import { isSameWordFamily } from './translationGuards.js';

const normalizeComparable = (value) => {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');
};

const feminineLikeEndings = [
  'e',
  'es',
  'enne',
  'aine',
  'aise',
  'oise',
  'ole',
  'elle',
  'ive',
  'euse',
  'trice',
  'nne',
  'tte'
];

const looksFeminine = (word) => {
  const normalized = normalizeComparable(word);

  if (!normalized) {
    return false;
  }

  return feminineLikeEndings.some((ending) => normalized.endsWith(ending));
};

const dedupeCandidates = (candidates) => {
  const seen = new Set();

  return candidates.filter((candidate) => {
    const normalized = normalizeComparable(candidate);

    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
};

const chooseMasculineForm = (baseWord, candidates) => {
  const related = dedupeCandidates(candidates).filter((candidate) => isSameWordFamily(baseWord, candidate));

  if (!related.length) {
    return '';
  }

  const sorted = [...related].sort((left, right) => {
    const leftFeminine = looksFeminine(left) ? 1 : 0;
    const rightFeminine = looksFeminine(right) ? 1 : 0;

    if (leftFeminine !== rightFeminine) {
      return leftFeminine - rightFeminine;
    }

    return normalizeComparable(left).length - normalizeComparable(right).length;
  });

  return sorted[0] || '';
};

const chooseFeminineForm = (masculineForm, candidates) => {
  if (!masculineForm) {
    return '';
  }

  const normalizedMasculine = normalizeComparable(masculineForm);

  const related = dedupeCandidates(candidates).filter((candidate) => {
    const normalizedCandidate = normalizeComparable(candidate);

    return normalizedCandidate && normalizedCandidate !== normalizedMasculine && isSameWordFamily(masculineForm, candidate);
  });

  const feminineCandidates = related.filter((candidate) => looksFeminine(candidate));

  if (feminineCandidates.length) {
    return feminineCandidates.sort((left, right) => normalizeComparable(left).length - normalizeComparable(right).length)[0];
  }

  return '';
};

export const inferFrenchGenderForms = ({ baseWord, candidates = [] }) => {
  const masculine = chooseMasculineForm(baseWord, [baseWord, ...candidates]);
  const feminine = chooseFeminineForm(masculine || baseWord, candidates);

  return {
    applicable: Boolean(masculine && feminine),
    masculine: masculine || '',
    feminine: feminine || ''
  };
};
