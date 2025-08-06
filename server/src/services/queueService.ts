import { Queue } from "bullmq";
import redis from "../config/redis";

export interface NotificationJobData {
  reminderId: number;
  userId: number;
  debtorId: number;
  debtorName: string;
  amountOwed: number;
  phoneNumber: string | null;
  expoPushToken: string | null;
  title: string;
  message: string;
  dueDate: string;
  type: "overdue" | "upcoming";
}

// Create the notification queue
export const notificationQueue = new Queue<NotificationJobData>(
  "reminderNotifications",
  {
    connection: redis,
    defaultJobOptions: {
      removeOnComplete: 100, // Keep last 100 completed jobs
      removeOnFail: 50, // Keep last 50 failed jobs
    },
  }
);

export class QueueService {
  private static instance: QueueService;

  private constructor() {}

  public static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  /**
   * Schedule a reminder notification job
   */
  public async scheduleReminderNotification(
    reminder: any,
    type: "overdue" | "upcoming" = "overdue"
  ): Promise<void> {
    try {
      const dueDate = new Date(reminder.dueDate);
      const now = new Date();

      // If the reminder is already overdue, send immediately
      if (dueDate <= now && type === "overdue") {
        await this.addImmediateNotification(reminder, type);
        return;
      }

      // Calculate delay for future notifications
      const delay = dueDate.getTime() - now.getTime();

      if (delay <= 0) {
        console.warn(`Reminder ${reminder.id} is already overdue`);
        return;
      }

      const jobData: NotificationJobData = {
        reminderId: reminder.id,
        userId: reminder.userId,
        debtorId: reminder.debtorId,
        debtorName: reminder.debtor.name,
        amountOwed: reminder.debtor.amountOwed,
        phoneNumber: reminder.debtor.phoneNumber,
        expoPushToken: reminder.user.expoPushToken,
        title: reminder.title,
        message: reminder.message,
        dueDate: reminder.dueDate,
        type,
      };

      await notificationQueue.add(`reminder-${type}`, jobData, {
        delay,
        jobId: `reminder-${reminder.id}-${type}`,
        removeOnComplete: true,
      });

      console.log(
        `✅ Scheduled ${type} notification for reminder ${reminder.id} at ${dueDate}`
      );
    } catch (error) {
      console.error("Error scheduling reminder notification:", error);
      throw error;
    }
  }

  /**
   * Add an immediate notification job (for overdue reminders)
   */
  private async addImmediateNotification(
    reminder: any,
    type: "overdue" | "upcoming"
  ): Promise<void> {
    const jobData: NotificationJobData = {
      reminderId: reminder.id,
      userId: reminder.userId,
      debtorId: reminder.debtorId,
      debtorName: reminder.debtor.name,
      amountOwed: reminder.debtor.amountOwed,
      phoneNumber: reminder.debtor.phoneNumber,
      expoPushToken: reminder.user.expoPushToken,
      title: reminder.title,
      message: reminder.message,
      dueDate: reminder.dueDate,
      type,
    };

    await notificationQueue.add(`reminder-${type}`, jobData, {
      jobId: `reminder-${reminder.id}-${type}`,
      removeOnComplete: true,
    });

    console.log(
      `✅ Added immediate ${type} notification for reminder ${reminder.id}`
    );
  }

  /**
   * Cancel a scheduled reminder notification
   */
  public async cancelReminderNotification(reminderId: number): Promise<void> {
    try {
      // Remove both overdue and upcoming jobs for this reminder
      const overdueJob = await notificationQueue.getJob(
        `reminder-${reminderId}-overdue`
      );
      const upcomingJob = await notificationQueue.getJob(
        `reminder-${reminderId}-upcoming`
      );

      if (overdueJob) {
        await overdueJob.remove();
        console.log(
          `✅ Cancelled overdue notification for reminder ${reminderId}`
        );
      }

      if (upcomingJob) {
        await upcomingJob.remove();
        console.log(
          `✅ Cancelled upcoming notification for reminder ${reminderId}`
        );
      }
    } catch (error) {
      console.error("Error cancelling reminder notification:", error);
    }
  }

  /**
   * Get queue statistics
   */
  public async getQueueStats() {
    try {
      const waiting = await notificationQueue.getWaiting();
      const active = await notificationQueue.getActive();
      const completed = await notificationQueue.getCompleted();
      const failed = await notificationQueue.getFailed();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
      };
    } catch (error) {
      console.error("Error getting queue stats:", error);
      return null;
    }
  }

  /**
   * Clean up completed and failed jobs
   */
  public async cleanupJobs(): Promise<void> {
    try {
      await notificationQueue.clean(1000 * 60 * 60 * 24, "completed" as any); // Clean jobs older than 24 hours
      await notificationQueue.clean(1000 * 60 * 60 * 24, "failed" as any); // Clean failed jobs older than 24 hours
      console.log("✅ Cleaned up old jobs");
    } catch (error) {
      console.error("Error cleaning up jobs:", error);
    }
  }
}

export default QueueService.getInstance();
