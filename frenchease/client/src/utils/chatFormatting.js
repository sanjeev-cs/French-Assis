const removeMarkdown = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
};

export const formatChatText = (content) => {
  return content
    .split('\n')
    .map((line) => removeMarkdown(line))
    .filter(Boolean)
    .map((line) => {
      const listMatch = line.match(/^[-•]\s*(.+)$/);
      return {
        type: listMatch ? 'list' : 'paragraph',
        text: listMatch ? listMatch[1] : line
      };
    });
};

export const extractSearchTerms = (content) => {
  const withoutMarkdown = removeMarkdown(content);
  const quotedTerms = [...withoutMarkdown.matchAll(/["']([^"']{2,60})["']/g)]
    .map((match) => match[1].trim())
    .filter((term) => /[a-zàâçéèêëîïôùûüÿœæ]/i.test(term));

  const boldTerms = [...content.matchAll(/\*\*([^*]{2,40})\*\*/g)]
    .map((match) => match[1].trim())
    .filter((term) => /[a-zàâçéèêëîïôùûüÿœæ]/i.test(term));

  return [...new Set([...boldTerms, ...quotedTerms])]
    .filter((term) => !/^(hello|english|french|formal|informal)$/i.test(term))
    .slice(0, 4);
};
