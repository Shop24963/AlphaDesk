import api from './api';

export interface Backtest {
  _id: string;
  user: string;
  strategy: string;
  name: string;
  settings: BacktestSettings;
  results?: BacktestResults;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  trades?: BacktestTrade[];
  equityCurve?: EquityPoint[];
  createdAt: string;
  updatedAt: string;
}

export interface BacktestSettings {
  symbol: string;
  timeframe: string;
  from: string;
  to: string;
  initialCapital: number;
  positionSize: number;
  stopLossPercent?: number;
  targetPercent?: number;
}

export interface BacktestResults {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  avgReturn: number;
  totalReturn: number;
  totalReturnPercent: number;
  sharpeRatio: number;
  sortinoRatio: number;
  avgWinningTrade: number;
  avgLosingTrade: number;
  largestWin: number;
  largestLoss: number;
  avgTradeDuration: number;
  consecutiveWins: number;
  consecutiveLosses: number;
}

export interface BacktestTrade {
  entryDate: string;
  exitDate?: string;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  side: 'LONG' | 'SHORT';
  pnl: number;
  pnlPercent: number;
  exitReason?: string;
}

export interface EquityPoint {
  date: string;
  value: number;
}

export const backtestService = {
  getAll: async (): Promise<Backtest[]> => {
    const response = await api.get<Backtest[]>('/backtesting');
    return response.data;
  },

  getById: async (id: string): Promise<Backtest> => {
    const response = await api.get<Backtest>(`/backtesting/${id}`);
    return response.data;
  },

  create: async (data: Omit<Backtest, '_id' | 'user' | 'status' | 'progress' | 'createdAt' | 'updatedAt'>): Promise<Backtest> => {
    const response = await api.post<Backtest>('/backtesting', data);
    return response.data;
  },

  run: async (id: string): Promise<Backtest> => {
    const response = await api.post<Backtest>(`/backtesting/${id}/run`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/backtesting/${id}`);
  },
};
