import { FRENCH_VARIANTS, getFrenchVariantLabel, normalizeFrenchVariant } from '../constants/frenchVariants.js';

const normalizeKey = (value) => {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const ENGLISH_TO_FRENCH_OVERRIDES = {
  english: {
    europeanFrench: 'anglais',
    canadianFrench: 'anglais',
    masculine: 'anglais',
    feminine: 'anglaise',
    partOfSpeech: 'demonym'
  },
  french: {
    europeanFrench: 'français',
    canadianFrench: 'français',
    masculine: 'français',
    feminine: 'française',
    partOfSpeech: 'demonym'
  },
  spanish: {
    europeanFrench: 'espagnol',
    canadianFrench: 'espagnol',
    masculine: 'espagnol',
    feminine: 'espagnole',
    partOfSpeech: 'demonym'
  },
  indian: {
    europeanFrench: 'indien',
    canadianFrench: 'indien',
    masculine: 'indien',
    feminine: 'indienne',
    partOfSpeech: 'demonym',
    note: "Use 'indien' for masculine and 'indienne' for feminine."
  }
};

const FRENCH_TO_ENGLISH_OVERRIDES = {
  anglais: {
    english: 'English',
    masculine: 'anglais',
    feminine: 'anglaise',
    partOfSpeech: 'demonym'
  },
  anglaise: {
    english: 'English',
    masculine: 'anglais',
    feminine: 'anglaise',
    partOfSpeech: 'demonym'
  },
  francais: {
    english: 'French',
    masculine: 'français',
    feminine: 'française',
    partOfSpeech: 'demonym'
  },
  francaise: {
    english: 'French',
    masculine: 'français',
    feminine: 'française',
    partOfSpeech: 'demonym'
  },
  espagnol: {
    english: 'Spanish',
    masculine: 'espagnol',
    feminine: 'espagnole',
    partOfSpeech: 'demonym'
  },
  espagnole: {
    english: 'Spanish',
    masculine: 'espagnol',
    feminine: 'espagnole',
    partOfSpeech: 'demonym'
  },
  indien: {
    english: 'Indian',
    masculine: 'indien',
    feminine: 'indienne',
    partOfSpeech: 'demonym',
    note: "Use 'indien' for masculine and 'indienne' for feminine."
  },
  indienne: {
    english: 'Indian',
    masculine: 'indien',
    feminine: 'indienne',
    partOfSpeech: 'demonym',
    note: "Use 'indien' for masculine and 'indienne' for feminine."
  }
};

const buildGenderForms = (entry) => ({
  applicable: Boolean(entry.feminine),
  masculine: entry.masculine || '',
  feminine: entry.feminine || '',
  partOfSpeech: entry.partOfSpeech || 'other',
  note: entry.note || ''
});

export const getTranslationOverride = ({ text, sourceLang, targetLang, preferredFrenchVariant, textType }) => {
  if (textType !== 'word') {
    return null;
  }

  const normalizedText = String(text || '').trim();
  const key = normalizeKey(normalizedText);
  const normalizedVariant = normalizeFrenchVariant(preferredFrenchVariant);

  if (sourceLang === 'en' && targetLang === 'fr') {
    const entry = ENGLISH_TO_FRENCH_OVERRIDES[key];

    if (!entry) {
      return null;
    }

    const variantTranslations = {
      europeanFrench: entry.europeanFrench,
      canadianFrench: entry.canadianFrench
    };

    return {
      translatedText:
        normalizedVariant === FRENCH_VARIANTS.canadian ? entry.canadianFrench : entry.europeanFrench,
      frenchText:
        normalizedVariant === FRENCH_VARIANTS.canadian ? entry.canadianFrench : entry.europeanFrench,
      englishText: normalizedText,
      sourceLang,
      targetLang,
      variantTranslations,
      genderForms: buildGenderForms(entry),
      translationNote: entry.note || '',
      sourceFrenchVariant: 'shared',
      frenchVariant: normalizedVariant,
      frenchVariantLabel: getFrenchVariantLabel(normalizedVariant)
    };
  }

  if (sourceLang === 'fr' && targetLang === 'en') {
    const entry = FRENCH_TO_ENGLISH_OVERRIDES[key];

    if (!entry) {
      return null;
    }

    return {
      translatedText: entry.english,
      frenchText: normalizedText,
      englishText: entry.english,
      sourceLang,
      targetLang,
      variantTranslations: null,
      genderForms: buildGenderForms(entry),
      translationNote: entry.note || '',
      sourceFrenchVariant: 'shared',
      frenchVariant: normalizedVariant,
      frenchVariantLabel: getFrenchVariantLabel(normalizedVariant)
    };
  }

  return null;
};
