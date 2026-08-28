import api from './api';

export interface Portfolio {
  _id: string;
  user: string;
  name: string;
  totalValue: number;
  investedValue: number;
  currentValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  holdings: Holding[];
  createdAt: string;
  updatedAt: string;
}

export interface Holding {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  investedValue: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  allocation: number;
}

export interface Transaction {
  _id: string;
  portfolio: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  totalAmount: number;
  date: string;
  notes?: string;
}

export const portfolioService = {
  getPortfolio: async (): Promise<Portfolio> => {
    const response = await api.get<Portfolio>('/portfolio');
    return response.data;
  },

  addTransaction: async (data: Omit<Transaction, '_id' | 'portfolio'>): Promise<Transaction> => {
    const response = await api.post<Transaction>('/portfolio/transactions', data);
    return response.data;
  },

  getTransactions: async (): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>('/portfolio/transactions');
    return response.data;
  },

  deleteTransaction: async (id: string): Promise<void> => {
    await api.delete(`/portfolio/transactions/${id}`);
  },

  getHoldings: async (): Promise<Holding[]> => {
    const response = await api.get<Holding[]>('/portfolio/holdings');
    return response.data;
  },
};
