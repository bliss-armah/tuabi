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

if [ "$SERVICE" = "worker" ]; then
  if [ "$NODE_ENV" = "production" ]; then
    npm run build && npm run worker
  else
    npx prisma generate && npx prisma db push --accept-data-loss && npm run worker:dev
  fi
else
  if [ "$NODE_ENV" = "production" ]; then
    npm run build && npm start
  else
    npx prisma generate && npx prisma db push --accept-data-loss && npm run dev
  fi
fi 