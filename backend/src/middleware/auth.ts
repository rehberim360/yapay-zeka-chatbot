/**
 * JWT Authentication Middleware
 * 
 * Validates JWT tokens for protected endpoints
 * Requirements: 3.1-3.10 (API Security)
 */

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role?: string;
      };
    }
  }
}

/**
 * JWT Authentication Middleware
 * Validates Bearer token in Authorization header
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'No authorization header provided'
      });
      return;
    }

    // Check Bearer format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        success: false,
        error: 'Invalid authorization format',
        message: 'Expected format: Bearer <token>'
      });
      return;
    }

    const token = parts[1];
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'No token provided'
      });
      return;
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET not configured');
      res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      id: string;
      email?: string;
      role?: string;
    };

    // Attach user to request
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: error.message
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expired',
        message: 'Please login again'
      });
      return;
    }

    console.error('❌ Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Optional JWT Authentication
 * Validates token if provided, but allows request to continue without it
 */
export const optionalAuthenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      // No token provided, continue without user
      next();
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      // Invalid format, continue without user
      next();
      return;
    }

    const token = parts[1];
    if (!token) {
      next();
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET not configured');
      next();
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      id: string;
      email?: string;
      role?: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    // Token validation failed, but continue without user
    next();
  }
};
