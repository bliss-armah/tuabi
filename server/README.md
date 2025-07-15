# Tuabi Server - Docker Setup (Unified)

This project uses a single Dockerfile and docker-compose.yml for both development and production. You can run both the API and the worker from the same image using environment variables.

## 🐳 Quick Start

### 1. Build the Images

   ```bash
   cd server
# Build all images
docker-compose build
   ```

### 2. Start the Stack (Development)

   ```bash
# Start all services in development mode (default)
docker-compose up -d
```

- API: http://localhost:3000
- Postgres: localhost:5433
- Redis: localhost:6380

### 3. Start the Stack (Production)

   ```bash
# Set NODE_ENV=production in your environment or .env file
docker-compose up -d
```

### 4. Logs & Management

```bash
# View logs
docker-compose logs -f
# View API logs
docker-compose logs -f api
# View worker logs
docker-compose logs -f worker
# Stop all services
docker-compose down
```

## 🔧 Configuration

- All configuration is via environment variables (see `env.example`).
- To run in production, set `NODE_ENV=production`.
- To run the worker, set `SERVICE=worker` (default is `SERVICE=api`).

## 🏗️ How It Works

- **Single Dockerfile**: Installs all dependencies, supports both dev (hot reload) and prod (compiled) modes.
- **Single Compose File**: Orchestrates Postgres, Redis, API, and worker. Uses the same image for both API and worker, just with different `SERVICE` env var.
- **Entrypoint Script**: Decides what to run based on `SERVICE` and `NODE_ENV`.

## 🛠️ Development Workflow

- Code changes are hot-reloaded in dev mode.
- Prisma client is auto-generated in dev mode.
- **Safe database migrations** with automatic prompts for dangerous changes.
- Schema changes are handled safely with migration files.

## 🔒 Database Safety Features

### **Development Mode**
- ✅ **Automatic migration creation** for safe schema changes
- ✅ **Safe push** for non-breaking changes
- ✅ **Manual intervention required** for dangerous changes
- ✅ **Migration files** created for version control

### **Production Mode**
- ✅ **Migration deployment** only (no schema changes)
- ✅ **Safe and predictable** database updates
- ✅ **No data loss** during deployments

### **Manual Database Operations**
   ```bash
# Create a new migration
docker-compose exec api npx prisma migrate dev --name your-migration-name

# Apply migrations
docker-compose exec api npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
docker-compose exec api npx prisma migrate reset

# Open Prisma Studio
docker-compose exec api npx prisma studio
```

## 🏭 Production Workflow

- Set `NODE_ENV=production` and use strong secrets in your `.env` file.
- The API and worker run compiled code for performance.

## 📋 Example .env

See `env.example` for all required variables.

```
NODE_ENV=development
SERVICE=api
PORT=3000
DATABASE_URL=postgresql://tuabi_user:tuabi_password@postgres:5432/tuabi_db
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis_password
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

## 🧹 Clean Up

- To remove all containers and volumes:
   ```bash
  docker-compose down -v
  ```

## 📝 Notes

- You can override any environment variable in your `.env` file or via the `environment` section in `docker-compose.yml`.
- For production, use a secure `.env` file and set `NODE_ENV=production`.
- Both API and worker use the same image, just with different `SERVICE` values.

---

For any questions, see the comments in `docker-compose.yml` and `Dockerfile`.
