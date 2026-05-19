import { getTranslationDirection } from '../utils/languageDetection.js';
import { callGroqJson, logGroqFallback, parseJsonSafely } from './groqClient.js';

const isValidLanguage = (value) => value === 'en' || value === 'fr';

const resolveTextType = (text) => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;

  if (words <= 1) {
    return 'word';
  }

  return /[.!?]/.test(text) ? 'sentence' : 'phrase';
};

const analyzeFallback = (text) => {
  const { sourceLang, targetLang } = getTranslationDirection(text);

  return {
    source_language: sourceLang,
    target_language: targetLang,
    normalized_text: text.trim(),
    text_type: resolveTextType(text)
  };
};

export const analyzeTranslationRequest = async (text) => {
  const fallback = analyzeFallback(text);

  try {
    const content = await callGroqJson({
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: `You are a language-routing assistant for a French learning app. Detect whether the source text is English or French, then choose the opposite target language.

Rules:
- Only use "en" or "fr".
- If the user typed a real French word, phrase, or sentence, source_language must be "fr".
- If the user typed a real English word, phrase, or sentence, source_language must be "en".
- If the token is ambiguous, prefer the language that best matches normal everyday usage.
- Preserve the user's text in normalized_text, but trim extra surrounding whitespace.
- text_type must be one of: "word", "phrase", "sentence".

Return ONLY valid JSON:
{
  "source_language": "en|fr",
  "target_language": "fr|en",
  "normalized_text": "trimmed source text",
  "text_type": "word|phrase|sentence"
}`
        },
        {
          role: 'user',
          content: text
        }
      ]
    });

    const parsed = parseJsonSafely(content, fallback);

    if (!isValidLanguage(parsed.source_language) || !isValidLanguage(parsed.target_language)) {
      return fallback;
    }

    return {
      source_language: parsed.source_language,
      target_language: parsed.target_language,
      normalized_text:
        typeof parsed.normalized_text === 'string' && parsed.normalized_text.trim()
          ? parsed.normalized_text.trim()
          : fallback.normalized_text,
      text_type: ['word', 'phrase', 'sentence'].includes(parsed.text_type) ? parsed.text_type : fallback.text_type
    };
  } catch (error) {
    logGroqFallback('translation analysis', error);
    return fallback;
  }
};

const frenchDetailsFallback = (baseTranslation) => {
  return {
    preferred_translation: baseTranslation,
    masculine_form: '',
    feminine_form: '',
    gender_applicable: false,
    part_of_speech: 'phrase',
    note: '',
    confidence: 'low'
  };
};

export const refineFrenchTranslation = async ({ sourceText, baseTranslation, textType }) => {
  const fallback = frenchDetailsFallback(baseTranslation);

  try {
    const content = await callGroqJson({
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: `You are a precise French translation editor for a language learning app.

Your job:
- Improve or validate a base English-to-French translation.
- Treat base_translation as the semantic anchor. Do not change it to a different concept.
- Never replace the meaning with a different language, nationality, demonym, or adjective family.
- Example: if source_text is "English", stay in the "anglais/anglaise" family, never the "francais/francaise" family.
- Produce one natural Canadian French translation.
- If the translation is a single noun, adjective, demonym, or another gendered lexical item, provide both masculine_form and feminine_form when they are genuinely useful.
- For single gendered lexical items, preferred_translation must use the default dictionary form, usually masculine singular. Put the feminine form only in feminine_form.
- If gender does not apply, set gender_applicable to false and leave masculine_form and feminine_form empty.
- Keep translations natural, standard, and learner-safe.
- Do not invent slang unless the source clearly needs it.
- For phrases or sentences, masculine/feminine forms are usually not applicable.

Return ONLY valid JSON:
{
  "preferred_translation": "Natural Canadian French translation",
  "masculine_form": "Masculine French form if applicable, otherwise empty string",
  "feminine_form": "Feminine French form if applicable, otherwise empty string",
  "gender_applicable": true,
  "part_of_speech": "noun|adjective|demonym|verb|phrase|sentence|other",
  "note": "Short learner-facing note about regional variation or gender, otherwise empty string",
  "confidence": "high|medium|low"
}`
        },
        {
          role: 'user',
          content: JSON.stringify({
            source_text: sourceText,
            base_translation: baseTranslation,
            text_type: textType
          })
        }
      ]
    });

    const parsed = parseJsonSafely(content, fallback);

    return {
      ...fallback,
      ...parsed,
      preferred_translation: parsed.preferred_translation || fallback.preferred_translation,
      masculine_form: parsed.masculine_form || '',
      feminine_form: parsed.feminine_form || '',
      gender_applicable: Boolean(parsed.gender_applicable && (parsed.masculine_form || parsed.feminine_form))
    };
  } catch (error) {
    logGroqFallback('French translation refinement', error);
    return fallback;
  }
};

const englishDetailsFallback = (baseTranslation) => ({
  preferred_translation: baseTranslation,
  masculine_form: '',
  feminine_form: '',
  gender_applicable: false,
  part_of_speech: 'phrase',
  note: '',
  confidence: 'low'
});

export const refineEnglishTranslation = async ({ sourceText, baseTranslation, textType }) => {
  const fallback = englishDetailsFallback(baseTranslation);

  try {
    const content = await callGroqJson({
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: `You are a precise French-to-English translation editor for a language learning app.

Your job:
- Improve or validate a base French-to-English translation.
- Treat base_translation as the semantic anchor. Do not change it to a different concept.
- If the French source is a single gendered lexical item, provide both masculine_form and feminine_form when applicable.
- If gender does not apply, set gender_applicable to false and leave masculine_form and feminine_form empty.
- Keep the English translation natural and beginner-friendly.

Return ONLY valid JSON:
{
  "preferred_translation": "Natural English translation",
  "masculine_form": "Masculine French form if applicable, otherwise empty string",
  "feminine_form": "Feminine French form if applicable, otherwise empty string",
  "gender_applicable": true,
  "part_of_speech": "noun|adjective|demonym|verb|phrase|sentence|other",
  "note": "Short learner-facing note about gender or regional usage, otherwise empty string",
  "confidence": "high|medium|low"
}`
        },
        {
          role: 'user',
          content: JSON.stringify({
            source_text: sourceText,
            base_translation: baseTranslation,
            text_type: textType
          })
        }
      ]
    });

    const parsed = parseJsonSafely(content, fallback);

    return {
      ...fallback,
      ...parsed,
      preferred_translation: parsed.preferred_translation || fallback.preferred_translation,
      masculine_form: parsed.masculine_form || '',
      feminine_form: parsed.feminine_form || '',
      gender_applicable: Boolean(parsed.gender_applicable && (parsed.masculine_form || parsed.feminine_form))
    };
  } catch (error) {
    logGroqFallback('English translation refinement', error);
    return fallback;
  }
};
