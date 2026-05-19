const IPA_SEQUENCE_MAP = [
  ['ɑ̃', 'ahn'],
  ['ɔ̃', 'ohn'],
  ['ɛ̃', 'ehn'],
  ['œ̃', 'uhn'],
  ['dʒ', 'j'],
  ['tʃ', 'ch'],
  ['dj', 'dy'],
  ['tj', 'ty'],
  ['sj', 'sy'],
  ['ʃ', 'sh'],
  ['ʒ', 'zh'],
  ['ɲ', 'ny'],
  ['ʁ', 'r'],
  ['ɥ', 'wee'],
  ['j', 'y'],
  ['w', 'w'],
  ['ø', 'uh'],
  ['œ', 'uh'],
  ['ə', 'uh'],
  ['e', 'ay'],
  ['ɛ', 'eh'],
  ['i', 'ee'],
  ['y', 'ee'],
  ['u', 'oo'],
  ['o', 'oh'],
  ['ɔ', 'aw'],
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
    .replace(/['ˈˌ]/g, '')
    .replace(/\s+/g, '')
    .replace(/\./g, '-');
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
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
};
