#!/bin/sh
set -e

# Default values
: "${SERVICE:=api}"   # SERVICE=api or SERVICE=worker
: "${NODE_ENV:=development}"

# Wait for database to be ready
echo "Waiting for database to be ready..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "Database is ready!"

# Wait for Redis to be ready
echo "Waiting for Redis to be ready..."
while ! nc -z redis 6379; do
  sleep 1
done
echo "Redis is ready!"

# Add a small delay to prevent race conditions
sleep 2

# Database setup function
setup_database() {
  echo "Setting up database..."
  
  # Generate Prisma client
  npx prisma generate
  
  if [ "$NODE_ENV" = "production" ]; then
    echo "🏭 Production mode: Running migrations safely..."
    npx prisma migrate deploy
    echo "✅ Production migrations completed"
  else
    echo "🛠️  Development mode: Checking for schema changes..."
    
    # Try to push schema and capture output
    PUSH_OUTPUT=$(npx prisma db push --preview-feature 2>&1 || true)
    
    # Check if there are schema changes
    if echo "$PUSH_OUTPUT" | grep -q "Database schema is out of sync"; then
      echo "⚠️  Schema changes detected!"
      echo "🐳 Non-interactive mode detected, using safe defaults..."
      
      # Try to create a migration first
      if npx prisma migrate dev --name auto-migration --create-only; then
        echo "📝 Migration created, applying..."
        npx prisma migrate deploy
        echo "✅ Migration applied successfully"
      else
        echo "⚠️  Could not create migration, attempting safe push..."
        # Try a regular push (will fail if unsafe)
        if npx prisma db push; then
          echo "✅ Schema updated safely"
        else
          echo "❌ Schema changes require manual intervention"
          echo "Please run manually: docker-compose exec api npx prisma migrate dev"
          echo "Continuing without database changes..."
        fi
      fi
    else
      echo "✅ Database schema is up to date"
    fi
  fi
}

if [ "$SERVICE" = "worker" ]; then
  if [ "$NODE_ENV" = "production" ]; then
    setup_database
    npm run build && npm run worker
  else
    setup_database
    npm run worker:dev
  fi
else
  if [ "$NODE_ENV" = "production" ]; then
    setup_database
    npm run build && npm start
  else
    setup_database
    npm run dev
  fi
fi 