import { buildFallbackWordAlignment } from '../utils/wordAlignment.js';
import { callGroqJson, logGroqFallback, parseJsonSafely } from './groqClient.js';

const normalizeAlignmentRows = (rows) => {
  return (Array.isArray(rows) ? rows : [])
    .map((row) => ({
      sourceText: String(row?.sourceText || '').trim(),
      targetText: String(row?.targetText || '').trim()
    }))
    .filter((row) => row.sourceText && row.targetText);
};

export const getWordAlignment = async ({ sourceText, translatedText, sourceLang, targetLang, textType }) => {
  if (textType === 'word') {
    return [];
  }

  const fallback = buildFallbackWordAlignment({ sourceText, translatedText });

  try {
    const content = await callGroqJson({
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: `You align translated text for a French learning app.

Rules:
- Return target-language rows in the same order they appear in the translated text.
- Each row should pair a short source-language chunk with the matching target-language word or short phrase.
- Do not return dictionary meanings. Return alignment only.
- Keep sourceText learner-friendly and concise.
- Ignore punctuation-only tokens.
- When one target word maps to multiple source words, combine them into one short sourceText chunk.
- When a source pronoun or helper word is implied, align it to the most natural target token.

Return ONLY valid JSON:
{
  "rows": [
    { "sourceText": "source words", "targetText": "target word or phrase" }
  ]
}`
        },
        {
          role: 'user',
          content: JSON.stringify({
            sourceText,
            translatedText,
            sourceLang,
            targetLang,
            textType
          })
        }
      ]
    });

    const parsed = parseJsonSafely(content, { rows: fallback });
    const rows = normalizeAlignmentRows(parsed.rows);

    return rows.length ? rows : fallback;
  } catch (error) {
    logGroqFallback('word alignment', error);
    return fallback;
  }
};
