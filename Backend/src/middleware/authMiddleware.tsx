import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * JWT Authentication middleware for protected routes
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = userService.verifyToken(token);

    if (!decoded) {
      res.status(401).json({ message: 'Invalid or expired token' });
      return;
    }

    // Attach user to request
    req.user = decoded;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

/**
 * Admin role middleware
 */
export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }

  next();
};
