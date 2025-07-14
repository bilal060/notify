const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'public/uploads/profiles';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId)
      .select('-password -pin')
      .populate('followers', 'username profilePicture')
      .populate('following', 'username profilePicture');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, displayName, bio } = req.body;
    
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -pin');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const userId = req.user.id;
    const profilePictureUrl = `/uploads/profiles/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: profilePictureUrl },
      { new: true }
    ).select('-password -pin');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      message: 'Profile picture updated successfully',
      profilePicture: profilePictureUrl,
      user 
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload cover photo
const uploadCoverPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const userId = req.user.id;
    const coverPhotoUrl = `/uploads/profiles/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { coverPhoto: coverPhotoUrl },
      { new: true }
    ).select('-password -pin');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      message: 'Cover photo updated successfully',
      coverPhoto: coverPhotoUrl,
      user 
    });
  } catch (error) {
    console.error('Error uploading cover photo:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Set/Update PIN
const setPin = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pin } = req.body;
    
    if (!pin || pin.length < 4 || pin.length > 6) {
      return res.status(400).json({ message: 'PIN must be 4-6 digits' });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { pin },
      { new: true }
    ).select('-password -pin');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'PIN set successfully' });
  } catch (error) {
    console.error('Error setting PIN:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset PIN
const resetPin = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Password is required to reset PIN' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }
    
    user.pin = null;
    await user.save();
    
    res.json({ message: 'PIN reset successfully' });
  } catch (error) {
    console.error('Error resetting PIN:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by username (public profile)
const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username })
      .select('-password -pin -email -deviceId')
      .populate('followers', 'username profilePicture')
      .populate('following', 'username profilePicture');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error getting user by username:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Follow/Unfollow user
const toggleFollow = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { targetUserId } = req.params;
    
    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }
    
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);
    
    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isFollowing = currentUser.following.includes(targetUserId);
    
    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }
    
    await Promise.all([currentUser.save(), targetUser.save()]);
    
    res.json({ 
      message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
      isFollowing: !isFollowing
    });
  } catch (error) {
    console.error('Error toggling follow:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  uploadCoverPhoto,
  changePassword,
  setPin,
  resetPin,
  getUserByUsername,
  toggleFollow,
  upload
}; 