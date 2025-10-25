// Centralized API base URL and fetch helper for backend calls
// Uses env var NEXT_PUBLIC_BACKEND_URL with a safe default

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sean22123-backend.hf.space';

export const apiFetch = (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  return fetch(url, options);
};