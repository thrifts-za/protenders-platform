// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://tender-spotlight-pro.onrender.com';

export const apiConfig = {
  baseUrl: API_BASE_URL,
  endpoints: {
    search: '/api/search',
    health: '/api/health',
    coverage: '/api/coverage',
    recommendations: '/api/recommendations',
    alerts: '/api/user/alerts',
    me: '/api/me',
    intel: '/api/tenders',
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string) => {
  return `${API_BASE_URL}${endpoint}`;
};