import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { auth } from '../config/firebase';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const ACCESS_TOKEN_EXPIRY = '7d';
const REFRESH_TOKEN_EXPIRY = '30d';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    name?: string;
  };
}

/**
 * JWT Authentication Middleware
 * Verifies the JWT token from Authorization header
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Access token required' 
      });
    }

    // First try to verify as a custom JWT
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        uid: string;
        email: string;
        name?: string;
      };
      
      req.user = {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name
      };
      
      return next();
    } catch (jwtError) {
      // If JWT verification fails, try Firebase token
      try {
        const decodedFirebase = await auth.verifyIdToken(token);
        req.user = {
          uid: decodedFirebase.uid,
          email: decodedFirebase.email || '',
          name: decodedFirebase.name
        };
        return next();
      } catch (firebaseError) {
        return res.status(403).json({ 
          success: false, 
          error: 'Invalid or expired token' 
        });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Authentication error' 
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
          uid: string;
          email: string;
          name?: string;
        };
        req.user = decoded;
      } catch {
        // Token invalid, but continue without user
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

/**
 * Generate JWT tokens
 */
export const generateTokens = (user: { uid: string; email: string; name?: string }) => {
  const accessTokenOptions: SignOptions = { expiresIn: ACCESS_TOKEN_EXPIRY };
  const refreshTokenOptions: SignOptions = { expiresIn: REFRESH_TOKEN_EXPIRY };
  
  const accessToken = jwt.sign(
    { uid: user.uid, email: user.email, name: user.name },
    JWT_SECRET,
    accessTokenOptions
  );

  const refreshToken = jwt.sign(
    { uid: user.uid, type: 'refresh' },
    JWT_SECRET,
    refreshTokenOptions
  );

  return { accessToken, refreshToken };
};

/**
 * Verify refresh token and generate new access token
 */
export const refreshAccessToken = (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as {
      uid: string;
      type: string;
    };

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    const accessTokenOptions: SignOptions = { expiresIn: ACCESS_TOKEN_EXPIRY };
    
    const newAccessToken = jwt.sign(
      { uid: decoded.uid },
      JWT_SECRET,
      accessTokenOptions
    );

    return { accessToken: newAccessToken };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};
