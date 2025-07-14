# Render Deployment Guide

## 🚀 Deploy Backend on Render

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended for easy deployment)

### Step 2: Connect Your Repository
1. In Render dashboard, click "New +"
2. Select "Web Service"
3. Connect your GitHub repository: `bilal060/notify`
4. Select the repository

### Step 3: Configure the Service
- **Name:** `notification-backend`
- **Environment:** `Node`
- **Region:** `Oregon` (or closest to your users)
- **Branch:** `main`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** `Free` (or upgrade if needed)

### Step 4: Set Environment Variables
Add these environment variables in Render dashboard:

```
NODE_ENV=production
PORT=10000
MONGO_URL=mongodb+srv://dbuser:Bil%40l112@cluster0.ey6gj6g.mongodb.net/mob_notifications
JWT_SECRET=your-super-secure-jwt-secret
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Step 5: Deploy
1. Click "Create Web Service"
2. Render will automatically build and deploy your app
3. Your service will be available at: `https://notification-backend.onrender.com`

## 🔧 Render Features

### Free Tier Includes:
- **512 MB RAM**
- **Shared CPU**
- **750 hours/month** (enough for 24/7 operation)
- **Automatic HTTPS**
- **Custom domains**
- **Auto-deploy from Git**

### Keep-Alive Configuration:
Render's free tier services **sleep after 15 minutes of inactivity** and wake up on the first request. To prevent this:

1. **Upgrade to Paid Plan** ($7/month) for always-on service
2. **Use External Keep-Alive Service** (like UptimeRobot)
3. **Run Keep-Alive Script** on your local machine

## 🛠️ Keep-Alive Solutions

### Option 1: External Monitoring Service
Use [UptimeRobot](https://uptimerobot.com) (free):
1. Sign up at uptimerobot.com
2. Add new monitor
3. URL: `https://notification-backend.onrender.com/api/health`
4. Check interval: 5 minutes

### Option 2: Local Keep-Alive Script
```bash
# Install the keep-alive script
cd backend
npm install

# Run keep-alive (update URL after deployment)
export SERVER_URL="https://notification-backend.onrender.com"
npm run keep-alive
```

### Option 3: Upgrade to Paid Plan
- **$7/month** for always-on service
- No sleep, instant response
- Better performance

## 📊 Monitoring

### Health Check Endpoints:
- **Health:** `https://notification-backend.onrender.com/api/health`
- **Keep-Alive:** `https://notification-backend.onrender.com/api/keep-alive`

### Render Dashboard:
- Monitor logs, performance, and uptime
- Automatic deployments on git push
- Easy environment variable management

## 🔄 Auto-Deploy
Your service will automatically redeploy when you push to the `main` branch on GitHub.

## 📝 Important Notes:
1. **Free tier sleeps after 15 minutes** - first request may take 30-60 seconds
2. **Environment variables** must be set in Render dashboard
3. **MongoDB connection** should work from Render's servers
4. **File uploads** will be temporary on free tier (use cloud storage for production) 