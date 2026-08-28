import { Request, Response, NextFunction } from 'express';
import { Notification } from './notification.model.js';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { getIo } from '../../sockets/index.js';

interface NotificationQueryParams {
  type?: string;
  isRead?: string;
  priority?: string;
  page?: string;
  limit?: string;
}

export class NotificationController {
  /**
   * Get all notifications for authenticated user
   */
  async getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { type, isRead, priority, page = '1', limit = '20' } =
        req.query as NotificationQueryParams;

      const query: any = { user: req.user?._id };

      if (type) {
        query.type = type;
      }

      if (isRead !== undefined) {
        query.isRead = isRead === 'true';
      }

      if (priority) {
        query.priority = priority;
      }

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      const [notifications, total, unreadCount] = await Promise.all([
        Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
        Notification.countDocuments(query),
        Notification.countDocuments({ user: req.user?._id, isRead: false }),
      ]);

      res.json({
        success: true,
        data: notifications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
        meta: {
          unreadCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const count = await Notification.countDocuments({
        user: req.user?._id,
        isRead: false,
      });

      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const notification = await Notification.findOne({
        _id: id,
        user: req.user?._id,
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }

      await notification.markAsRead();

      res.json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await (Notification as any).markAllAsRead(req.user?._id);

      // Emit real-time update
      const io = getIo();
      io.to(req.user?._id.toString()).emit('notifications:all-read', {
        timestamp: new Date(),
      });

      res.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const notification = await Notification.findOneAndDelete({
        _id: id,
        user: req.user?._id,
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }

      res.json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete all read notifications
   */
  async deleteReadNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await Notification.deleteMany({
        user: req.user?._id,
        isRead: true,
      });

      res.json({
        success: true,
        message: `${result.deletedCount} notifications deleted`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create notification (internal use or admin)
   */
  async createNotification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId, type, title, message, data, priority, actionUrl } = req.body;

      const notification = await Notification.create({
        user: userId || req.user?._id,
        type,
        title,
        message,
        data,
        priority: priority || 'medium',
        actionUrl,
      });

      // Emit real-time notification
      const io = getIo();
      io.to(notification.user.toString()).emit('notification:new', notification);

      res.status(201).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
