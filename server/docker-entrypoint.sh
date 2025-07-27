#!/bin/sh
set -e

# Default values
: "${SERVICE:=api}"   # SERVICE=api or SERVICE=worker
: "${NODE_ENV:=development}"

# Validate SERVICE variable
case "$SERVICE" in
    "api"|"worker") ;;
    *) echo "❌ Invalid SERVICE: '$SERVICE'. Must be 'api' or 'worker'"; exit 1 ;;
esac

# Function to wait for a service
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    
    echo "⏳ Waiting for $service_name to be ready..."
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
        if pg_isready -h postgres -p 5432 -U tuabi_user >/dev/null 2>&1; then
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

# Function to debug database connection
debug_database_connection() {
    echo "🔍 Debugging database connection..."
    
    # Check if we can connect to the database
    if ! npx prisma db pull --preview-feature >/dev/null 2>&1; then
        echo "⚠️  Cannot connect to database or database doesn't exist"
        
        # Try to create the database if it doesn't exist
        echo "🏗️  Attempting to create database..."
        # This might work if your PostgreSQL user has createdb privileges
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
        
        if ! npx prisma migrate deploy; then
            echo "❌ Production migrations failed"
            echo "🔍 Migration deploy output above should show the specific error"
            exit 1
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
wait_for_service redis 6379 "Redis"

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
        exec npm run build && npm run worker
    else
        exec npm run worker:dev
    fi
else
    # API service
    if [ "$NODE_ENV" = "production" ]; then
        exec npm run build && npm start
    else
        exec npm run dev
    fi
fi