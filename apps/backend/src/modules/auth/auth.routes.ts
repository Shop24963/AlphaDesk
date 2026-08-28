import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, BadRequestError } from '@/common/errors.js';
import { authenticate, generateAccessToken, generateRefreshToken, verifyRefreshToken, AuthRequest } from '@/middleware/auth.js';
import { authLimiter } from '@/middleware/rateLimiter.js';
import { User } from '@/modules/users/user.model.js';
import { Session } from '@/modules/auth/session.model.js';
import { logger } from '@/common/logger.js';

const router = Router();

/**
 * Request validation schemas
 */
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const validatedData = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });

    if (existingUser) {
      throw new BadRequestError('User with this email already exists');
    }

    // Create user
    const user = await User.create({
      email: validatedData.email,
      password: validatedData.password,
      name: validatedData.name,
      role: 'user',
      isActive: true,
      isVerified: false,
    });

    logger.info('New user registered', { userId: user._id, email: user.email });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
    });

    // Store refresh token in session
    await Session.create({
      userId: user._id,
      refreshToken,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 15 * 60 * 1000, // 15 minutes
        },
      },
    });
  })
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
  '/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const validatedData = loginSchema.parse(req.body);

    // Find user with password
    const user = await User.findOne({ email: validatedData.email }).select('+password');

    if (!user || !user.isActive) {
      throw new BadRequestError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(validatedData.password);

    if (!isPasswordValid) {
      throw new BadRequestError('Invalid email or password');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    logger.info('User logged in', { userId: user._id, email: user.email });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
    });

    // Store refresh token in session
    await Session.create({
      userId: user._id,
      refreshToken,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 15 * 60 * 1000, // 15 minutes
        },
      },
    });
  })
);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const validatedData = refreshTokenSchema.parse(req.body);

    // Verify refresh token
    const decoded = verifyRefreshToken(validatedData.refreshToken);

    // Find valid session
    const session = await Session.findOne({
      userId: decoded.userId,
      refreshToken: validatedData.refreshToken,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      throw new BadRequestError('Invalid or expired refresh token');
    }

    // Get user
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      throw new BadRequestError('User not found or inactive');
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      data: {
        accessToken,
        expiresIn: 15 * 60 * 1000, // 15 minutes
      },
    });
  })
);

/**
 * POST /api/auth/logout
 * Logout user - invalidate refresh token
 */
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Delete specific session
      await Session.deleteOne({
        userId: (req.user as any).userId,
        refreshToken,
      });
    } else {
      // Delete all sessions for user
      await Session.deleteMany({
        userId: (req.user as any).userId,
      });
    }

    logger.info('User logged out', { userId: (req.user as any).userId });

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  })
);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await User.findById((req.user as any).userId);

    if (!user) {
      throw new BadRequestError('User not found');
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  })
);

export { router as authRoutes };
