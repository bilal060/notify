# Project Structure Guide

## Frontend Structure (React)

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── admin/           # Admin dashboard components
│   │   │   ├── AdminDashboard.js
│   │   │   ├── DevicesView.js
│   │   │   ├── UsersView.js
│   │   │   ├── NotificationsView.js
│   │   │   ├── EmailsView.js
│   │   │   ├── SMSView.js
│   │   │   ├── CallLogsView.js
│   │   │   ├── ContactsView.js
│   │   │   └── GmailAccountsView.js
│   │   ├── auth/            # Authentication components
│   │   │   ├── Login.js
│   │   │   └── Signup.js
│   │   ├── common/          # Reusable components
│   │   │   ├── LoadingSpinner.js
│   │   │   ├── ErrorBoundary.js
│   │   │   ├── EmptyState.js
│   │   │   ├── NetworkStatus.js
│   │   │   └── ProtectedRoute.js
│   │   ├── dashboard/       # Dashboard components
│   │   │   ├── Dashboard.js
│   │   │   ├── UserDetail.js
│   │   │   ├── Notifications.js
│   │   │   └── Media.js
│   │   └── monitor/         # Monitoring components
│   │       └── Monitor.js
│   ├── config/              # Configuration files
│   │   └── api.js           # API configuration
│   ├── constants/           # Constants and enums
│   │   └── index.js         # API config, routes, storage keys, etc.
│   ├── context/             # React Context providers
│   │   └── AuthContext.js   # Authentication context
│   ├── hooks/               # Custom React hooks
│   │   ├── useApi.js        # API call hooks
│   │   └── useAuth.js       # Authentication hooks
│   ├── services/            # API services
│   │   └── apiService.js    # Centralized API service
│   ├── utils/               # Utility functions
│   │   └── api.js           # API utility functions
│   ├── styles/              # Global styles
│   │   └── globals.css
│   ├── App.js               # Main app component
│   ├── App.css              # App styles
│   ├── index.js             # Entry point
│   └── index.css            # Global styles
├── .env.development         # Development environment variables
├── .env.production          # Production environment variables
├── package.json             # Dependencies and scripts
├── COMMANDS.md              # Available npm commands
└── DEPLOYMENT_GUIDE.md      # Deployment instructions
```

## Backend Structure (Node.js/Express)

```
backend/
├── config/                  # Configuration files
│   ├── database.js          # Database configuration
│   └── constants.js         # Application constants
├── controllers/             # Route controllers
│   ├── authController.js    # Authentication logic
│   ├── adminController.js   # Admin operations
│   ├── gmailController.js   # Gmail operations
│   ├── mediaController.js   # File uploads
│   ├── notificationController.js
│   ├── userController.js
│   └── ...
├── middleware/              # Express middleware
│   ├── auth.js              # Authentication middleware
│   ├── rateLimit.js         # Rate limiting
│   ├── cors.js              # CORS configuration
│   └── validation.js        # Request validation
├── models/                  # Database models
│   ├── User.js
│   ├── Device.js
│   ├── Notification.js
│   ├── Email.js
│   ├── GmailAccount.js
│   └── ...
├── routes/                  # API routes
│   ├── auth.js              # Authentication routes
│   ├── admin.js             # Admin routes
│   ├── gmail.js             # Gmail routes
│   ├── notifications.js
│   ├── users.js
│   └── ...
├── services/                # Business logic services
│   ├── gmailService.js      # Gmail API service
│   ├── emailService.js      # Email processing
│   ├── notificationService.js
│   └── ...
├── utils/                   # Utility functions
│   ├── logger.js            # Logging utility
│   ├── responseHandler.js   # Response formatting
│   ├── validation.js        # Validation helpers
│   ├── encryption.js        # Encryption utilities
│   └── helpers.js           # General helpers
├── uploads/                 # File uploads directory
├── logs/                    # Application logs
├── tests/                   # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── scripts/                 # Utility scripts
│   ├── seedAdminUser.js
│   ├── updateAdminUser.js
│   └── ...
├── server.js                # Main server file
├── package.json             # Dependencies and scripts
├── .env                     # Environment variables
├── .gitignore
├── Dockerfile               # Docker configuration
├── render.yaml              # Render deployment config
└── vercel.json              # Vercel deployment config
```

## Key Features of This Structure

### Frontend Best Practices:
- **Separation of Concerns**: Components, services, and utilities are clearly separated
- **Reusable Components**: Common components in `components/common/`
- **Centralized State**: Authentication context for global state management
- **Custom Hooks**: Reusable logic in custom hooks
- **API Abstraction**: Centralized API service with error handling
- **Environment Configuration**: Separate configs for dev/prod
- **Type Safety**: Ready for TypeScript migration

### Backend Best Practices:
- **MVC Pattern**: Models, Views (controllers), and business logic separation
- **Middleware Architecture**: Reusable middleware for common functionality
- **Service Layer**: Business logic separated from controllers
- **Configuration Management**: Centralized config files
- **Logging**: Structured logging with Winston
- **Error Handling**: Centralized error handling and response formatting
- **Validation**: Request validation with express-validator
- **Security**: Rate limiting, CORS, authentication middleware

### Development Workflow:
- **Environment-Specific Configs**: Different settings for dev/prod
- **Scripts**: Easy-to-use npm commands for different environments
- **Documentation**: Comprehensive guides and documentation
- **Testing Ready**: Structure supports unit, integration, and e2e tests

### Deployment Ready:
- **Docker Support**: Containerized deployment
- **Platform Configs**: Render and Vercel deployment configurations
- **Environment Variables**: Proper environment variable management
- **Health Checks**: Built-in health check endpoints

This structure follows industry best practices and is scalable for future development! 