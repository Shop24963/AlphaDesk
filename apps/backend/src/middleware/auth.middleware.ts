import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { StringValue } from 'ms';
import { z } from 'zod';
import { UnauthorizedError, ForbiddenError } from '@/common/errors.js';
import { env } from '@/config/env.js';
import { UserRole } from '@alphadesk/shared-types';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

const tokenSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  role: z.enum(['user', 'admin', 'premium']),
  iat: z.number(),
  exp: z.number(),
});

export const protect = authenticate;
export const authMiddleware = authenticate;

function authenticate(
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as jwt.JwtPayload;

    const validated = tokenSchema.parse(decoded);

    req.user = validated;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired'));
    } else if (error instanceof z.ZodError) {
      next(new UnauthorizedError('Invalid token payload'));
    } else {
      next(error);
    }
  }
}

export function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as jwt.JwtPayload;
      const validated = tokenSchema.parse(decoded);
      req.user = validated;
    }

    next();
  } catch {
    next();
  }
}

export function authorize(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
}

export const requireAdmin = authorize('admin');

export const requirePremium = authorize('premium', 'admin');

export function generateAccessToken(payload: {
  userId: string;
  email: string;
  role: UserRole;
}): string {
  return jwt.sign(
    { userId: payload.userId, email: payload.email, role: payload.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN as StringValue | number }
  );
}

export function generateRefreshToken(payload: { userId: string }): string {
  return jwt.sign(
    { userId: payload.userId },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN as StringValue | number }
  );
}

export function verifyRefreshToken(token: string): JWTPayload {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as jwt.JwtPayload;
  return tokenSchema.parse(decoded);
}
