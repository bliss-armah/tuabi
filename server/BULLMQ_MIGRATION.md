# BullMQ Migration Guide

## Overview

This project has been migrated from `node-cron` to **BullMQ** for reliable job scheduling and push notifications. BullMQ provides persistent job queues that survive server restarts and can be processed by dedicated worker processes.

## What Changed

### Before (node-cron)

- Used `node-cron` to periodically check for overdue/upcoming reminders
- If server restarted, scheduled jobs were lost
- All processing happened in the main server process

### After (BullMQ)

- Jobs are persisted in Redis and survive server restarts
- Dedicated worker process handles notification jobs
- Better error handling and retry mechanisms
- Scalable architecture

## New Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Main Server   │    │   Redis Queue   │    │  Worker Process │
│                 │    │                 │    │                 │
│ - API Endpoints │───▶│ - Job Storage   │───▶│ - Process Jobs  │
│ - Job Creation  │    │ - Persistence   │    │ - Send Notifs   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Setup Instructions

### 1. Install Redis

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**macOS:**

```bash
brew install redis
brew services start redis
```

**Windows:**
Download from https://redis.io/download or use Docker:

```bash
docker run -d -p 6379:6379 redis:alpine
```

### 2. Environment Variables

Add these to your `.env` file:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Leave empty if no password
```

### 3. Install Dependencies

```bash
npm install
```

## Running the System

### 1. Start the Main Server

```bash
npm run dev
```

### 2. Start the Notification Worker (in a separate terminal)

```bash
npm run worker:dev
```

### 3. Production Commands

```bash
# Build the project
npm run build

# Start production server
npm start

# Start production worker
npm run worker
```

## How It Works

### Job Scheduling

When a reminder is created or updated:

1. **Main Server** creates a job in the Redis queue with the due date as delay
2. **Worker Process** picks up the job at the scheduled time
3. **Worker** sends the push notification and updates the database

### Job Types

- **`reminder-overdue`**: Sent when a payment is overdue
- **`reminder-upcoming`**: Sent 1 hour before the due date

### Queue Management

- Jobs are automatically removed after completion
- Failed jobs are kept for debugging
- Old completed/failed jobs are cleaned up after 24 hours

## Monitoring

### Queue Statistics

```bash
GET /api/queue/stats
```

Response:

```json
{
  "success": true,
  "data": {
    "waiting": 5,
    "active": 2,
    "completed": 150,
    "failed": 3
  }
}
```

### Clean Up Old Jobs

```bash
POST /api/queue/cleanup
```

## Benefits

1. **Reliability**: Jobs persist even if server restarts
2. **Scalability**: Can run multiple worker processes
3. **Monitoring**: Built-in job tracking and statistics
4. **Error Handling**: Automatic retry mechanisms
5. **Performance**: Decoupled job processing from API server

## Troubleshooting

### Redis Connection Issues

```bash
# Test Redis connection
redis-cli ping
# Should return: PONG
```

### Worker Not Processing Jobs

1. Check if Redis is running
2. Verify environment variables
3. Check worker logs for errors
4. Ensure worker process is started

### Jobs Not Being Scheduled

1. Check main server logs
2. Verify reminder creation/update logic
3. Check Redis queue for pending jobs

## Migration Notes

- All existing cron-based scheduling has been removed
- The notification service now uses BullMQ queues
- No changes needed in the frontend
- Existing reminders will be processed by the new system

## Development

### Adding New Job Types

1. Update `NotificationJobData` interface in `queueService.ts`
2. Add job processing logic in `notificationWorker.ts`
3. Update the queue service methods

### Testing

```bash
# Test job scheduling
curl -X POST /api/reminders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"debtorId": 1, "title": "Test", "dueDate": "2024-01-01T10:00:00Z"}'

# Check queue stats
curl -X GET /api/queue/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```
