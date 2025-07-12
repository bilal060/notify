const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Payment = require('../models/Payment');

// Create payment intent for subscription
const createPaymentIntent = async (req, res) => {
  try {
    const { subscriptionType } = req.body;
    const userId = req.user._id;

    // Validate subscription type
    if (!['monthly', 'yearly'].includes(subscriptionType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription type'
      });
    }

    // Set amount based on subscription type
    const amounts = {
      monthly: 999, // $9.99
      yearly: 9999  // $99.99
    };

    const amount = amounts[subscriptionType];

    // Get or create Stripe customer
    let user = await User.findById(userId);
    let customerId = user.subscription.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.username,
        metadata: {
          userId: userId.toString()
        }
      });

      customerId = customer.id;
      user.subscription.stripeCustomerId = customerId;
      await user.save();
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      customer: customerId,
      metadata: {
        userId: userId.toString(),
        subscriptionType: subscriptionType
      },
      description: `Notification monitoring subscription - ${subscriptionType}`
    });

    // Create payment record
    const payment = new Payment({
      user: userId,
      amount: amount,
      subscriptionType: subscriptionType,
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId: customerId,
      status: 'pending'
    });

    await payment.save();

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount,
        subscriptionType: subscriptionType
      }
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent'
    });
  }
};

// Handle payment success webhook
const handlePaymentSuccess = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      
      // Find and update payment record
      const payment = await Payment.findOne({
        stripePaymentIntentId: paymentIntent.id
      });

      if (payment) {
        payment.status = 'succeeded';
        await payment.save();

        // Update user subscription
        const user = await User.findById(payment.user);
        if (user) {
          const now = new Date();
          const endDate = new Date(now);
          
          if (payment.subscriptionType === 'monthly') {
            endDate.setMonth(endDate.getMonth() + 1);
          } else if (payment.subscriptionType === 'yearly') {
            endDate.setFullYear(endDate.getFullYear() + 1);
          }

          user.subscription = {
            type: payment.subscriptionType,
            startDate: now,
            endDate: endDate,
            isActive: true,
            stripeCustomerId: payment.stripeCustomerId,
            stripeSubscriptionId: paymentIntent.id
          };

          await user.save();
        }
      }
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
};

// Get user payment history
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const payments = await Payment.getUserPayments(userId, page, limit);
    const totalPayments = await Payment.countDocuments({ user: userId });

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalPayments / limit),
          totalItems: totalPayments,
          itemsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment history'
    });
  }
};

// Get subscription status
const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const subscriptionInfo = {
      type: user.subscription.type,
      isActive: user.isSubscriptionActive(),
      startDate: user.subscription.startDate,
      endDate: user.subscription.endDate,
      daysRemaining: 0
    };

    if (subscriptionInfo.isActive && user.subscription.endDate) {
      const now = new Date();
      const endDate = new Date(user.subscription.endDate);
      const diffTime = endDate - now;
      subscriptionInfo.daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    res.json({
      success: true,
      data: {
        subscription: subscriptionInfo
      }
    });

  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription status'
    });
  }
};

// Cancel subscription
const cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.subscription.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Cancel subscription in Stripe
    try {
      await stripe.subscriptions.cancel(user.subscription.stripeSubscriptionId);
    } catch (stripeError) {
      console.error('Stripe cancellation error:', stripeError);
      // Continue with local cancellation even if Stripe fails
    }

    // Update local subscription
    user.subscription.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
};

module.exports = {
  createPaymentIntent,
  handlePaymentSuccess,
  getPaymentHistory,
  getSubscriptionStatus,
  cancelSubscription
}; 