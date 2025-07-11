# Reminder System Implementation

This document describes the reminder system that has been added to the Tuabi debt management application.

## Overview

The reminder system allows users to set payment reminders for debtors and receive push notifications when payments are due. The system includes both client-side and server-side components to handle reminder creation, scheduling, and notification delivery.

## Features

### Core Features

- **Create Reminders**: Users can create reminders for specific debtors with custom titles, messages, and due dates
- **Edit Reminders**: Users can modify existing reminders
- **Delete Reminders**: Users can remove reminders they no longer need
- **Mark as Completed**: Users can mark reminders as completed when payments are received
- **Push Notifications**: Local notifications are sent when reminders are due
- **Overdue Tracking**: The system tracks overdue reminders and sends notifications
- **Upcoming Reminders**: Notifications are sent for reminders due within the next hour

### UI Components

- **Reminders Tab**: Dedicated tab in the main navigation for managing all reminders
- **Reminder Modal**: Form for creating and editing reminders
- **Reminders List**: Displays all reminders with status indicators and action buttons
- **Debtor Integration**: Reminders can be viewed and managed from individual debtor detail screens

## Technical Implementation

### Database Schema

The system uses a new `Reminder` model with the following structure:

```prisma
model Reminder {
  id          Int      @id @default(autoincrement())
  debtorId    Int
  userId      Int
  title       String
  message     String
  dueDate     DateTime
  isCompleted Boolean  @default(false)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  debtor Debtor @relation(fields: [debtorId], references: [id], onDelete: Cascade)
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("reminders")
}
```

### Backend Components

#### API Endpoints

- `POST /api/reminders` - Create a new reminder
- `GET /api/reminders` - Get all reminders (with optional filters)
- `GET /api/reminders/overdue` - Get overdue reminders
- `GET /api/reminders/:id` - Get a specific reminder
- `PUT /api/reminders/:id` - Update a reminder
- `PATCH /api/reminders/:id/complete` - Mark reminder as completed
- `DELETE /api/reminders/:id` - Delete a reminder

#### Notification Service

- **Scheduler**: Uses `node-cron` to check for overdue and upcoming reminders
- **Local Notifications**: Currently logs notifications (can be extended to use Expo Push Notifications, Firebase, etc.)
- **Automatic Scheduling**: Notifications are automatically scheduled when reminders are created

### Frontend Components

#### Notification Service

- **Expo Notifications**: Handles local push notifications
- **Permission Management**: Requests and manages notification permissions
- **Token Management**: Registers for push notifications and manages tokens

#### State Management

- **Redux Toolkit**: Uses RTK Query for API calls
- **Caching**: Automatic cache invalidation and updates
- **Optimistic Updates**: Immediate UI updates for better UX

## Usage

### Creating a Reminder

1. Navigate to the Reminders tab or a debtor's detail screen
2. Tap "Add Reminder"
3. Fill in the title, message, and due date
4. Tap "Create"

### Managing Reminders

- **View**: All reminders are displayed in a list with status indicators
- **Edit**: Tap the edit button to modify a reminder
- **Complete**: Tap the checkmark to mark a reminder as completed
- **Delete**: Tap the trash icon to delete a reminder

### Notification Behavior

- **Due Date**: Notifications are sent at the exact due date/time
- **Overdue**: Additional notifications are sent for overdue reminders
- **Upcoming**: Notifications are sent 1 hour before the due date

## Configuration

### Environment Variables

No additional environment variables are required for the basic implementation.

### Notification Services

The system is designed to be easily extended with external notification services:

- **Expo Push Notifications**: For cross-platform push notifications
- **Firebase Cloud Messaging**: For Android push notifications
- **Twilio SMS**: For SMS notifications
- **Email Services**: For email notifications

## Future Enhancements

### Planned Features

1. **Recurring Reminders**: Set reminders that repeat at regular intervals
2. **Custom Notification Times**: Allow users to set multiple notification times
3. **SMS Notifications**: Send SMS reminders to debtors
4. **Email Notifications**: Send email reminders
5. **Reminder Templates**: Pre-defined reminder templates for common scenarios
6. **Bulk Operations**: Create reminders for multiple debtors at once
7. **Reminder Analytics**: Track reminder effectiveness and payment rates

### Technical Improvements

1. **Push Notification Integration**: Implement actual push notifications using Expo or Firebase
2. **Background Processing**: Handle notifications when the app is in the background
3. **Offline Support**: Queue notifications when offline and send when online
4. **Notification Preferences**: Allow users to customize notification settings

## Troubleshooting

### Common Issues

1. **Notifications not appearing**

   - Check notification permissions in device settings
   - Ensure the app is not in battery optimization mode
   - Verify that notifications are enabled in the app

2. **Reminders not saving**

   - Check network connectivity
   - Verify that the debtor exists and belongs to the user
   - Ensure the due date is in the future

3. **Database errors**
   - Run `npm run db:push` to ensure the database schema is up to date
   - Check that the PostgreSQL database is running
   - Verify environment variables are correctly set

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in the server environment.

## Security Considerations

- All reminder operations are authenticated and authorized
- Users can only access their own reminders
- Reminders are automatically deleted when debtors are deleted
- Input validation prevents malicious data injection

## Performance Considerations

- Reminders are paginated to handle large datasets
- Database queries are optimized with proper indexing
- Notification scheduling uses efficient cron jobs
- Client-side caching reduces API calls
