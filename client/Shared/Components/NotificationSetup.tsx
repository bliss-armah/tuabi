import React, { useEffect } from "react";
import notificationService from "../Services/NotificationService";

interface NotificationSetupProps {
  children: React.ReactNode;
}

export default function NotificationSetup({
  children,
}: NotificationSetupProps) {
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Register for push notifications
        const token =
          await notificationService.registerForPushNotificationsAsync();

        if (token) {
          console.log("Push notification token:", token);
          // Here you could send the token to your backend to store it
          // for sending push notifications later
        }

        // Set up notification listeners
        const notificationListener =
          notificationService.addNotificationReceivedListener(
            (notification) => {
              console.log("Notification received:", notification);
            }
          );

        const responseListener =
          notificationService.addNotificationResponseReceivedListener(
            (response) => {
              console.log("Notification response:", response);
              // Handle notification tap
              const data = response.notification.request.content.data;
              if (data?.type === "reminder") {
                // Navigate to the specific reminder or debtor
                console.log("Reminder notification tapped:", data);
              }
            }
          );

        return () => {
          notificationListener.remove();
          responseListener.remove();
        };
      } catch (error) {
        console.error("Error setting up notifications:", error);
      }
    };

    initializeNotifications();
  }, []);

  return <>{children}</>;
}
