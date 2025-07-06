import React, { useEffect } from "react";
import { usePushNotifications } from "../Hooks/usePushNotifications";

interface NotificationSetupProps {
  children: React.ReactNode;
}

export default function NotificationSetup({ children }: NotificationSetupProps) {
  const { expoPushToken, notification } = usePushNotifications();

  useEffect(() => {
    if (expoPushToken) {
      console.log("Push notification token:", expoPushToken);
      // You can send this token to your backend here
    }
  }, [expoPushToken]);

  useEffect(() => {
    if (notification) {
      console.log("Notification received:", notification);
      const data = notification.request.content.data;

      if (data?.type === "reminder") {
        // Handle reminder notification
        console.log("Reminder notification tapped:", data);
      }
    }
  }, [notification]);

  return <>{children}</>;
}
