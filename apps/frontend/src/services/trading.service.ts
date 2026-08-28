import api from './api';

export interface PaperAccount {
  _id: string;
  user: string;
  accountNumber: string;
  balance: number;
  investedValue: number;
  currentValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  isActive: boolean;
  createdAt: string;
}

export interface Trade {
  _id: string;
  account: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT' | 'SL' | 'SL-M';
  quantity: number;
  price: number;
  triggerPrice?: number;
  status: 'PENDING' | 'OPEN' | 'EXECUTED' | 'CANCELLED' | 'REJECTED';
  executedAt?: string;
  executedPrice?: number;
  executedQuantity?: number;
  stopLoss?: number;
  target?: number;
  pnl?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
}

export const tradingService = {
  getAccount: async (): Promise<PaperAccount> => {
    const response = await api.get<PaperAccount>('/trading/account');
    return response.data;
  },

  createAccount: async (initialBalance: number): Promise<PaperAccount> => {
    const response = await api.post<PaperAccount>('/trading/account', { initialBalance });
    return response.data;
  },

  placeOrder: async (data: Omit<Trade, '_id' | 'account' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Trade> => {
    const response = await api.post<Trade>('/trading/orders', data);
    return response.data;
  },

  getOrders: async (): Promise<Trade[]> => {
    const response = await api.get<Trade[]>('/trading/orders');
    return response.data;
  },

  getOrderById: async (id: string): Promise<Trade> => {
    const response = await api.get<Trade>(`/trading/orders/${id}`);
    return response.data;
  },

  cancelOrder: async (id: string): Promise<Trade> => {
    const response = await api.post<Trade>(`/trading/orders/${id}/cancel`);
    return response.data;
  },

  getPositions: async (): Promise<Position[]> => {
    const response = await api.get<Position[]>('/trading/positions');
    return response.data;
  },

  exitPosition: async (symbol: string): Promise<Trade> => {
    const response = await api.post<Trade>('/trading/positions/exit', { symbol });
    return response.data;
  },
};
