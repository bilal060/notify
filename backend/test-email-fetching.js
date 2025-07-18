const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5001/api';
const FACEBOOK_ID = '100001234567890'; // Replace with actual Facebook ID

// Test email fetching by Facebook ID
async function testEmailFetching() {
    console.log('🧪 Testing Email Fetching by Facebook ID');
    console.log('=====================================');
    
    try {
        // Test different methods
        const methods = ['all', 'facebook_api', 'posts', 'database', 'pattern', 'gmail'];
        
        for (const method of methods) {
            console.log(`\n📧 Testing method: ${method}`);
            
            try {
                const response = await axios.get(`${BASE_URL}/facebook/emails/${FACEBOOK_ID}`, {
                    params: { method: method },
                    timeout: 10000
                });
                
                if (response.data.success) {
                    console.log(`✅ Method ${method}: Found ${response.data.data.totalEmails} emails`);
                    
                    if (response.data.data.emails.length > 0) {
                        console.log('📋 Emails found:');
                        response.data.data.emails.forEach((email, index) => {
                            console.log(`  ${index + 1}. ${email.email} (${email.source} - ${email.confidence})`);
                        });
                    }
                } else {
                    console.log(`❌ Method ${method}: ${response.data.message}`);
                }
                
            } catch (error) {
                console.log(`❌ Method ${method} failed: ${error.message}`);
            }
            
            // Wait between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Test profile extraction
async function testProfileExtraction() {
    console.log('\n👤 Testing Profile Extraction');
    console.log('============================');
    
    try {
        const response = await axios.get(`${BASE_URL}/facebook/profile/${FACEBOOK_ID}`, {
            timeout: 10000
        });
        
        if (response.data.success) {
            console.log('✅ Profile extracted successfully');
            console.log('📋 Profile data:', JSON.stringify(response.data.data, null, 2));
        } else {
            console.log('❌ Profile extraction failed:', response.data.message);
        }
        
    } catch (error) {
        console.error('❌ Profile test failed:', error.message);
    }
}

// Test posts extraction
async function testPostsExtraction() {
    console.log('\n📝 Testing Posts Extraction');
    console.log('==========================');
    
    try {
        const response = await axios.get(`${BASE_URL}/facebook/posts/${FACEBOOK_ID}`, {
            params: { limit: 10 },
            timeout: 10000
        });
        
        if (response.data.success) {
            console.log('✅ Posts extracted successfully');
            console.log(`📋 Found ${response.data.data.total} posts`);
            
            if (response.data.data.posts.length > 0) {
                console.log('📄 Sample posts:');
                response.data.data.posts.slice(0, 3).forEach((post, index) => {
                    console.log(`  ${index + 1}. ${post.message ? post.message.substring(0, 100) + '...' : 'No message'}`);
                });
            }
        } else {
            console.log('❌ Posts extraction failed:', response.data.message);
        }
        
    } catch (error) {
        console.error('❌ Posts test failed:', error.message);
    }
}

// Test search functionality
async function testSearch() {
    console.log('\n🔍 Testing Search Functionality');
    console.log('==============================');
    
    try {
        const searchQueries = ['john', 'jane', 'test'];
        
        for (const query of searchQueries) {
            console.log(`\n🔎 Searching for: "${query}"`);
            
            try {
                const response = await axios.get(`${BASE_URL}/facebook/search`, {
                    params: { query: query, type: 'user' },
                    timeout: 10000
                });
                
                if (response.data.success) {
                    console.log(`✅ Found ${response.data.data.data.length} results`);
                    
                    if (response.data.data.data.length > 0) {
                        console.log('👥 Sample results:');
                        response.data.data.data.slice(0, 3).forEach((profile, index) => {
                            console.log(`  ${index + 1}. ${profile.name} (${profile.username || 'No username'})`);
                        });
                    }
                } else {
                    console.log('❌ Search failed:', response.data.message);
                }
                
            } catch (error) {
                console.log(`❌ Search for "${query}" failed: ${error.message}`);
            }
            
            // Wait between searches
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
    } catch (error) {
        console.error('❌ Search test failed:', error.message);
    }
}

// Main test function
async function runAllTests() {
    console.log('🚀 Starting Facebook Email Fetching Tests');
    console.log('========================================');
    console.log(`📍 Base URL: ${BASE_URL}`);
    console.log(`🆔 Facebook ID: ${FACEBOOK_ID}`);
    console.log('');
    
    // Run tests
    await testProfileExtraction();
    await testPostsExtraction();
    await testSearch();
    await testEmailFetching();
    
    console.log('\n✅ All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = {
    testEmailFetching,
    testProfileExtraction,
    testPostsExtraction,
    testSearch,
    runAllTests
}; 