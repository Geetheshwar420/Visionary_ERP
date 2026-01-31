import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { collections, FieldValue, auth } from '../config/firebase';
import { AuthenticatedRequest, authenticateToken, generateTokens, refreshAccessToken } from '../middleware/auth';
import { validateRegister, validateFirebaseLogin } from '../middleware/validation';
import { sendVerificationEmail } from '../services/email';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validateRegister, async (req: Request, res: Response) => {
  try {
    const { email, name, uid } = req.body;

    if (!uid) {
      return res.status(400).json({
        success: false,
        error: 'UID is required for registration'
      });
    }

    // Check if user exists
    const userDoc = await collections.users.doc(uid).get();
    if (userDoc.exists) {
      return res.status(400).json({
        success: false,
        error: 'User already registered'
      });
    }

    // Create user
    const userData = {
      id: uid,
      email,
      name,
      role: 'admin',
      mfaEnabled: false,
      emailVerified: false,
      firebaseAuth: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    await collections.users.doc(uid).set(userData);

    // Generate tokens
    const tokens = generateTokens({ uid, email, name });

    res.status(201).json({
      success: true,
      data: {
        user: userData,
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
 * POST /api/auth/firebase-login
 * Login or register with a verified Firebase ID token (IDP: Google, Password, etc.)
 */
router.post('/firebase-login', validateFirebaseLogin, async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'ID token is required'
      });
    }

    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email not associated with this token'
      });
    }

    // Check if user exists in database
    let userDoc = await collections.users.doc(uid).get();
    let userData: any;

    if (!userDoc.exists) {
      // Create profile if first time
      userData = {
        id: uid,
        email,
        name: name || email.split('@')[0],
        photoURL: picture,
        role: 'admin',
        firebaseAuth: true,
        emailVerified: decodedToken.email_verified || false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };
      await collections.users.doc(uid).set(userData);
    } else {
      userData = userDoc.data();
      // Update last login or verified status
      await collections.users.doc(uid).update({
        emailVerified: decodedToken.email_verified || userData.emailVerified,
        updatedAt: FieldValue.serverTimestamp()
      });
    }

    // Generate custom application tokens
    const tokens = generateTokens({
      uid,
      email,
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
    console.error('Firebase login error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid Firebase token'
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

    const userSnapshot = await collections.users.where('email', '==', email).get();

    if (userSnapshot.empty) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Check code
    if (userData.verificationCode !== code && code !== '123456') { // Allow 123456 as master bypass for testing
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code'
      });
    }

    await userDoc.ref.update({
      emailVerified: true,
      verificationCode: null, // Clear the code
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
 * POST /api/auth/resend-code
 * Resend verification code
 */
router.post('/resend-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const userSnapshot = await collections.users.where('email', '==', email).get();

    if (userSnapshot.empty) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userDoc = userSnapshot.docs[0];
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    await userDoc.ref.update({
      verificationCode,
      updatedAt: FieldValue.serverTimestamp()
    });

    // Send email
    await sendVerificationEmail(email, verificationCode);

    res.json({
      success: true,
      message: 'Verification code resent successfully'
    });

  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resend code'
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
