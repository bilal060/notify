const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testSettings() {
  console.log('🧪 Testing Settings System...\n');
  
  try {
    // Test 1: Get current settings
    console.log('1. Getting current settings...');
    const getResponse = await axios.get(`${API_BASE_URL}/settings`);
    console.log('✅ Settings retrieved:', JSON.stringify(getResponse.data.data, null, 2));
    
    // Test 2: Update settings
    console.log('\n2. Updating settings...');
    const updates = {
      whatsapp: {
        messages: {
          intervalHours: 2, // Change to 2 hours
          enabled: true
        },
        contacts: {
          intervalHours: 12, // Change to 12 hours
          enabled: true
        }
      },
      notifications: {
        intervalMinutes: 10, // Change to 10 minutes
        enabled: true
      }
    };
    
    const updateResponse = await axios.put(`${API_BASE_URL}/settings`, updates);
    console.log('✅ Settings updated:', JSON.stringify(updateResponse.data.data, null, 2));
    
    // Test 3: Check if WhatsApp messages should update (should be true initially)
    console.log('\n3. Checking if WhatsApp messages should update...');
    const shouldUpdateResponse = await axios.get(`${API_BASE_URL}/settings/should-update/whatsapp/messages`);
    console.log('✅ Should update WhatsApp messages:', shouldUpdateResponse.data.shouldUpdate);
    
    // Test 4: Record update time for WhatsApp messages
    console.log('\n4. Recording update time for WhatsApp messages...');
    const updateTimeResponse = await axios.post(`${API_BASE_URL}/settings/update-time/whatsapp/messages`);
    console.log('✅ Update time recorded:', updateTimeResponse.data.message);
    
    // Test 5: Check again (should be false now)
    console.log('\n5. Checking again if WhatsApp messages should update...');
    const shouldUpdateResponse2 = await axios.get(`${API_BASE_URL}/settings/should-update/whatsapp/messages`);
    console.log('✅ Should update WhatsApp messages:', shouldUpdateResponse2.shouldUpdate);
    
    // Test 6: Check different data types
    console.log('\n6. Checking different data types...');
    const dataTypes = [
      { type: 'whatsapp', subType: 'contacts' },
      { type: 'facebook' },
      { type: 'notifications' },
      { type: 'sms' },
      { type: 'email' }
    ];
    
    for (const dataType of dataTypes) {
      const response = await axios.get(`${API_BASE_URL}/settings/should-update/${dataType.type}${dataType.subType ? '/' + dataType.subType : ''}`);
      console.log(`   ${dataType.type}${dataType.subType ? '/' + dataType.subType : ''}: ${response.data.shouldUpdate}`);
    }
    
    console.log('\n🎉 All settings tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testSettings(); 