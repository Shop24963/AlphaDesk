import api from './api';

export interface Strategy {
  _id: string;
  user: string;
  name: string;
  description: string;
  type: 'swing' | 'positional' | 'intraday' | 'longterm';
  rules: StrategyRule[];
  riskManagement: RiskManagement;
  isActive: boolean;
  backtestStats?: BacktestStats;
  createdAt: string;
  updatedAt: string;
}

export interface StrategyRule {
  field: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between' | 'crosses_above' | 'crosses_below';
  value: number | string;
  timeframe?: string;
}

export interface RiskManagement {
  stopLossPercent: number;
  targetPercent: number;
  maxPositionSize: number;
  maxPortfolioRisk: number;
}

export interface BacktestStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  avgReturn: number;
  sharpeRatio: number;
}

export const strategyService = {
  getAll: async (): Promise<Strategy[]> => {
    const response = await api.get<Strategy[]>('/strategies');
    return response.data;
  },

  getById: async (id: string): Promise<Strategy> => {
    const response = await api.get<Strategy>(`/strategies/${id}`);
    return response.data;
  },

  create: async (data: Omit<Strategy, '_id' | 'user' | 'createdAt' | 'updatedAt'>): Promise<Strategy> => {
    const response = await api.post<Strategy>('/strategies', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Strategy>): Promise<Strategy> => {
    const response = await api.put<Strategy>(`/strategies/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/strategies/${id}`);
  },

  runBacktest: async (id: string, params: { from: string; to: string }): Promise<Strategy> => {
    const response = await api.post<Strategy>(`/strategies/${id}/backtest`, params);
    return response.data;
  },
};
