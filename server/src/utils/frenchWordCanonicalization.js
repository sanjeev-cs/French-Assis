const normalizeComparable = (value) => {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');
};

export const canonicalizeFrenchWord = ({ translation, masculineForm, feminineForm, genderApplicable }) => {
  const baseTranslation = String(translation || '').trim();
  const masculine = String(masculineForm || '').trim();
  const feminine = String(feminineForm || '').trim();

  if (!genderApplicable || !masculine) {
    return baseTranslation;
  }

  if (!feminine) {
    return masculine;
  }

  const normalizedBase = normalizeComparable(baseTranslation);
  const normalizedMasculine = normalizeComparable(masculine);
  const normalizedFeminine = normalizeComparable(feminine);

  if (!normalizedBase) {
    return masculine;
  }

  if (normalizedBase === normalizedFeminine && normalizedMasculine !== normalizedFeminine) {
    return masculine;
  }

  return masculine;
};
