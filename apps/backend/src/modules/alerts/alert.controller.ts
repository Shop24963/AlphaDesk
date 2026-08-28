import { Request, Response, NextFunction } from 'express';
import { Alert } from './alert.model';

class AlertController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const alertData = req.body;

      const alert = await Alert.create({
        ...alertData,
        user: userId,
      });

      res.status(201).json({
        success: true,
        data: alert,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;

      const query: any = { user: userId };
      if (isActive !== undefined) {
        query.isActive = isActive;
      }

      const alerts = await Alert.find(query).sort({ createdAt: -1 });

      res.json({
        success: true,
        data: alerts,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const updateData = req.body;

      const alert = await Alert.findOneAndUpdate(
        { _id: id, user: userId },
        updateData,
        { new: true, runValidators: true }
      );

      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found',
        });
      }

      res.json({
        success: true,
        data: alert,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const alert = await Alert.findOneAndDelete({ _id: id, user: userId });

      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found',
        });
      }

      res.json({
        success: true,
        message: 'Alert deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async toggle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const alert = await Alert.findOne({ _id: id, user: userId });
      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found',
        });
      }

      alert.isActive = !alert.isActive;
      await alert.save();

      res.json({
        success: true,
        data: alert,
      });
    } catch (error) {
      next(error);
    }
  }

  async trigger(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const alert = await Alert.findById(id);
      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found',
        });
      }

      if (!alert.shouldNotify()) {
        return res.status(400).json({
          success: false,
          message: 'Alert cannot be triggered',
        });
      }

      alert.triggeredCount += 1;
      alert.lastTriggeredAt = new Date();
      alert.triggeredAt = new Date();

      if (alert.maxTriggers && alert.triggeredCount >= alert.maxTriggers) {
        alert.isActive = false;
      }

      await alert.save();

      res.json({
        success: true,
        data: alert,
        message: 'Alert triggered',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const alertController = new AlertController();
