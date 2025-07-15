// API Configuration
const getApiBaseUrl = () => {
  // Production: Use environment variable from Vercel
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // Development: Use localhost:5000
  return 'http://localhost:5000';
};

const API_BASE_URL = getApiBaseUrl();

// API utility functions
const api = {
  // Base URL getter
  getBaseUrl: () => API_BASE_URL,
  
  // Generic request function
  request: async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  // GET request
  get: (endpoint) => api.request(endpoint),

  // POST request
  post: (endpoint, data) => api.request(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // PUT request
  put: (endpoint, data) => api.request(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // DELETE request
  delete: (endpoint) => api.request(endpoint, {
    method: 'DELETE',
  }),

  // File upload
  upload: (endpoint, formData) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    return fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });
  },
};

// Environment info for debugging
console.log('🌐 API Configuration:');
console.log('   Environment:', process.env.NODE_ENV);
console.log('   API Base URL:', API_BASE_URL);
console.log('   Frontend URL:', window.location.origin);

export default api;
export { API_BASE_URL }; 