import api from '../utils/api';
import { API_CONFIG, HTTP_STATUS, ERROR_MESSAGES } from '../constants';

class ApiService {
  constructor() {
    this.baseURL = api.getBaseUrl();
    this.timeout = API_CONFIG.TIMEOUT;
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
    this.retryDelay = API_CONFIG.RETRY_DELAY;
  }

  // Generic request method with retry logic
  async request(endpoint, options = {}, retryCount = 0) {
    try {
      const response = await api.request(endpoint, {
        ...options,
        timeout: this.timeout,
      });
      return response;
    } catch (error) {
      if (this.shouldRetry(error, retryCount)) {
        await this.delay(this.retryDelay * (retryCount + 1));
        return this.request(endpoint, options, retryCount + 1);
      }
      throw this.handleError(error);
    }
  }

  // Check if request should be retried
  shouldRetry(error, retryCount) {
    const isNetworkError = !error.response;
    const isServerError = error.response?.status >= 500;
    const isRetryableStatus = error.response?.status === 429; // Rate limit
    const hasRetriesLeft = retryCount < this.retryAttempts;

    return (isNetworkError || isServerError || isRetryableStatus) && hasRetriesLeft;
  }

  // Delay helper
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Error handler
  handleError(error) {
    if (!error.response) {
      return new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }

    const { status, data } = error.response;
    
    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        return new Error(ERROR_MESSAGES.UNAUTHORIZED);
      case HTTP_STATUS.FORBIDDEN:
        return new Error(ERROR_MESSAGES.FORBIDDEN);
      case HTTP_STATUS.NOT_FOUND:
        return new Error(ERROR_MESSAGES.NOT_FOUND);
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return new Error(ERROR_MESSAGES.SERVER_ERROR);
      default:
        return new Error(data?.message || ERROR_MESSAGES.SERVER_ERROR);
    }
  }

  // Auth methods
  async login(credentials) {
    return this.request('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  // Admin methods
  async getAdminStats() {
    return this.request('/api/admin/stats');
  }

  async getDevices(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/devices?${queryString}`);
  }

  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/users?${queryString}`);
  }

  async getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/notifications?${queryString}`);
  }

  async getEmails(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/emails?${queryString}`);
  }

  async getSMS(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/sms?${queryString}`);
  }

  async getCallLogs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/call-logs?${queryString}`);
  }

  async getContacts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/contacts?${queryString}`);
  }

  async getGmailAccounts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/gmail-accounts?${queryString}`);
  }

  // File upload
  async uploadFile(endpoint, file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    return api.upload(endpoint, formData);
  }
}

export default new ApiService(); 