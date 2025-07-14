# Fly.io Environment Setup Guide

## Required Environment Variables

After creating your Fly.io app, set these secrets:

```bash
# MongoDB Connection
flyctl secrets set MONGO_URL="mongodb+srv://dbuser:Bil%40l112@cluster0.ey6gj6g.mongodb.net/mob_notifications"

# JWT Secret
flyctl secrets set JWT_SECRET="your-super-secure-jwt-secret"

# Frontend URL (update with your actual frontend URL)
flyctl secrets set FRONTEND_URL="https://your-frontend-url.vercel.app"

# Node Environment
flyctl secrets set NODE_ENV="production"
```

## Commands to Run After Adding Payment Info:

1. **Create the app:**
   ```bash
   flyctl apps create notification-backend --org personal
   ```

2. **Set secrets:**
   ```bash
   flyctl secrets set MONGO_URL="mongodb+srv://dbuser:Bil%40l112@cluster0.ey6gj6g.mongodb.net/mob_notifications"
   flyctl secrets set JWT_SECRET="your-super-secure-jwt-secret"
   flyctl secrets set FRONTEND_URL="https://your-frontend-url.vercel.app"
   flyctl secrets set NODE_ENV="production"
   ```

3. **Create volume for uploads:**
   ```bash
   flyctl volumes create notification_data --size 1 --region iad
   ```

4. **Deploy:**
   ```bash
   flyctl deploy
   ```

5. **Check status:**
   ```bash
   flyctl status
   flyctl logs
   ```

## Your API will be available at:
- **Production URL:** https://notification-backend.fly.dev
- **Health Check:** https://notification-backend.fly.dev/api/health 