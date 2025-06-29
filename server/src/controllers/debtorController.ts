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
      return
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
      return
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
    return
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
