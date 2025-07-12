# Notification Monitoring System

A comprehensive MERN stack application for monitoring mobile device notifications in real-time. Users can sign up, subscribe to a plan, and receive a unique URL to monitor notifications from their mobile devices.

## Features

- **User Authentication**: Secure signup/login system with JWT tokens
- **Subscription Management**: Monthly and yearly plans with Stripe integration
- **Unique Monitoring URLs**: Each user gets a personalized URL for mobile monitoring
- **Real-time Notification Capture**: Service worker captures notifications from mobile browsers
- **Dashboard Analytics**: View notification statistics and manage captured data
- **Responsive Design**: Modern UI that works on all devices

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Stripe** for payment processing
- **bcrypt** for password hashing
- **cors** for cross-origin requests

### Frontend
- **React.js** with functional components and hooks
- **React Router** for navigation
- **Axios** for API calls
- **React Toastify** for notifications
- **Stripe.js** for payment processing
- **Service Workers** for notification capture

## Project Structure

```
notification/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── paymentController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Notification.js
│   │   └── Payment.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── payments.js
│   │   └── notifications.js
│   ├── server.js
│   ├── package.json
│   └── env.example
├── frontend/
│   ├── public/
│   │   ├── monitor.html
│   │   └── sw.js
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── payment/
│   │   │   └── common/
│   │   ├── context/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Stripe account

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/notification-system
JWT_SECRET=your_jwt_secret_here
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

5. Start the server:
```bash
npm start
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

5. Start the development server:
```bash
npm start
```

## Usage

### User Flow

1. **Sign Up**: Users create an account with email and password
2. **Subscribe**: Choose between monthly ($9.99) or yearly ($99.99) plans
3. **Get Unique URL**: Each user receives a personalized monitoring URL
4. **Mobile Setup**: Open the URL on the mobile device to be monitored
5. **Grant Permissions**: Allow notification access when prompted
6. **Monitor**: View captured notifications in the dashboard

### API Endpoints

#### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### Payments
- `POST /api/payments/create-payment-intent` - Create Stripe payment intent
- `POST /api/payments/webhook` - Stripe webhook handler
- `GET /api/payments/subscription-status` - Get subscription status

#### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create new notification
- `PUT /api/notifications/:id/read` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification
- `GET /api/notifications/url` - Get user's unique monitoring URL
- `GET /api/notifications/stats` - Get notification statistics

## Mobile Monitoring

The system uses a service worker (`sw.js`) to capture notifications from mobile browsers. The monitoring page (`monitor.html`) requests notification permissions and registers the service worker to intercept and forward notifications to the backend.

### How it Works

1. User opens their unique monitoring URL on mobile device
2. Browser requests notification permissions
3. Service worker is registered and activated
4. Notifications are captured and sent to backend via API
5. Dashboard displays real-time notification data

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation and sanitization
- Secure payment processing with Stripe
- Rate limiting on API endpoints

## Deployment

### Backend Deployment
1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Deploy to Heroku, Vercel, or your preferred platform

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy to Netlify, Vercel, or your preferred platform
3. Update API URL in environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository. 