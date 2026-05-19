const frenchSignals = [
  /\b(bonjour|salut|merci|oui|non|avec|pour|dans|vous|nous|etre|être|avoir|faire|comment|ça|cela|je|tu|il|elle|les|des|une|est|suis|sont|pas|bien|soir|matin|eau|fromage|aujourd'hui|quoi|pourquoi)\b/i,
  /[àâçéèêëîïôùûüÿœæ]/i,
  /\b(j'|l'|d'|c'|qu'|n'|s'|m'|t')/i
];

const englishSignals = [
  /\b(hello|thanks|thank you|please|with|for|in|how|what|why|where|when|water|good|morning|night|are|you|doing|friend|house|car|english)\b/i,
  /\b(i|you|he|she|we|they|is|are|am|do|does|did|the|a|an)\b/i
];

const normalizeForScoring = (text) => {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

export const detectInputLanguage = (text) => {
  if (!text.trim()) {
    return 'auto';
  }

  const raw = text.trim().toLowerCase();
  const normalized = normalizeForScoring(text);

  const frenchScore = frenchSignals.reduce((score, pattern) => {
    return pattern.test(raw) || pattern.test(normalized) ? score + 1 : score;
  }, 0);

  const englishScore = englishSignals.reduce((score, pattern) => {
    return pattern.test(normalized) ? score + 1 : score;
  }, 0);

  return frenchScore > englishScore ? 'fr' : 'en';
};
