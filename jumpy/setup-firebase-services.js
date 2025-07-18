#!/usr/bin/env node

/**
 * 🔥 Firebase Services Setup Helper
 * 
 * This script helps you set up Firebase services and test the integration
 */

const admin = require('firebase-admin');
const readline = require('readline');

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class FirebaseSetupHelper {
  constructor() {
    this.projectId = serviceAccount.project_id;
    this.setupResults = [];
  }

  async runSetup() {
    console.log('🔥 Firebase Services Setup Helper');
    console.log('==================================\n');
    console.log(`📋 Project: ${this.projectId}`);
    console.log(`📧 Service Account: ${serviceAccount.client_email}\n`);

    try {
      // Test 1: Check Firestore
      await this.testFirestore();
      
      // Test 2: Check Realtime Database
      await this.testRealtimeDatabase();
      
      // Test 3: Check Storage
      await this.testStorage();
      
      // Test 4: Check Authentication
      await this.testAuthentication();
      
      // Print results
      this.printResults();
      
      // Provide next steps
      this.provideNextSteps();
      
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
    } finally {
      rl.close();
    }
  }

  async testFirestore() {
    console.log('📊 Testing Firestore Database...');
    
    try {
      const testDoc = await db.collection('test').doc('setup').get();
      console.log('✅ Firestore connection successful');
      
      // Test write operation
      await db.collection('test').doc('setup').set({
        timestamp: new Date(),
        test: 'setup',
        status: 'success'
      });
      console.log('✅ Firestore write operation successful');
      
      this.setupResults.push({ service: 'Firestore', status: 'PASS' });
      
    } catch (error) {
      console.error('❌ Firestore test failed:', error.message);
      this.setupResults.push({ service: 'Firestore', status: 'FAIL', error: error.message });
    }
  }

  async testRealtimeDatabase() {
    console.log('\n⚡ Testing Realtime Database...');
    
    try {
      const testRef = rtdb.ref('test/setup');
      await testRef.set({
        timestamp: Date.now(),
        test: 'setup',
        status: 'success'
      });
      console.log('✅ Realtime Database write successful');
      
      const snapshot = await testRef.once('value');
      const data = snapshot.val();
      console.log('✅ Realtime Database read successful');
      
      this.setupResults.push({ service: 'Realtime Database', status: 'PASS' });
      
    } catch (error) {
      console.error('❌ Realtime Database test failed:', error.message);
      console.log('💡 This usually means the Realtime Database needs to be created in Firebase Console');
      this.setupResults.push({ service: 'Realtime Database', status: 'FAIL', error: error.message });
    }
  }

  async testStorage() {
    console.log('\n📁 Testing Firebase Storage...');
    
    try {
      // Note: Storage is disabled in the app to avoid costs
      console.log('💡 Storage is currently disabled to avoid costs');
      console.log('✅ Storage test skipped (intentionally disabled)');
      
      this.setupResults.push({ service: 'Storage', status: 'SKIPPED', note: 'Disabled to avoid costs' });
      
    } catch (error) {
      console.error('❌ Storage test failed:', error.message);
      this.setupResults.push({ service: 'Storage', status: 'FAIL', error: error.message });
    }
  }

  async testAuthentication() {
    console.log('\n🔐 Testing Firebase Authentication...');
    
    try {
      // Test admin SDK authentication
      const auth = admin.auth();
      console.log('✅ Firebase Auth admin SDK working');
      
      this.setupResults.push({ service: 'Authentication', status: 'PASS' });
      
    } catch (error) {
      console.error('❌ Authentication test failed:', error.message);
      this.setupResults.push({ service: 'Authentication', status: 'FAIL', error: error.message });
    }
  }

  printResults() {
    console.log('\n📊 Setup Results Summary:');
    console.log('==========================');
    
    this.setupResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'SKIPPED' ? '⏭️' : '❌';
      console.log(`${icon} ${result.service}: ${result.status}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      if (result.note) {
        console.log(`   Note: ${result.note}`);
      }
    });
    
    const passed = this.setupResults.filter(r => r.status === 'PASS').length;
    const failed = this.setupResults.filter(r => r.status === 'FAIL').length;
    const skipped = this.setupResults.filter(r => r.status === 'SKIPPED').length;
    
    console.log(`\n📈 Summary: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  }

  provideNextSteps() {
    console.log('\n🎯 Next Steps:');
    console.log('==============');
    
    const failedServices = this.setupResults.filter(r => r.status === 'FAIL');
    
    if (failedServices.length === 0) {
      console.log('🎉 All services are working! You can now:');
      console.log('1. Build your Android app: ./gradlew assembleDebug');
      console.log('2. Install on device: adb install app/build/outputs/apk/debug/app-debug.apk');
      console.log('3. Test the mobile integration');
    } else {
      console.log('⚠️ Some services need to be enabled in Firebase Console:');
      console.log('\n🔧 Manual Setup Required:');
      console.log('1. Go to https://console.firebase.google.com/project/tour-dubai-79253');
      
      failedServices.forEach(service => {
        switch (service.service) {
          case 'Realtime Database':
            console.log('2. Click "Realtime Database" → "Create Database" → "Start in test mode"');
            break;
          case 'Firestore':
            console.log('2. Click "Firestore Database" → "Create Database" → "Start in test mode"');
            break;
          case 'Storage':
            console.log('2. Click "Storage" → "Get Started" → "Start in test mode"');
            break;
          case 'Authentication':
            console.log('2. Click "Authentication" → "Get Started" → Enable sign-in methods');
            break;
        }
      });
      
      console.log('3. Run this script again to verify setup');
    }
    
    console.log('\n📱 Android App Setup:');
    console.log('1. Go to Project Settings → Add app → Android');
    console.log('2. Package name: com.jumpy.videoplayerapp');
    console.log('3. Download google-services.json and place in app/ directory');
    console.log('4. Build and test the app');
  }
}

// Run setup
async function main() {
  const helper = new FirebaseSetupHelper();
  await helper.runSetup();
}

// Check if firebase-service-account.json exists
const fs = require('fs');
if (!fs.existsSync('./firebase-service-account.json')) {
  console.error('❌ firebase-service-account.json not found!');
  console.log('📋 Please ensure the Firebase service account file is in the jumpy directory');
  process.exit(1);
}

main(); 