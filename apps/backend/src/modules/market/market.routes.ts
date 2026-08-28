import { Router, Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { marketDataProvider } from './market.provider';
import { marketRepository } from './market.repository';
import { validateRequest } from '../../common/middleware/validate';
import { z } from 'zod';

const router = Router();

// Get market overview
router.get(
  '/overview',
  asyncHandler(async (req: Request, res: Response) => {
    const overview = await marketDataProvider.getMarketOverview();
    res.json({
      success: true,
      data: overview,
    });
  })
);

// Get all instruments with pagination
router.get(
  '/instruments',
  asyncHandler(async (req: Request, res: Response) => {
    const { exchange, instrumentType, search, page = 1, limit = 50 } = req.query;
    
    const result = await marketRepository.findInstruments(
      {
        exchange: exchange as string,
        instrumentType: instrumentType as string,
        search: search as string,
      },
      parseInt(page as string),
      parseInt(limit as string)
    );
    
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  })
);

// Search instruments
router.get(
  '/instruments/search',
  asyncHandler(async (req: Request, res: Response) => {
    const { q, limit = 20 } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }
    
    const instruments = await marketRepository.searchInstruments(
      q,
      parseInt(limit as string)
    );
    
    return res.json({
      success: true,
      data: instruments,
    });
  })
);

// Get quote for a symbol
router.get(
  '/quotes/:symbol',
  asyncHandler(async (req: Request, res: Response) => {
    const { symbol } = req.params;
    const quote = await marketDataProvider.getQuote(symbol);
    
    res.json({
      success: true,
      data: quote,
    });
  })
);

// Get multiple quotes
router.post(
  '/quotes/bulk',
  asyncHandler(async (req: Request, res: Response) => {
    const { symbols } = req.body;
    
    if (!Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Symbols array is required',
      });
    }
    
    const quotes = await Promise.all(
      symbols.map(async (s: string) => {
        try {
          return await marketDataProvider.getQuote(s);
        } catch {
          return null;
        }
      })
    );
    
    return res.json({
      success: true,
      data: quotes.filter(Boolean),
    });
  })
);

// Get historical data
router.get(
  '/historical/:symbol',
  validateRequest({
    params: z.object({
      symbol: z.string(),
    }),
    query: z.object({
      from: z.string().optional(),
      to: z.string().optional(),
      interval: z.enum(['1m', '3m', '5m', '15m', '30m', '60m', '1d', '1W', '1M']).default('1d'),
      exchange: z.string().default('NSE'),
    }),
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { symbol } = req.params as { symbol: string };
    const query = req.query as { 
      from?: string; 
      to?: string; 
      interval?: '1m' | '3m' | '5m' | '15m' | '30m' | '60m' | '1d' | '1W' | '1M';
      exchange?: string;
    };
    
    const now = new Date();
    const fromDate = query.from ? new Date(query.from) : new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const toDate = query.to ? new Date(query.to) : now;
    const interval = query.interval || '1d';
    const exchange = query.exchange || 'NSE';
    
    const candles = await marketDataProvider.getHistoricalData({
      symbol,
      exchange,
      from: fromDate,
      to: toDate,
      interval,
    });
    
    res.json({
      success: true,
      data: candles,
    });
  })
);

// Subscribe to market data (WebSocket)
router.post(
  '/subscribe',
  asyncHandler(async (req: Request, res: Response) => {
    const { symbols } = req.body;
    
    if (!Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Symbols array is required',
      });
    }
    
    await marketDataProvider.subscribeMarketData(symbols);
    
    return res.json({
      success: true,
      message: `Subscribed to ${symbols.length} symbols`,
      data: { subscribed: symbols },
    });
  })
);

// Unsubscribe from market data
router.post(
  '/unsubscribe',
  asyncHandler(async (req: Request, res: Response) => {
    const { symbols } = req.body;
    
    if (!Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Symbols array is required',
      });
    }
    
    await marketDataProvider.unsubscribeMarketData(symbols);
    
    return res.json({
      success: true,
      message: `Unsubscribed from ${symbols.length} symbols`,
      data: { unsubscribed: symbols },
    });
  })
);

export const marketRoutes = router;
