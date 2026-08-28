import { Request, Response, NextFunction } from 'express';
import { Watchlist } from './watchlist.model';

class WatchlistController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, symbols } = req.body;
      const userId = req.user!.id;

      const existingWatchlist = await Watchlist.findOne({ user: userId, name });
      if (existingWatchlist) {
        return res.status(400).json({
          success: false,
          message: 'Watchlist with this name already exists',
        });
      }

      const watchlist = await Watchlist.create({
        user: userId,
        name,
        description,
        symbols: symbols || [],
      });

      res.status(201).json({
        success: true,
        data: watchlist,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const watchlists = await Watchlist.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });

      res.json({
        success: true,
        data: watchlists,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const watchlist = await Watchlist.findOne({ _id: id, user: userId });
      if (!watchlist) {
        return res.status(404).json({
          success: false,
          message: 'Watchlist not found',
        });
      }

      res.json({
        success: true,
        data: watchlist,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, description, symbols } = req.body;
      const userId = req.user!.id;

      const watchlist = await Watchlist.findOne({ _id: id, user: userId });
      if (!watchlist) {
        return res.status(404).json({
          success: false,
          message: 'Watchlist not found',
        });
      }

      if (name && name !== watchlist.name) {
        const existing = await Watchlist.findOne({ user: userId, name });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'Watchlist with this name already exists',
          });
        }
      }

      watchlist.name = name || watchlist.name;
      watchlist.description = description !== undefined ? description : watchlist.description;
      watchlist.symbols = symbols !== undefined ? symbols : watchlist.symbols;

      await watchlist.save();

      res.json({
        success: true,
        data: watchlist,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const watchlist = await Watchlist.findOne({ _id: id, user: userId });
      if (!watchlist) {
        return res.status(404).json({
          success: false,
          message: 'Watchlist not found',
        });
      }

      if (watchlist.isDefault) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete default watchlist',
        });
      }

      await Watchlist.deleteOne({ _id: id });

      res.json({
        success: true,
        message: 'Watchlist deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async addSymbol(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { symbol } = req.body;
      const userId = req.user!.id;

      const watchlist = await Watchlist.findOne({ _id: id, user: userId });
      if (!watchlist) {
        return res.status(404).json({
          success: false,
          message: 'Watchlist not found',
        });
      }

      if (!watchlist.symbols.includes(symbol)) {
        watchlist.symbols.push(symbol);
        await watchlist.save();
      }

      res.json({
        success: true,
        data: watchlist,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeSymbol(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { symbol } = req.body;
      const userId = req.user!.id;

      const watchlist = await Watchlist.findOne({ _id: id, user: userId });
      if (!watchlist) {
        return res.status(404).json({
          success: false,
          message: 'Watchlist not found',
        });
      }

      watchlist.symbols = watchlist.symbols.filter(s => s !== symbol);
      await watchlist.save();

      res.json({
        success: true,
        data: watchlist,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const watchlistController = new WatchlistController();
