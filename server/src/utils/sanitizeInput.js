export const stripHtml = (value) => value.replace(/<[^>]*>?/gm, '');

export const sanitizeText = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return stripHtml(value).trim();
};
