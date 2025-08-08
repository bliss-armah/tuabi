import { Request, Response } from "express";
import prisma from "../config/database";
import { generateToken } from "../utils/jwt";
import { hashPassword, verifyPassword } from "../utils/hash";
import {
  normalizePhoneNumber,
  validatePhoneNumber,
} from "../utils/phoneNumber";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body; // identifier can be email or phone number

    if (!identifier || !password) {
      res.status(400).json({
        success: false,
        message:
          "Please provide both identifier (email or phone number) and password",
      });
      return;
    }

    // Determine if identifier is email or phone number
    const isEmail = identifier.includes("@");
    let user;

    if (isEmail) {
      // Search by email
      user = await prisma.user.findUnique({
        where: { email: identifier.toLowerCase() },
      });
    } else {
      // Search by phone number (normalize first)
      try {
        const normalizedPhone = normalizePhoneNumber(identifier);
        user = await prisma.user.findUnique({
          where: { phoneNumber: normalizedPhone },
        });
      } catch (error) {
        res.status(400).json({
          success: false,
          message: "Invalid phone number format",
        });
        return;
      }
    }

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const token = generateToken({
      userId: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email,
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
    const { name, email, phoneNumber, password } = req.body;

    // Validate required fields
    if (!name || !email || !phoneNumber || !password) {
      res.status(400).json({
        success: false,
        message:
          "All fields (name, email, phone number, password) are required",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
      return;
    }

    // Validate and normalize phone number
    let normalizedPhone;
    try {
      normalizedPhone = normalizePhoneNumber(phoneNumber);
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          "Please provide a valid phone number (e.g., 0245289983 or +233245289983)",
      });
      return;
    }

    // Check if user exists with email or phone number
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { phoneNumber: normalizedPhone }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        res.status(400).json({
          success: false,
          message: "User with this email already exists",
        });
      } else {
        res.status(400).json({
          success: false,
          message: "User with this phone number already exists",
        });
      }
      return;
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phoneNumber: normalizedPhone,
        password: hashedPassword,
      },
    });

    const token = generateToken({
      userId: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
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

export const requestPasswordReset = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { identifier } = req.body; // email or phone number

    if (!identifier) {
      res.status(400).json({
        success: false,
        message: "Please provide email or phone number",
      });
      return;
    }

    const isEmail = identifier.includes("@");
    let user;

    if (isEmail) {
      user = await prisma.user.findUnique({
        where: { email: identifier.toLowerCase() },
      });
    } else {
      try {
        const normalizedPhone = normalizePhoneNumber(identifier);
        user = await prisma.user.findUnique({
          where: { phoneNumber: normalizedPhone },
        });
      } catch (error) {
        res.status(400).json({
          success: false,
          message: "Invalid phone number format",
        });
        return;
      }
    }

    if (!user) {
      // Don't reveal if user exists or not for security
      res.status(200).json({
        success: true,
        message: "If the account exists, a reset code has been sent",
      });
      return;
    }

    // Generate a simple 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetCode,
        resetExpiresAt,
      },
    });

    // In a real app, you'd send this via SMS/email
    // For now, we'll return it in the response for testing
    res.status(200).json({
      success: true,
      message: "Reset code sent successfully",
      data: {
        resetCode, // Remove this in production
        expiresIn: "10 minutes",
      },
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { identifier, resetCode, newPassword } = req.body;

    if (!identifier || !resetCode || !newPassword) {
      res.status(400).json({
        success: false,
        message: "Please provide identifier, reset code, and new password",
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
      return;
    }

    const isEmail = identifier.includes("@");
    let user;

    if (isEmail) {
      user = await prisma.user.findUnique({
        where: { email: identifier.toLowerCase() },
      });
    } else {
      try {
        const normalizedPhone = normalizePhoneNumber(identifier);
        user = await prisma.user.findUnique({
          where: { phoneNumber: normalizedPhone },
        });
      } catch (error) {
        res.status(400).json({
          success: false,
          message: "Invalid phone number format",
        });
        return;
      }
    }

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Invalid reset request",
      });
      return;
    }

    // Check if reset code matches and is not expired
    if (
      user.resetCode !== resetCode ||
      !user.resetExpiresAt ||
      user.resetExpiresAt < new Date()
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid or expired reset code",
      });
      return;
    }

    // Hash new password and update user
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetExpiresAt: null,
      },
    });

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
