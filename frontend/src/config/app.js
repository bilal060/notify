const config = {
  // API Configuration
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001',
    timeout: 30000,
    retries: 3
  },

  // Google OAuth Configuration
  google: {
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com',
    scope: 'email profile openid',
    redirectUri: process.env.REACT_APP_GOOGLE_REDIRECT_URI || 'http://localhost:3000'
  },

  // App Configuration
  app: {
    name: 'Notification Dashboard',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    debug: process.env.NODE_ENV === 'development'
  },

  // UI Configuration
  ui: {
    theme: {
      primary: '#1976d2',
      secondary: '#dc004e',
      background: '#f5f5f5',
      surface: '#ffffff',
      error: '#f44336',
      warning: '#ff9800',
      success: '#4caf50',
      info: '#2196f3'
    },
    breakpoints: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920
    }
  },

  // Local Storage Keys
  storage: {
    token: 'auth_token',
    user: 'user_data',
    theme: 'app_theme',
    settings: 'app_settings'
  },

  // Routes
  routes: {
    home: '/',
    login: '/login',
    dashboard: '/dashboard',
    profile: '/profile',
    settings: '/settings',
    admin: '/admin'
  },

  // Features
  features: {
    googleSignIn: true,
    darkMode: true,
    notifications: true,
    realTimeUpdates: true
  }
};

export default config; 