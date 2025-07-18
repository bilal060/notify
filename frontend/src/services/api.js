import config from '../config/app';

class ApiService {
  constructor() {
    this.baseURL = config.api.baseUrl;
    this.timeout = config.api.timeout;
    this.retries = config.api.retries;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem(config.storage.token);
  }

  // Set auth token in localStorage
  setAuthToken(token) {
    if (token) {
      localStorage.setItem(config.storage.token, token);
    } else {
      localStorage.removeItem(config.storage.token);
    }
  }

  // Get user data from localStorage
  getUser() {
    const userData = localStorage.getItem(config.storage.user);
    return userData ? JSON.parse(userData) : null;
  }

  // Set user data in localStorage
  setUser(user) {
    if (user) {
      localStorage.setItem(config.storage.user, JSON.stringify(user));
    } else {
      localStorage.removeItem(config.storage.user);
    }
  }

  // Create headers for requests
  createHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Make HTTP request with retry logic
  async request(endpoint, options = {}, retryCount = 0) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.createHeaders(options.includeAuth !== false);

    const requestOptions = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle different response statuses
      if (response.status === 401) {
        // Unauthorized - clear auth data and redirect to login
        this.setAuthToken(null);
        this.setUser(null);
        window.location.href = config.routes.login;
        throw new Error('Authentication required');
      }

      if (response.status === 403) {
        throw new Error('Access forbidden');
      }

      if (response.status >= 500 && retryCount < this.retries) {
        // Retry on server errors
        await this.delay(1000 * (retryCount + 1)); // Exponential backoff
        return this.request(endpoint, options, retryCount + 1);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }

      if (retryCount < this.retries && !error.message.includes('Authentication required')) {
        // Retry on network errors
        await this.delay(1000 * (retryCount + 1));
        return this.request(endpoint, options, retryCount + 1);
      }

      throw error;
    }
  }

  // Delay utility for retries
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // GET request
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'GET',
      ...options,
    });
  }

  // POST request
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // PUT request
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // DELETE request
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  // PATCH request
  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // Upload file
  async upload(endpoint, file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);

    const headers = this.createHeaders(options.includeAuth !== false);
    delete headers['Content-Type']; // Let browser set content-type for FormData

    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers,
      ...options,
    });
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.get('/api/health');
      return response.status === 'healthy';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Test connection
  async testConnection() {
    try {
      await this.get('/api/health');
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService; 