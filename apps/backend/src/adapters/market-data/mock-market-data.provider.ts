import {
  MarketDataProvider,
  Quote,
  Instrument,
  Candle,
  MarketOverview,
  HistoricalDataRequest,
} from './types.js';
import { logger } from '@/common/logger.js';

/**
 * Mock Market Data Provider
 * Provides simulated market data for development and testing
 */
export class MockMarketDataProvider implements MarketDataProvider {
  private connected: boolean = false;
  private instruments: Instrument[] = [];
  private subscriptions: Set<string> = new Set();

  constructor() {
    this.initializeInstruments();
  }

  private initializeInstruments(): void {
    // NSE Stocks - Sample data
    this.instruments = [
      {
        symbol: 'RELIANCE',
        exchange: 'NSE',
        name: 'Reliance Industries Ltd',
        segment: 'equity',
        tickSize: 0.05,
        instrumentType: 'stock',
        isTrading: true,
        series: 'EQ',
        sector: 'Energy',
        industry: 'Refineries',
      },
      {
        symbol: 'TCS',
        exchange: 'NSE',
        name: 'Tata Consultancy Services Ltd',
        segment: 'equity',
        tickSize: 0.05,
        instrumentType: 'stock',
        isTrading: true,
        series: 'EQ',
        sector: 'Technology',
        industry: 'IT Services',
      },
      {
        symbol: 'INFY',
        exchange: 'NSE',
        name: 'Infosys Ltd',
        segment: 'equity',
        tickSize: 0.05,
        instrumentType: 'stock',
        isTrading: true,
        series: 'EQ',
        sector: 'Technology',
        industry: 'IT Services',
      },
      {
        symbol: 'HDFCBANK',
        exchange: 'NSE',
        name: 'HDFC Bank Ltd',
        segment: 'equity',
        tickSize: 0.05,
        instrumentType: 'stock',
        isTrading: true,
        series: 'EQ',
        sector: 'Financial Services',
        industry: 'Private Sector Bank',
      },
      {
        symbol: 'ICICIBANK',
        exchange: 'NSE',
        name: 'ICICI Bank Ltd',
        segment: 'equity',
        tickSize: 0.05,
        instrumentType: 'stock',
        isTrading: true,
        series: 'EQ',
        sector: 'Financial Services',
        industry: 'Private Sector Bank',
      },
      {
        symbol: 'NIFTY',
        exchange: 'NSE',
        name: 'Nifty 50',
        segment: 'equity',
        tickSize: 0.05,
        instrumentType: 'index',
        isTrading: true,
        series: 'EQ',
      },
      {
        symbol: 'BANKNIFTY',
        exchange: 'NSE',
        name: 'Nifty Bank',
        segment: 'equity',
        tickSize: 0.05,
        instrumentType: 'index',
        isTrading: true,
        series: 'EQ',
      },
    ];
  }

  async connect(): Promise<void> {
    logger.info('Mock market data provider connected');
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    logger.info('Mock market data provider disconnected');
    this.connected = false;
    this.subscriptions.clear();
  }

  isConnected(): boolean {
    return this.connected;
  }

  async getInstruments(): Promise<Instrument[]> {
    return Promise.resolve(this.instruments);
  }

  async getQuote(symbol: string, exchange: string = 'NSE'): Promise<Quote> {
    const basePrice = this.getBasePrice(symbol);
    const change = (Math.random() - 0.5) * basePrice * 0.02; // ±1% change
    const lastPrice = basePrice + change;

    return Promise.resolve({
      symbol,
      exchange,
      lastPrice: parseFloat(lastPrice.toFixed(2)),
      open: parseFloat((basePrice * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2)),
      high: parseFloat((lastPrice * 1.01).toFixed(2)),
      low: parseFloat((lastPrice * 0.99).toFixed(2)),
      close: basePrice,
      volume: Math.floor(Math.random() * 1000000) + 100000,
      averagePrice: parseFloat(lastPrice.toFixed(2)),
      totalBuyQuantity: Math.floor(Math.random() * 500000),
      totalSellQuantity: Math.floor(Math.random() * 500000),
      bidPrice: parseFloat((lastPrice - 0.05).toFixed(2)),
      bidQty: Math.floor(Math.random() * 1000),
      askPrice: parseFloat((lastPrice + 0.05).toFixed(2)),
      askQty: Math.floor(Math.random() * 1000),
      timestamp: new Date(),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(((change / basePrice) * 100).toFixed(2)),
      upperCircuitLimit: parseFloat((basePrice * 1.1).toFixed(2)),
      lowerCircuitLimit: parseFloat((basePrice * 0.9).toFixed(2)),
    });
  }

