import mongoose from 'mongoose';

const wordBreakdownSchema = new mongoose.Schema(
  {
    word: { type: String, required: true },
    translation: { type: String, default: '' },
    phonetic: { type: String, default: '' }
  },
  { _id: false }
);

const searchHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  inputText: { type: String, required: true },
  inputLanguage: { type: String, default: 'en' },
  translatedText: { type: String, default: '' },
  phonetics: { type: String, default: '' },
  pronunciation_guide: { type: String, default: '' },
  word_breakdown: { type: [wordBreakdownSchema], default: [] },
  ai_tip: { type: String, default: '' },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 30
  }
});

export const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);
