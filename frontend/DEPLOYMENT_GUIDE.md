# Deployment Guide

## Environment Configuration

### Development Environment
- **Frontend URL**: http://localhost:3000
- **Backend URL**: http://localhost:5000
- **Environment File**: `.env.development`

### Production Environment
- **Frontend URL**: https://notify-sepia.vercel.app
- **Backend URL**: https://your-backend.onrender.com
- **Environment File**: `.env.production`

## Environment Variables

### Frontend (Vercel)
Set these environment variables in your Vercel dashboard:

```bash
REACT_APP_API_BASE_URL=https://your-backend.onrender.com
REACT_APP_ENV=production
REACT_APP_FRONTEND_URL=https://notify-sepia.vercel.app
```

### Backend (Render)
Set these environment variables in your Render dashboard:

```bash
MONGO_URL=mongodb+srv://dbuser:Bil%40l112@cluster0.ey6gj6g.mongodb.net/mob_notifications
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-backend.onrender.com/api/gmail/callback
PORT=10000
NODE_ENV=production
```

## Deployment Steps

### 1. Backend (Render)
1. Connect your GitHub repository to Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables
5. Deploy

### 2. Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Add environment variables
5. Deploy

## API Configuration

The frontend now uses a centralized API utility (`src/utils/api.js`) that automatically:
- Uses the correct API URL based on environment
- Handles authentication tokens
- Provides consistent error handling
- Supports all HTTP methods (GET, POST, PUT, DELETE, file upload)

## Testing

### Development Testing
```bash
# Start backend
cd backend && npm start

# Start frontend
cd frontend && npm start

# Test admin login
# Email: mbilal.admin@gmail.com
# Password: mbilal.admin
```

### Production Testing
1. Visit https://notify-sepia.vercel.app
2. Login with admin credentials
3. Verify all admin dashboard features work
4. Check that data loads from Render backend

## Troubleshooting

### CORS Issues
- Ensure backend CORS allows your Vercel domain
- Check that API base URL is correct

### Authentication Issues
- Verify JWT_SECRET is set correctly
- Check that admin user exists in database

### Database Issues
- Verify MONGO_URL is correct
- Check MongoDB connection in Render logs

### Environment Variables
- Ensure all variables are set in Vercel/Render dashboards
- Check that variable names start with `REACT_APP_` for frontend

## Security Notes

- Admin access is restricted to users with `isAdmin: true` or `role: 'admin'`
- All API requests include authentication tokens
- Environment variables are properly secured
- CORS is configured for production domains only 