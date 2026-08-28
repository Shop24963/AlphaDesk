import api from './api';

export interface Watchlist {
  _id: string;
  name: string;
  user: string;
  symbols: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export const watchlistService = {
  getAll: async (): Promise<Watchlist[]> => {
    const response = await api.get<Watchlist[]>('/watchlists');
    return response.data;
  },

  getById: async (id: string): Promise<Watchlist> => {
    const response = await api.get<Watchlist>(`/watchlists/${id}`);
    return response.data;
  },

  create: async (data: { name: string; symbols?: string[] }): Promise<Watchlist> => {
    const response = await api.post<Watchlist>('/watchlists', data);
    return response.data;
  },

  update: async (id: string, data: { name?: string; symbols?: string[] }): Promise<Watchlist> => {
    const response = await api.put<Watchlist>(`/watchlists/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/watchlists/${id}`);
  },

  addSymbol: async (id: string, symbol: string): Promise<Watchlist> => {
    const response = await api.post<Watchlist>(`/watchlists/${id}/symbols`, { symbol });
    return response.data;
  },

  removeSymbol: async (id: string, symbol: string): Promise<Watchlist> => {
    const response = await api.delete<Watchlist>(`/watchlists/${id}/symbols/${symbol}`);
    return response.data;
  },
};
