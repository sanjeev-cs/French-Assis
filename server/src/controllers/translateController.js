import { translateText as translateWithProvider } from '../services/translationService.js';
import { createHistoryEntry } from '../services/historyService.js';
import { HttpError } from '../utils/httpError.js';
import { sanitizeText } from '../utils/sanitizeInput.js';
import { getFrenchVariantLabel, normalizeFrenchVariant } from '../constants/frenchVariants.js';
import {
  analyzeTranslationRequest,
  refineEnglishTranslation,
  refineFrenchTranslation
} from '../services/groqTranslationService.js';
import { canonicalizeFrenchWord } from '../utils/frenchWordCanonicalization.js';
import { keepRelatedWord } from '../utils/translationGuards.js';

export const translateText = async (req, res, next) => {
  try {
    const text = sanitizeText(req.body.text);
    const preferredFrenchVariant = normalizeFrenchVariant(sanitizeText(req.body.frenchVariant));

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

    let translatedText = baseTranslatedText;
    let frenchText = sourceLang === 'fr' ? sourceText : translatedText;
    let englishText = sourceLang === 'en' ? sourceText : translatedText;
    let variantTranslations = null;
    let genderForms = null;
    let translationNote = '';
    let sourceFrenchVariant = 'shared';

    if (targetLang === 'fr') {
      const details = await refineFrenchTranslation({
        sourceText,
        baseTranslation: baseTranslation.translatedText,
        preferredFrenchVariant,
        textType: analysis.text_type
      });

      const safeEuropeanFrench =
        analysis.text_type === 'word'
          ? keepRelatedWord(baseTranslatedText, details.european_french, baseTranslatedText)
          : details.european_french || baseTranslatedText;
      const safeCanadianFrench =
        analysis.text_type === 'word'
          ? keepRelatedWord(baseTranslatedText, details.canadian_french, safeEuropeanFrench || baseTranslatedText)
          : details.canadian_french || details.european_french || baseTranslatedText;

      variantTranslations = {
        europeanFrench: safeEuropeanFrench,
        canadianFrench: safeCanadianFrench
      };

      const safeMasculine =
        analysis.text_type === 'word'
          ? keepRelatedWord(baseTranslatedText, details.masculine_form, baseTranslatedText)
          : details.masculine_form || '';
      const safeFeminine =
        analysis.text_type === 'word'
          ? keepRelatedWord(safeMasculine || baseTranslatedText, details.feminine_form, '')
          : details.feminine_form || '';

      genderForms = {
        applicable: Boolean(details.gender_applicable && safeFeminine),
        masculine: safeMasculine || '',
        feminine: safeFeminine || '',
        partOfSpeech: details.part_of_speech || '',
        note: details.note || ''
      };

      if (analysis.text_type === 'word') {
        const canonicalEuropeanFrench = canonicalizeFrenchWord({
          translation: safeEuropeanFrench,
          masculineForm: safeMasculine,
          feminineForm: safeFeminine,
          genderApplicable: Boolean(details.gender_applicable && safeFeminine)
        });
        const canonicalCanadianFrench = canonicalizeFrenchWord({
          translation: safeCanadianFrench,
          masculineForm: safeMasculine,
          feminineForm: safeFeminine,
          genderApplicable: Boolean(details.gender_applicable && safeFeminine)
        });

        variantTranslations = {
          europeanFrench: canonicalEuropeanFrench,
          canadianFrench: canonicalCanadianFrench
        };
        translatedText =
          preferredFrenchVariant === 'canadian'
            ? canonicalCanadianFrench
            : canonicalEuropeanFrench;
      } else {
        translatedText =
          preferredFrenchVariant === 'canadian'
            ? variantTranslations.canadianFrench
            : variantTranslations.europeanFrench;
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
      sourceFrenchVariant = details.source_french_variant || 'shared';
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
      variantTranslations,
      genderForms,
      translationNote,
      sourceFrenchVariant,
      frenchVariant: preferredFrenchVariant,
      frenchVariantLabel: getFrenchVariantLabel(preferredFrenchVariant),
      historyId: history._id
    });
  } catch (error) {
    next(error);
  }
};
