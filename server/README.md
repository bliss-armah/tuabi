# Tuabi Server - Docker Setup (Unified)

## 🏗️ Architecture Overview

The Docker setup creates a **multi-service application** with these components:
- **PostgreSQL Database** (stores the data)
- **Redis Cache** (handles sessions, queues, caching)
- **API Service** (the main Node.js backend)
- **Worker Service** (background job processor)

All these services run in **separate containers** but communicate with each other through a Docker network.

---

## 📁 File Structure & Purpose

```
The-project/
├── server/                     # the Node.js application
│   ├── src/
│   │   ├── app.ts             # Main API application
│   │   └── workers/
│   │       └── notificationWorker.ts  # Background jobs
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Initial data
│   ├── Dockerfile             # Instructions to build the app
│   ├── docker-entrypoint.sh   # Startup script
│   └── package.json
├── docker-compose.yml         # Orchestrates all services
└── docker-scripts.sh          # Helper commands
```

---

## 🐳 The Dockerfile Explained

```dockerfile
FROM node:18-alpine
```
**What it does**: Uses Node.js 18 on Alpine Linux (lightweight)

```dockerfile
WORKDIR /app
```
**What it does**: Sets `/app` as the working directory inside the container

```dockerfile
RUN apk add --no-cache libc6-compat openssl postgresql-client netcat-openbsd
```
**What it does**: Installs system dependencies:
- `postgresql-client`: To connect and check PostgreSQL
- `netcat-openbsd`: To check if services are ready
- `openssl`, `libc6-compat`: Required by some Node.js packages

```dockerfile
COPY package.json package-lock.json* ./
RUN npm ci
```
**What it does**: 
1. Copies package files first (Docker layer optimization)
2. Installs dependencies using `npm ci` (faster, more reliable for production)

```dockerfile
COPY . .
RUN npx prisma generate
```
**What it does**:
1. Copies the entire application code
2. Generates Prisma client (database access layer)

```dockerfile
EXPOSE 3000
```
**What it does**: Tells Docker that the app listens on port 3000

```dockerfile
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
```
**What it does**: Runs the startup script when container starts

---

## 📋 The Entrypoint Script Breakdown

The entrypoint script is the **conductor** of the application startup:

### 1. Service Detection
```bash
: "${SERVICE:=api}"   # Defaults to "api" if SERVICE env var not set
```
**Purpose**: Same Docker image can run as either API or Worker

### 2. Dependency Waiting
```bash
wait_for_postgres()
wait_for_service redis 6379 "Redis"
```
**Purpose**: Ensures database and Redis are ready before starting the app
**Why needed**: Containers start in parallel, but the app needs database ready first

### 3. Database Setup (API Service Only)
```bash
if [ "$SERVICE" = "api" ]; then
    setup_database
fi
```
**Purpose**: Only the API container handles database migrations/setup
**Why**: Prevents multiple containers trying to modify database simultaneously

### 4. Service Startup
```bash
if [ "$SERVICE" = "worker" ]; then
    # Start worker
else
    # Start API
fi
```
**Purpose**: Starts the appropriate service based on SERVICE environment variable

---

## 🎼 Docker Compose Orchestration

Docker Compose is the **orchestra conductor** - it coordinates all services:

### Service Definitions

#### PostgreSQL Service
```yaml
postgres:
  image: postgres:15-alpine
  environment:
    POSTGRES_DB: tuabi_db
    POSTGRES_USER: tuabi_user  
    POSTGRES_PASSWORD: tuabi_password
  ports:
    - "5433:5432"  # Host:Container port mapping
```
**What happens**:
1. Downloads PostgreSQL 15 image
2. Creates database `tuabi_db` with user `tuabi_user`
3. Maps port 5433 on the computer to port 5432 in container
4. Stores data in `postgres_data` volume (persists when container restarts)

#### Redis Service
```yaml
redis:
  image: redis:7-alpine
  command: redis-server --appendonly yes --requirepass redis_password
  ports:
    - "6380:6379"
```
**What happens**:
1. Downloads Redis 7 image
2. Enables data persistence (`--appendonly yes`)
3. Sets password protection
4. Maps port 6380 on the computer to port 6379 in container

