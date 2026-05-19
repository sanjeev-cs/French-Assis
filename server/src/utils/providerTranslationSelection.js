const normalizeText = (value) => {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const cleanCandidate = (value) => {
  return String(value || '')
    .trim()
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[,;:/\-\s]+|[,;:/\-\s]+$/g, '')
    .trim();
};

const extractCandidateTexts = (value, textType) => {
  const cleaned = cleanCandidate(value);

  if (!cleaned) {
    return [];
  }

  if (textType !== 'word') {
    return [cleaned];
  }

  return cleaned
    .split(/[|;/,]/)
    .map((part) => cleanCandidate(part))
    .filter(Boolean);
};

export const collectProviderCandidates = ({ textType, responseDataText, matches = [] }) => {
  const candidates = [];

  extractCandidateTexts(responseDataText, textType).forEach((candidateText) => {
    candidates.push(candidateText);
  });

  matches.forEach((match) => {
    extractCandidateTexts(match.translation, textType).forEach((candidateText) => {
      candidates.push(candidateText);
    });
  });

  return [...new Set(candidates.map((candidate) => cleanCandidate(candidate)).filter(Boolean))];
};

const isExactSegmentMatch = (inputText, segment) => normalizeText(inputText) === normalizeText(segment);

const buildCandidateScore = ({ inputText, candidateText, segment, quality, source, textType }) => {
  const normalizedCandidate = normalizeText(candidateText);

  if (!normalizedCandidate) {
    return Number.NEGATIVE_INFINITY;
  }

  let score = 0;
  const wordCount = normalizedCandidate.split(/\s+/).filter(Boolean).length;

  if (isExactSegmentMatch(inputText, segment)) {
    score += 1000;
  }

  if (source === 'responseData') {
    score += 20;
  }

  if (textType === 'word') {
    score += wordCount === 1 ? 120 : -40;
  } else if (wordCount > 1) {
    score += 50;
  }

  if (typeof quality === 'number' && Number.isFinite(quality)) {
    score += Math.max(0, Math.min(quality, 100)) / 2;
  }

  score += Math.max(0, 30 - normalizedCandidate.length);

  return score;
};

export const selectProviderTranslation = ({ inputText, textType, responseDataText, matches = [] }) => {
  const candidateMap = new Map();

  const pushCandidate = ({ candidateText, segment, quality, source }) => {
    const cleaned = cleanCandidate(candidateText);

    if (!cleaned) {
      return;
    }

    const normalized = normalizeText(cleaned);
    const score = buildCandidateScore({
      inputText,
      candidateText: cleaned,
      segment,
      quality,
      source,
      textType
    });

    const existing = candidateMap.get(normalized);

    if (!existing || score > existing.score) {
      candidateMap.set(normalized, {
        text: cleaned,
        score
      });
    }
  };

  extractCandidateTexts(responseDataText, textType).forEach((candidateText) => {
    pushCandidate({
      candidateText,
      segment: '',
      quality: 0,
      source: 'responseData'
    });
  });

  matches.forEach((match) => {
    extractCandidateTexts(match.translation, textType).forEach((candidateText) => {
      pushCandidate({
        candidateText,
        segment: match.segment || '',
        quality: Number(match.quality) || 0,
        source: 'match'
      });
    });
  });

  const ordered = [...candidateMap.values()].sort((left, right) => right.score - left.score);
  return ordered[0]?.text || cleanCandidate(responseDataText);
};
