const normalizeLetters = (value) => {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');
};

const countMatches = (value, pattern) => {
  const matches = String(value || '').match(pattern);
  return matches ? matches.length : 0;
};

const COMMON_STARTING_CLUSTERS = new Set([
  'bl',
  'br',
  'ch',
  'cl',
  'cr',
  'dr',
  'fl',
  'fr',
  'gl',
  'gr',
  'ph',
  'pl',
  'pr',
  'qu',
  'ps',
  'sc',
  'sch',
  'sh',
  'sk',
  'sl',
  'sm',
  'sn',
  'sp',
  'spl',
  'spr',
  'squ',
  'st',
  'str',
  'sw',
  'th',
  'tr',
  'ts',
  'tw',
  'vr'
]);

const tokenizeWords = (value) => {
  return String(value || '')
    .trim()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
};

const buildWordSignal = (rawWord) => {
  const lettersOnly = normalizeLetters(rawWord);
  const letterCount = lettersOnly.length;
  const digitCount = countMatches(rawWord, /\d/g);
  const punctuationCount = countMatches(rawWord, /[^a-zA-Z0-9\s'-]/g);
  const vowelCount = countMatches(lettersOnly, /[aeiouy]/g);
  const longestConsonantRun = Math.max(
    0,
    ...lettersOnly.split(/[aeiouy]+/).map((segment) => segment.length)
  );
  const hasMixedLettersAndDigits = /[a-zA-Z]/.test(rawWord) && /\d/.test(rawWord);
  const uniqueLetterCount = new Set(lettersOnly.split('')).size;

  return {
    lettersOnly,
    letterCount,
    digitCount,
    punctuationCount,
    vowelCount,
    longestConsonantRun,
    hasMixedLettersAndDigits,
    uniqueLetterCount
  };
};

const isLikelyGibberishWord = (rawWord) => {
  const signal = buildWordSignal(rawWord);
  const {
    lettersOnly,
    letterCount,
    digitCount,
    punctuationCount,
    vowelCount,
    longestConsonantRun,
    hasMixedLettersAndDigits,
    uniqueLetterCount
  } = signal;

  if (!letterCount) {
    return true;
  }

  if (hasMixedLettersAndDigits) {
    return true;
  }

  if (digitCount > 0 || punctuationCount > 0) {
    return true;
  }

  if (letterCount >= 3 && vowelCount === 0) {
    return true;
  }

  if (longestConsonantRun >= 5) {
    return true;
  }

  if (letterCount >= 8 && uniqueLetterCount <= 4) {
    return true;
  }

  if (letterCount >= 4) {
    const startingClusterMatch = lettersOnly.match(/^[^aeiouy]{2,3}/);

    if (startingClusterMatch) {
      const startingCluster = startingClusterMatch[0];

      if (!COMMON_STARTING_CLUSTERS.has(startingCluster)) {
        return true;
      }
    }
  }

  return false;
};

const isLikelyGibberishPhrase = (rawText) => {
  const tokens = tokenizeWords(rawText);
  const alphaTokens = tokens.filter((token) => normalizeLetters(token).length > 0);

  if (!alphaTokens.length) {
    return true;
  }

  const meaningfulTokens = alphaTokens.filter((token) => normalizeLetters(token).length >= 3);

  if (!meaningfulTokens.length) {
    return false;
  }

  const gibberishTokenCount = meaningfulTokens.filter(isLikelyGibberishWord).length;
  const vowelPoorTokenCount = meaningfulTokens.filter((token) => {
    const { letterCount, vowelCount } = buildWordSignal(token);
    return letterCount >= 3 && vowelCount <= 1;
  }).length;
  const repeatedPatternTokenCount = meaningfulTokens.filter((token) => {
    const { letterCount, uniqueLetterCount } = buildWordSignal(token);
    return letterCount >= 5 && uniqueLetterCount <= 3;
  }).length;
  const threshold = Math.max(2, Math.ceil(meaningfulTokens.length * 0.6));

  if (gibberishTokenCount >= threshold) {
    return true;
  }

  if (
    meaningfulTokens.length >= 3 &&
    vowelPoorTokenCount >= meaningfulTokens.length &&
    repeatedPatternTokenCount >= Math.ceil(meaningfulTokens.length / 2)
  ) {
    return true;
  }

  return false;
};

export const isLikelyGibberish = (text, textType = 'word') => {
  const raw = String(text || '').trim();

  if (!raw) {
    return true;
  }

  if (textType === 'word') {
    return isLikelyGibberishWord(raw);
  }

  if (textType === 'phrase' || textType === 'sentence') {
    return isLikelyGibberishPhrase(raw);
  }

  return isLikelyGibberishWord(raw);
};

export const shouldRejectLowConfidenceTranslation = ({
  sourceText,
  textType,
  translatedText,
  providerMeta
}) => {
  const translated = String(translatedText || '').trim();

  if (!isLikelyGibberish(sourceText, textType)) {
    return false;
  }

  if (!translated) {
    return true;
  }

  const exactMatchCount = providerMeta?.exactMatchCount || 0;
  const bestExactQuality = providerMeta?.bestExactQuality || 0;

  return exactMatchCount === 0 || bestExactQuality < 60;
};
