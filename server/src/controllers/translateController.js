import { translateText as translateWithProvider } from '../services/translationService.js';
import { createHistoryEntry } from '../services/historyService.js';
import { HttpError } from '../utils/httpError.js';
import { sanitizeText } from '../utils/sanitizeInput.js';
import {
  analyzeTranslationRequest,
  refineEnglishTranslation,
  refineFrenchTranslation
} from '../services/groqTranslationService.js';
import { canonicalizeFrenchWord } from '../utils/frenchWordCanonicalization.js';
import { inferFrenchGenderForms } from '../utils/frenchGenderInference.js';
import { keepRelatedWord } from '../utils/translationGuards.js';

export const translateText = async (req, res, next) => {
  try {
    const text = sanitizeText(req.body.text);

    if (!text) {
      throw new HttpError('Text is required.', 400);
    }

    if (text.length > 200) {
      throw new HttpError('Text must be 200 characters or fewer.', 400);
    }

    const analysis = await analyzeTranslationRequest(text);
    const sourceText = analysis.normalized_text || text;
    const sourceLang = analysis.source_language;
    const targetLang = analysis.target_language;
    const baseTranslation = await translateWithProvider({
      text: sourceText,
      sourceLang,
      targetLang,
      textType: analysis.text_type
    });
    const baseTranslatedText = baseTranslation.translatedText.trim();
    const providerCandidates = Array.isArray(baseTranslation.candidates) ? baseTranslation.candidates : [];

    let translatedText = baseTranslatedText;
    let frenchText = sourceLang === 'fr' ? sourceText : translatedText;
    let englishText = sourceLang === 'en' ? sourceText : translatedText;
    let genderForms = null;
    let translationNote = '';

    if (targetLang === 'fr') {
      const details = await refineFrenchTranslation({
        sourceText,
        baseTranslation: baseTranslation.translatedText,
        textType: analysis.text_type
      });

      const safeCanadianFrench =
        analysis.text_type === 'word'
          ? keepRelatedWord(baseTranslatedText, details.preferred_translation, baseTranslatedText)
          : details.preferred_translation || baseTranslatedText;

      const safeMasculine =
        analysis.text_type === 'word'
          ? keepRelatedWord(baseTranslatedText, details.masculine_form, baseTranslatedText)
          : details.masculine_form || '';
      const safeFeminine =
        analysis.text_type === 'word'
          ? keepRelatedWord(safeMasculine || baseTranslatedText, details.feminine_form, '')
          : details.feminine_form || '';
      const inferredGenderForms =
        analysis.text_type === 'word'
          ? inferFrenchGenderForms({
              baseWord: baseTranslatedText,
              candidates: providerCandidates
            })
          : { applicable: false, masculine: '', feminine: '' };
      const resolvedMasculine = safeMasculine || inferredGenderForms.masculine || '';
      const resolvedFeminine = safeFeminine || inferredGenderForms.feminine || '';
      const hasGenderForms = Boolean(resolvedMasculine && resolvedFeminine);

      genderForms = {
        applicable: Boolean((details.gender_applicable && resolvedFeminine) || inferredGenderForms.applicable),
        masculine: resolvedMasculine,
        feminine: resolvedFeminine,
        partOfSpeech: details.part_of_speech || '',
        note: details.note || ''
      };

      if (analysis.text_type === 'word') {
        const canonicalCanadianFrench = canonicalizeFrenchWord({
          translation: safeCanadianFrench,
          masculineForm: resolvedMasculine,
          feminineForm: resolvedFeminine,
          genderApplicable: hasGenderForms
        });

        translatedText = canonicalCanadianFrench;
      } else {
        translatedText = safeCanadianFrench;
      }

      frenchText = translatedText;
      englishText = sourceText;
      translationNote = details.note || '';
    } else {
      const details = await refineEnglishTranslation({
        sourceText,
        baseTranslation: baseTranslatedText,
        textType: analysis.text_type
      });

      translatedText = analysis.text_type === 'word' ? baseTranslatedText : details.preferred_translation || baseTranslatedText;
      frenchText = sourceText;
      englishText = translatedText;
      translationNote = details.note || '';
      genderForms = {
        applicable: Boolean(details.gender_applicable),
        masculine: details.masculine_form || '',
        feminine: details.feminine_form || '',
        partOfSpeech: details.part_of_speech || '',
        note: details.note || ''
      };
    }

    const history = await createHistoryEntry({
      userId: req.user.id,
      inputText: sourceText,
      inputLanguage: sourceLang,
      translatedText
    });

    res.status(200).json({
      translatedText,
      frenchText,
      englishText,
      sourceLang,
      targetLang,
      genderForms,
      translationNote,
      historyId: history._id
    });
  } catch (error) {
    next(error);
  }
};
