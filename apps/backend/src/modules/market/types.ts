import { z } from 'zod';

export const instrumentSchema = z.object({
  _id: z.string().optional(),
  symbol: z.string(),
  exchange: z.enum(['NSE', 'BSE', 'NFO', 'BFO']),
  instrumentType: z.enum(['EQ', 'FUT', 'OPT', 'IDX']),
  name: z.string(),
  segment: z.string(),
  lotSize: z.number().default(1),
  tickSize: z.number().default(0.05),
  strikePrice: z.number().optional(),
  expiryDate: z.string().optional(),
  isin: z.string().optional(),
  series: z.string().default('EQ'),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const quoteSchema = z.object({
  _id: z.string().optional(),
  symbol: z.string(),
  exchange: z.string(),
  lastPrice: z.number(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
  totalBuyQuantity: z.number(),
  totalSellQuantity: z.number(),
  averagePrice: z.number(),
  lowerCircuitLimit: z.number(),
  upperCircuitLimit: z.number(),
  priceChange: z.number(),
  priceChangePercent: z.number(),
  timestamp: z.date(),
  bidPrice: z.number().optional(),
  bidQty: z.number().optional(),
  askPrice: z.number().optional(),
  askQty: z.number().optional(),
  ltp: z.number().optional(),
  ohlc: z.object({
    open: z.number(),
    high: z.number(),
    low: z.number(),
    close: z.number(),
  }).optional(),
});

export const candleSchema = z.object({
  timestamp: z.date(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
  trades: z.number().optional(),
});

export const historicalDataRequestSchema = z.object({
  symbol: z.string(),
  exchange: z.string(),
  from: z.date(),
  to: z.date(),
  interval: z.enum(['1m', '3m', '5m', '15m', '30m', '60m', '1d', '1W', '1M']),
});

export const marketOverviewSchema = z.object({
  indices: z.array(z.object({
    name: z.string(),
    symbol: z.string(),
    value: z.number(),
    change: z.number(),
    changePercent: z.number(),
    high: z.number(),
    low: z.number(),
    open: z.number(),
    previousClose: z.number(),
  })),
  marketStatus: z.enum(['open', 'closed', 'pre_open', 'post_close']),
  advanceDecline: z.object({
    advances: z.number(),
    declines: z.number(),
    unchanged: z.number(),
  }),
  sectorPerformance: z.array(z.object({
    sector: z.string(),
    change: z.number(),
    changePercent: z.number(),
  })),
  timestamp: z.date(),
});

export type Instrument = z.infer<typeof instrumentSchema>;
export type Quote = z.infer<typeof quoteSchema>;
export type Candle = z.infer<typeof candleSchema>;
export type HistoricalDataRequest = z.infer<typeof historicalDataRequestSchema>;
export type MarketOverview = z.infer<typeof marketOverviewSchema>;
