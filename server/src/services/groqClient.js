import { env } from '../config/env.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const extractJson = (content) => {
  const trimmed = content.trim();

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
};

export const logGroqFallback = (context, error) => {
  if (env.nodeEnv !== 'production') {
    console.warn(`Groq ${context} fallback:`, error.message);
  }
};

export const parseJsonSafely = (content, fallback) => {
  try {
    return JSON.parse(extractJson(content));
  } catch (error) {
    logGroqFallback('JSON parse', error);
    return fallback;
  }
};

const requestGroq = async ({ messages, temperature, responseFormat }) => {
  if (!env.groqApiKey) {
    throw new Error('GROQ_API_KEY is required');
  }

  const body = {
    model: env.groqModel,
    temperature,
    messages
  };

  if (responseFormat) {
    body.response_format = responseFormat;
  }

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.groqApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Groq API request failed');
  }

  return data.choices?.[0]?.message?.content || '';
};

export const callGroqJson = async ({ messages, temperature = 0.1 }) => {
  return requestGroq({
    messages,
    temperature,
    responseFormat: { type: 'json_object' }
  });
};

export const callGroqText = async ({ messages, temperature = 0.45 }) => {
  return requestGroq({
    messages,
    temperature
  });
};
