import { Request, Response, NextFunction } from 'express';
import { PerformanceMetric } from './performance-metric.model.js';
import { Trade } from '../trading/trade.model.js';
import { AuthRequest } from '../../middleware/auth.middleware.js';

interface AnalyticsQueryParams {
  period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate?: string;
  endDate?: string;
}

export class AnalyticsController {
  /**
   * Calculate trading performance metrics from trades
   */
  private calculateMetrics(trades: any[]) {
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalPnL: 0,
        totalProfit: 0,
        totalLoss: 0,
        averageWin: 0,
        averageLoss: 0,
        profitFactor: 0,
        largestWin: 0,
        largestLoss: 0,
        averageHoldingPeriod: 0,
        maxDrawdown: 0,
        expectancy: 0,
        consecutiveWins: 0,
        consecutiveLosses: 0,
      };
    }

    const winningTrades = trades.filter((t) => t.realizedPnL > 0);
    const losingTrades = trades.filter((t) => t.realizedPnL <= 0);

    const totalProfit = winningTrades.reduce(
      (sum, t) => sum + t.realizedPnL,
      0
    );
    const totalLoss = Math.abs(
      losingTrades.reduce((sum, t) => sum + t.realizedPnL, 0)
    );

    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit;

    const holdingPeriods = trades.map((t) => {
      const exitDate = t.exitDate || new Date();
      const entryDate = new Date(t.entryDate);
      return (exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
    });
    const averageHoldingPeriod =
      holdingPeriods.reduce((sum, p) => sum + p, 0) / holdingPeriods.length;

    // Calculate max drawdown
    let peak = 0;
    let maxDrawdown = 0;
    let cumulativePnL = 0;
    for (const trade of trades.sort(
      (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
    )) {
      cumulativePnL += trade.realizedPnL || 0;
      if (cumulativePnL > peak) {
        peak = cumulativePnL;
      }
      const drawdown = peak - cumulativePnL;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    // Calculate expectancy
    const winRate = winningTrades.length / trades.length;
    const avgWin =
      winningTrades.length > 0
        ? totalProfit / winningTrades.length
        : 0;
    const avgLoss =
      losingTrades.length > 0 ? totalLoss / losingTrades.length : 0;
    const expectancy = winRate * avgWin - (1 - winRate) * avgLoss;

    // Calculate consecutive wins/losses
    let maxConsecutiveWins = 0;
    let maxConsecutiveLosses = 0;
    let currentWins = 0;
    let currentLosses = 0;

    for (const trade of trades.sort(
      (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
    )) {
      if (trade.realizedPnL > 0) {
        currentWins++;
        currentLosses = 0;
        maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWins);
      } else {
        currentLosses++;
        currentWins = 0;
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLosses);
      }
    }

    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: parseFloat((winRate * 100).toFixed(2)),
      totalPnL: parseFloat(cumulativePnL.toFixed(2)),
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      totalLoss: parseFloat(totalLoss.toFixed(2)),
      averageWin: parseFloat(avgWin.toFixed(2)),
      averageLoss: parseFloat(avgLoss.toFixed(2)),
      profitFactor: parseFloat(profitFactor.toFixed(2)),
      largestWin: Math.max(...winningTrades.map((t) => t.realizedPnL), 0),
      largestLoss: Math.min(...losingTrades.map((t) => t.realizedPnL), 0),
      averageHoldingPeriod: parseFloat(averageHoldingPeriod.toFixed(2)),
      maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
      expectancy: parseFloat(expectancy.toFixed(2)),
      consecutiveWins: maxConsecutiveWins,
      consecutiveLosses: maxConsecutiveLosses,
    };
  }

  /**
   * Get performance metrics for a specific period
   */
  async getPerformance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { period = 'monthly', startDate, endDate } =
        req.query as AnalyticsQueryParams;

      const query: any = { user: req.user?._id, period };

      if (startDate || endDate) {
        query.startDate = {};
        if (startDate) query.startDate.$gte = new Date(startDate);
        if (endDate) query.endDate.$lte = new Date(endDate);
      }

      const metrics = await PerformanceMetric.find(query).sort({
        startDate: -1,
      });

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate and save performance metrics from trades
   */
  async calculatePerformance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { period = 'monthly', startDate, endDate } = req.body;

      const query: any = {
        user: req.user?._id,
        status: 'closed',
      };

      if (startDate && endDate) {
        query.entryDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      const trades = await Trade.find(query).sort({ entryDate: 1 });
      const metricsData = this.calculateMetrics(trades);

      const metric = await PerformanceMetric.create({
        user: req.user?._id,
        period,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        metrics: metricsData,
      });

      res.status(201).json({
        success: true,
        data: metric,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get dashboard analytics summary
   */
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;

      // Get all closed trades
      const allTrades = await Trade.find({
        user: userId,
        status: 'closed',
      }).sort({ entryDate: 1 });

      const overallMetrics = this.calculateMetrics(allTrades);

      // Get recent trades
      const recentTrades = await Trade.find({ user: userId })
        .sort({ entryDate: -1 })
        .limit(10);

      // Get active positions
      const activePositions = await Trade.find({
        user: userId,
        status: 'open',
      });

      // Get latest performance metric
      const latestMetric = await PerformanceMetric.findOne({
        user: userId,
      }).sort({ endDate: -1 });

      res.json({
        success: true,
        data: {
          overallMetrics,
          recentTrades,
          activePositionsCount: activePositions.length,
          latestMetric,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get equity curve data
   */
  async getEquityCurve(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;

      const query: any = {
        user: req.user?._id,
        status: 'closed',
      };

      if (startDate && endDate) {
        query.entryDate = {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string),
        };
      }

      const trades = await Trade.find(query).sort({ entryDate: 1 });

      let cumulativePnL = 0;
      const equityCurve = trades.map((trade) => {
        cumulativePnL += trade.realizedPnL || 0;
        return {
          date: trade.exitDate || trade.entryDate,
          equity: cumulativePnL,
          tradeId: trade._id,
          symbol: trade.symbol,
          pnl: trade.realizedPnL,
        };
      });

      res.json({
        success: true,
        data: equityCurve,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
