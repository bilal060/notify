# 🔥 Firebase Setup Guide for Tour Dubai Project

## 📋 **Your Firebase Project Details**

- **Project ID**: `tour-dubai-79253`
- **Project Name**: Tour Dubai
- **Service Account**: `firebase-adminsdk-fbsvc@tour-dubai-79253.iam.gserviceaccount.com`

## 🚀 **Step 1: Enable Firebase Services**

Go to [Firebase Console](https://console.firebase.google.com/project/tour-dubai-79253) and enable these services:

### **1.1 Firestore Database**
1. Go to **Firestore Database** in the left sidebar
2. Click **Create Database**
3. Choose **Start in test mode** (for development)
4. Select a location (choose closest to your users)
5. Click **Done**

### **1.2 Realtime Database**
1. Go to **Realtime Database** in the left sidebar
2. Click **Create Database**
3. Choose **Start in test mode** (for development)
4. Select a location (same as Firestore)
5. Click **Done**

### **1.3 Storage (Optional - Paid Service)**
1. Go to **Storage** in the left sidebar
2. Click **Get Started**
3. Choose **Start in test mode** (for development)
4. Select a location (same as others)
5. Click **Done**

**💡 Cost-Saving Note**: Firebase Storage is currently **DISABLED** in the app to avoid costs. Only metadata is stored in Firestore. You can enable it by changing `ENABLE_STORAGE = true` in `FirebaseService.kt`.

### **1.4 Cloud Messaging**
1. Go to **Cloud Messaging** in the left sidebar
2. It should be automatically enabled

## 📱 **Step 2: Android App Configuration**

### **2.1 Add Android App**
1. Go to **Project Settings** (gear icon)
2. Click **Add app** → **Android**
3. Enter package name: `com.jumpy.videoplayerapp`
4. Enter app nickname: `Video Player Pro`
5. Click **Register app**

### **2.2 Download google-services.json**
1. Download the `google-services.json` file
2. Place it in `jumpy/app/` directory
3. The file should be at: `jumpy/app/google-services.json`

### **2.3 Enable Authentication (Optional)**
1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** if needed
3. Enable **Google** if needed

## 🔧 **Step 3: Security Rules**

### **3.1 Firestore Rules**
Go to **Firestore Database** → **Rules** and set:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for all users (development only)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### **3.2 Realtime Database Rules**
Go to **Realtime Database** → **Rules** and set:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### **3.3 Storage Rules**
Go to **Storage** → **Rules** and set:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

## 📊 **Step 4: Test Configuration**

### **4.1 Run Mobile Test**
```bash
cd jumpy
node test-firebase-mobile.js
```

### **4.2 Expected Output**
```
🚀 Starting Mobile Firebase Integration Tests...

🔗 Testing Firebase Connection...
✅ Firestore connection successful
✅ Realtime Database connection successful

📊 Testing Firestore Operations...
✅ Notifications collection write successful
✅ Messages collection write successful
✅ Contacts collection write successful

⚡ Testing Realtime Database...
✅ Live data updates successful
✅ Device status updates successful

📱 Testing Device Status Updates...
✅ Sync status updates successful
✅ Device token updates successful

🔄 Testing Data Sync Simulation...
✅ Bulk sync simulation successful

🔔 Testing Push Notifications...
📤 Secret alert notification prepared
📤 Sync request notification prepared
📤 Device command notification prepared

📁 Testing Storage Operations...
✅ Storage metadata write successful (Storage disabled)
💡 Note: Firebase Storage is disabled to avoid costs. Only metadata is stored.

📡 Testing Real-time Updates...
✅ Real-time updates write successful
📡 Real-time update received: { new_command: 'collect_data', sync_request: true, alert: 'New data available' }

📊 Test Results Summary:
========================
✅ Firebase Connection: PASS
✅ Firestore Operations: PASS
✅ Realtime Database: PASS
✅ Device Status: PASS
✅ Data Sync: PASS
✅ Push Notifications: PASS
✅ Storage Operations: PASS
✅ Real-time Updates: PASS

📈 Summary: 8 passed, 0 failed

🎉 All tests passed! Mobile Firebase integration is ready.
```

## 🚨 **Troubleshooting**

### **Issue 1: Realtime Database Error**
If you see: `Firebase error. Please ensure that you have the URL of your Firebase Realtime Database instance configured correctly`

**Solution:**
1. Go to **Realtime Database** in Firebase Console
2. Make sure it's created and enabled
3. Copy the database URL from the console
4. Update the URL in your code if needed

### **Issue 2: Permission Denied**
If you see permission errors:

**Solution:**
1. Check that all services are enabled
2. Verify security rules are set to allow read/write
3. Make sure you're using the correct service account

### **Issue 3: google-services.json Missing**
If the Android app can't find the configuration:

**Solution:**
1. Download `google-services.json` from Firebase Console
2. Place it in `jumpy/app/` directory
3. Make sure the package name matches exactly

## 📱 **Step 5: Build Android App**

### **5.1 Build the App**
```bash
cd jumpy
./gradlew assembleDebug
```

### **5.2 Install on Device**
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

## 🔔 **Step 6: Test Push Notifications**

### **6.1 Get Device Token**
1. Install the app on a device
2. Check logs for FCM token
3. Copy the token for testing

### **6.2 Send Test Notification**
Use Firebase Console or the test script to send notifications.

## 📈 **Step 7: Monitor Data**

### **7.1 Firebase Console**
- **Firestore**: View structured data
- **Realtime Database**: View live updates
- **Storage**: View uploaded files
- **Analytics**: View app usage

### **7.2 Logs**
Check Android logs for Firebase operations:
```bash
adb logcat | grep Firebase
```

## 🔒 **Security Notes**

⚠️ **Important**: The current rules allow full access for development. For production:

1. **Implement proper authentication**
2. **Set up user-based security rules**
3. **Enable App Check**
4. **Use proper data validation**

## 📞 **Support**

If you encounter issues:

1. Check Firebase Console for errors
2. Review Android logs
3. Verify all services are enabled
4. Test with Firebase Console directly

---

**🎉 Your Firebase project `tour-dubai-79253` is now ready for mobile integration!** 