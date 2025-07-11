import express from "express";
import { authenticateToken } from "../middleware/auth";
import {
  createReminder,
  getReminders,
  getReminderById,
  updateReminder,
  deleteReminder,
  markReminderAsCompleted,
  getOverdueReminders,
} from "../controllers/reminderController";
import notificationService from "../services/notificationService";

const router = express.Router();


// Apply authentication middleware to all routes
router.use(authenticateToken);

// Create a new reminder
router.post("/", createReminder);

// Get all reminders (with optional filters)
router.get("/", getReminders);

// Get overdue reminders
router.get("/overdue", getOverdueReminders);

router.post("/send-test", async (req, res) => {
  const { pushToken, title, body, data } = req.body;

  if (!pushToken) {
    return res.status(400).json({ message: "Missing push token" });
  }

  try {
    const message = {
      to: pushToken,
      sound: "default",
      title: title || "Test Notification",
      body: body || "This is a test notification from your backend",
      data: data || { test: true },
    };

    const response = await notificationService.sendCustomNotification(message);

    return res.status(200).json({
      message: "Notification sent",
      response,
    });
  } catch (error) {
    console.error("Error sending test notification:", error);
    return res.status(500).json({
      message: "Failed to send notification",
    });
  }
});

// Get a specific reminder by ID
router.get("/:id", getReminderById);

// Update a reminder
router.put("/:id", updateReminder);

// Mark reminder as completed
router.patch("/:id/complete", markReminderAsCompleted);

// Delete a reminder
router.delete("/:id", deleteReminder);

export default router;
