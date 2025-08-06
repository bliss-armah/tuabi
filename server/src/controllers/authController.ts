import { Request, Response } from "express";
import prisma from "../config/database";
import { generateToken } from "../utils/jwt";
import { hashPassword, verifyPassword } from "../utils/hash";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber, password } = req.body;
    const user = await prisma.user.findUnique({ where: { phoneNumber } });

    if (!user) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const token = generateToken({
      userId: user.id,
      phoneNumber: user.phoneNumber,
    });
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phoneNumber, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "User with this phone number already exists",
      });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        phoneNumber,
        password: hashedPassword,
      },
    });

    const token = generateToken({
      userId: user.id,
      phoneNumber: user.phoneNumber,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user.id,
          name: user.name,
          phoneNumber: user.phoneNumber,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
