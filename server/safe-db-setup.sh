#!/bin/sh
set -e

# Safe database setup script
# This script handles database migrations safely in both interactive and non-interactive environments

echo "🔍 Checking database schema..."

# Generate Prisma client
npx prisma generate

# Check if we're in production
if [ "$NODE_ENV" = "production" ]; then
  echo "🏭 Production mode: Running migrations safely..."
  npx prisma migrate deploy
  echo "✅ Production migrations completed"
  return 0
fi

# Development mode - check for schema changes
echo "🛠️  Development mode: Checking for schema changes..."

# Try to push schema and capture output
PUSH_OUTPUT=$(npx prisma db push --preview-feature 2>&1 || true)

# Check if there are schema changes
if echo "$PUSH_OUTPUT" | grep -q "Database schema is out of sync"; then
  echo "⚠️  Schema changes detected!"
  
  # Check if we're in an interactive environment
  if [ -t 0 ] && [ -t 1 ]; then
    # Interactive mode - ask user
    echo "Choose an option:"
    echo "1) Create and apply migration (recommended)"
    echo "2) Force push schema (may lose data)"
    echo "3) Skip database changes"
    read -p "Enter choice (1-3): " choice
    
    case $choice in
      1)
        echo "📝 Creating and applying migration..."
        npx prisma migrate dev --name auto-migration --create-only
        npx prisma migrate deploy
        echo "✅ Migration applied successfully"
        ;;
      2)
        echo "⚠️  Force pushing schema (data loss possible)..."
        npx prisma db push --accept-data-loss
        echo "✅ Schema force pushed"
        ;;
      3)
        echo "⏭️  Skipping database changes"
        ;;
      *)
        echo "❌ Invalid choice, skipping database changes"
        ;;
    esac
  else
    # Non-interactive mode (Docker) - use safe defaults
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
        exit 1
      fi
    fi
  fi
else
  echo "✅ Database schema is up to date"
fi 