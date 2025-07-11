import { useState } from "react";
import { Reminder } from "@/Features/Reminders/RemindersApi";

export const useReminderModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [reminder, setReminder] = useState<Reminder | undefined>();

  const openAddReminder = (debtorId?: number, debtorName?: string) => {
    setMode("add");
    setReminder(undefined);
    setIsVisible(true);
  };

  const openEditReminder = (reminder: Reminder) => {
    setMode("edit");
    setReminder(reminder);
    setIsVisible(true);
  };

  const closeModal = () => {
    setIsVisible(false);
    setReminder(undefined);
  };

  return {
    isVisible,
    mode,
    reminder,
    openAddReminder,
    openEditReminder,
    closeModal,
  };
};
