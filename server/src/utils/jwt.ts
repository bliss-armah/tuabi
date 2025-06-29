import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { Request } from "express";

interface JWTPayload {
  userId: number;
  email: string;
}

export const generateToken = (payload: JWTPayload): string => {
  const secret: Secret | undefined = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  const expiresIn: any = process.env.JWT_EXPIRES_IN || "7d";

  const options: SignOptions = {
    expiresIn,
  };

  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
};

export const extractTokenFromHeader = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
};
