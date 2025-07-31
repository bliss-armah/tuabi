#!/bin/sh
set -e

# Default values
: "${SERVICE:=api}"   # SERVICE=api or SERVICE=worker
: "${NODE_ENV:=development}"  # Default to development

# Detect environment (Fly.io sets FLY_APP_NAME)
if [ -n "$FLY_APP_NAME" ]; then
    ENVIRONMENT="flyio"
    : "${NODE_ENV:=production}"  # Override to production on Fly.io
    echo "🚁 Detected Fly.io environment"
else
    ENVIRONMENT="local"
    echo "🏠 Detected local environment"
fi

# Validate SERVICE variable
case "$SERVICE" in
    "api"|"worker") ;;
    *) echo "❌ Invalid SERVICE: '$SERVICE'. Must be 'api' or 'worker'"; exit 1 ;;
esac

# Extract database connection details based on environment
if [ "$ENVIRONMENT" = "flyio" ]; then
    # Fly.io: Extract from DATABASE_URL or use defaults
    if [ -n "$DATABASE_URL" ]; then
        DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:]*\):.*|\1|p')
        DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
        DB_USER=$(echo "$DATABASE_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')
    else
        # Fly.io defaults
        DB_HOST="server-nameless-snow-6142-db.internal"
        DB_PORT="5432"
        DB_USER="postgres"
    fi
else
    # Local: Use local defaults or extract from DATABASE_URL
    if [ -n "$DATABASE_URL" ]; then
        DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:]*\):.*|\1|p')
        DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
        DB_USER=$(echo "$DATABASE_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')
    else
        # Local defaults
        DB_HOST="${DB_HOST:-localhost}"
        DB_PORT="${DB_PORT:-5432}"
        DB_USER="${DB_USER:-postgres}"
    fi
fi

# Function to wait for a service
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    
    echo "⏳ Waiting for $service_name to be ready at $host:$port..."
    local retries=30
    while [ $retries -gt 0 ]; do
        if nc -z "$host" "$port" 2>/dev/null; then
            echo "✅ $service_name is ready!"
            return 0
        fi
        echo "⌛ $service_name not ready, retrying in 2 seconds... ($retries attempts left)"
        sleep 2
        retries=$((retries - 1))
    done
    
    echo "❌ $service_name failed to become ready after 60 seconds"
    exit 1
}

# Function to wait for PostgreSQL specifically
wait_for_postgres() {
    echo "⏳ Waiting for PostgreSQL to be ready..."
    local retries=30
    while [ $retries -gt 0 ]; do
        if pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" >/dev/null 2>&1; then
            echo "✅ PostgreSQL is ready!"
            return 0
        fi
        echo "⌛ PostgreSQL not ready, retrying in 2 seconds... ($retries attempts left)"
        sleep 2
        retries=$((retries - 1))
    done
    
    echo "❌ PostgreSQL failed to become ready after 60 seconds"
    exit 1
}

# Function to wait for Redis (handles both local and remote)
wait_for_redis() {
    # Check if REDIS_URL is provided
    if [ -n "$REDIS_URL" ]; then
        echo "🔍 Checking Redis connectivity via REDIS_URL..."
        
        # Parse REDIS_URL properly
        if echo "$REDIS_URL" | grep -q "redis://"; then
            # Extract host and port from redis://:password@host:port format
            REDIS_HOST=$(echo "$REDIS_URL" | sed 's|redis://[^@]*@||' | cut -d':' -f1)
            REDIS_PORT=$(echo "$REDIS_URL" | sed 's|redis://[^@]*@||' | cut -d':' -f2 | cut -d'/' -f1)
            
            if [ -z "$REDIS_HOST" ]; then
                REDIS_HOST="localhost"  # Default for local
            fi
            if [ -z "$REDIS_PORT" ]; then
                REDIS_PORT="6379"      # Default Redis port
            fi
            
            echo "📍 Connecting to Redis at $REDIS_HOST:$REDIS_PORT"
            wait_for_service "$REDIS_HOST" "$REDIS_PORT" "Redis"
        else
            echo "⚠️  Invalid Redis URL format, skipping connectivity check"
            echo "🔍 Redis URL format: $REDIS_URL"
        fi
    # Check if separate Redis variables are provided
    elif [ -n "$REDIS_HOST" ] && [ -n "$REDIS_PORT" ]; then
        echo "🔍 Checking Redis connectivity via separate variables..."
        echo "📍 Connecting to Redis at $REDIS_HOST:$REDIS_PORT"
        wait_for_service "$REDIS_HOST" "$REDIS_PORT" "Redis"
    else
        echo "⚠️  No Redis configuration provided, skipping Redis connectivity check"
        echo "💡 Set either REDIS_URL or REDIS_HOST+REDIS_PORT+REDIS_PASSWORD"
    fi
}

# Function to debug database connection
debug_database_connection() {
    echo "🔍 Debugging database connection..."
    echo "📊 Database details:"
    echo "   Host: $DB_HOST"
    echo "   Port: $DB_PORT" 
    echo "   User: $DB_USER"
    
    # Check if we can connect to the database
    if ! npx prisma db pull --preview-feature >/dev/null 2>&1; then
        echo "⚠️  Cannot connect to database or database doesn't exist"
        
        # Try to create the database if it doesn't exist
        echo "🏗️  Attempting to create database..."
        npx prisma db push --accept-data-loss || echo "⚠️  Could not create database automatically"
    else
        echo "✅ Database connection successful"
    fi
}

