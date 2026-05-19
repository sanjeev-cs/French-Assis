export const phoneticsUnavailable = {
  phonetic_transcription: '',
  pronunciation_guide: 'Pronunciation guide unavailable',
  word_breakdown: [],
  pronunciation_explanation: 'Pronunciation explanation unavailable',
  audio_description: ''
};

const normalizeLookupKey = (value) => String(value || '').trim().toLowerCase();

export const createPronunciationSummary = (phonetics) => ({
  guide: phonetics?.pronunciation_guide || '',
  ipa: phonetics?.phonetic_transcription || '',
  explanation: phonetics?.pronunciation_explanation || ''
});

export const buildGenderPronunciationMap = async ({
  fetchPhonetics,
  genderForms,
  historyId,
  variant,
  baseFrenchText,
  basePhonetics
}) => {
  if (!genderForms?.applicable) {
    return {};
  }

  const forms = [
    ['masculine', genderForms.masculine],
    ['feminine', genderForms.feminine]
  ].filter(([, value]) => value && value.trim());

  if (!forms.length) {
    return {};
  }

  const phoneticsByText = new Map();
  const baseKey = normalizeLookupKey(baseFrenchText);

  if (baseKey && basePhonetics) {
    phoneticsByText.set(baseKey, basePhonetics);
  }

  const entries = await Promise.all(
    forms.map(async ([formKey, text]) => {
      const normalizedText = normalizeLookupKey(text);
      let phonetics = phoneticsByText.get(normalizedText);

      if (!phonetics) {
        phonetics = await fetchPhonetics({
          frenchText: text,
          historyId,
          variant
        }).catch(() => phoneticsUnavailable);

        phoneticsByText.set(normalizedText, phonetics);
      }

      return [
        formKey,
        {
          text,
          ...createPronunciationSummary(phonetics)
        }
      ];
    })
  );

  return Object.fromEntries(entries);
};