#### API Service
```yaml
api:
  build: ./server  # Builds from the Dockerfile
  environment:
    SERVICE: api
    DATABASE_URL: postgresql://tuabi_user:tuabi_password@postgres:5432/tuabi_db
  depends_on:
    postgres:
      condition: service_healthy
```
**What happens**:
1. Builds the custom image from `./server/Dockerfile`
2. Sets environment variables (including database connection)
3. Waits for PostgreSQL to be healthy before starting
4. Runs database migrations and starts the API

#### Worker Service
```yaml
worker:
  build: ./server  # Same image as API
  environment:
    SERVICE: worker  # This tells entrypoint to start worker instead
  depends_on:
    api:
      condition: service_started  # Waits for API to start first
```
**What happens**:
1. Uses same image as API service
2. Sets `SERVICE=worker` so entrypoint starts worker process
3. Waits for API service to start (so database is already set up)

---

## 🔄 The Complete Startup Flow

Here's what happens when you run `docker-compose up`:

### Phase 1: Infrastructure Setup
1. **Docker creates network**: All containers can talk to each other
2. **PostgreSQL starts**: Creates database, waits for health check
3. **Redis starts**: Starts cache server, waits for health check

### Phase 2: Application Setup  
4. **API container starts**: 
   - Entrypoint script runs
   - Waits for PostgreSQL and Redis to be ready
   - Runs database migrations (`prisma db push` or `prisma migrate deploy`)
   - Seeds database with initial data
   - Starts the Node.js API server

### Phase 3: Worker Setup
5. **Worker container starts**:
   - Waits for API container to be started (database already set up)
   - Starts background job processor

### Phase 4: Ready State
6. **All services running**:
   - API: http://localhost:3500
   - PostgreSQL: localhost:5433
   - Redis: localhost:6380

---

## 🌐 Network Communication

Inside the Docker network, services communicate using **service names**:

```javascript
// In the Node.js code, you connect to:
DATABASE_URL: "postgresql://tuabi_user:tuabi_password@postgres:5432/tuabi_db"
//                                                    ^^^^^^^^
//                                            Service name, not localhost!

REDIS_HOST: "redis"  // Not localhost:6380!
```

**Why**: Docker creates internal DNS that resolves service names to container IPs

---

## 💾 Data Persistence

```yaml
volumes:
  postgres_data:   # Database data survives container restarts
  redis_data:      # Cache data survives container restarts
```

**What this means**:
- the data survives when containers restart
- Data is lost only when you run `docker-compose down -v` (removes volumes)

---

## 🛠️ Development vs Production

### Development Mode (`NODE_ENV=development`)
- Uses `nodemon` for auto-restart on file changes
- Uses `prisma db push` for quick schema changes
- Volume mounts the local code for live editing

### Production Mode (`NODE_ENV=production`)  
- Builds TypeScript to JavaScript first
- Uses `prisma migrate deploy` for safe database changes
- No volume mounting (code is baked into image)

---

## 🔧 Common Operations

### Starting Everything
```bash
docker-compose up -d        # Background mode
docker-compose up --build   # Rebuild images first
```

### Viewing Logs
```bash
docker-compose logs -f api    # API logs only
docker-compose logs -f        # All services
```

### Database Operations
```bash
docker-compose exec api npx prisma studio    # Open database browser
docker-compose exec api npx prisma migrate dev  # Create migration
```

### Stopping Everything
```bash
docker-compose down          # Stop containers
docker-compose down -v       # Stop and remove data
```

---

## 🚨 Troubleshooting Common Issues

### "Table does not exist" Error
**Cause**: Database migrations didn't run
**Solution**: Check API container logs, ensure PostgreSQL is healthy

### "Connection refused" Errors  
**Cause**: Services starting before dependencies are ready
**Solution**: Check health checks and depends_on configuration

### "Port already in use"
**Cause**: Port conflicts with other services
**Solution**: Change port mappings in docker-compose.yml

### Worker not processing jobs
**Cause**: Worker started before database setup
**Solution**: Ensure worker depends_on API service

---

## 🎯 Key Takeaways

1. **Single Image, Multiple Services**: Same Docker image runs API and Worker
2. **Startup Order Matters**: Database → API (with migrations) → Worker  
3. **Environment Variables Control Behavior**: `SERVICE` determines what runs
4. **Health Checks Prevent Race Conditions**: Services wait for dependencies
5. **Volumes Preserve Data**: Database survives container restarts
6. **Internal Networking**: Services talk using service names, not localhost

This setup gives you a **production-ready, scalable architecture** that can run consistently across development, staging, and production environments!