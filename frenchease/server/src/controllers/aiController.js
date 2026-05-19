import { getAiTip, getChatResponse, getPhonetics } from '../services/groqService.js';
import { updateHistoryEntry } from '../services/historyService.js';
import { HttpError } from '../utils/httpError.js';
import { sanitizeText } from '../utils/sanitizeInput.js';

export const phonetics = async (req, res, next) => {
  try {
    const frenchText = sanitizeText(req.body.frenchText);
    const historyId = sanitizeText(req.body.historyId);

    if (!frenchText) {
      throw new HttpError('French text is required.', 400);
    }

    const result = await getPhonetics(frenchText);

    await updateHistoryEntry({
      historyId,
      userId: req.user.id,
      updates: {
        phonetics: result.phonetic_transcription || '',
        pronunciation_guide: result.pronunciation_guide || '',
        word_breakdown: (result.word_breakdown || []).map((item) => ({
          word: item.word || '',
          translation: item.english_hint || '',
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

    if (!word || !translation) {
      throw new HttpError('Word and translation are required.', 400);
    }

    const result = await getAiTip(word, translation);
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
