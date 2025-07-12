import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Payment.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key');

const Payment = () => {
  const { user, hasActiveSubscription } = useAuth();
  const navigate = useNavigate();
  
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

  useEffect(() => {
    if (hasActiveSubscription()) {
      navigate('/dashboard');
    }
    fetchSubscriptionStatus();
  }, [hasActiveSubscription, navigate]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await axios.get('/api/payments/subscription-status');
      setSubscriptionStatus(response.data.data.subscription);
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      // Create payment intent
      const response = await axios.post('/api/payments/create-payment-intent', {
        subscriptionType: selectedPlan
      });

      const { clientSecret } = response.data.data;

      // Load Stripe
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Confirm payment
      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: {
            // In a real app, you'd collect card details via Stripe Elements
            // For demo purposes, we'll use a test card
            number: '4242424242424242',
            exp_month: 12,
            exp_year: 2024,
            cvc: '123'
          }
        }
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Payment successful! Your subscription is now active.');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly Plan',
      price: '$9.99',
      period: 'per month',
      features: [
        'Unlimited notification monitoring',
        'Real-time dashboard',
        'Email support',
        'Basic analytics'
      ],
      popular: false
    },
    {
      id: 'yearly',
      name: 'Yearly Plan',
      price: '$99.99',
      period: 'per year',
      features: [
        'Everything in Monthly',
        '2 months free',
        'Priority support',
        'Advanced analytics',
        'Custom integrations'
      ],
      popular: true
    }
  ];

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h1>Choose Your Plan</h1>
        <p>Select a subscription plan to start monitoring notifications</p>
      </div>

      <div className="plans-container">
        {plans.map(plan => (
          <div 
            key={plan.id}
            className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {plan.popular && <div className="popular-badge">Most Popular</div>}
            
            <div className="plan-header">
              <h3>{plan.name}</h3>
              <div className="plan-price">
                <span className="price">{plan.price}</span>
                <span className="period">{plan.period}</span>
              </div>
            </div>

            <ul className="plan-features">
              {plan.features.map((feature, index) => (
                <li key={index}>
                  <span className="checkmark">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              className={`select-plan-button ${selectedPlan === plan.id ? 'selected' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPlan(plan.id);
              }}
            >
              {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>

      <div className="payment-summary">
        <h3>Order Summary</h3>
        <div className="summary-item">
          <span>{plans.find(p => p.id === selectedPlan)?.name}</span>
          <span>{plans.find(p => p.id === selectedPlan)?.price}</span>
        </div>
        <div className="summary-total">
          <span>Total</span>
          <span>{plans.find(p => p.id === selectedPlan)?.price}</span>
        </div>
      </div>

      <div className="payment-actions">
        <button 
          className="subscribe-button"
          onClick={handleSubscribe}
          disabled={loading}
        >
          {loading ? 'Processing...' : `Subscribe to ${selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'} Plan`}
        </button>
        
        <button 
          className="back-button"
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>

      <div className="payment-info">
        <h4>What you get:</h4>
        <ul>
          <li>Unique monitoring URL for each user</li>
          <li>Real-time notification capture</li>
          <li>Secure data storage</li>
          <li>24/7 monitoring</li>
          <li>Easy-to-use dashboard</li>
        </ul>
      </div>

      <div className="security-notice">
        <p>
          <strong>🔒 Secure Payment:</strong> All payments are processed securely through Stripe. 
          We never store your payment information.
        </p>
      </div>
    </div>
  );
};

export default Payment; 