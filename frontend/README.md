# Advanced Attack System - Frontend

A React-based frontend for the Advanced Attack System, featuring Google Sign-In integration, admin dashboard, and comprehensive data management.

## 🚀 Features

- **Google Sign-In Integration**: Secure authentication using Google OAuth 2.0
- **Admin Dashboard**: Comprehensive data management interface
- **Real-time Data**: Live updates for notifications, emails, and device data
- **Responsive Design**: Mobile-friendly interface
- **Dark Mode Support**: Automatic theme switching
- **Privacy & Legal**: Built-in Privacy Policy and Terms of Service pages

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Cloud Console account (for Google Sign-In)
- Backend API running

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables**
   ```env
   # API Configuration
   REACT_APP_API_URL=http://localhost:3000/api
   REACT_APP_ENV=development

   # Google Sign-In
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here

   # Google Analytics
   REACT_APP_GA_TRACKING_ID=your_ga_tracking_id_here
   ```

## 🔧 Google Sign-In Setup

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API

### 2. Configure OAuth 2.0
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
5. Add authorized redirect URIs:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)

### 3. Get Client ID
1. Copy the generated Client ID
2. Add it to your `.env.local` file:
   ```env
   REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
- Runs on `http://localhost:3000`
- Hot reload enabled
- Development environment

### Production Mode
```bash
npm run prod
```
- Optimized build
- Production environment
- Environment variables from `.env.production`

### Build for Production
```bash
npm run build
```
- Creates optimized production build
- Output in `build/` directory

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   └── common/         # Shared components
├── hooks/              # Custom React hooks
├── context/            # React context providers
├── services/           # API services
├── utils/              # Utility functions
├── pages/              # Page components
└── config/             # Configuration files
```

## 🔐 Authentication

### Google Sign-In Flow
1. User clicks "Sign in with Google"
2. Google OAuth popup appears
3. User authorizes the application
4. Google returns JWT credential
5. Frontend sends credential to backend
6. Backend verifies and creates/updates user
7. Backend returns JWT token
8. Frontend stores token and redirects to dashboard

### Protected Routes
- All admin routes require authentication
- JWT token stored in localStorage
- Automatic token refresh
- Redirect to login if unauthorized

## 🎨 Styling

- **CSS Modules**: Component-scoped styles
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Automatic theme detection
- **Google Material Design**: Consistent with Google's design language

## 📊 Data Management

### Real-time Updates
- WebSocket connections for live data
- Automatic refresh intervals
- Optimistic UI updates

### Data Types
- **Notifications**: App notifications from devices
- **Emails**: Gmail integration data
- **SMS**: Text message data
- **Call Logs**: Phone call history
- **Contacts**: Device contact lists
- **Device Info**: Hardware and software details

## 🔧 Configuration

### Environment Variables
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_GOOGLE_CLIENT_ID`: Google OAuth Client ID
- `REACT_APP_GA_TRACKING_ID`: Google Analytics ID
- `REACT_APP_ENV`: Environment (development/production)

### API Configuration
- Base URL configuration in `src/config/constants.js`
- Request/response interceptors
- Error handling middleware
- Authentication headers

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📦 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the application: `npm run build`
2. Upload `build/` directory to your web server
3. Configure server to serve `index.html` for all routes

## 🔒 Security

### Best Practices
- Environment variables for sensitive data
- HTTPS in production
- Content Security Policy headers
- XSS protection
- CSRF protection via JWT tokens

### Google Sign-In Security
- Client ID validation
- JWT token verification
- Secure token storage
- Automatic token refresh

## 📝 Legal

### Privacy Policy
- Accessible at `/privacy`
- GDPR compliant
- Data collection disclosure
- User rights information

### Terms of Service
- Accessible at `/terms`
- Service usage terms
- User obligations
- Liability limitations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: support@yourcompany.com
- Documentation: [Link to docs]

## 🔄 Changelog

### v1.0.0
- Initial release
- Google Sign-In integration
- Admin dashboard
- Real-time data management
- Privacy Policy and Terms of Service pages
