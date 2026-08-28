import { Request, Response, NextFunction } from 'express';
import { JournalEntry } from './journal-entry.model.js';
import { AuthRequest } from '../../middleware/auth.middleware.js';

interface JournalQueryParams {
  type?: string;
  tag?: string;
  stock?: string;
  startDate?: string;
  endDate?: string;
  page?: string;
  limit?: string;
}

export class JournalController {
  /**
   * Get all journal entries for authenticated user
   */
  async getEntries(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { type, tag, stock, startDate, endDate, page = '1', limit = '20' } =
        req.query as JournalQueryParams;

      const query: any = { user: req.user?._id };

      if (type) {
        query.type = type;
      }

      if (tag) {
        query.tags = tag;
      }

      if (stock) {
        query.relatedStocks = stock;
      }

      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      const [entries, total] = await Promise.all([
        JournalEntry.find(query)
          .sort({ date: -1 })
          .skip(skip)
          .limit(limitNum)
          .populate('relatedTrade'),
        JournalEntry.countDocuments(query),
      ]);

      res.json({
        success: true,
        data: entries,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single journal entry by ID
   */
  async getEntry(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const entry = await JournalEntry.findOne({
        _id: id,
        user: req.user?._id,
      }).populate('relatedTrade');

      if (!entry) {
        return res.status(404).json({
          success: false,
          message: 'Journal entry not found',
        });
      }

      res.json({
        success: true,
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new journal entry
   */
  async createEntry(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const entry = await JournalEntry.create({
        ...req.body,
        user: req.user?._id,
      });

      const populatedEntry = await JournalEntry.findById(entry._id).populate(
        'relatedTrade'
      );

      res.status(201).json({
        success: true,
        data: populatedEntry,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update journal entry
   */
  async updateEntry(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const entry = await JournalEntry.findOneAndUpdate(
        { _id: id, user: req.user?._id },
        req.body,
        { new: true, runValidators: true }
      ).populate('relatedTrade');

      if (!entry) {
        return res.status(404).json({
          success: false,
          message: 'Journal entry not found',
        });
      }

      res.json({
        success: true,
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete journal entry
   */
  async deleteEntry(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const entry = await JournalEntry.findOneAndDelete({
        _id: id,
        user: req.user?._id,
      });

      if (!entry) {
        return res.status(404).json({
          success: false,
          message: 'Journal entry not found',
        });
      }

      res.json({
        success: true,
        message: 'Journal entry deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get journal statistics
   */
  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;

      const [totalEntries, entriesByType, avgRating, recentEntries] =
        await Promise.all([
          JournalEntry.countDocuments({ user: userId }),
          JournalEntry.aggregate([
            { $match: { user: userId } },
            { $group: { _id: '$type', count: { $sum: 1 } } },
          ]),
          JournalEntry.aggregate([
            { $match: { user: userId, rating: { $exists: true } } },
            { $group: { _id: null, avg: { $avg: '$rating' } } },
          ]),
          JournalEntry.find({ user: userId })
            .sort({ date: -1 })
            .limit(5),
        ]);

      res.json({
        success: true,
        data: {
          totalEntries,
          entriesByType: entriesByType.reduce(
            (acc: any, item: any) => {
              acc[item._id] = item.count;
              return acc;
            },
            { trade: 0, observation: 0, lesson: 0, review: 0 }
          ),
          averageRating: avgRating[0]?.avg || 0,
          recentEntries,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get tags cloud
   */
  async getTags(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tags = await JournalEntry.aggregate([
        { $match: { user: req.user?._id } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 50 },
      ]);

      res.json({
        success: true,
        data: tags,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const journalController = new JournalController();
