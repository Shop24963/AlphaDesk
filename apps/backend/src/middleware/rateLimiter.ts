import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '@/config/env.js';
import { logger } from '@/common/logger.js';

export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS, // 15 minutes by default
  max: env.RATE_LIMIT_MAX_REQUESTS, // 100 requests per window by default
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  handler: (req, res, _next, options) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });

    res.status(options.statusCode).json(options.message);
  },
});

/**
 * Strict rate limiter for authentication endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again after 15 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  keyGenerator: (req) => {
    // Rate limit by IP and email combination
    const email = req.body?.email || 'unknown';
    return `${req.ip}:${email}`;
  },
});

/**
 * WebSocket rate limiter
 */
export interface WebSocketRateLimiter {
  connections: Map<string, number>;
  maxConnections: number;

  checkLimit(socketId: string): boolean;
  addConnection(socketId: string): void;
  removeConnection(socketId: string): void;
}

export function createWebSocketRateLimiter(maxConnections: number = 10): WebSocketRateLimiter {
  const connections = new Map<string, number>();

  return {
    connections,
    maxConnections,

    checkLimit(socketId: string): boolean {
      const count = connections.get(socketId) || 0;
      return count < maxConnections;
    },

    addConnection(socketId: string): void {
      const count = connections.get(socketId) || 0;
      connections.set(socketId, count + 1);
    },

    removeConnection(socketId: string): void {
      const count = connections.get(socketId) || 0;
      if (count <= 1) {
        connections.delete(socketId);
      } else {
        connections.set(socketId, count - 1);
      }
    },
  };
}
