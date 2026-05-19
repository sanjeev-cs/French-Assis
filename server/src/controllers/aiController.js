import { getAiTip, getChatResponse, getPhonetics } from '../services/groqService.js';
import { updateHistoryEntry } from '../services/historyService.js';
import { HttpError } from '../utils/httpError.js';
import { sanitizeText } from '../utils/sanitizeInput.js';
import { normalizeFrenchVariant } from '../constants/frenchVariants.js';

export const phonetics = async (req, res, next) => {
  try {
    const frenchText = sanitizeText(req.body.frenchText);
    const historyId = sanitizeText(req.body.historyId);
    const variant = normalizeFrenchVariant(sanitizeText(req.body.variant));

    if (!frenchText) {
      throw new HttpError('French text is required.', 400);
    }

    const result = await getPhonetics(frenchText, variant);

    await updateHistoryEntry({
      historyId,
      userId: req.user.id,
      updates: {
        phonetics: result.phonetic_transcription || '',
        pronunciation_guide: result.pronunciation_guide || '',
        word_breakdown: (result.word_breakdown || []).map((item) => ({
          word: item.word || '',
          translation: item.translation || '',
          phonetic: item.phonetic || ''
        }))
      }
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const aiTip = async (req, res, next) => {
  try {
    const word = sanitizeText(req.body.word);
    const translation = sanitizeText(req.body.translation);
    const historyId = sanitizeText(req.body.historyId);
    const frenchVariant = normalizeFrenchVariant(sanitizeText(req.body.frenchVariant));

    if (!word || !translation) {
      throw new HttpError('Word and translation are required.', 400);
    }

    const result = await getAiTip(word, translation, frenchVariant);
    await updateHistoryEntry({
      historyId,
      userId: req.user.id,
      updates: {
        ai_tip: JSON.stringify(result)
      }
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const aiChat = async (req, res, next) => {
  try {
    const message = sanitizeText(req.body.message);
    const history = Array.isArray(req.body.history) ? req.body.history : [];

    if (!message) {
      throw new HttpError('Message is required.', 400);
    }

    if (message.length > 800) {
      throw new HttpError('Message must be 800 characters or fewer.', 400);
    }

    const result = await getChatResponse({ message, history });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
