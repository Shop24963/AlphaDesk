import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { Portfolio } from './portfolio.model';
import { Transaction } from './transaction.model';

class PortfolioController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { name, description, type, totalValue } = req.body;

      const portfolio = await Portfolio.create({
        user: userId,
        name,
        description,
        type: type || 'live',
        totalValue: totalValue || 0,
        currentValue: totalValue || 0,
      });

      res.status(201).json({
        success: true,
        data: portfolio,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const type = req.query.type as string;

      const query: any = { user: userId };
      if (type) {
        query.type = type;
      }

      const portfolios = await Portfolio.find(query).sort({ createdAt: -1 });

      res.json({
        success: true,
        data: portfolios,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const portfolio = await Portfolio.findOne({ _id: id, user: userId }).populate('transactions');

      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found',
        });
      }

      res.json({
        success: true,
        data: portfolio,
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

      const portfolio = await Portfolio.findOneAndUpdate(
        { _id: id, user: userId },
        updateData,
        { new: true, runValidators: true }
      );

      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found',
        });
      }

      res.json({
        success: true,
        data: portfolio,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const portfolio = await Portfolio.findOneAndDelete({ _id: id, user: userId });

      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found',
        });
      }

      // Delete associated transactions
      await Transaction.deleteMany({ portfolio: id });

      res.json({
        success: true,
        message: 'Portfolio deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const portfolio = await Portfolio.findOne({ _id: id, user: userId });
      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found',
        });
      }

      const transactions = await Transaction.find({ portfolio: id })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit);

      const total = await Transaction.countDocuments({ portfolio: id });

      res.json({
        success: true,
        data: transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async addTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const transactionData = req.body;

      const portfolio = await Portfolio.findOne({ _id: id, user: userId });
      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found',
        });
      }

      const transaction = await Transaction.create({
        ...transactionData,
        user: userId,
        portfolio: id,
      });

      // Update portfolio holdings
      await this.updatePortfolioHoldings(portfolio, transaction);

      res.status(201).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  private async updatePortfolioHoldings(portfolio: any, transaction: any) {
    const { symbol, exchange, type, quantity, price, netAmount } = transaction;

    const existingHoldingIndex = portfolio.holdings.findIndex(
      (h: any) => h.symbol === symbol && h.exchange === exchange
    );

    if (type === 'buy') {
      if (existingHoldingIndex >= 0) {
        const holding = portfolio.holdings[existingHoldingIndex];
        const totalQty = holding.quantity + quantity;
        const totalCost = holding.investedValue + netAmount;
        holding.quantity = totalQty;
        holding.averagePrice = parseFloat((totalCost / totalQty).toFixed(2));
        holding.investedValue = parseFloat((holding.investedValue + netAmount).toFixed(2));
      } else {
        portfolio.holdings.push({
          symbol,
          exchange,
          quantity,
          averagePrice: price,
          currentPrice: price,
          investedValue: netAmount,
          currentValue: netAmount,
          profit: 0,
          profitPercent: 0,
          dayChange: 0,
          dayChangePercent: 0,
          allocation: 0,
        });
      }
    } else if (type === 'sell') {
      if (existingHoldingIndex >= 0) {
        const holding = portfolio.holdings[existingHoldingIndex];
        holding.quantity -= quantity;
        holding.investedValue = parseFloat((holding.investedValue - netAmount).toFixed(2));

        if (holding.quantity <= 0) {
          portfolio.holdings.splice(existingHoldingIndex, 1);
        }
      }
    }

    // Recalculate totals
    portfolio.investedValue = portfolio.holdings.reduce(
      (sum: number, h: any) => sum + h.investedValue,
      0
    );
    portfolio.currentValue = portfolio.holdings.reduce(
      (sum: number, h: any) => sum + h.currentValue,
      0
    );
    portfolio.totalProfit = portfolio.currentValue - portfolio.investedValue;
    portfolio.totalProfitPercent = portfolio.investedValue > 0
      ? parseFloat(((portfolio.totalProfit / portfolio.investedValue) * 100).toFixed(2))
      : 0;

    // Calculate allocation
    portfolio.holdings.forEach((h: any) => {
      h.allocation = portfolio.currentValue > 0
        ? parseFloat(((h.currentValue / portfolio.currentValue) * 100).toFixed(2))
        : 0;
    });

    await portfolio.save();
  }
}

export const portfolioController = new PortfolioController();
