import { Router } from 'express';
import { notificationController } from './notification.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = Router();

// All routes are protected
router.use(protect);

// Get unread count
router.get('/unread-count', notificationController.getUnreadCount.bind(notificationController));

// Mark all as read
router.post('/mark-all-read', notificationController.markAllAsRead.bind(notificationController));

// Delete all read notifications
router.delete('/read', notificationController.deleteReadNotifications.bind(notificationController));

// Get all notifications (with filtering and pagination)
router.get('/', notificationController.getNotifications.bind(notificationController));

// Mark single notification as read
router.patch('/:id/read', notificationController.markAsRead.bind(notificationController));

// Delete single notification
router.delete('/:id', notificationController.deleteNotification.bind(notificationController));

// Create notification (admin/internal use)
router.post('/', notificationController.createNotification.bind(notificationController));

export default router;
