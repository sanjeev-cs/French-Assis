import { callGroqJson, callGroqText, logGroqFallback, parseJsonSafely } from './groqClient.js';

const getPhoneticsPrompt = () => `You are a Canadian French phonetics expert for English-speaking beginners. Given French text, silently verify the pronunciation before returning JSON.

Rules for the simplified pronunciation guide:
- Use syllable-by-syllable English approximations separated by hyphens.
- Do not use IPA symbols in pronunciation_guide.
- Do not use capital N to show nasal vowels.
- Approximate French nasal vowels consistently:
  - an/en/am/em sounds like "ahn" (comment -> koh-mahn)
  - on/om sounds like "ohn" (bonjour -> bohn-zhoor)
  - in/ain/ein sounds like "ehn"
  - un sounds like "uhn"
- Mark silent endings in pronunciation_explanation, not pronunciation_guide.
- For phrases, preserve natural rhythm and do not over-pronounce final silent consonants.
- If there are regional variants, follow Canadian French first and mention standard alternatives briefly in pronunciation_explanation when useful.
- In word_breakdown, translation must be the English meaning of the French word when reasonably possible.

Examples:
- "Bonjour" -> pronunciation_guide: "bohn-zhoor"
- "Comment ça va ?" -> pronunciation_guide: "koh-mahn sah vah"
- "Je suis étudiant" -> pronunciation_guide: "zhuh swee zay-tew-dyahn"

Return ONLY valid JSON in this exact format (no markdown, no explanation outside JSON):
{
  "phonetic_transcription": "IPA transcription here",
  "pronunciation_guide": "Simplified English pronunciation guide",
  "word_breakdown": [{ "word": "french word", "translation": "English meaning", "phonetic": "IPA", "english_hint": "say it like..." }],
  "pronunciation_explanation": "Beginner-friendly explanation of why the word or sentence is pronounced this way. Mention silent letters, nasal vowels, liaison, dropped endings, or French sound rules when relevant.",
  "audio_description": "Brief description of how each sound is formed"
}`;

export const getPhonetics = async (frenchText) => {
  const fallback = {
    phonetic_transcription: '',
    pronunciation_guide: 'Pronunciation guide unavailable',
    word_breakdown: [],
    pronunciation_explanation: 'Pronunciation explanation unavailable',
    audio_description: 'Audio description unavailable'
  };

  try {
    const content = await callGroqJson({
      messages: [
        { role: 'system', content: getPhoneticsPrompt() },
        { role: 'user', content: frenchText }
      ]
    });

    return parseJsonSafely(content, fallback);
  } catch (error) {
    logGroqFallback('phonetics', error);
    return fallback;
  }
};

export const getAiTip = async (word, translation) => {
  const fallback = {
    memory_tip: 'AI tip unavailable.',
    example_sentence: {
      french: '',
      english: '',
      phonetic_transcription: '',
      pronunciation_guide: ''
    },
    common_mistake: '',
    difficulty: 'beginner'
  };

  const prompt = `You are a French language coach. For the English word or phrase '${word}' which translates to '${translation}' in Canadian French, provide a short memory tip, one natural usage example in Canadian French, pronunciation for the French example sentence, and one common mistake to avoid. Make the French example correct and natural for learners. Return ONLY valid JSON:
{
  "memory_tip": "...",
  "example_sentence": {
    "french": "...",
    "english": "...",
    "phonetic_transcription": "IPA transcription of the French example sentence",
    "pronunciation_guide": "Simplified English pronunciation guide for the French example sentence"
  },
  "common_mistake": "...",
  "difficulty": "beginner|intermediate|advanced"
}`;

  try {
    const content = await callGroqJson({ messages: [{ role: 'user', content: prompt }] });
    return parseJsonSafely(content, fallback);
  } catch (error) {
    logGroqFallback('AI tip', error);
    return fallback;
  }
};

export const getChatResponse = async ({ message, history = [] }) => {
  const safeHistory = history
    .filter((item) => ['user', 'assistant'].includes(item.role) && typeof item.content === 'string')
    .slice(-8)
    .map((item) => ({
      role: item.role,
      content: item.content.slice(0, 700)
    }));

  try {
    const content = await callGroqText({
      messages: [
        {
          role: 'system',
          content:
            'You are FrenchEase Assistant, a concise French language tutor. Help with French translation, pronunciation, grammar, vocabulary, usage, memorization, and practice. Give clear beginner-friendly answers. Do not use markdown formatting, bold markers, asterisks, or code fences. Use short plain-text lines or simple hyphen lists. For pronunciation, be precise and conservative: say readable guides are approximations, prefer Canadian French, avoid inventing sound rules, and mention silent letters, nasal vowels, liaison, or dropped endings only when relevant. Include French examples with English translations when useful. If the question is unrelated to French learning, politely redirect to French learning help.'
        },
        ...safeHistory,
        { role: 'user', content: message }
      ]
    });

    return {
      answer: content.trim() || 'I could not generate a response. Please try again.'
    };
  } catch (error) {
    logGroqFallback('chat', error);
    return {
      answer: 'The AI chat is temporarily unavailable. Please try again in a moment.'
    };
  }
};