  async getQuotes(symbols: string[]): Promise<Map<string, Quote>> {
    const quotes = new Map<string, Quote>();
    
    for (const symbol of symbols) {
      try {
        const quote = await this.getQuote(symbol);
        quotes.set(symbol, quote);
      } catch (error) {
        logger.warn(`Failed to get quote for ${symbol}`, error);
      }
    }

    return Promise.resolve(quotes);
  }

  async getHistoricalData(request: HistoricalDataRequest): Promise<Candle[]> {
    const { symbol, from, to, interval } = request;
    const candles: Candle[] = [];
    
    const basePrice = this.getBasePrice(symbol);
    let currentDate = new Date(from);
    
    while (currentDate <= to) {
      // Skip weekends
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      const volatility = interval.includes('d') ? 0.02 : 0.005;
      const open = basePrice * (1 + (Math.random() - 0.5) * volatility);
      const close = basePrice * (1 + (Math.random() - 0.5) * volatility);
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      
      candles.push({
        timestamp: new Date(currentDate),
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: Math.floor(Math.random() * 1000000) + 100000,
      });

      // Increment date based on interval
      if (interval === '1d') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else {
        currentDate.setHours(currentDate.getHours() + 1);
      }
    }

    return Promise.resolve(candles);
  }

  async getMarketOverview(): Promise<MarketOverview> {
    const niftyValue = 22000 + (Math.random() - 0.5) * 500;
    const bankNiftyValue = 47000 + (Math.random() - 0.5) * 1000;
    
    const advances = Math.floor(Math.random() * 1000) + 500;
    const declines = Math.floor(Math.random() * 1000) + 500;
    const unchanged = Math.floor(Math.random() * 100);

    return Promise.resolve({
      indices: [
        {
          name: 'NIFTY 50',
          value: parseFloat(niftyValue.toFixed(2)),
          change: parseFloat(((Math.random() - 0.5) * 100).toFixed(2)),
          changePercent: parseFloat(((Math.random() - 0.5) * 0.5).toFixed(2)),
        },
        {
          name: 'BANK NIFTY',
          value: parseFloat(bankNiftyValue.toFixed(2)),
          change: parseFloat(((Math.random() - 0.5) * 200).toFixed(2)),
          changePercent: parseFloat(((Math.random() - 0.5) * 0.8).toFixed(2)),
        },
      ],
      marketStatus: 'open',
      advanceDecline: {
        advances,
        declines,
        unchanged,
      },
      marketBreadth: advances / (advances + declines),
      totalVolume: Math.floor(Math.random() * 10000000000),
      timestamp: new Date(),
    });
  }

  async subscribeMarketData(symbols: string[]): Promise<void> {
    symbols.forEach((s) => this.subscriptions.add(s));
    logger.info(`Subscribed to ${symbols.length} symbols`);
  }

  async unsubscribeMarketData(symbols: string[]): Promise<void> {
    symbols.forEach((s) => this.subscriptions.delete(s));
    logger.info(`Unsubscribed from ${symbols.length} symbols`);
  }

  /**
   * Get base price for a symbol (for simulation)
   */
  private getBasePrice(symbol: string): number {
    const prices: Record<string, number> = {
      RELIANCE: 2500,
      TCS: 3600,
      INFY: 1500,
      HDFCBANK: 1650,
      ICICIBANK: 1000,
      NIFTY: 22000,
      BANKNIFTY: 47000,
    };
    
    return prices[symbol] || 100 + Math.random() * 100;
  }
}

// Singleton instance
let mockProviderInstance: MockMarketDataProvider | null = null;

export const getMockMarketDataProvider = (): MockMarketDataProvider => {
  if (!mockProviderInstance) {
    mockProviderInstance = new MockMarketDataProvider();
  }
  return mockProviderInstance;
};
