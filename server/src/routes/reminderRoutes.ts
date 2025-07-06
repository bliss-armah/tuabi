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

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Create a new reminder
router.post("/", createReminder);

// Get all reminders (with optional filters)
router.get("/", getReminders);

// Get overdue reminders
router.get("/overdue", getOverdueReminders);

// Get a specific reminder by ID
router.get("/:id", getReminderById);

// Update a reminder
router.put("/:id", updateReminder);

// Mark reminder as completed
router.patch("/:id/complete", markReminderAsCompleted);

// Delete a reminder
router.delete("/:id", deleteReminder);

export default router;
