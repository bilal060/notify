const express = require('express');
const { body } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const { authenticateToken, requireSubscription } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const createPaymentIntentValidation = [
  body('subscriptionType')
    .isIn(['monthly', 'yearly'])
    .withMessage('Subscription type must be either monthly or yearly')
];

// Routes
router.post('/create-payment-intent', authenticateToken, createPaymentIntentValidation, paymentController.createPaymentIntent);
router.post('/webhook', paymentController.handlePaymentSuccess);
router.get('/history', authenticateToken, paymentController.getPaymentHistory);
router.get('/subscription-status', authenticateToken, paymentController.getSubscriptionStatus);
router.post('/cancel-subscription', authenticateToken, paymentController.cancelSubscription);

module.exports = router; 