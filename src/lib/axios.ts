import axios from 'axios';

const backendUrl =
  process.env.BACKEND_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production' || process.env.VERCEL
    ? 'https://job-alert-portal-backend-wwc6.onrender.com'
    : 'http://localhost:5000');

const api = axios.create({
  baseURL: `${backendUrl.replace(/\/$/, '')}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Response error interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('[API Error]', error.response.status, error.config?.url);
    } else {
      console.error('[API Error]', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;