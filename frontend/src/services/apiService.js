const apiService = {
  // Base configuration
  baseURL: process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || 'http://localhost:5001',
  
  // Helper method to make API calls
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  },

  // Auth endpoints
  async login(credentials) {
    return this.request('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async register(userData) {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async googleSignIn(credential) {
    return this.request('/api/auth/google-signin', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
  },

  async logout() {
    return this.request('/api/auth/signout', {
      method: 'POST',
    });
  },

  // User endpoints
  async getProfile() {
    return this.request('/api/users/profile');
  },

  async updateProfile(userData) {
    return this.request('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Dashboard endpoints
  async getDashboardStats() {
    return this.request('/api/dashboard/stats');
  },

  async getNotifications(page = 1, limit = 50) {
    return this.request(`/api/notifications?page=${page}&limit=${limit}`);
  },

  async getContacts(page = 1, limit = 50) {
    return this.request(`/api/contacts?page=${page}&limit=${limit}`);
  },

  async getSMS(page = 1, limit = 50) {
    return this.request(`/api/sms?page=${page}&limit=${limit}`);
  },

  async getCallLogs(page = 1, limit = 50) {
    return this.request(`/api/callLogs?page=${page}&limit=${limit}`);
  },

  async getEmails(page = 1, limit = 50) {
    return this.request(`/api/gmail/emails?page=${page}&limit=${limit}`);
  },

  async getMedia(page = 1, limit = 50) {
    return this.request(`/api/media?page=${page}&limit=${limit}`);
  },

  // Admin endpoints
  async getUsers(page = 1, limit = 50) {
    return this.request(`/api/users?page=${page}&limit=${limit}`);
  },

  async getUser(userId) {
    return this.request(`/api/users/${userId}`);
  },

  async getDevices(page = 1, limit = 50) {
    return this.request(`/api/devices?page=${page}&limit=${limit}`);
  },

  async getGmailAccounts(page = 1, limit = 50) {
    return this.request(`/api/gmail/accounts?page=${page}&limit=${limit}`);
  },

  // Settings endpoints
  async getSettings() {
    return this.request('/api/settings');
  },

  async updateSettings(settings) {
    return this.request('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};

export default apiService; 