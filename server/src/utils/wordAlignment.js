const tokenizeText = (text) => {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .map((token) => token.replace(/^[^\p{L}\p{N}']+|[^\p{L}\p{N}'?]+$/gu, '').trim())
    .filter(Boolean);
};

export const buildFallbackWordAlignment = ({ sourceText, translatedText }) => {
  const sourceTokens = tokenizeText(sourceText);
  const targetTokens = tokenizeText(translatedText).filter((token) => token !== '?');

  if (!sourceTokens.length || !targetTokens.length) {
    return [];
  }

  const rows = [];
  let sourceIndex = 0;

  targetTokens.forEach((targetToken, index) => {
    const remainingTargets = targetTokens.length - index;
    const remainingSources = sourceTokens.length - sourceIndex;
    const takeCount = Math.max(1, Math.ceil(remainingSources / remainingTargets));
    const sourceSlice = sourceTokens.slice(sourceIndex, sourceIndex + takeCount);

    rows.push({
      sourceText: sourceSlice.join(' '),
      targetText: targetToken
    });

    sourceIndex += takeCount;
  });

  return rows.filter((row) => row.sourceText && row.targetText);
};
