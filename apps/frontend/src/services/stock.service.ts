import api from './api';

export interface Stock {
  _id: string;
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE';
  sector: string;
  industry: string;
  marketCap: number;
  peRatio?: number;
  pbRatio?: number;
  dividendYield?: number;
  weekHigh52: number;
  weekLow52: number;
  lastPrice: number;
  change: number;
  changePercent: number;
}

export interface Quote {
  symbol: string;
  lastPrice: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

export interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketOverview {
  nifty50: {
    value: number;
    change: number;
    changePercent: number;
  };
  bankNifty: {
    value: number;
    change: number;
    changePercent: number;
  };
  advanceDecline: {
    advances: number;
    declines: number;
    unchanged: number;
  };
  marketStatus: 'OPEN' | 'CLOSED' | 'PRE_OPEN' | 'POST_CLOSE';
}

export const stockService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<{ stocks: Stock[]; total: number }> => {
    const response = await api.get<{ stocks: Stock[]; total: number }>('/stocks', { params });
    return response.data;
  },

  getBySymbol: async (symbol: string): Promise<Stock> => {
    const response = await api.get<Stock>(`/stocks/${symbol}`);
    return response.data;
  },

  getQuote: async (symbol: string): Promise<Quote> => {
    const response = await api.get<Quote>(`/stocks/${symbol}/quote`);
    return response.data;
  },

  getHistoricalData: async (symbol: string, timeframe: string, days: number): Promise<Candle[]> => {
    const response = await api.get<Candle[]>(`/stocks/${symbol}/historical`, {
      params: { timeframe, days },
    });
    return response.data;
  },

  getSectors: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/stocks/sectors');
    return response.data;
  },

  getIndustries: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/stocks/industries');
    return response.data;
  },

  getMarketOverview: async (): Promise<MarketOverview> => {
    const response = await api.get<MarketOverview>('/market/overview');
    return response.data;
  },
};
