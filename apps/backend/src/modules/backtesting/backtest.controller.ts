import { Request, Response, NextFunction } from 'express';
import { Backtest } from './backtest.model';
import { Strategy } from '../strategies/strategy.model';

class BacktestController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { strategyId, name, description, settings } = req.body;

      // Verify strategy ownership
      const strategy = await Strategy.findOne({ _id: strategyId, user: userId });
      if (!strategy) {
        return res.status(404).json({
          success: false,
          message: 'Strategy not found',
        });
      }

      const backtest = await Backtest.create({
        user: userId,
        strategy: strategyId,
        name,
        description,
        settings,
        status: 'pending',
      });

      res.status(201).json({
        success: true,
        data: backtest,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const status = req.query.status as string;
      const strategyId = req.query.strategyId as string;

      const query: any = { user: userId };

      if (status) {
        query.status = status;
      }

      if (strategyId) {
        query.strategy = strategyId;
      }

      const backtests = await Backtest.find(query)
        .populate('strategy', 'name category')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: backtests,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const backtest = await Backtest.findOne({ _id: id, user: userId })
        .populate('strategy', 'name category rules indicators');

      if (!backtest) {
        return res.status(404).json({
          success: false,
          message: 'Backtest not found',
        });
      }

      res.json({
        success: true,
        data: backtest,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { status, error, results, trades, equityCurve } = req.body;

      const backtest = await Backtest.findOne({ _id: id, user: userId });
      if (!backtest) {
        return res.status(404).json({
          success: false,
          message: 'Backtest not found',
        });
      }

      if (status) backtest.status = status;
      if (error) backtest.error = error;
      if (results) backtest.results = results;
      if (trades) backtest.trades = trades;
      if (equityCurve) backtest.equityCurve = equityCurve;

      // Update strategy stats if completed
      if (status === 'completed' && results) {
        await Strategy.findByIdAndUpdate(backtest.strategy, {
          backtestStats: results,
        });
      }

      await backtest.save();

      res.json({
        success: true,
        data: backtest,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const backtest = await Backtest.findOneAndDelete({ _id: id, user: userId });

      if (!backtest) {
        return res.status(404).json({
          success: false,
          message: 'Backtest not found',
        });
      }

      res.json({
        success: true,
        message: 'Backtest deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async run(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const backtest = await Backtest.findOne({ _id: id, user: userId });
      if (!backtest) {
        return res.status(404).json({
          success: false,
          message: 'Backtest not found',
        });
      }

      if (backtest.status === 'running') {
        return res.status(400).json({
          success: false,
          message: 'Backtest is already running',
        });
      }

      backtest.status = 'running';
      backtest.error = undefined;
      await backtest.save();

      // In a real implementation, this would queue a background job
      // For now, we'll simulate with a simple response
      res.json({
        success: true,
        message: 'Backtest started',
        data: backtest,
      });

      // TODO: Implement actual backtesting engine
      // This would involve:
      // 1. Fetching historical data for the specified period
      // 2. Applying strategy rules to generate signals
      // 3. Simulating trades with position sizing and risk management
      // 4. Calculating performance metrics
      // 5. Updating the backtest document with results

    } catch (error) {
      next(error);
    }
  }
}

export const backtestController = new BacktestController();
