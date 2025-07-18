const fs = require('fs');
const path = require('path');

// Function to extract Firebase credentials from JSON file
function extractFirebaseCredentials(jsonFilePath) {
  try {
    // Read the JSON file
    const jsonContent = fs.readFileSync(jsonFilePath, 'utf8');
    const credentials = JSON.parse(jsonContent);
    
    console.log('🔥 Firebase Credentials Extracted Successfully!\n');
    
    // Extract the required values
    const extractedCredentials = {
      FIREBASE_PROJECT_ID: credentials.project_id,
      FIREBASE_PRIVATE_KEY_ID: credentials.private_key_id,
      FIREBASE_PRIVATE_KEY: credentials.private_key,
      FIREBASE_CLIENT_EMAIL: credentials.client_email,
      FIREBASE_CLIENT_ID: credentials.client_id,
      FIREBASE_CLIENT_CERT_URL: credentials.client_x509_cert_url
    };
    
    // Display the credentials
    console.log('📋 Your Firebase Credentials:\n');
    Object.entries(extractedCredentials).forEach(([key, value]) => {
      console.log(`${key}=${value}`);
    });
    
    // Generate the .env entries
    console.log('\n📝 Add these lines to your .env file:\n');
    console.log('# Firebase Configuration');
    Object.entries(extractedCredentials).forEach(([key, value]) => {
      // Handle private key specially (it contains newlines)
      if (key === 'FIREBASE_PRIVATE_KEY') {
        console.log(`${key}="${value}"`);
      } else {
        console.log(`${key}=${value}`);
      }
    });
    
    // Update .env file automatically
    updateEnvFile(extractedCredentials);
    
    return extractedCredentials;
    
  } catch (error) {
    console.error('❌ Error extracting credentials:', error.message);
    console.log('\n💡 Make sure you have downloaded the Firebase service account JSON file.');
    console.log('📁 Place it in the backend directory and run this script again.');
  }
}

// Function to update .env file
function updateEnvFile(credentials) {
  try {
    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    
    // Read existing .env file
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Remove existing Firebase entries
    const lines = envContent.split('\n').filter(line => {
      return !line.startsWith('FIREBASE_') && !line.startsWith('# Firebase');
    });
    
    // Add new Firebase entries
    lines.push('');
    lines.push('# Firebase Configuration');
    Object.entries(credentials).forEach(([key, value]) => {
      if (key === 'FIREBASE_PRIVATE_KEY') {
        lines.push(`${key}="${value}"`);
      } else {
        lines.push(`${key}=${value}`);
      }
    });
    
    // Write back to .env file
    fs.writeFileSync(envPath, lines.join('\n'));
    console.log('\n✅ .env file updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating .env file:', error.message);
  }
}

// Main execution
if (require.main === module) {
  console.log('🔥 Firebase Credentials Extractor\n');
  
  // Look for Firebase JSON file in current directory
  const files = fs.readdirSync(__dirname);
  const firebaseJsonFile = files.find(file => 
    file.includes('firebase') && file.includes('adminsdk') && file.endsWith('.json')
  );
  
  if (firebaseJsonFile) {
    console.log(`📁 Found Firebase JSON file: ${firebaseJsonFile}`);
    console.log('🔍 Extracting credentials...\n');
    extractFirebaseCredentials(path.join(__dirname, firebaseJsonFile));
  } else {
    console.log('❌ No Firebase service account JSON file found in the current directory.');
    console.log('\n📋 Instructions:');
    console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
    console.log('2. Click "Generate new private key"');
    console.log('3. Download the JSON file');
    console.log('4. Place the JSON file in the backend directory');
    console.log('5. Run this script again: node extract-firebase-credentials.js');
    console.log('\n💡 The JSON file should be named something like:');
    console.log('   tour-dubai-79253-firebase-adminsdk-xxxxx-xxxxxxxxxx.json');
  }
}

module.exports = { extractFirebaseCredentials }; 