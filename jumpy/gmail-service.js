const { google } = require('googleapis');
const path = require('path');
const winston = require('winston');

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/gmail-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/gmail.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

class GmailService {
  constructor() {
    this.gmail = null;
    this.auth = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      const KEYFILEPATH = path.join(__dirname, 'jumpy-465913-08f53af635f1.json');
      const SCOPES = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/gmail.send'
      ];

      this.auth = new google.auth.GoogleAuth({
        keyFile: KEYFILEPATH,
        scopes: SCOPES,
      });

      this.gmail = google.gmail({ version: 'v1', auth: this.auth });
      this.initialized = true;
      
      logger.info('Gmail service initialized successfully');
      return true;
    } catch (error) {
      logger.error('Gmail service initialization failed:', error);
      return false;
    }
  }

  async getUnreadMessages(maxResults = 10) {
    if (!this.initialized) {
      throw new Error('Gmail service not initialized');
    }

    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults: maxResults,
        q: 'is:unread'
      });

      return response.data.messages || [];
    } catch (error) {
      logger.error('Error fetching unread messages:', error);
      throw error;
    }
  }

  async getMessageDetails(messageId) {
    if (!this.initialized) {
      throw new Error('Gmail service not initialized');
    }

    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId
      });

      return response.data;
    } catch (error) {
      logger.error(`Error fetching message ${messageId}:`, error);
      throw error;
    }
  }

  async markAsRead(messageId) {
    if (!this.initialized) {
      throw new Error('Gmail service not initialized');
    }

    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['UNREAD']
        }
      });

      logger.info(`Message ${messageId} marked as read`);
      return true;
    } catch (error) {
      logger.error(`Error marking message ${messageId} as read:`, error);
      throw error;
    }
  }

  async forwardMessage(messageId, forwardTo) {
    if (!this.initialized) {
      throw new Error('Gmail service not initialized');
    }

    try {
      // Get the original message
      const originalMessage = await this.getMessageDetails(messageId);
      
      // Extract headers
      const headers = originalMessage.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
      const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender';
      const date = headers.find(h => h.name === 'Date')?.value || '';

      // Create forwarded message
      const forwardedMessage = {
        raw: Buffer.from(
          `To: ${forwardTo}\r\n` +
          `Subject: Fwd: ${subject}\r\n` +
          `From: ${from}\r\n` +
          `Content-Type: text/plain; charset=UTF-8\r\n` +
          `\r\n` +
          `Forwarded message:\r\n` +
          `From: ${from}\r\n` +
          `Date: ${date}\r\n` +
          `Subject: ${subject}\r\n` +
          `\r\n` +
          `[Email content forwarded from jumpy app]`
        ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      };

      // Send the forwarded message
      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: forwardedMessage
      });

      logger.info(`Message ${messageId} forwarded to ${forwardTo}`);
      return response.data;
    } catch (error) {
      logger.error(`Error forwarding message ${messageId}:`, error);
      throw error;
    }
  }

  async searchMessages(query, maxResults = 10) {
    if (!this.initialized) {
      throw new Error('Gmail service not initialized');
    }

    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults: maxResults,
        q: query
      });

      return response.data.messages || [];
    } catch (error) {
      logger.error(`Error searching messages with query "${query}":`, error);
      throw error;
    }
  }

  async getLabels() {
    if (!this.initialized) {
      throw new Error('Gmail service not initialized');
    }

    try {
      const response = await this.gmail.users.labels.list({
        userId: 'me'
      });

      return response.data.labels || [];
    } catch (error) {
      logger.error('Error fetching labels:', error);
      throw error;
    }
  }

  async createLabel(labelName) {
    if (!this.initialized) {
      throw new Error('Gmail service not initialized');
    }

    try {
      const response = await this.gmail.users.labels.create({
        userId: 'me',
        requestBody: {
          name: labelName,
          labelListVisibility: 'labelShow',
          messageListVisibility: 'show'
        }
      });

      logger.info(`Label "${labelName}" created successfully`);
      return response.data;
    } catch (error) {
      logger.error(`Error creating label "${labelName}":`, error);
      throw error;
    }
  }

  async addLabelToMessage(messageId, labelId) {
    if (!this.initialized) {
      throw new Error('Gmail service not initialized');
    }

    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          addLabelIds: [labelId]
        }
      });

      logger.info(`Label ${labelId} added to message ${messageId}`);
      return true;
    } catch (error) {
      logger.error(`Error adding label ${labelId} to message ${messageId}:`, error);
      throw error;
    }
  }

  async deleteMessage(messageId) {
    if (!this.initialized) {
      throw new Error('Gmail service not initialized');
    }

    try {
      await this.gmail.users.messages.delete({
        userId: 'me',
        id: messageId
      });

      logger.info(`Message ${messageId} deleted successfully`);
      return true;
    } catch (error) {
      logger.error(`Error deleting message ${messageId}:`, error);
      throw error;
    }
  }

  async getProfile() {
    if (!this.initialized) {
      throw new Error('Gmail service not initialized');
    }

    try {
      const response = await this.gmail.users.getProfile({
        userId: 'me'
      });

      return response.data;
    } catch (error) {
      logger.error('Error fetching Gmail profile:', error);
      throw error;
    }
  }
}

module.exports = GmailService; 