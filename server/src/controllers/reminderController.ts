import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import prisma from "../config/database";
import notificationService from "../services/notificationService";

export const createReminder = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { debtorId, title, message, dueDate } = req.body;
    const userId = req.user!.id;

    // Validate debtor exists and belongs to user
    const debtor = await prisma.debtor.findFirst({
      where: {
        id: parseInt(debtorId),
        userId: userId,
      },
    });

    if (!debtor) {
      return res.status(404).json({
        success: false,
        message: "Debtor not found",
      });
    }

    // Validate due date is in the future
    const dueDateTime = new Date(dueDate);
    if (dueDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Due date must be in the future",
      });
    }

    const reminder = await prisma.reminder.create({
      data: {
        debtorId: parseInt(debtorId),
        userId: userId,
        title,
        message,
        dueDate: dueDateTime,
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
            expoPushToken: true,
          },
        },
      },
    });

    // Schedule notification for the reminder
    await notificationService.scheduleReminderNotification(reminder);

    res.status(201).json({
      success: true,
      message: "Reminder created successfully",
      data: reminder,
    });
    return;
  } catch (error) {
    console.error("Create reminder error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
};

export const getReminders = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const { debtorId, status } = req.query;

    const whereClause: any = {
      userId: userId,
    };

    if (debtorId) {
      whereClause.debtorId = parseInt(debtorId as string);
    }

    if (status === "active") {
      whereClause.isActive = true;
      whereClause.isCompleted = false;
    } else if (status === "completed") {
      whereClause.isCompleted = true;
    } else if (status === "overdue") {
      whereClause.isActive = true;
      whereClause.isCompleted = false;
      whereClause.dueDate = {
        lt: new Date(),
      };
    }

    const reminders = await prisma.reminder.findMany({
      where: whereClause,
      include: {
        debtor: {
          select: {
            id: true,
            name: true,
            amountOwed: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    res.status(200).json({
      success: true,
      data: reminders,
    });
    return;
  } catch (error) {
    console.error("Get reminders error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
};

export const getReminderById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const reminder = await prisma.reminder.findFirst({
      where: {
        id: parseInt(id),
        userId: userId,
      },
      include: {
        debtor: {
          select: {
            id: true,
            name: true,
            amountOwed: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

    res.status(200).json({
      success: true,
      data: reminder,
    });
    return;
  } catch (error) {
    console.error("Get reminder by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
};

export const updateReminder = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { title, message, dueDate, isCompleted, isActive } = req.body;
    const userId = req.user!.id;

    // Check if reminder exists and belongs to user
    const existingReminder = await prisma.reminder.findFirst({
      where: {
        id: parseInt(id),
        userId: userId,
      },
    });

    if (!existingReminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (message !== undefined) updateData.message = message;
    if (dueDate !== undefined) {
      const dueDateTime = new Date(dueDate);
      if (dueDateTime <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "Due date must be in the future",
        });
      }
      updateData.dueDate = dueDateTime;
    }
    if (isCompleted !== undefined) updateData.isCompleted = isCompleted;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedReminder = await prisma.reminder.update({
      where: { id: parseInt(id) },
      data: updateData,
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
            expoPushToken: true,
          },
        },
      },
    });

    // Reschedule notification if due date was updated
    if (dueDate !== undefined) {
      await notificationService.cancelReminderNotification(parseInt(id));
      await notificationService.scheduleReminderNotification(updatedReminder);
    }

    res.status(200).json({
      success: true,
      message: "Reminder updated successfully",
      data: updatedReminder,
    });
    return;
  } catch (error) {
    console.error("Update reminder error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
};

export const deleteReminder = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if reminder exists and belongs to user
    const existingReminder = await prisma.reminder.findFirst({
      where: {
        id: parseInt(id),
        userId: userId,
      },
    });

    if (!existingReminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

    await prisma.reminder.delete({
      where: { id: parseInt(id) },
    });

    // Cancel any scheduled notifications for this reminder
    await notificationService.cancelReminderNotification(parseInt(id));

    res.status(200).json({
      success: true,
      message: "Reminder deleted successfully",
    });
    return;
  } catch (error) {
    console.error("Delete reminder error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
};

export const markReminderAsCompleted = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if reminder exists and belongs to user
    const existingReminder = await prisma.reminder.findFirst({
      where: {
        id: parseInt(id),
        userId: userId,
      },
    });

    if (!existingReminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

    const updatedReminder = await prisma.reminder.update({
      where: { id: parseInt(id) },
      data: {
        isCompleted: true,
        isActive: false,
      },
      include: {
        debtor: {
          select: {
            name: true,
          },
        },
      },
    });

    // Cancel any scheduled notifications for this reminder
    await notificationService.cancelReminderNotification(parseInt(id));

    res.status(200).json({
      success: true,
      message: "Reminder marked as completed",
      data: updatedReminder,
    });
    return;
  } catch (error) {
    console.error("Mark reminder as completed error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
};

export const getOverdueReminders = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;

    const overdueReminders = await prisma.reminder.findMany({
      where: {
        userId: userId,
        isActive: true,
        isCompleted: false,
        dueDate: {
          lt: new Date(),
        },
      },
      include: {
        debtor: {
          select: {
            id: true,
            name: true,
            amountOwed: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    res.status(200).json({
      success: true,
      data: overdueReminders,
    });
    return;
  } catch (error) {
    console.error("Get overdue reminders error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
};
