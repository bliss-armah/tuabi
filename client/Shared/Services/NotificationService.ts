import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async registerForPushNotificationsAsync(): Promise<string | null> {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return null;
      }

      try {
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig?.extra?.eas?.projectId,
          })
        ).data;
        this.expoPushToken = token;
        console.log("Expo push token:", token);
      } catch (error) {
        console.error("Error getting push token:", error);
      }
    } else {
      console.log("Must use physical device for Push Notifications");
    }

    return token;
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    trigger: Notifications.NotificationTriggerInput,
    data?: any
  ): Promise<string> {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: "default",
      },
      trigger,
    });

    console.log("Scheduled notification with identifier:", identifier);
    return identifier;
  }

  async scheduleReminderNotification(
    reminderId: number,
    debtorName: string,
    amount: number,
    dueDate: Date,
    message: string
  ): Promise<string> {
    const title = `Payment Reminder: ${debtorName}`;
    const body = `Payment of GHS ${amount.toFixed(2)} is due. ${message}`;

    // Schedule notification for the due date
    const trigger = {
      date: dueDate,
    };

    return await this.scheduleLocalNotification(title, body, trigger, {
      type: "reminder",
      reminderId,
      debtorName,
      amount,
    });
  }

  async cancelNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getPendingNotifications(): Promise<
    Notifications.NotificationRequest[]
  > {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  async addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Promise<Notifications.Subscription> {
    return Notifications.addNotificationReceivedListener(listener);
  }

  async addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Promise<Notifications.Subscription> {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }
}

export default NotificationService.getInstance();
