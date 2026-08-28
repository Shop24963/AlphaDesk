import { Instrument, Quote, Candle, HistoricalDataRequest, MarketOverview } from './types';
import { marketRepository } from './market.repository';

export interface IMarketDataProvider {
  getInstruments(): Promise<Instrument[]>;
  getQuote(symbol: string): Promise<Quote>;
  getHistoricalData(input: HistoricalDataRequest): Promise<Candle[]>;
  getMarketOverview(): Promise<MarketOverview>;
  subscribeMarketData(symbols: string[]): Promise<void>;
  unsubscribeMarketData(symbols: string[]): Promise<void>;
}

export class MockMarketDataProvider implements IMarketDataProvider {
  private mockQuotes: Map<string, Quote> = new Map();
  private subscribers: Set<string> = new Set();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize some mock NSE stocks
    const nseStocks = [
      'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK',
      'HINDUNILVR', 'SBIN', 'BHARTIARTL', 'ITC', 'KOTAKBANK',
      'LT', 'AXISBANK', 'ASIANPAINT', 'HCLTECH', 'MARUTI',
      'BAJFINANCE', 'TITAN', 'SUNPHARMA', 'ULTRACEMCO', 'WIPRO'
    ];

    nseStocks.forEach(symbol => {
      const basePrice = Math.random() * 3000 + 500;
      const change = (Math.random() - 0.5) * 100;
      const lastPrice = basePrice + change;
      
      this.mockQuotes.set(symbol, {
        symbol,
        exchange: 'NSE',
        lastPrice: parseFloat(lastPrice.toFixed(2)),
        open: parseFloat(basePrice.toFixed(2)),
        high: parseFloat((lastPrice * 1.02).toFixed(2)),
        low: parseFloat((lastPrice * 0.98).toFixed(2)),
        close: parseFloat(basePrice.toFixed(2)),
        volume: Math.floor(Math.random() * 1000000) + 100000,
        totalBuyQuantity: Math.floor(Math.random() * 500000),
        totalSellQuantity: Math.floor(Math.random() * 500000),
        averagePrice: parseFloat(lastPrice.toFixed(2)),
        lowerCircuitLimit: parseFloat((basePrice * 0.9).toFixed(2)),
        upperCircuitLimit: parseFloat((basePrice * 1.1).toFixed(2)),
        priceChange: parseFloat(change.toFixed(2)),
        priceChangePercent: parseFloat(((change / basePrice) * 100).toFixed(2)),
        timestamp: new Date(),
        bidPrice: parseFloat((lastPrice - 0.05).toFixed(2)),
        bidQty: Math.floor(Math.random() * 1000),
        askPrice: parseFloat((lastPrice + 0.05).toFixed(2)),
        askQty: Math.floor(Math.random() * 1000),
        ltp: parseFloat(lastPrice.toFixed(2)),
        ohlc: {
          open: parseFloat(basePrice.toFixed(2)),
          high: parseFloat((lastPrice * 1.02).toFixed(2)),
          low: parseFloat((lastPrice * 0.98).toFixed(2)),
          close: parseFloat(basePrice.toFixed(2)),
        },
      });
    });
  }

  async getInstruments(): Promise<Instrument[]> {
    const result = await marketRepository.findInstruments({}, 1, 100);
    return result.data as Instrument[];
  }

  async getQuote(symbol: string): Promise<Quote> {
    const quote = this.mockQuotes.get(symbol.toUpperCase());
    if (!quote) {
      throw new Error(`Quote not found for symbol: ${symbol}`);
    }
    return { ...quote, timestamp: new Date() };
  }

  async getHistoricalData(input: HistoricalDataRequest): Promise<Candle[]> {
    const candles: Candle[] = [];
    const now = new Date();
    const daysBack = input.interval === '1d' ? 365 : 30;
    
    let intervalMs: number;
    switch (input.interval) {
      case '1m': intervalMs = 60 * 1000; break;
      case '3m': intervalMs = 3 * 60 * 1000; break;
      case '5m': intervalMs = 5 * 60 * 1000; break;
      case '15m': intervalMs = 15 * 60 * 1000; break;
      case '30m': intervalMs = 30 * 60 * 1000; break;
      case '60m': intervalMs = 60 * 60 * 1000; break;
      case '1d': intervalMs = 24 * 60 * 60 * 1000; break;
      case '1W': intervalMs = 7 * 24 * 60 * 60 * 1000; break;
      case '1M': intervalMs = 30 * 24 * 60 * 60 * 1000; break;
      default: intervalMs = 24 * 60 * 60 * 1000;
    }

    const basePrice = this.mockQuotes.get(input.symbol)?.lastPrice || 1000;
    
    for (let i = daysBack; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * intervalMs);
      const volatility = 0.02;
      const randomChange = (Math.random() - 0.5) * volatility * basePrice;
      const open = basePrice + randomChange;
      const close = open + (Math.random() - 0.5) * volatility * basePrice;
      const high = Math.max(open, close) + Math.random() * volatility * basePrice;
      const low = Math.min(open, close) - Math.random() * volatility * basePrice;
      
      candles.push({
        timestamp,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: Math.floor(Math.random() * 100000) + 10000,
        trades: Math.floor(Math.random() * 1000) + 100,
      });
    }

    return candles;
  }

  async getMarketOverview(): Promise<MarketOverview> {
    const indices = [
      { name: 'NIFTY 50', symbol: 'NIFTY', value: 22500, change: 150, changePercent: 0.67 },
      { name: 'NIFTY BANK', symbol: 'BANKNIFTY', value: 48000, change: -200, changePercent: -0.42 },
      { name: 'NIFTY IT', symbol: 'NIFTYIT', value: 35000, change: 300, changePercent: 0.86 },
      { name: 'NIFTY MIDCAP', symbol: 'NIFTYMIDCAP', value: 15000, change: 80, changePercent: 0.53 },
    ].map(idx => ({
      ...idx,
      high: idx.value + Math.random() * 200,
      low: idx.value - Math.random() * 200,
      open: idx.value - idx.change + Math.random() * 50,
      previousClose: idx.value - idx.change,
    }));

    const advances = Math.floor(Math.random() * 1000) + 800;
    const declines = Math.floor(Math.random() * 1000) + 500;
    
    return {
      indices,
      marketStatus: 'open',
      advanceDecline: {
        advances,
        declines,
        unchanged: 3000 - advances - declines,
      },
      sectorPerformance: [
        { sector: 'Banking', change: 1.2, changePercent: 1.2 },
        { sector: 'IT', change: 2.1, changePercent: 2.1 },
        { sector: 'Pharma', change: -0.5, changePercent: -0.5 },
        { sector: 'Auto', change: 0.8, changePercent: 0.8 },
        { sector: 'FMCG', change: 0.3, changePercent: 0.3 },
        { sector: 'Metal', change: -1.2, changePercent: -1.2 },
        { sector: 'Energy', change: 1.5, changePercent: 1.5 },
        { sector: 'Realty', change: 2.5, changePercent: 2.5 },
      ],
      timestamp: new Date(),
    };
  }

  async subscribeMarketData(symbols: string[]): Promise<void> {
    symbols.forEach(symbol => this.subscribers.add(symbol.toUpperCase()));
  }

  async unsubscribeMarketData(symbols: string[]): Promise<void> {
    symbols.forEach(symbol => this.subscribers.delete(symbol.toUpperCase()));
  }

  getSubscribers(): Set<string> {
    return this.subscribers;
  }

  updateQuote(symbol: string, quote: Partial<Quote>) {
    const existing = this.mockQuotes.get(symbol.toUpperCase());
    if (existing) {
      this.mockQuotes.set(symbol.toUpperCase(), {
        ...existing,
        ...quote,
        timestamp: new Date(),
      });
    }
  }

  simulateMarketMovement() {
    this.mockQuotes.forEach((quote, symbol) => {
      const changePercent = (Math.random() - 0.5) * 0.02;
      const newPrice = quote.lastPrice * (1 + changePercent);
      this.updateQuote(symbol, {
        lastPrice: parseFloat(newPrice.toFixed(2)),
        priceChange: parseFloat((newPrice - quote.close).toFixed(2)),
        priceChangePercent: parseFloat(((newPrice - quote.close) / quote.close * 100).toFixed(2)),
      });
    });
  }
}

export const marketDataProvider = new MockMarketDataProvider();
