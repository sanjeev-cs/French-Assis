const IPA_SEQUENCE_MAP = [
  ['\u025B\u0303', 'ehn'],
  ['\u0251\u0303', 'ahn'],
  ['\u0254\u0303', 'ohn'],
  ['\u0153\u0303', 'uhn'],
  ['dj\u025Bn', 'dyen'],
  ['dj\u025B\u0303', 'dyehn'],
  ['tj\u025Bn', 'tyen'],
  ['tj\u025B\u0303', 'tyehn'],
  ['sj\u025Bn', 'syen'],
  ['sj\u025B\u0303', 'syehn'],
  ['d\u0292', 'j'],
  ['t\u0283', 'ch'],
  ['dj', 'dy'],
  ['tj', 'ty'],
  ['sj', 'sy'],
  ['\u0283', 'sh'],
  ['\u0292', 'zh'],
  ['\u0272', 'ny'],
  ['\u0281', 'r'],
  ['\u0265', 'wee'],
  ['\u025Bn', 'en'],
  ['\u0251n', 'ahn'],
  ['\u0254n', 'on'],
  ['j', 'y'],
  ['w', 'w'],
  ['\u00F8', 'uh'],
  ['\u0153', 'uh'],
  ['\u0259', 'uh'],
  ['e', 'ay'],
  ['\u025B', 'eh'],
  ['i', 'ee'],
  ['y', 'ee'],
  ['u', 'oo'],
  ['o', 'oh'],
  ['\u0254', 'aw'],
  ['a', 'ah'],
  ['b', 'b'],
  ['d', 'd'],
  ['f', 'f'],
  ['g', 'g'],
  ['k', 'k'],
  ['l', 'l'],
  ['m', 'm'],
  ['n', 'n'],
  ['p', 'p'],
  ['s', 's'],
  ['t', 't'],
  ['v', 'v'],
  ['z', 'z']
];

const normalizeIpa = (ipa) => {
  return String(ipa || '')
    .trim()
    .replace(/[\/\[\]]/g, '')
    .replace(/['ËˆËŒˈˌ]/g, '')
    .replace(/\s+/g, '')
    .replace(/\./g, '-');
};

export const normalizeReadableGuide = (guide) => {
  return String(guide || '')
    .trim()
    .replace(/[*_`]/g, '')
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/(^-|-$)/g, '');
};

export const hasUsableReadableGuide = (guide) => {
  const normalized = normalizeReadableGuide(guide).toLowerCase();

  if (!normalized) {
    return false;
  }

  return !(
    normalized.includes('unavailable') ||
    normalized.includes('not recognized') ||
    normalized.includes('not recognised') ||
    normalized.includes('pronunciation guide') ||
    normalized.includes('ipa') ||
    normalized.includes('transcription')
  );
};

const consumeMappedToken = (remaining) => {
  for (const [token, readable] of IPA_SEQUENCE_MAP) {
    if (remaining.startsWith(token)) {
      return { token, readable };
    }
  }

  return null;
};

export const buildReadableGuideFromIpa = (ipa) => {
  const normalized = normalizeIpa(ipa);

  if (!normalized) {
    return '';
  }

  let output = '';
  let index = 0;

  while (index < normalized.length) {
    const current = normalized[index];

    if (current === '-') {
      output += '-';
      index += 1;
      continue;
    }

    const mapped = consumeMappedToken(normalized.slice(index));

    if (mapped) {
      output += mapped.readable;
      index += mapped.token.length;
      continue;
    }

    output += current;
    index += 1;
  }

  return output
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase();
};
