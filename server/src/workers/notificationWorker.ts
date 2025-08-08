import { Worker, Job } from "bullmq";
import { Expo, ExpoPushMessage } from "expo-server-sdk";
import redis from "../config/redis";
import { NotificationJobData } from "../services/queueService";
import prisma from "../config/database";

const expo = new Expo();

class NotificationWorker {
  private worker: Worker<NotificationJobData>;

  constructor() {
    this.worker = new Worker<NotificationJobData>(
      "reminderNotifications",
      async (job: Job<NotificationJobData>) => {
        await this.processNotificationJob(job);
      },
      {
        connection: redis,
        concurrency: 10, // Process up to 10 jobs concurrently
      }
    );

    this.setupWorkerEvents();
  }

  private setupWorkerEvents(): void {
    this.worker.on("completed", (job) => {
      console.log(`✅ Job ${job.id} completed successfully`);
    });

    this.worker.on("failed", (job, err) => {
      console.error(`❌ Job ${job?.id} failed:`, err);
    });

    this.worker.on("error", (err) => {
      console.error("❌ Worker error:", err);
    });

    this.worker.on("ready", () => {
      console.log("🚀 Notification worker is ready to process jobs");
    });
  }

  private async processNotificationJob(
    job: Job<NotificationJobData>
  ): Promise<void> {
    const { data } = job;

    try {
      console.log(
        `📱 Processing ${data.type} notification for reminder ${data.reminderId}`
      );

      // Check if reminder still exists and is active
      const reminder = await prisma.reminder.findFirst({
        where: {
          id: data.reminderId,
          isActive: true,
          isCompleted: false,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              expoPushToken: true,
            },
          },
          debtor: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              amountOwed: true,
            },
          },
        },
      });

      if (!reminder) {
        console.log(
          `⚠️ Reminder ${data.reminderId} not found or inactive, skipping notification`
        );
        return;
      }

      // Check if user still has a valid push token
      if (
        !reminder.user.expoPushToken ||
        !Expo.isExpoPushToken(reminder.user.expoPushToken)
      ) {
        console.warn(
          `⚠️ Invalid or missing push token for user ${data.userId}, skipping notification`
        );
        return;
      }

      // Send the notification
      await this.sendNotification(reminder, data.type);

      // Mark reminder as notified if it's an overdue notification
      if (data.type === "overdue") {
        await prisma.reminder.update({
          where: { id: data.reminderId },
          data: { wasNotified: true },
        });
      }

      console.log(
        `✅ ${data.type} notification sent successfully for reminder ${data.reminderId}`
      );
    } catch (error) {
      console.error(`❌ Error processing notification job ${job.id}:`, error);
      throw error; // Re-throw to mark job as failed
    }
  }

  private async sendNotification(
    reminder: any,
    type: "overdue" | "upcoming"
  ): Promise<void> {
    const pushToken = reminder.user.expoPushToken;

    if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
      throw new Error("Invalid push token");
    }

    let title: string;
    let body: string;

    if (type === "overdue") {
      title = `Payment Overdue: ${reminder.debtor.name}`;
      body = `GHS ${reminder.debtor.amountOwed.toFixed(2)} is overdue.`;
    } else {
      const dueDate = new Date(reminder.dueDate);
      const now = new Date();
      const diffMinutes = Math.floor(
        (dueDate.getTime() - now.getTime()) / (1000 * 60)
      );

      title = `Payment Due Soon: ${reminder.debtor.name}`;
      body = `Payment of GHS ${reminder.debtor.amountOwed.toFixed(
        2
      )} is due in ${diffMinutes} minutes.`;
    }

    const message: ExpoPushMessage = {
      to: pushToken,
      sound: "default",
      title,
      body,
      data: {
        type: `${type}_reminder`,
        reminderId: reminder.id,
        debtorId: reminder.debtorId,
        debtorName: reminder.debtor.name,
        amount: reminder.debtor.amountOwed,
        phoneNumber: reminder.debtor.phoneNumber,
      },
    };

    const ticketChunk = await expo.sendPushNotificationsAsync([message]);

    if (ticketChunk[0]?.status === "error") {
      throw new Error(`Expo notification failed: ${ticketChunk[0].message}`);
    }

    console.log(`📤 Push notification sent:`, ticketChunk);
  }

  public async close(): Promise<void> {
    await this.worker.close();
  }
}

// Start the worker
const worker = new NotificationWorker();

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down notification worker...");
  await worker.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("🛑 Shutting down notification worker...");
  await worker.close();
  process.exit(0);
});

export default worker;
