const frenchSignals = [
  /\b(bonjour|salut|merci|oui|non|avec|pour|dans|vous|nous|etre|être|avoir|faire|comment|ça|cela|je|tu|il|elle|les|des|une|est|suis|sont|pas|bien|soir|matin)\b/i,
  /[àâçéèêëîïôùûüÿœæ]/i,
  /\b(j'|l'|d'|c'|qu'|n'|s'|m'|t')/i
];

export const detectLanguage = (text) => {
  const normalized = text.trim().toLowerCase();
  const frenchScore = frenchSignals.reduce((score, pattern) => {
    return pattern.test(normalized) ? score + 1 : score;
  }, 0);

  return frenchScore > 0 ? 'fr' : 'en';
};

export const getTranslationDirection = (text) => {
  const sourceLang = detectLanguage(text);
  const targetLang = sourceLang === 'fr' ? 'en' : 'fr';

  return {
    sourceLang,
    targetLang
  };
};
