# 🎬 Jumpy - Video Sharing App

**Jumpy** is a modern video sharing platform that allows users to upload, share, and discover videos across different categories. Built with React Native for mobile and Node.js for the backend.

![Jumpy Logo](backend/public/logo.svg)

## ✨ Features

### 🎥 Video Management
- **Category-based browsing**: Cartoons, Sports, Funny, Nature, Technology
- **Video upload**: Easy video upload with metadata
- **Video playback**: Full-featured video player with controls
- **Secure sharing**: Temporary encoded URLs for secure video sharing

### 🔐 User Authentication
- **User registration**: Create new accounts with email verification
- **Secure login**: JWT-based authentication
- **Profile management**: User profiles with device tracking

### 📱 Mobile App Features
- **Cross-platform**: Works on both iOS and Android
- **Modern UI**: Beautiful, intuitive interface with Jumpy branding
- **Offline support**: Basic offline functionality
- **Push notifications**: Real-time updates and alerts

### 🔒 Security Features
- **Encrypted sharing**: Temporary share codes with expiry
- **Device tracking**: Dual ID system for security and functionality
- **Password hashing**: Secure password storage with bcrypt
- **JWT tokens**: Secure session management

## 🏗️ Architecture

### Backend (Node.js + Express + MongoDB)
```
backend/
├── controllers/     # Business logic
├── models/         # Database models
├── routes/         # API endpoints
├── middleware/     # Authentication & validation
├── public/         # Static assets (logos, icons)
└── server.js       # Main server file
```

### Mobile App (React Native + Expo)
```
VideoPlayerAppNew/
├── src/
│   ├── components/ # UI components
│   ├── services/   # API services
│   ├── context/    # State management
│   └── utils/      # Helper functions
├── assets/         # Images, fonts, icons
└── App.tsx         # Main app component
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB
- Expo CLI
- Android Studio / Xcode (for mobile development)

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

The backend will start on `http://localhost:5001`

### Mobile App Setup
```bash
cd VideoPlayerAppNew
npm install
npx expo start
```

### Database Seeding
```bash
cd backend
node seedVideos.js
```

This will populate the database with 50 sample videos (10 per category).

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/profile` - Get user profile

### Videos
- `GET /api/videos/category/:category` - Get videos by category
- `POST /api/videos/upload` - Upload new video
- `GET /api/videos/share/:code` - Get video by share code
- `PUT /api/videos/:id/views` - Increment video views

## 🎨 Design System

### Colors
- **Primary**: `#667eea` (Purple Blue)
- **Secondary**: `#764ba2` (Deep Purple)
- **Accent**: `#ff6b6b` (Coral Red)
- **Background**: `#f8f9fa` (Light Gray)

### Typography
- **App Name**: Bold, 32px
- **Headers**: Bold, 28px
- **Body**: Regular, 16px
- **Labels**: Semi-bold, 16px

## 📱 App Screenshots

### Authentication
- **Sign In**: Clean login interface with Jumpy branding
- **Sign Up**: User registration with validation

### Main Features
- **Categories**: Browse videos by category
- **Video List**: Grid layout with video thumbnails
- **Video Player**: Full-screen playback with controls
- **Upload**: Easy video upload interface

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
MONGODB_URI=mongodb://localhost:27017/jumpy_db
JWT_SECRET=your_jwt_secret_here
PORT=5001
NODE_ENV=development
```

### Mobile App Configuration
Update `VideoPlayerAppNew/app.json` for:
- App name and bundle ID
- Permissions
- Icon and splash screen

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Deploy to Vercel, Heroku, or your preferred platform

### Mobile App Deployment
1. Build for production: `expo build:android` or `expo build:ios`
2. Submit to App Store / Google Play Store

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

---

**Made with ❤️ by the Jumpy Team**

*Jump into amazing videos with Jumpy! 🎬* 