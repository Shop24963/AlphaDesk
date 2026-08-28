/**
 * Quote interface
 */
export interface Quote {
  symbol: string;
  exchange: string;
  lastPrice: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  averagePrice: number;
  totalBuyQuantity: number;
  totalSellQuantity: number;
  bidPrice: number;
  bidQty: number;
  askPrice: number;
  askQty: number;
  timestamp: Date;
  change: number;
  changePercent: number;
  upperCircuitLimit: number;
  lowerCircuitLimit: number;
}

/**
 * Candle/OHLCV data
 */
export interface Candle {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  trades?: number;
}

/**
 * Instrument/Stock metadata
 */
export interface Instrument {
  symbol: string;
  exchange: string;
  name: string;
  segment: 'equity' | 'futures' | 'options' | 'currency' | 'commodity';
  lotSize?: number;
  tickSize: number;
  strikePrice?: number;
  expiryDate?: Date;
  instrumentType: 'stock' | 'index' | 'future' | 'option' | 'etf';
  isTrading: boolean;
  series: 'EQ' | 'BE' | 'BL' | 'BM' | 'GC' | 'IL';
  industry?: string;
  sector?: string;
  isin?: string;
}

/**
 * Market Overview
 */
export interface MarketOverview {
  indices: {
    name: string;
    value: number;
    change: number;
    changePercent: number;
  }[];
  marketStatus: 'open' | 'closed' | 'pre_open' | 'post_close';
  advanceDecline: {
    advances: number;
    declines: number;
    unchanged: number;
  };
  marketBreadth: number; // advances / (advances + declines)
  totalVolume: number;
  timestamp: Date;
}

/**
 * Historical Data Request
 */
export interface HistoricalDataRequest {
  symbol: string;
  exchange: string;
  from: Date;
  to: Date;
  interval: '1m' | '5m' | '15m' | '30m' | '60m' | '1d' | '1w' | '1M';
}

/**
 * Market Data Provider Interface
 * Abstracts different market data sources
 */
export interface MarketDataProvider {
  /**
   * Get list of all available instruments
   */
  getInstruments(): Promise<Instrument[]>;

  /**
   * Get current quote for a symbol
   */
  getQuote(symbol: string, exchange?: string): Promise<Quote>;

  /**
   * Get multiple quotes at once
   */
  getQuotes(symbols: string[]): Promise<Map<string, Quote>>;

  /**
   * Get historical candle data
   */
  getHistoricalData(request: HistoricalDataRequest): Promise<Candle[]>;

  /**
   * Get market overview
   */
  getMarketOverview(): Promise<MarketOverview>;

  /**
   * Subscribe to real-time market data for symbols
   */
  subscribeMarketData(symbols: string[]): Promise<void>;

  /**
   * Unsubscribe from real-time market data
   */
  unsubscribeMarketData(symbols: string[]): Promise<void>;

  /**
   * Check if provider is connected
   */
  isConnected(): boolean;

  /**
   * Connect to provider
   */
  connect(): Promise<void>;

  /**
   * Disconnect from provider
   */
  disconnect(): Promise<void>;
}
