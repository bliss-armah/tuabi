# Tuabi Backend - Node.js API Server

A robust REST API server for the Tuabi debt management application, built with Node.js, Express, PostgreSQL, and Redis.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (recommended)

### Installation

```bash
cd server
npm install
```

### Development

```bash
# Start development server
npm run dev

# Start with Docker
docker-compose up api

# Start all services (API, Database, Redis)
docker-compose up -d
```

## 🔧 Features

### Core API Features

- **User Authentication**: JWT-based authentication system
- **Debtor Management**: CRUD operations for debtors
- **Payment Tracking**: Record and track debt transactions
- **Reminder System**: Payment reminder notifications
- **Subscription Management**: Payment processing with Paystack
- **Real-time Notifications**: Push notification system

### AI Integration 🤖

- **OpenRouter Integration**: AI-powered debt analysis
- **Portfolio Insights**: Comprehensive debt portfolio analysis
- **Risk Assessment**: Individual and portfolio risk evaluation
- **Payment Predictions**: AI-powered payment timing predictions
- **Smart Recommendations**: Actionable debt management advice

### Database Features

- **Prisma ORM**: Type-safe database operations
- **Migrations**: Automated database schema management
- **Seeding**: Sample data for development
- **Connection Pooling**: Optimized database connections

## 🏗️ Project Structure

```
server/
├── src/
│   ├── controllers/      # API controllers
│   │   ├── authController.ts
│   │   ├── debtorController.ts
│   │   ├── aiController.ts
│   │   ├── subscriptionController.ts
│   │   └── reminderController.ts
│   ├── routes/          # API routes
│   │   ├── auth.ts
│   │   ├── debtor.ts
│   │   ├── ai.ts
│   │   ├── subscription.ts
│   │   └── reminder.ts
│   ├── services/        # Business logic
│   │   ├── openRouterService.ts
│   │   ├── paystackService.ts
│   │   ├── notificationService.ts
│   │   └── queueService.ts
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   ├── errorHandler.ts
│   │   └── notFound.ts
│   ├── config/          # Configuration files
│   │   ├── database.ts
│   │   └── redis.ts
│   ├── utils/           # Utility functions
│   │   ├── hash.ts
│   │   └── jwt.ts
│   ├── workers/         # Background workers
│   │   └── notificationWorker.ts
│   └── app.ts           # Express app setup
├── prisma/              # Database schema & migrations
│   ├── schema.prisma    # Database schema
│   ├── migrations/      # Migration files
│   └── seed.ts          # Database seeder
├── uploads/             # File uploads
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript configuration
└── Dockerfile           # Docker configuration
```

## 🗄️ Database Schema

### Core Tables

- **users**: User authentication and profile data
- **debtors**: Debtor information and amounts
- **debt_history**: Payment and debt transaction history
- **reminders**: Payment reminder settings
- **subscriptions**: User subscription data
- **transactions**: Payment transaction records
- **subscription_plans**: Available subscription plans

### Relationships

```sql
-- Users can have multiple debtors
users (1) -> (N) debtors

-- Debtors have payment history
debtors (1) -> (N) debt_history

-- Users can set reminders for debtors
users (1) -> (N) reminders
debtors (1) -> (N) reminders

-- Users can have subscriptions
users (1) -> (N) subscriptions
subscription_plans (1) -> (N) subscriptions
```

## 🔌 API Endpoints

### Authentication

```http
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
POST /api/auth/logout       # User logout
GET  /api/auth/profile      # Get user profile
PUT  /api/auth/profile      # Update user profile
```

### Debtors

```http
GET    /api/debtors              # Get all debtors
GET    /api/debtors/:id          # Get specific debtor
POST   /api/debtors              # Create new debtor
PUT    /api/debtors/:id          # Update debtor
DELETE /api/debtors/:id          # Delete debtor
POST   /api/debtors/:id/increment # Add debt amount
POST   /api/debtors/:id/decrement # Reduce debt amount
GET    /api/debtors/dashboard    # Dashboard data
```

### AI Features

```http
GET /api/ai/insights              # Portfolio insights
GET /api/ai/debtor/:id/analysis   # Individual debtor analysis
GET /api/ai/predictions           # Payment predictions
GET /api/ai/risk-assessment       # Risk assessment
GET /api/ai/comprehensive         # All insights combined
```

### Subscriptions

```http
GET    /api/subscriptions/plans   # Get subscription plans
POST   /api/subscriptions/create  # Create subscription
GET    /api/subscriptions/status  # Get subscription status
POST   /api/subscriptions/cancel  # Cancel subscription
```

### Reminders

```http
GET    /api/reminders             # Get all reminders
POST   /api/reminders             # Create reminder
PUT    /api/reminders/:id         # Update reminder
DELETE /api/reminders/:id         # Delete reminder
```

