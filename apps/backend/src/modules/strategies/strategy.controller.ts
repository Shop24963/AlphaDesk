import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { Strategy } from './strategy.model';

class StrategyController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const strategyData = req.body;

      const strategy = await Strategy.create({
        ...strategyData,
        user: userId,
      });

      res.status(201).json({
        success: true,
        data: strategy,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const category = req.query.category as string;
      const type = req.query.type as string;
      const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
      const includePublic = req.query.includePublic === 'true';

      const query: any = {};

      if (!includePublic) {
        query.user = userId;
      } else {
        query.$or = [{ user: userId }, { isPublic: true }];
      }

      if (category) {
        query.category = category;
      }

      if (type) {
        query.type = type;
      }

      if (isActive !== undefined) {
        query.isActive = isActive;
      }

      const strategies = await Strategy.find(query).sort({ createdAt: -1 });

      res.json({
        success: true,
        data: strategies,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const strategy = await Strategy.findOne({
        _id: id,
        $or: [{ user: userId }, { isPublic: true }],
      });

      if (!strategy) {
        return res.status(404).json({
          success: false,
          message: 'Strategy not found',
        });
      }

      res.json({
        success: true,
        data: strategy,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const updateData = req.body;

      const strategy = await Strategy.findOne({ _id: id, user: userId });
      if (!strategy) {
        return res.status(404).json({
          success: false,
          message: 'Strategy not found',
        });
      }

      // Increment version on update
      strategy.version += 1;

      Object.assign(strategy, updateData);
      await strategy.save();

      res.json({
        success: true,
        data: strategy,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const strategy = await Strategy.findOneAndDelete({ _id: id, user: userId });

      if (!strategy) {
        return res.status(404).json({
          success: false,
          message: 'Strategy not found',
        });
      }

      res.json({
        success: true,
        message: 'Strategy deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async toggle(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const strategy = await Strategy.findOne({ _id: id, user: userId });
      if (!strategy) {
        return res.status(404).json({
          success: false,
          message: 'Strategy not found',
        });
      }

      strategy.isActive = !strategy.isActive;
      await strategy.save();

      res.json({
        success: true,
        data: strategy,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBacktestStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const backtestStats = req.body;

      const strategy = await Strategy.findOne({ _id: id, user: userId });
      if (!strategy) {
        return res.status(404).json({
          success: false,
          message: 'Strategy not found',
        });
      }

      strategy.backtestStats = backtestStats;
      await strategy.save();

      res.json({
        success: true,
        data: strategy,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const strategyController = new StrategyController();
