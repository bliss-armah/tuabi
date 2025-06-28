# Subscription Feature Setup Guide

This guide will help you set up the subscription feature with Paystack integration in your Tuabi application.

## Backend Setup

### 1. Install Dependencies

Navigate to the server directory and install the new dependencies:

```bash
cd server
pip install -r requirements.txt
```

### 2. Environment Configuration

Create a `.env` file in the server directory with the following variables:

```env
# Database Configuration
DATABASE_URL=sqlite:///./blog.db

# JWT Configuration
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key_here

# Server Configuration
HOST=0.0.0.0
PORT=8000
```

### 3. Paystack Account Setup

1. Sign up for a Paystack account at [https://paystack.com](https://paystack.com)
2. Go to your Paystack dashboard
3. Navigate to Settings > API Keys
4. Copy your test secret key and public key
5. Update the `.env` file with your actual Paystack keys

### 4. Database Migration

The new subscription and transaction tables will be created automatically when you start the server. If you need to manually migrate:

```bash
cd server
python migrate_db.py
```

### 5. Start the Backend Server

```bash
cd server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend Setup

### 1. Install Dependencies

The frontend already includes the necessary dependencies. If you need to install them:

```bash
cd client
npm install
# or
yarn install
```

### 2. Update API Configuration

Make sure your API base URL is correctly configured in `client/Shared/Api/config.ts`:

```typescript
const rawBaseQuery = fetchBaseQuery({
  baseUrl: "http://your-server-ip:8000", // Update this to your server IP
  // ... rest of the configuration
});
```

### 3. Start the Frontend

```bash
cd client
npm start
# or
yarn start
```

## Features Implemented

### Backend Features

1. **Subscription Models**: Added `Subscription` and `Transaction` models to track user subscriptions and payments
2. **Paystack Integration**: Complete Paystack API integration for payment processing
3. **Subscription Management**: Endpoints for managing subscriptions, transactions, and user status
4. **Payment Verification**: Secure payment verification with Paystack webhooks

### Frontend Features

1. **Subscription Plans Screen**: Beautiful UI for displaying and selecting subscription plans
2. **Payment Processing**: Integrated WebView for Paystack payment processing
3. **Subscription Status Component**: Reusable component showing user's subscription status
4. **Subscription Tab**: Dedicated tab for subscription management
5. **Dashboard Integration**: Subscription status displayed on the main dashboard

## API Endpoints

### Subscription Endpoints

- `GET /subscription/plans` - Get available subscription plans
- `POST /subscription/initialize` - Initialize a subscription payment
- `POST /subscription/verify` - Verify a completed payment
- `GET /subscription/status` - Get user's subscription status
- `GET /subscription/transactions` - Get user's transaction history
- `GET /subscription/subscriptions` - Get user's subscription history

## Subscription Plans

The system includes two default subscription plans:

1. **Monthly Plan**: ₦1,000/month

   - Unlimited debtors
   - Detailed analytics
   - Export reports
   - Priority support

2. **Yearly Plan**: ₦10,000/year (Save 20%)
   - All monthly features
   - 20% discount compared to monthly

## Usage Flow

1. **User Registration/Login**: Users can register and login as usual
2. **Subscription Check**: The app checks if the user has an active subscription
3. **Plan Selection**: Users can view and select subscription plans
4. **Payment Processing**: Paystack handles the payment securely
5. **Subscription Activation**: Upon successful payment, the subscription is activated
6. **Status Tracking**: Users can view their subscription status and history

## Security Features

- JWT authentication for all subscription endpoints
- Secure payment processing through Paystack
- Transaction verification and logging
- User-specific subscription tracking

## Testing

### Test Cards (Paystack Test Mode)

You can use these test cards for testing payments:

- **Successful Payment**: 4084 0840 8408 4081
- **Failed Payment**: 4084 0840 8408 4082
- **Abandoned Payment**: 4084 0840 8408 4083

### Test Bank Account

- **Bank**: Test Bank
- **Account Number**: 0000000000
- **OTP**: 123456

## Troubleshooting

### Common Issues

1. **Payment Not Processing**: Check your Paystack API keys in the `.env` file
2. **Database Errors**: Ensure the database file has write permissions
3. **CORS Issues**: The backend is configured to allow all origins for development
4. **WebView Issues**: Make sure `react-native-webview` is properly installed

### Support

If you encounter any issues:

1. Check the server logs for error messages
2. Verify your Paystack account and API keys
3. Ensure all dependencies are properly installed
4. Check the network connectivity between frontend and backend

## Production Deployment

For production deployment:

1. Use production Paystack keys
2. Set up proper CORS configuration
3. Use a production database (PostgreSQL recommended)
4. Set up SSL certificates
5. Configure proper environment variables
6. Set up monitoring and logging

## License

This subscription feature is part of the Tuabi application. Please ensure you comply with Paystack's terms of service and your local payment regulations.