# Function to setup database
setup_database() {
    echo "🔧 Setting up database..."
    
    # Debug database connection first
    debug_database_connection
    
    # Generate Prisma client
    echo "📦 Generating Prisma client..."
    if ! npx prisma generate; then
        echo "❌ Failed to generate Prisma client"
        exit 1
    fi
    
    if [ "$NODE_ENV" = "production" ]; then
        echo "🏭 Production mode: Running migrations safely..."
        
        # Show migration status for debugging
        echo "🔍 Checking migration status..."
        npx prisma migrate status || echo "⚠️  Could not get migration status"
        
        # Check if we need to baseline (handle P3005 error)
        if ! npx prisma migrate deploy 2>&1; then
            echo "❌ Production migrations failed, checking if we need to baseline..."
            
            # Try to baseline the migration as already applied
            echo "🔄 Attempting to baseline existing migrations..."
            if npx prisma migrate resolve --applied 20250711194021_new_update 2>&1; then
                echo "✅ Successfully baselined migration"
                # Try deploy again after baseline
                if ! npx prisma migrate deploy; then
                    echo "❌ Migration deploy still failed after baseline"
                    exit 1
                fi
            else
                echo "❌ Could not baseline migration, trying alternative approach..."
                
                # Alternative: Get all migration names and try to baseline them
                for migration_dir in prisma/migrations/*/; do
                    if [ -d "$migration_dir" ]; then
                        migration_name=$(basename "$migration_dir")
                        echo "🔄 Attempting to baseline migration: $migration_name"
                        npx prisma migrate resolve --applied "$migration_name" 2>&1 || echo "⚠️ Could not baseline $migration_name"
                    fi
                done
                
                # Try one more time
                if ! npx prisma migrate deploy; then
                    echo "❌ All migration strategies failed"
                    exit 1
                fi
            fi
        fi
        echo "✅ Production migrations completed"
        
        # Run seed if needed
        if [ -f "prisma/seed.ts" ] || [ -f "prisma/seed.js" ]; then
            echo "🌱 Running database seed..."
            npx prisma db seed || echo "⚠️  Seed failed or not configured"
        fi
    else
        echo "🛠️  Development mode: Setting up database with migrations..."
        
        # Show current directory contents for debugging
        echo "🔍 Checking prisma directory structure..."
        ls -la prisma/ 2>/dev/null || echo "⚠️  No prisma directory found"
        
        # Check if migrations directory exists and has migrations
        if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
            echo "📊 Found existing migrations:"
            ls -la prisma/migrations/
            
            # Show migration status for debugging
            echo "🔍 Checking migration status..."
            npx prisma migrate status || echo "⚠️  Could not get migration status"
            
            echo "🚀 Applying existing migrations..."
            if ! npx prisma migrate deploy 2>&1; then
                echo "❌ Failed to apply existing migrations"
                echo "🔄 Attempting to reset and reapply migrations..."
                
                # Try alternative approach - reset and reapply
                if ! npx prisma migrate reset --force --skip-seed 2>&1; then
                    echo "⚠️  Could not reset migrations, trying db push instead..."
                    # As last resort, use db push to sync schema
                    if ! npx prisma db push --accept-data-loss; then
                        echo "❌ All migration approaches failed"
                        exit 1
                    fi
                    echo "✅ Database schema synchronized using db push"
                else
                    echo "✅ Migrations reset and reapplied successfully"
                fi
            else
                echo "✅ Migrations applied successfully"
            fi
        else
            echo "📝 No migrations found, initializing database..."
            
            # Try db push first to create initial schema
            if ! npx prisma db push --accept-data-loss; then
                echo "❌ Failed to push initial schema"
                exit 1
            fi
            
            # Then create initial migration to track it
            if ! npx prisma migrate dev --name initial_migration --create-only; then
                echo "⚠️  Could not create initial migration file (but schema is applied)"
            else
                # Mark the migration as applied since we already pushed the schema
                npx prisma migrate resolve --applied initial_migration || echo "⚠️  Could not mark migration as applied"
            fi
            
            echo "✅ Initial database setup completed"
        fi
        
        # Run seed if needed
        if [ -f "prisma/seed.ts" ] || [ -f "prisma/seed.js" ]; then
            echo "🌱 Running database seed..."
            npx prisma db seed || echo "⚠️  Seed failed or not configured"
        fi
    fi
    
    echo "✅ Database setup completed"
}

# Handle termination signals gracefully
trap 'echo "🛑 Received termination signal, shutting down..."; exit 0' TERM INT

# Wait for dependencies
wait_for_postgres
wait_for_redis

# Add a small delay to ensure everything is fully ready
echo "⏸️  Waiting 3 seconds for services to stabilize..."
sleep 3

# Setup database (only run this once, from API service)
if [ "$SERVICE" = "api" ]; then
    setup_database
else
    echo "ℹ️  Skipping database setup (only runs from API service)"
fi

# Start the appropriate service
echo "🚀 Starting service: $SERVICE in $NODE_ENV mode"
if [ "$SERVICE" = "worker" ]; then
    if [ "$NODE_ENV" = "production" ]; then
        echo "👷 Starting worker..."
        exec npm run worker
    else
        exec npm run worker:dev
    fi
else
    # API service
    if [ "$NODE_ENV" = "production" ]; then
        echo "🚀 Starting API server..."
        exec npm start
    else
        exec npm run dev
    fi
fi