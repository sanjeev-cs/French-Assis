import { HttpError } from '../utils/httpError.js';

const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';

export const translateText = async ({ text, sourceLang, targetLang }) => {
  const url = new URL(MYMEMORY_URL);
  url.searchParams.set('q', text);
  url.searchParams.set('langpair', `${sourceLang}|${targetLang}`);

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.responseStatus >= 400 || !data.responseData?.translatedText) {
      throw new Error(data.responseDetails || 'MyMemory returned an invalid response');
    }

    return {
      translatedText: data.responseData.translatedText,
      sourceLang,
      targetLang
    };
  } catch (error) {
    throw new HttpError('Translation service temporarily unavailable.', 503, error.message);
  }
};
