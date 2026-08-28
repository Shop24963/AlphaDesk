import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { PaperAccount } from './paper-account.model';
import { Trade } from './trade.model';
import { marketDataProvider } from '../market/market.provider';

class TradingController {
  async createAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { name, description, initialBalance } = req.body;

      const account = await PaperAccount.create({
        user: userId,
        name: name || 'Paper Trading Account',
        description,
        balance: {
          cash: initialBalance || 1000000,
          invested: 0,
          total: initialBalance || 1000000,
          dayProfit: 0,
          totalProfit: 0,
        },
      });

      res.status(201).json({
        success: true,
        data: account,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAccounts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const accounts = await PaperAccount.find({ user: userId }).sort({ createdAt: -1 });

      res.json({
        success: true,
        data: accounts,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAccountById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const account = await PaperAccount.findOne({ _id: id, user: userId });

      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Account not found',
        });
      }

      res.json({
        success: true,
        data: account,
      });
    } catch (error) {
      next(error);
    }
  }

  async placeOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { accountId } = req.params;
      const userId = req.user!.userId;
      const orderData = req.body;

      const account = await PaperAccount.findOne({ _id: accountId, user: userId });
      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Account not found',
        });
      }

      if (!account.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Account is not active',
        });
      }

      // Get current quote for the symbol
      const quote = await marketDataProvider.getQuote(orderData.symbol);

      // Calculate required amount
      const price = orderData.orderType === 'market' ? quote.lastPrice : orderData.price;
      const requiredAmount = price * orderData.quantity;

      // Check if sufficient funds available for buy orders
      if (orderData.type === 'buy' && requiredAmount > account.balance.cash) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient funds',
        });
      }

      // Create trade order
      const trade = await Trade.create({
        user: userId,
        account: accountId,
        ...orderData,
        status: 'executed',
        filledQuantity: orderData.quantity,
        averagePrice: price,
        entryDate: new Date(),
      });

      // Update account holdings and balance
      await this.updateAccountAfterTrade(account, trade, orderData.type);

      res.status(201).json({
        success: true,
        data: trade,
      });
    } catch (error) {
      next(error);
    }
  }

  private async updateAccountAfterTrade(account: any, trade: any, type: string) {
    const { symbol, exchange, quantity, averagePrice } = trade;

    if (type === 'buy') {
      const cost = averagePrice * quantity;
      account.balance.cash -= cost;
      account.balance.invested += cost;

      const existingHoldingIndex = account.holdings.findIndex(
        (h: any) => h.symbol === symbol && h.exchange === exchange
      );

      if (existingHoldingIndex >= 0) {
        const holding = account.holdings[existingHoldingIndex];
        const totalQty = holding.quantity + quantity;
        const totalCost = holding.investedValue + cost;
        holding.quantity = totalQty;
        holding.averagePrice = parseFloat((totalCost / totalQty).toFixed(2));
        holding.investedValue = parseFloat((holding.investedValue + cost).toFixed(2));
      } else {
        account.holdings.push({
          symbol,
          exchange,
          quantity,
          averagePrice,
          currentPrice: averagePrice,
          investedValue: cost,
          currentValue: cost,
          profit: 0,
          profitPercent: 0,
        });
      }
    } else if (type === 'sell') {
      const proceeds = averagePrice * quantity;
      account.balance.cash += proceeds;

      const existingHoldingIndex = account.holdings.findIndex(
        (h: any) => h.symbol === symbol && h.exchange === exchange
      );

      if (existingHoldingIndex >= 0) {
        const holding = account.holdings[existingHoldingIndex];
        const costBasis = holding.averagePrice * quantity;
        const pnl = proceeds - costBasis;

        holding.quantity -= quantity;
        holding.investedValue -= costBasis;
        account.balance.totalProfit += pnl;

        if (holding.quantity <= 0) {
          account.holdings.splice(existingHoldingIndex, 1);
        }
      }

      account.balance.invested -= (averagePrice * quantity);
    }

    account.balance.total = account.balance.cash + account.balance.invested;
    account.orders.push(trade._id);

    await account.save();
  }

  async getOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { accountId } = req.params;
      const userId = req.user!.userId;
      const status = req.query.status as string;

      const account = await PaperAccount.findOne({ _id: accountId, user: userId });
      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Account not found',
        });
      }

      const query: any = { account: accountId };
      if (status) {
        query.status = status;
      }

      const orders = await Trade.find(query).sort({ createdAt: -1 });

      res.json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { accountId, orderId } = req.params;
      const userId = req.user!.userId;

      const account = await PaperAccount.findOne({ _id: accountId, user: userId });
      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Account not found',
        });
      }

      const trade = await Trade.findOne({ _id: orderId, account: accountId });
      if (!trade) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      if (trade.status !== 'pending' && trade.status !== 'open') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel executed or cancelled order',
        });
      }

      trade.status = 'cancelled';
      await trade.save();

      res.json({
        success: true,
        data: trade,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateHoldings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { accountId } = req.params;
      const userId = req.user!.userId;

      const account = await PaperAccount.findOne({ _id: accountId, user: userId });
      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Account not found',
        });
      }

      // Update current prices for all holdings
      let totalCurrentValue = 0;
      let totalInvestedValue = 0;

      for (const holding of account.holdings) {
        try {
          const quote = await marketDataProvider.getQuote(holding.symbol);
          holding.currentPrice = quote.lastPrice;
          holding.currentValue = holding.currentPrice * holding.quantity;
          holding.profit = holding.currentValue - holding.investedValue;
          holding.profitPercent = holding.investedValue > 0
            ? parseFloat(((holding.profit / holding.investedValue) * 100).toFixed(2))
            : 0;

          totalCurrentValue += holding.currentValue;
          totalInvestedValue += holding.investedValue;
        } catch (error) {
          // Skip if quote not available
        }
      }

      account.balance.invested = totalInvestedValue;
      account.balance.total = account.balance.cash + totalCurrentValue;
      account.balance.totalProfit = totalCurrentValue - totalInvestedValue;

      await account.save();

      res.json({
        success: true,
        data: account,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const tradingController = new TradingController();
