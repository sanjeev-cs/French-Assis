const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

export const translateText = async (text) => {
  return request('/api/translate', {
    method: 'POST',
    body: JSON.stringify({ text })
  });
};

export const fetchPhonetics = async ({ frenchText, historyId }) => {
  return request('/api/phonetics', {
    method: 'POST',
    body: JSON.stringify({ frenchText, historyId })
  });
};

export const fetchAiTip = async ({ word, translation, historyId }) => {
  return request('/api/ai-tip', {
    method: 'POST',
    body: JSON.stringify({ word, translation, historyId })
  });
};

export const sendChatMessage = async ({ message, history }) => {
  return request('/api/ai-chat', {
    method: 'POST',
    body: JSON.stringify({ message, history })
  });
};

export const fetchHistory = async ({ page = 1, limit = 20 } = {}) => {
  return request(`/api/history?page=${page}&limit=${limit}`);
};

export const deleteHistory = async (id) => {
  return request(`/api/history/${id}`, {
    method: 'DELETE'
  });
};
