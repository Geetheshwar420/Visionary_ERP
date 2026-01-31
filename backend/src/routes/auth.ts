import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { collections, FieldValue } from '../config/firebase';
import { AuthenticatedRequest, authenticateToken, generateTokens, refreshAccessToken } from '../middleware/auth';
import { validateRegister, validateLogin } from '../middleware/validation';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validateRegister, async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await collections.users.where('email', '==', email).get();
    if (!existingUser.empty) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userId = uuidv4();
    const userData = {
      id: userId,
      email,
      name,
      password: hashedPassword,
      role: 'admin',
      mfaEnabled: false,
      emailVerified: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    await collections.users.doc(userId).set(userData);

    // Generate tokens
    const tokens = generateTokens({ uid: userId, email, name });

    // Return user without password
    const { password: _, ...userWithoutPassword } = userData;

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        ...tokens
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', validateLogin, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const userSnapshot = await collections.users.where('email', '==', email).get();
    if (userSnapshot.empty) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Verify password
    const isValidPassword = await bcrypt.compare(password, userData.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate tokens
    const tokens = generateTokens({ 
      uid: userData.id, 
      email: userData.email, 
      name: userData.name 
    });

    // Update last login
    await userDoc.ref.update({
      lastLoginAt: FieldValue.serverTimestamp()
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = userData;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        ...tokens
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

/**
 * POST /api/auth/login-google
 * Login with Google (receives Firebase ID token)
 */
router.post('/login-google', async (req, res) => {
  try {
    const { idToken, email, name, photoURL } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Check if user exists
    let userSnapshot = await collections.users.where('email', '==', email).get();
    let userData;

    if (userSnapshot.empty) {
      // Create new user
      const userId = uuidv4();
      userData = {
        id: userId,
        email,
        name: name || email.split('@')[0],
        photoURL,
        role: 'admin',
        mfaEnabled: false,
        emailVerified: true,
        provider: 'google',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };
      await collections.users.doc(userId).set(userData);
    } else {
      userData = userSnapshot.docs[0].data();
      // Update last login
      await userSnapshot.docs[0].ref.update({
        lastLoginAt: FieldValue.serverTimestamp()
      });
    }

    // Generate tokens
    const tokens = generateTokens({ 
      uid: userData.id, 
      email: userData.email, 
      name: userData.name 
    });

    res.json({
      success: true,
      data: {
        user: userData,
        ...tokens
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      error: 'Google login failed'
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required'
      });
    }

    const tokens = refreshAccessToken(refreshToken);

    res.json({
      success: true,
      data: tokens
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid refresh token'
    });
  }
});

/**
 * GET /api/auth/profile
 * Get current user profile
 */
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    
    const userDoc = await collections.users.doc(userId!).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userData = userDoc.data();
    const { password, ...userWithoutPassword } = userData as any;

    res.json({
      success: true,
      data: userWithoutPassword
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile'
    });
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { name, phone, location } = req.body;

    const updateData: any = {
      updatedAt: FieldValue.serverTimestamp()
    };

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;

    await collections.users.doc(userId!).update(updateData);

    const updatedUser = await collections.users.doc(userId!).get();
    const userData = updatedUser.data();
    const { password, ...userWithoutPassword } = userData as any;

    res.json({
      success: true,
      data: userWithoutPassword
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

/**
 * PUT /api/auth/change-password
 * Change user password
 */
router.put('/change-password', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current and new password required'
      });
    }

    const userDoc = await collections.users.doc(userId!).get();
    const userData = userDoc.data();

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, userData?.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await collections.users.doc(userId!).update({
      password: hashedPassword,
      updatedAt: FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const userSnapshot = await collections.users.where('email', '==', email).get();
    
    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If the email exists, a reset link has been sent'
    });

    // In production, send actual email here
    if (!userSnapshot.empty) {
      // TODO: Implement email sending with reset token
      console.log('Password reset requested for:', email);
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process request'
    });
  }
});

/**
 * POST /api/auth/verify-email
 * Verify email with code
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    // In production, verify the code
    // For now, simulate verification
    const userSnapshot = await collections.users.where('email', '==', email).get();
    
    if (userSnapshot.empty) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await userSnapshot.docs[0].ref.update({
      emailVerified: true,
      updatedAt: FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      error: 'Verification failed'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  // In a real app, you might want to blacklist the token
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router;
