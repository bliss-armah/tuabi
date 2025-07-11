import { Expo, ExpoPushMessage } from "expo-server-sdk";
import queueService from "./queueService";

const expo = new Expo();

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Schedule a reminder notification using BullMQ
   */
  public async scheduleReminderNotification(reminder: any): Promise<void> {
    try {
      const dueDate = new Date(reminder.dueDate);
      const now = new Date();

      // If the reminder is already overdue, schedule it immediately
      if (dueDate <= now && !reminder.wasNotified) {
        await queueService.scheduleReminderNotification(reminder, "overdue");
        return;
      }

      // Schedule the overdue notification for the due date
      await queueService.scheduleReminderNotification(reminder, "overdue");

      // Schedule an upcoming notification 1 hour before the due date
      const upcomingDate = new Date(dueDate.getTime() - 60 * 60 * 1000); // 1 hour before
      if (upcomingDate > now) {
        const upcomingReminder = {
          ...reminder,
          dueDate: upcomingDate,
        };
        await queueService.scheduleReminderNotification(
          upcomingReminder,
          "upcoming"
        );
      }

      console.log(`✅ Scheduled notifications for reminder ${reminder.id}`);
    } catch (error) {
      console.error("Error scheduling reminder notification:", error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled reminder notification
   */
  public async cancelReminderNotification(reminderId: number): Promise<void> {
    try {
      await queueService.cancelReminderNotification(reminderId);
      console.log(`✅ Cancelled notification for reminder ${reminderId}`);
    } catch (error) {
      console.error("Error cancelling reminder notification:", error);
    }
  }

  /**
   * Send a custom notification immediately
   */
  public async sendCustomNotification(message: ExpoPushMessage) {
    try {
      if (!Expo.isExpoPushToken(message.to)) {
        console.warn("Invalid Expo Push Token:", message.to);
        return { error: "Invalid token" };
      }

      const ticket = await expo.sendPushNotificationsAsync([message]);
      console.log("Custom push sent:", ticket);
      return ticket;
    } catch (error) {
      console.error("Error sending custom notification:", error);
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  public async getQueueStats() {
    return await queueService.getQueueStats();
  }

  /**
   * Clean up old jobs
   */
  public async cleanupJobs(): Promise<void> {
    await queueService.cleanupJobs();
  }
}

export default NotificationService.getInstance();
