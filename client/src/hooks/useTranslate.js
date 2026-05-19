import { useState } from 'react';
import { fetchAiTip, fetchPhonetics, translateText } from '../services/api.js';
import { buildGenderPronunciationMap, phoneticsUnavailable } from '../utils/phoneticsResult.js';

const emptyResult = {
  inputText: '',
  translation: null,
  phonetics: null,
  aiTip: null
};

const aiTipUnavailable = {
  memory_tip: 'AI tip unavailable.',
  example_sentence: {
    french: '',
    english: '',
    phonetic_transcription: '',
    pronunciation_guide: ''
  },
  common_mistake: '',
  difficulty: 'beginner'
};

export const useTranslate = () => {
  const [result, setResult] = useState(emptyResult);
  const [isLoading, setIsLoading] = useState(false);
  const [stageMessage, setStageMessage] = useState('');
  const [error, setError] = useState('');

  const lookup = async (rawInput) => {
    const input = typeof rawInput === 'string' ? { text: rawInput } : rawInput;
    const text = input.text.trim();

    if (!text) {
      return;
    }

    setError('');
    setIsLoading(true);
    setStageMessage('Translating...');
    setResult({ ...emptyResult, inputText: text });

    try {
      const translation = await translateText({ text });

      setResult({
        inputText: text,
        translation,
        phonetics: null,
        aiTip: null
      });

      setStageMessage('Getting phonetics...');

      const [phonetics, aiTip] = await Promise.all([
        fetchPhonetics({
          frenchText: translation.frenchText,
          historyId: translation.historyId
        }).catch(() => phoneticsUnavailable),
        fetchAiTip({
          word: translation.englishText,
          translation: translation.frenchText,
          historyId: translation.historyId
        }).catch(() => aiTipUnavailable)
      ]);

      const genderPronunciations = await buildGenderPronunciationMap({
        fetchPhonetics,
        genderForms: translation.genderForms,
        historyId: translation.historyId,
        baseFrenchText: translation.frenchText,
        basePhonetics: phonetics
      });

      setStageMessage('Preparing AI tip...');
      setResult({
        inputText: text,
        translation: {
          ...translation,
          genderPronunciations
        },
        phonetics,
        aiTip
      });
    } catch (requestError) {
      setError(requestError.message || 'Translation service temporarily unavailable.');
    } finally {
      setIsLoading(false);
      setStageMessage('');
    }
  };

  return {
    result,
    isLoading,
    stageMessage,
    error,
    lookup
  };
};
