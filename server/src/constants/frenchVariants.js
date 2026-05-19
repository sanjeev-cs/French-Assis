export const FRENCH_VARIANTS = {
  european: 'european',
  canadian: 'canadian'
};

export const normalizeFrenchVariant = (value) => {
  return value === FRENCH_VARIANTS.canadian ? FRENCH_VARIANTS.canadian : FRENCH_VARIANTS.european;
};

export const getFrenchVariantLabel = (value) => {
  return normalizeFrenchVariant(value) === FRENCH_VARIANTS.canadian ? 'Canadian French' : 'European French';
};
