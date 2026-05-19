import { translateText as translateWithProvider } from '../services/translationService.js';
import { createHistoryEntry } from '../services/historyService.js';
import { HttpError } from '../utils/httpError.js';
import { getTranslationDirection } from '../utils/languageDetection.js';
import { sanitizeText } from '../utils/sanitizeInput.js';

export const translateText = async (req, res, next) => {
  try {
    const text = sanitizeText(req.body.text);

    if (!text) {
      throw new HttpError('Text is required.', 400);
    }

    if (text.length > 200) {
      throw new HttpError('Text must be 200 characters or fewer.', 400);
    }

    const { sourceLang, targetLang } = getTranslationDirection(text);
    const translation = await translateWithProvider({ text, sourceLang, targetLang });
    const frenchText = sourceLang === 'fr' ? text : translation.translatedText;
    const englishText = sourceLang === 'en' ? text : translation.translatedText;
    const history = await createHistoryEntry({
      inputText: text,
      inputLanguage: sourceLang,
      translatedText: translation.translatedText
    });

    res.status(200).json({
      ...translation,
      frenchText,
      englishText,
      historyId: history._id
    });
  } catch (error) {
    next(error);
  }
};
