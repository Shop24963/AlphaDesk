import { Request, Response, NextFunction } from 'express';
import { Stock } from './stock.model';
import { marketDataProvider } from '../market/market.provider';

class StockController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const exchange = req.query.exchange as string;
      const sector = req.query.sector as string;
      const search = req.query.search as string;
      const isActive = req.query.isActive === 'false' ? false : true;

      const query: any = { isActive };

      if (exchange) {
        query.exchange = exchange.toUpperCase();
      }

      if (sector) {
        query.sector = new RegExp(sector, 'i');
      }

      if (search) {
        query.$or = [
          { symbol: new RegExp(search, 'i') },
          { name: new RegExp(search, 'i') },
        ];
      }

      const stocks = await Stock.find(query)
        .sort({ symbol: 1 })
        .limit(limit)
        .skip((page - 1) * limit);

      const total = await Stock.countDocuments(query);

      res.json({
        success: true,
        data: stocks,
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

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const stock = await Stock.findById(id);
      if (!stock) {
        return res.status(404).json({
          success: false,
          message: 'Stock not found',
        });
      }

      res.json({
        success: true,
        data: stock,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBySymbol(req: Request, res: Response, next: NextFunction) {
    try {
      const { symbol, exchange = 'NSE' } = req.params;

      const stock = await Stock.findOne({
        symbol: symbol.toUpperCase(),
        exchange: exchange.toUpperCase(),
      });

      if (!stock) {
        return res.status(404).json({
          success: false,
          message: 'Stock not found',
        });
      }

      res.json({
        success: true,
        data: stock,
      });
    } catch (error) {
      next(error);
    }
  }

  async getQuote(req: Request, res: Response, next: NextFunction) {
    try {
      const { symbol, exchange = 'NSE' } = req.params;

      const quote = await marketDataProvider.getQuote(`${symbol.toUpperCase()}`);

      res.json({
        success: true,
        data: quote,
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  async getSectors(req: Request, res: Response, next: NextFunction) {
    try {
      const sectors = await Stock.distinct('sector', { isActive: true });

      res.json({
        success: true,
        data: sectors.filter(Boolean).sort(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getIndustries(req: Request, res: Response, next: NextFunction) {
    try {
      const industries = await Stock.distinct('industry', { isActive: true });

      res.json({
        success: true,
        data: industries.filter(Boolean).sort(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const stockController = new StockController();
