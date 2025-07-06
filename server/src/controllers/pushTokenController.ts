import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import prisma from "../config/database";

export const savePushToken = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { pushToken } = req.body;
  const userId = req.user?.id;

  if (!pushToken) {
    return res.status(400).json({ success: false, message: "Push token required" });
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { expoPushToken: pushToken },
    });

    return res.status(200).json({
      success: true,
      message: "Push token saved successfully",
    });
  } catch (error) {
    console.error("Error saving push token:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save push token",
    });
  }
};
