# Tuabi Backend API

A modern Express.js TypeScript backend with PostgreSQL and Prisma ORM.

## Features

- 🔐 JWT Authentication
- 🗄️ PostgreSQL Database with Prisma ORM
- 🛡️ Security middleware (Helmet, CORS, Rate limiting)
- ✅ Input validation with express-validator
- 📝 Comprehensive error handling
- 🔄 TypeScript for type safety
- 🚀 Fast and scalable architecture

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

## Installation

1. **Clone the repository and navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials and other configuration.

4. **Set up the database:**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Or run migrations
   npm run db:migrate
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with initial data

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Debtors
- `GET /api/debtors` - Get all debtors
- `GET /api/debtors/:id` - Get debtor by ID
- `POST /api/debtors` - Create new debtor
- `PUT /api/debtors/:id` - Update debtor
- `DELETE /api/debtors/:id` - Delete debtor

### Debt History
- `GET /api/debt-history/debtor/:debtorId` - Get debt history for debtor
- `POST /api/debt-history` - Add debt history entry

### Subscriptions
- `GET /api/subscriptions` - Get user subscriptions
- `POST /api/subscriptions` - Create subscription
- `PUT /api/subscriptions/:id/cancel` - Cancel subscription

## Database Schema

The application uses the following main entities:
- **Users** - Application users with authentication
- **Debtors** - People who owe money to users
- **DebtHistory** - History of debt changes
- **Subscriptions** - User subscription plans
- **Transactions** - Payment transactions

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation
- SQL injection protection (via Prisma)

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tuabi_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development

# CORS
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"
```

## Development

The project uses TypeScript for type safety. The source code is in the `src/` directory:

- `controllers/` - Request handlers
- `middleware/` - Custom middleware
- `routes/` - API route definitions
- `utils/` - Utility functions
- `config/` - Configuration files

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set production environment variables

3. Start the server:
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request 