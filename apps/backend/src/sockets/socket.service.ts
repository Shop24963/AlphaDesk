import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env.js';
import { logger } from '@/common/logger.js';
import { createWebSocketRateLimiter } from '@/middleware/rateLimiter.js';

interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin' | 'premium';
}

export class SocketService {
  private io: SocketIOServer | null = null;
  private rateLimiter = createWebSocketRateLimiter(10);
  private connectedUsers = new Map<string, Set<string>>(); // userId -> socketIds

  /**
   * Initialize Socket.IO server
   */
  public init(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: env.CORS_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.io.use(this.authenticateSocket.bind(this));

    this.io.on('connection', this.handleConnection.bind(this));

    logger.info('🔌 Socket.IO initialized');
  }

  /**
   * Authenticate socket connection
   */
  private authenticateSocket(socket: Socket, next: (err?: Error) => void): void {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token as string, env.JWT_ACCESS_SECRET) as JWTPayload;
      (socket as any).user = decoded;
      next();
    } catch (error) {
      logger.warn('Socket authentication failed', { error: error instanceof Error ? error.message : error });
      next(new Error('Invalid token'));
    }
  }

  /**
   * Handle socket connection
   */
  private handleConnection(socket: Socket): void {
    const user = (socket as any).user as JWTPayload;
    const userId = user.userId;

    logger.debug('Socket connected', { userId, socketId: socket.id });

    // Add to rate limiter
    this.rateLimiter.addConnection(userId);

    // Check rate limit
    if (!this.rateLimiter.checkLimit(userId)) {
      logger.warn('Socket rate limit exceeded', { userId });
      socket.emit('error', { message: 'Too many connections' });
      socket.disconnect();
      return;
    }

    // Join user room
    socket.join(`user:${userId}`);
    
    // Track connected sockets per user
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, new Set());
    }
    this.connectedUsers.get(userId)?.add(socket.id);

    // Handle events
    socket.on('subscribe', (data: { channels: string[] }) => {
      this.handleSubscribe(socket, data.channels);
    });

    socket.on('unsubscribe', (data: { channels: string[] }) => {
      this.handleUnsubscribe(socket, data.channels);
    });

    socket.on('disconnect', () => {
      this.handleDisconnect(socket, userId);
    });

    socket.on('error', (error: Error) => {
      logger.error('Socket error', { userId, error: error.message });
    });
  }

  /**
   * Handle channel subscription
   */
  private handleSubscribe(socket: Socket, channels: string[]): void {
    channels.forEach(channel => {
      socket.join(channel);
      logger.debug('Subscribed to channel', { 
        userId: (socket as any).user?.userId, 
        channel 
      });
    });

    socket.emit('subscribed', { channels });
  }

  /**
   * Handle channel unsubscription
   */
  private handleUnsubscribe(socket: Socket, channels: string[]): void {
    channels.forEach(channel => {
      socket.leave(channel);
    });

    socket.emit('unsubscribed', { channels });
  }

  /**
   * Handle socket disconnect
   */
  private handleDisconnect(socket: Socket, userId: string): void {
    logger.debug('Socket disconnected', { userId, socketId: socket.id });

    // Remove from rate limiter
    this.rateLimiter.removeConnection(userId);

    // Remove from tracking
    const userSockets = this.connectedUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        this.connectedUsers.delete(userId);
      }
    }
  }

  /**
   * Emit event to a specific user
   */
  public emitToUser(userId: string, event: string, data: unknown): void {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Emit event to a channel/room
   */
  public emitToChannel(channel: string, event: string, data: unknown): void {
    if (!this.io) return;

    this.io.to(channel).emit(event, data);
  }

  /**
   * Broadcast event to all connected clients
   */
  public broadcast(event: string, data: unknown): void {
    if (!this.io) return;

    this.io.emit(event, data);
  }

  /**
   * Get number of connected users
   */
  public getConnectedCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Check if user is connected
   */
  public isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  /**
   * Get Socket.IO instance
   */
  public getIO(): SocketIOServer | null {
    return this.io;
  }
}

// Singleton instance
export const socketService = new SocketService();