## 🔧 Development

### Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run migrate          # Run database migrations
npm run seed             # Seed database with sample data
npm run test             # Run tests
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript checks
```

### Environment Variables

Create `.env` file in the server directory:

```bash
# Server Configuration
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://tuabi_user:tuabi_password@localhost:5433/tuabi_db

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6380
REDIS_PASSWORD=redis_password

# Paystack (for payments)
PAYSTACK_SECRET_KEY=sk_test_your_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_key_here

# OpenRouter (for AI features)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Push Notifications
EXPO_ACCESS_TOKEN=your_expo_access_token_here
```

### Database Management

```bash
# Generate migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# View database
npx prisma studio

# Generate Prisma client
npx prisma generate
```

## 🤖 AI Integration

### OpenRouter Service

The backend integrates with OpenRouter for AI-powered analysis:

**Features:**

- Portfolio insights and risk assessment
- Payment prediction based on historical data
- Smart recommendations for debt management
- Cash flow forecasting

**Configuration:**

1. Get API key from [OpenRouter.ai](https://openrouter.ai)
2. Add to environment: `OPENROUTER_API_KEY=your_key`
3. AI features automatically activate

**Cost:** ~$0.01-0.05 per user monthly

### AI Endpoints

```typescript
// Example AI service usage
import { openRouterService } from "../services/openRouterService";

// Get user insights
const insights = await openRouterService.getUserInsights(userId);

// Analyze specific debtor
const analysis = await openRouterService.analyzeDebtor(userId, debtorId);

// Get payment predictions
const predictions = await openRouterService.getPaymentPredictions(userId);
```

## 🔒 Security

### Authentication

- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Token Expiration**: Configurable token lifetime
- **Refresh Tokens**: Secure token refresh mechanism

### Data Protection

- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Prevention**: Prisma ORM protection
- **CORS Configuration**: Cross-origin request handling
- **Rate Limiting**: API rate limiting protection

### API Security

- **Authentication Required**: All endpoints require auth
- **User Data Isolation**: Users can only access their data
- **Secure Headers**: Security headers configuration
- **Environment Variables**: Secure configuration management

## 📊 Monitoring & Health

### Health Checks

```http
GET /health              # Basic health check
GET /health/detailed     # Detailed health status
GET /api/ai/status       # AI service status
```

### Logging

- **Request Logging**: All API requests logged
- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Response time tracking
- **User Activity**: User action logging

### Metrics

- **Response Times**: API performance metrics
- **Error Rates**: Error tracking and reporting
- **Usage Statistics**: API usage analytics
- **Database Performance**: Query performance monitoring

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run with Docker
docker-compose up -d

# Build production image
docker build -t tuabi-backend .

# Run production container
docker run -p 3000:3000 tuabi-backend
```

### Production Setup

1. **Environment Variables**: Set production values
2. **Database**: Use production PostgreSQL instance
3. **Redis**: Use production Redis instance
4. **SSL**: Configure HTTPS certificates
5. **Monitoring**: Set up logging and monitoring

### Scaling

```bash
# Scale API services
docker-compose up -d --scale api=3

# Use load balancer
docker-compose up -d nginx
```

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

**Redis Connection**

```bash
# Check Redis status
docker-compose ps redis

# Test Redis connection
redis-cli -h localhost -p 6380 -a redis_password ping
```

**AI Features Not Working**

- Verify OpenRouter API key is set
- Check API key has sufficient credits
- Review server logs for errors

**Payment Issues**

- Verify Paystack keys are correct
- Check webhook endpoints are accessible
- Review transaction logs

### Debug Mode

```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev

# Enable verbose logging
DEBUG=* npm run dev
```

## 📈 Performance

### Optimization Tips

- **Database Indexes**: Optimize frequent queries
- **Connection Pooling**: Configure database connections
- **Caching**: Implement Redis caching
- **Compression**: Enable response compression

### Monitoring

- **Performance Metrics**: Track API performance
- **Error Tracking**: Monitor and fix errors
- **Resource Usage**: Monitor CPU and memory
- **Database Performance**: Query optimization

## 🧪 Testing

### Unit Testing

```bash
npm test               # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report
```

### API Testing

```bash
# Test API endpoints
npm run test:api

# Load testing
npm run test:load
```

### Database Testing

```bash
# Test database operations
npm run test:db

# Test migrations
npm run test:migrations
```

## 🤝 Contributing

### Code Style

- **TypeScript**: Use TypeScript for type safety
- **ESLint**: Follow ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **Conventional Commits**: Use conventional commit messages

### Development Workflow

1. Create feature branch
2. Make changes with tests
3. Run linting and tests
4. Submit pull request
5. Code review and merge

---

**Built with Node.js, Express, PostgreSQL, and Redis** 🚀
