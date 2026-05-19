const normalizeComparable = (value) => {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');
};

const sharedPrefixLength = (left, right) => {
  const max = Math.min(left.length, right.length);
  let count = 0;

  while (count < max && left[count] === right[count]) {
    count += 1;
  }

  return count;
};

export const isSameWordFamily = (baseWord, candidateWord) => {
  const left = normalizeComparable(baseWord);
  const right = normalizeComparable(candidateWord);

  if (!left || !right) {
    return false;
  }

  if (left === right) {
    return true;
  }

  const prefix = sharedPrefixLength(left, right);
  return prefix >= 4 || prefix / Math.min(left.length, right.length) >= 0.7;
};

export const keepRelatedWord = (baseWord, candidateWord, fallbackWord = '') => {
  return isSameWordFamily(baseWord, candidateWord) ? candidateWord : fallbackWord;
};
