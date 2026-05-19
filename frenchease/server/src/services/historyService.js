import { SearchHistory } from '../models/SearchHistory.js';

export const createHistoryEntry = async ({ userId, inputText, inputLanguage, translatedText }) => {
  return SearchHistory.create({
    user: userId,
    inputText,
    inputLanguage,
    translatedText
  });
};

export const updateHistoryEntry = async ({ historyId, userId, updates }) => {
  if (!historyId) {
    return null;
  }

  return SearchHistory.findOneAndUpdate({ _id: historyId, user: userId }, updates, { new: true });
};

export const getHistoryPage = async ({ userId, page, limit }) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    SearchHistory.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    SearchHistory.countDocuments({ user: userId })
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

export const deleteHistoryEntry = async ({ id, userId }) => {
  return SearchHistory.findOneAndDelete({ _id: id, user: userId });
};
