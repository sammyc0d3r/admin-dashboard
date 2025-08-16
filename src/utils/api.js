import { API_URL } from '../config';

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('adminToken');
  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const data = await response.json();
      errorDetail = data.detail || JSON.stringify(data);
    } catch {
      // ignore
    }
    throw new Error(errorDetail || response.statusText);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};
