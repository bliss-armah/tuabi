import cron from "node-cron";
import prisma from "../config/database";

export class NotificationService {
  private static instance: NotificationService;
  private isRunning = false;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public startScheduler(): void {
    if (this.isRunning) {
      console.log("Notification scheduler is already running");
      return;
    }

    // Check for overdue reminders every minute
    cron.schedule("* * * * *", async () => {
      await this.checkOverdueReminders();
    });

    // Check for upcoming reminders every 5 minutes
    cron.schedule("*/5 * * * *", async () => {
      await this.checkUpcomingReminders();
    });

    this.isRunning = true;
    console.log("Notification scheduler started");
  }

  public stopScheduler(): void {
    if (!this.isRunning) {
      console.log("Notification scheduler is not running");
      return;
    }

    cron.getTasks().forEach((task) => task.stop());
    this.isRunning = false;
    console.log("Notification scheduler stopped");
  }

  private async checkOverdueReminders(): Promise<void> {
    try {
      const overdueReminders = await prisma.reminder.findMany({
        where: {
          isActive: true,
          isCompleted: false,
          dueDate: {
            lt: new Date(),
          },
        },
        include: {
          debtor: {
            select: {
              name: true,
              amountOwed: true,
              phoneNumber: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      for (const reminder of overdueReminders) {
        await this.sendOverdueNotification(reminder);
      }
    } catch (error) {
      console.error("Error checking overdue reminders:", error);
    }
  }

  private async checkUpcomingReminders(): Promise<void> {
    try {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

      const upcomingReminders = await prisma.reminder.findMany({
        where: {
          isActive: true,
          isCompleted: false,
          dueDate: {
            gte: now,
            lte: oneHourFromNow,
          },
        },
        include: {
          debtor: {
            select: {
              name: true,
              amountOwed: true,
              phoneNumber: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      for (const reminder of upcomingReminders) {
        await this.sendUpcomingNotification(reminder);
      }
    } catch (error) {
      console.error("Error checking upcoming reminders:", error);
    }
  }

  private async sendOverdueNotification(reminder: any): Promise<void> {
    try {
      const notificationData = {
        type: "overdue_reminder",
        title: `Payment Overdue: ${reminder.debtor.name}`,
        body: `Payment of GHS ${reminder.debtor.amountOwed.toFixed(
          2
        )} is overdue. ${reminder.message}`,
        data: {
          reminderId: reminder.id,
          debtorId: reminder.debtorId,
          debtorName: reminder.debtor.name,
          amount: reminder.debtor.amountOwed,
          phoneNumber: reminder.debtor.phoneNumber,
        },
      };

      // Here you would integrate with your preferred notification service
      // For now, we'll just log the notification
      console.log("OVERDUE NOTIFICATION:", {
        userId: reminder.userId,
        userEmail: reminder.user.email,
        ...notificationData,
      });

      // You could integrate with services like:
      // - Expo Push Notifications
      // - Firebase Cloud Messaging
      // - Twilio SMS
      // - Email services
    } catch (error) {
      console.error("Error sending overdue notification:", error);
    }
  }

  private async sendUpcomingNotification(reminder: any): Promise<void> {
    try {
      const dueDate = new Date(reminder.dueDate);
      const now = new Date();
      const diffMinutes = Math.floor(
        (dueDate.getTime() - now.getTime()) / (1000 * 60)
      );

      const notificationData = {
        type: "upcoming_reminder",
        title: `Payment Due Soon: ${reminder.debtor.name}`,
        body: `Payment of GHS ${reminder.debtor.amountOwed.toFixed(
          2
        )} is due in ${diffMinutes} minutes. ${reminder.message}`,
        data: {
          reminderId: reminder.id,
          debtorId: reminder.debtorId,
          debtorName: reminder.debtor.name,
          amount: reminder.debtor.amountOwed,
          phoneNumber: reminder.debtor.phoneNumber,
        },
      };

      // Here you would integrate with your preferred notification service
      console.log("UPCOMING NOTIFICATION:", {
        userId: reminder.userId,
        userEmail: reminder.user.email,
        ...notificationData,
      });
    } catch (error) {
      console.error("Error sending upcoming notification:", error);
    }
  }

  public async scheduleReminderNotification(reminder: any): Promise<void> {
    try {
      const dueDate = new Date(reminder.dueDate);
      const now = new Date();

      if (dueDate <= now) {
        // If the reminder is already due, send it immediately
        await this.sendOverdueNotification(reminder);
        return;
      }

      // Schedule the notification for the due date
      const delay = dueDate.getTime() - now.getTime();

      setTimeout(async () => {
        await this.sendOverdueNotification(reminder);
      }, delay);

      console.log(
        `Scheduled notification for reminder ${reminder.id} at ${dueDate}`
      );
    } catch (error) {
      console.error("Error scheduling reminder notification:", error);
    }
  }

  public async cancelReminderNotification(reminderId: number): Promise<void> {
    try {
      // Here you would cancel any scheduled notifications for this reminder
      console.log(`Cancelled notification for reminder ${reminderId}`);
    } catch (error) {
      console.error("Error cancelling reminder notification:", error);
    }
  }
}

export default NotificationService.getInstance();
