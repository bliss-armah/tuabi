# Tuabi - Debt Management App

A comprehensive debt tracking and management application with AI-powered insights, built with React Native, Node.js, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (via Docker)
- React Native development environment

### 1. Clone & Setup

```bash
git clone <repository-url>
cd tuabi
```

### 2. Environment Setup

Create `.env` file in the root directory:

```bash
# Database
DATABASE_URL=postgresql://tuabi_user:tuabi_password@localhost:5433/tuabi_db

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Paystack (for payments)
PAYSTACK_SECRET_KEY=sk_test_your_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_key_here

# OpenRouter (for AI features)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Redis
REDIS_HOST=localhost
REDIS_PORT=6380
REDIS_PASSWORD=redis_password
```

### 3. Start Services

```bash
# Start all services (API, Database, Redis)
docker-compose up -d

# Start mobile app
cd client
npm install
npm start
```

## 📱 Features

### Core Features

- **Debtor Management**: Add, edit, and track debtors
- **Payment Tracking**: Record payments and debt additions
- **Reminders**: Set payment reminders with notifications
- **Dashboard**: Overview of debt portfolio and statistics
- **User Authentication**: Secure login/registration system

### AI-Powered Insights 🤖

- **Portfolio Analysis**: Comprehensive debt portfolio insights
- **Risk Assessment**: Individual debtor and portfolio risk evaluation
- **Payment Predictions**: AI-powered payment timing predictions
- **Smart Recommendations**: Actionable debt management advice
- **Cash Flow Forecasting**: Future cash inflow predictions

### Subscription Management

- **Payment Integration**: Paystack payment processing
- **Subscription Plans**: Monthly and yearly plans
- **Usage Tracking**: Monitor subscription status

## 🏗️ Architecture

This project consists of two main parts:

### 📱 Frontend (React Native)
- **Location**: `client/` directory
- **Technology**: React Native, Expo, TypeScript
- **Documentation**: [Frontend README](client/README.md)

### 🔧 Backend (Node.js)
- **Location**: `server/` directory  
- **Technology**: Node.js, Express, PostgreSQL, Redis
- **Documentation**: [Backend README](server/README.md)

### 🗄️ Database Schema
- **Users**: Authentication and profile data
- **Debtors**: Debtor information and amounts
- **DebtHistory**: Payment and debt transaction history
- **Reminders**: Payment reminder settings
- **Subscriptions**: User subscription data
- **Transactions**: Payment transaction records

## 🤖 AI Implementation

### OpenRouter Integration

The app uses OpenRouter (Claude 3.5 Sonnet) for AI analysis:

**Features:**

- Portfolio insights and risk assessment
- Payment prediction based on historical data
- Smart recommendations for debt management
- Cash flow forecasting

**Setup:**

1. Get API key from [OpenRouter.ai](https://openrouter.ai)
2. Add to environment: `OPENROUTER_API_KEY=your_key`
3. AI features automatically activate

**Cost:** ~$0.01-0.05 per user monthly

### API Endpoints

```http
GET /api/ai/insights              # Portfolio insights
GET /api/ai/debtor/:id/analysis   # Individual debtor analysis
GET /api/ai/predictions           # Payment predictions
GET /api/ai/risk-assessment       # Risk assessment
GET /api/ai/comprehensive         # All insights combined
```

## 🔧 Development

### Available Scripts

```bash
# Backend
cd server
npm run dev          # Start development server
npm run build        # Build for production
npm run migrate      # Run database migrations
npm run seed         # Seed database with sample data

# Frontend
cd client
npm start           # Start Expo development server
npm run android     # Run on Android
npm run ios         # Run on iOS
npm run web         # Run on web
```

### Database Management

```bash
# Generate migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

### Testing

```bash
# Backend tests
cd server && npm test

# Frontend tests
cd client && npm test
```

## 🌐 Deployment

### Production Setup

1. **Environment Variables**: Set production values
2. **Database**: Use production PostgreSQL instance
3. **Redis**: Use production Redis instance
4. **SSL**: Configure HTTPS certificates
5. **Monitoring**: Set up logging and monitoring

### Docker Deployment

```bash
# Build and run production containers
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale api=3
```

### Mobile App Deployment

```bash
# Build for production
cd client
eas build --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## 🔒 Security

### Authentication

- JWT-based authentication
- Password hashing with bcrypt
- Token expiration and refresh
- Secure session management

### Data Protection

- Input validation and sanitization
- SQL injection prevention (Prisma ORM)
- CORS configuration
- Rate limiting on API endpoints

### API Security

- All endpoints require authentication
- User data isolation
- Secure payment processing
- Environment variable protection

## 📊 Monitoring & Analytics

### Health Checks

```http
GET /health              # API health status
GET /api/ai/status       # AI service status
```

### Logging

- Request/response logging
- Error tracking and reporting
- Performance monitoring
- User activity analytics

## 🐛 Troubleshooting

### Common Issues

**Database Connection**

```bash
# Check database status
docker-compose ps postgres

# Reset database
docker-compose down
docker volume rm tuabi_postgres_data
docker-compose up -d
```

**AI Features Not Working**

- Verify OpenRouter API key is set
- Check API key has sufficient credits
- Review server logs for errors

**Mobile App Issues**

```bash
# Clear cache
cd client && npm start -- --clear

# Reset Metro bundler
npx react-native start --reset-cache
```

**Payment Issues**

- Verify Paystack keys are correct
- Check webhook endpoints are accessible
- Review transaction logs

### Debug Mode

```bash
# Enable debug logging
LOG_LEVEL=debug docker-compose up
```

## 📈 Performance

### Optimization Tips

- Use database indexes for frequent queries
- Implement caching for AI responses
- Optimize images and assets
- Enable compression on API responses

### Scaling

- Horizontal scaling with load balancers
- Database read replicas
- Redis clustering for sessions
- CDN for static assets

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact support@tuabi.com

---

**Built with ❤️ using React Native, Node.js, and AI**
