import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';
import prisma from '../config/database';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractTokenFromHeader(req);
    
    if (!token) {
       res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
      return
    }

    const payload = verifyToken(token);
    
    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user) {
       res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
      return
    }

    req.user = {
      id: user.id,
      email: user.email
    };

    next();
  } catch (error) {
     res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
    return
  }
}; 