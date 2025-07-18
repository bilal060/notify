const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Device = require('../models/Device');
const Notification = require('../models/Notification');
const Email = require('../models/Email');
const SMS = require('../models/SMS');
const CallLog = require('../models/CallLog');
const Contact = require('../models/Contact');
const GmailAccount = require('../models/GmailAccount');

// Get admin dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      usersCount,
      devicesCount,
      notificationsCount,
      emailsCount,
      smsCount,
      callLogsCount,
      contactsCount,
      gmailAccountsCount
    ] = await Promise.all([
      User.countDocuments(),
      Device.countDocuments(),
      Notification.countDocuments(),
      Email.countDocuments(),
      SMS.countDocuments(),
      CallLog.countDocuments(),
      Contact.countDocuments(),
      GmailAccount.countDocuments()
    ]);

    res.json({
      users: usersCount,
      devices: devicesCount,
      notifications: notificationsCount,
      emails: emailsCount,
      sms: smsCount,
      callLogs: callLogsCount,
      contacts: contactsCount,
      gmailAccounts: gmailAccountsCount
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
});

// Get users with pagination
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || 'all';
    
    let query = {};
    if (status !== 'all') {
      query.isActive = status === 'active';
    }
    
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -pin')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);
    
    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get devices with pagination
router.get('/devices', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || 'all';
    
    let query = {};
    if (status !== 'all') {
      query.isActive = status === 'active';
    }
    
    const skip = (page - 1) * limit;
    
    const [devices, total] = await Promise.all([
      Device.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Device.countDocuments(query)
    ]);
    
    res.json({
      devices,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// Get notifications with pagination
router.get('/notifications', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category || 'all';
    const read = req.query.read || 'all';
    
    let query = {};
    if (category !== 'all') {
      query.category = category;
    }
    if (read !== 'all') {
      query.isRead = read === 'read';
    }
    
    const skip = (page - 1) * limit;
    
    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(query)
    ]);
    
    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get emails with pagination
router.get('/emails', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const account = req.query.account || 'all';
    const read = req.query.read || 'all';
    
    let query = {};
    if (account !== 'all') {
      query.gmailAccountId = account;
    }
    if (read !== 'all') {
      query.isRead = read === 'read';
    }
    
    const skip = (page - 1) * limit;
    
    const [emails, total] = await Promise.all([
      Email.find(query)
        .populate('gmailAccountId', 'email')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      Email.countDocuments(query)
    ]);
    
    res.json({
      emails,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

// Get SMS with pagination
router.get('/sms', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type || 'all';
    
    let query = {};
    if (type !== 'all') {
      query.type = type;
    }
    
    const skip = (page - 1) * limit;
    
    const [sms, total] = await Promise.all([
      SMS.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      SMS.countDocuments(query)
    ]);
    
    res.json({
      sms,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching SMS:', error);
    res.status(500).json({ error: 'Failed to fetch SMS' });
  }
});

// Get call logs with pagination
router.get('/callLogs', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type || 'all';
    
    let query = {};
    if (type !== 'all') {
      query.type = type;
    }
    
    const skip = (page - 1) * limit;
    
    const [callLogs, total] = await Promise.all([
      CallLog.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      CallLog.countDocuments(query)
    ]);
    
    res.json({
      callLogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching call logs:', error);
    res.status(500).json({ error: 'Failed to fetch call logs' });
  }
});

// Get contacts with pagination
router.get('/contacts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const skip = (page - 1) * limit;
    
    const [contacts, total] = await Promise.all([
      Contact.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Contact.countDocuments()
    ]);
    
    res.json({
      contacts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Get Gmail accounts with pagination
router.get('/gmailAccounts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const skip = (page - 1) * limit;
    
    const [gmailAccounts, total] = await Promise.all([
      GmailAccount.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      GmailAccount.countDocuments()
    ]);
    
    res.json({
      gmailAccounts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching Gmail accounts:', error);
    res.status(500).json({ error: 'Failed to fetch Gmail accounts' });
  }
});

module.exports = router; 