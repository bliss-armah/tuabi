import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import prisma from "../config/database";

export const getDebtHistory = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { debtorId } = req.params;
    const debtorIdNum = parseInt(debtorId);

    if (isNaN(debtorIdNum)) {
      res.status(400).json({
        success: false,
        message: "Invalid debtor ID",
      });
      return;
    }

    // Verify debtor belongs to user
    const debtor = await prisma.debtor.findFirst({
      where: {
        id: debtorIdNum,
        userId: req.user!.id,
      },
    });

    if (!debtor) {
      res.status(404).json({
        success: false,
        message: "Debtor not found",
      });
      return;
    }

    const history = await prisma.debtHistory.findMany({
      where: { debtorId: debtorIdNum },
      orderBy: { timestamp: "desc" },
    });

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Get debt history error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const addDebtHistory = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { debtorId, amountChanged, action, note } = req.body;

    // Verify debtor belongs to user
    const debtor = await prisma.debtor.findFirst({
      where: {
        id: parseInt(debtorId),
        userId: req.user!.id,
      },
    });

    if (!debtor) {
      res.status(404).json({
        success: false,
        message: "Debtor not found",
      });
      return;
    }

    // Calculate new amount based on action
    let newAmount = debtor.amountOwed;
    switch (action) {
      case "add":
        newAmount += parseFloat(amountChanged);
        break;
      case "reduce":
        newAmount -= parseFloat(amountChanged);
        break;
      case "settled":
        newAmount = 0;
        break;
    }

    // Ensure amount doesn't go negative
    if (newAmount < 0) {
      newAmount = 0;
    }

    // Use transaction to update both debtor and add history
    const result = await prisma.$transaction([
      prisma.debtor.update({
        where: { id: parseInt(debtorId) },
        data: { amountOwed: newAmount },
      }),
      prisma.debtHistory.create({
        data: {
          debtorId: parseInt(debtorId),
          amountChanged: parseFloat(amountChanged),
          action,
          note,
          performedById: req.user!.id,
        },
      }),
    ]);

    res.status(201).json({
      success: true,
      message: "Debt history added successfully",
      data: {
        updatedDebtor: result[0],
        newHistory: result[1],
      },
    });
  } catch (error) {
    console.error("Add debt history error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
