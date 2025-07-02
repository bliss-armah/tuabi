import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import prisma from "../config/database";

export const getAllDebtors = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const debtors = await prisma.debtor.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({
      success: true,
      data: debtors,
    });
  } catch (error) {
    console.error("Get all debtors error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getDebtorById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const debtorId = parseInt(id);
    if (isNaN(debtorId)) {
      res.status(400).json({
        success: false,
        message: "Invalid debtor ID",
      });
      return;
    }
    const debtor = await prisma.debtor.findFirst({
      where: {
        id: debtorId,
        userId: req.user!.id,
      },
      include: {
        history: {
          orderBy: { timestamp: "desc" },
        },
      },
    });
    if (!debtor) {
      res.status(404).json({
        success: false,
        message: "Debtor not found",
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: debtor,
    });
  } catch (error) {
    console.error("Get debtor by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createDebtor = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { name, amountOwed, description, phoneNumber } = req.body;
    const debtor = await prisma.debtor.create({
      data: {
        name,
        amountOwed: parseFloat(amountOwed),
        description,
        phoneNumber,
        userId: req.user!.id,
      },
    });
    res.status(201).json({
      success: true,
      message: "Debtor created successfully",
      data: debtor,
    });
  } catch (error) {
    console.error("Create debtor error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateDebtor = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { name, amountOwed, description, phoneNumber } = req.body;
    const debtorId = parseInt(id);
    if (isNaN(debtorId)) {
      res.status(400).json({
        success: false,
        message: "Invalid debtor ID",
      });
      return;
    }
    // Check if debtor exists and belongs to user
    const existingDebtor = await prisma.debtor.findFirst({
      where: {
        id: debtorId,
        userId: req.user!.id,
      },
    });
    if (!existingDebtor) {
      res.status(404).json({
        success: false,
        message: "Debtor not found",
      });
      return;
    }
    const updatedDebtor = await prisma.debtor.update({
      where: { id: debtorId },
      data: {
        ...(name && { name }),
        ...(amountOwed !== undefined && { amountOwed: parseFloat(amountOwed) }),
        ...(description !== undefined && { description }),
        ...(phoneNumber !== undefined && { phoneNumber }),
      },
    });
    res.status(200).json({
      success: true,
      message: "Debtor updated successfully",
      data: updatedDebtor,
    });
  } catch (error) {
    console.error("Update debtor error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
};

export const incrementDebtorAmount = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { amount, note } = req.body;
    const debtorId = parseInt(id);

    if (isNaN(debtorId)) {
      res.status(400).json({
        success: false,
        message: "Invalid debtor ID",
      });
      return;
    }

    // Check if debtor exists and belongs to user
    const existingDebtor = await prisma.debtor.findFirst({
      where: {
        id: debtorId,
        userId: req.user!.id,
      },
    });

    if (!existingDebtor) {
      res.status(404).json({
        success: false,
        message: "Debtor not found",
      });
      return;
    }

    const incrementAmount = parseFloat(amount);
    const newAmount = existingDebtor.amountOwed + incrementAmount;

    // Use transaction to update debtor amount and create history record
    const result = await prisma.$transaction([
      prisma.debtor.update({
        where: { id: debtorId },
        data: { amountOwed: newAmount },
      }),
      prisma.debtHistory.create({
        data: {
          debtorId: debtorId,
          amountChanged: incrementAmount,
          action: "add",
          note: note || `Amount increased by ${incrementAmount}`,
          performedById: req.user!.id,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: "Debtor amount incremented successfully",
      data: {
        debtor: result[0],
        history: result[1],
        previousAmount: existingDebtor.amountOwed,
        newAmount: newAmount,
        amountAdded: incrementAmount,
      },
    });
  } catch (error) {
    console.error("Increment debtor amount error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const decrementDebtorAmount = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { amount, note } = req.body;
    const debtorId = parseInt(id);

    if (isNaN(debtorId)) {
      res.status(400).json({
        success: false,
        message: "Invalid debtor ID",
      });
      return;
    }

    // Check if debtor exists and belongs to user
    const existingDebtor = await prisma.debtor.findFirst({
      where: {
        id: debtorId,
        userId: req.user!.id,
      },
    });

    if (!existingDebtor) {
      res.status(404).json({
        success: false,
        message: "Debtor not found",
      });
      return;
    }

    const decrementAmount = parseFloat(amount);
    let newAmount = existingDebtor.amountOwed - decrementAmount;

    // Ensure amount doesn't go negative
    if (newAmount < 0) {
      newAmount = 0;
    }

    const actualAmountReduced = existingDebtor.amountOwed - newAmount;

    // Use transaction to update debtor amount and create history record
    const result = await prisma.$transaction([
      prisma.debtor.update({
        where: { id: debtorId },
        data: { amountOwed: newAmount },
      }),
      prisma.debtHistory.create({
        data: {
          debtorId: debtorId,
          amountChanged: actualAmountReduced,
          action: "reduce",
          note: note || `Payment received: ${actualAmountReduced}`,
          performedById: req.user!.id,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: "Debtor amount decremented successfully",
      data: {
        debtor: result[0],
        history: result[1],
        previousAmount: existingDebtor.amountOwed,
        newAmount: newAmount,
        amountPaid: actualAmountReduced,
        requestedDeduction: decrementAmount,
      },
    });
  } catch (error) {
    console.error("Decrement debtor amount error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteDebtor = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const debtorId = parseInt(id);
    if (isNaN(debtorId)) {
      res.status(400).json({
        success: false,
        message: "Invalid debtor ID",
      });
      return;
    }
    // Check if debtor exists and belongs to user
    const existingDebtor = await prisma.debtor.findFirst({
      where: {
        id: debtorId,
        userId: req.user!.id,
      },
    });
    if (!existingDebtor) {
      res.status(404).json({
        success: false,
        message: "Debtor not found",
      });
      return;
    }
    await prisma.debtor.delete({
      where: { id: debtorId },
    });
    res.status(200).json({
      success: true,
      message: "Debtor deleted successfully",
    });
  } catch (error) {
    console.error("Delete debtor error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
};

export const getDashboardData = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get all debtors for the user
    const debtors = await prisma.debtor.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        amountOwed: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Calculate total statistics
    const totalDebtors = debtors.length;
    const totalAmountOwed = debtors.reduce((sum, debtor) => sum + debtor.amountOwed, 0);
    
    // Count active debtors (those who owe more than 0)
    const activeDebtors = debtors.filter(debtor => debtor.amountOwed > 0);
    const totalActiveDebtors = activeDebtors.length;
    
    // Count settled debtors (those who owe 0)
    const settledDebtors = debtors.filter(debtor => debtor.amountOwed === 0);
    const totalSettledDebtors = settledDebtors.length;

    // Get recent activities (last 10 history entries)
    const recentActivities = await prisma.debtHistory.findMany({
      where: {
        debtor: {
          userId: userId,
        },
      },
      include: {
        debtor: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      take: 10,
    });

    // Get top debtors (highest amounts owed)
    const topDebtors = activeDebtors
      .sort((a, b) => b.amountOwed - a.amountOwed)
      .slice(0, 5)
      .map(debtor => ({
        id: debtor.id,
        name: debtor.name,
        amountOwed: debtor.amountOwed,
      }));

    // Calculate recent activity statistics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentStats = await prisma.debtHistory.aggregate({
      where: {
        debtor: {
          userId: userId,
        },
        timestamp: {
          gte: thirtyDaysAgo,
        },
      },
      _count: {
        id: true,
      },
    });

    // Get recent payments and additions separately
    const recentPayments = await prisma.debtHistory.aggregate({
      where: {
        debtor: {
          userId: userId,
        },
        action: "reduce",
        timestamp: {
          gte: thirtyDaysAgo,
        },
      },
      _sum: {
        amountChanged: true,
      },
      _count: {
        id: true,
      },
    });

    const recentAdditions = await prisma.debtHistory.aggregate({
      where: {
        debtor: {
          userId: userId,
        },
        action: "add",
        timestamp: {
          gte: thirtyDaysAgo,
        },
      },
      _sum: {
        amountChanged: true,
      },
      _count: {
        id: true,
      },
    });

    // Get newly added debtors (last 30 days)
    const newDebtors = await prisma.debtor.count({
      where: {
        userId: userId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Format response
    const dashboardData = {
      summary: {
        totalDebtors,
        totalActiveDebtors,
        totalSettledDebtors,
        totalAmountOwed: Math.round(totalAmountOwed * 100) / 100, // Round to 2 decimal places
      },
      topDebtors,
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        debtorName: activity.debtor.name,
        action: activity.action,
        amountChanged: activity.amountChanged,
        note: activity.note || null,
        timestamp: activity.timestamp,
      })),
      monthlyStats: {
        totalActivities: recentStats._count.id,
        totalPaymentsReceived: Math.round((recentPayments._sum.amountChanged || 0) * 100) / 100,
        totalPaymentTransactions: recentPayments._count.id,
        totalDebtAdded: Math.round((recentAdditions._sum.amountChanged || 0) * 100) / 100,
        totalAdditionTransactions: recentAdditions._count.id,
        newDebtorsAdded: newDebtors,
      },
      trends: {
        averageDebtPerDebtor: totalActiveDebtors > 0 
          ? Math.round((totalAmountOwed / totalActiveDebtors) * 100) / 100 
          : 0,
        settlementRate: totalDebtors > 0 
          ? Math.round((totalSettledDebtors / totalDebtors) * 100 * 100) / 100 
          : 0, // Percentage
      },
    };

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Get dashboard data error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};