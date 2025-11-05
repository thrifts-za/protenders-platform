// API configuration
// Use same-origin routes to avoid external dependencies.
export const apiConfig = {
  baseUrl: '',
  endpoints: {
    search: '/api/search',
    health: '/api/health',
    coverage: '/api/coverage',
    recommendations: '/api/recommendations',
    alerts: '/api/user/alerts',
    me: '/api/me',
    intel: '/api/tenders',
  },
};

// Helper: return same-origin path
export const getApiUrl = (endpoint: string) => endpoint;
