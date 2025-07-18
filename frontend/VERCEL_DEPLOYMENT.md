# Vercel Deployment Guide

## 🚀 Deploy to Vercel

### 1. Install Vercel CLI (if not already installed)
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy to Vercel
```bash
vercel --prod
```

## ⚙️ Environment Variables Setup

### Required Environment Variables in Vercel Dashboard:

1. **REACT_APP_API_BASE_URL**
   - Value: `https://notify-oxh1.onrender.com`
   - Description: Backend API URL

2. **REACT_APP_ENV**
   - Value: `production`
   - Description: Environment identifier

3. **REACT_APP_FRONTEND_URL**
   - Value: `https://notify-sepia.vercel.app` (or your Vercel domain)
   - Description: Frontend URL for redirects

4. **REACT_APP_GOOGLE_CLIENT_ID**
   - Value: `1056777795152-fqiuji6f3utu7v53can43ibtk1lkneso.apps.googleusercontent.com`
   - Description: Google OAuth Web client ID

## 🔧 Setting Environment Variables in Vercel Dashboard:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each environment variable:
   - Click **Add New**
   - Enter the variable name (e.g., `REACT_APP_API_BASE_URL`)
   - Enter the value (e.g., `https://notify-oxh1.onrender.com`)
   - Select **Production** environment
   - Click **Save**

## 🌐 Domain Configuration:

### Google OAuth Authorized Domains:
Add your Vercel domain to Google OAuth console:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your Web client ID
4. Add your Vercel domain to **Authorized JavaScript origins**:
   - `https://notify-sepia.vercel.app`
   - `https://your-custom-domain.vercel.app` (if using custom domain)

## 🔄 Deployment Commands:

### Development Build:
```bash
npm run build:dev
```

### Production Build:
```bash
npm run build:prod
```

### Deploy with Vercel:
```bash
vercel --prod
```

## 📝 Important Notes:

1. **Environment Variables**: Must be set in Vercel dashboard for production
2. **Google OAuth**: Ensure your Vercel domain is added to authorized origins
3. **CORS**: Backend must allow requests from your Vercel domain
4. **Build**: Vercel automatically runs `npm run build` during deployment

## 🐛 Troubleshooting:

### If Google Sign-In doesn't work:
1. Check environment variables in Vercel dashboard
2. Verify Google OAuth domain configuration
3. Check browser console for errors
4. Ensure backend CORS allows Vercel domain

### If API calls fail:
1. Verify `REACT_APP_API_BASE_URL` is correct
2. Check backend is running and accessible
3. Verify CORS configuration on backend

## 🔗 Useful Links:

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Vercel CLI Documentation](https://vercel.com/docs/cli) 