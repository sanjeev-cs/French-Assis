import { SearchHistory } from '../models/SearchHistory.js';

export const createHistoryEntry = async ({ inputText, inputLanguage, translatedText }) => {
  return SearchHistory.create({
    inputText,
    inputLanguage,
    translatedText
  });
};

export const updateHistoryEntry = async (historyId, updates) => {
  if (!historyId) {
    return null;
  }

  return SearchHistory.findByIdAndUpdate(historyId, updates, { new: true });
};

export const getHistoryPage = async ({ page, limit }) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    SearchHistory.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    SearchHistory.countDocuments()
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const deleteHistoryEntry = async (id) => {
  return SearchHistory.findByIdAndDelete(id);
};
