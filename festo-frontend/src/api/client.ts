import axios from 'axios';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  if (typeof window !== 'undefined') {
    try {
      const url = new URL(envUrl);
      // Synchronize hostname when running locally (127.0.0.1 vs localhost) to prevent cross-origin cookie rejection
      if (
        (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') &&
        (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
      ) {
        url.hostname = window.location.hostname;
        return `${url.origin}/api`;
      }
    } catch {
      // ignore URL parse errors
    }
  }
  return `${envUrl}/api`;
};

export const apiClient = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token header if present in localStorage as a bulletproof fallback for cross-site cookie restrictions
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('festo_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
