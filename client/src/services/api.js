const API_URL = (import.meta.env.BACKEND_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
const AUTH_EVENT = 'frenchease:unauthorized';

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
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
    if (response.status === 401) {
      window.dispatchEvent(new Event(AUTH_EVENT));
    }

    throw new Error(data.message || 'Request failed');
  }

  return data;
};

export const translateText = async ({ text }) => {
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

export const registerUser = async ({ username, password }) => {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
};

export const loginUser = async ({ username, password }) => {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
};

export const logoutUser = async () => {
  return request('/api/auth/logout', {
    method: 'POST'
  });
};

export const changePassword = async ({ currentPassword, nextPassword }) => {
  return request('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, nextPassword })
  });
};

export const fetchCurrentUser = async () => {
  return request('/api/auth/me');
};

export const onUnauthorized = (handler) => {
  window.addEventListener(AUTH_EVENT, handler);
  return () => window.removeEventListener(AUTH_EVENT, handler);
};
