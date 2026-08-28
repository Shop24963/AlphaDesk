import api from './api';

export interface Alert {
  _id: string;
  user: string;
  symbol: string;
  condition: AlertCondition;
  triggerValue: number;
  currentValue: number;
  isActive: boolean;
  triggeredAt?: string;
  notificationType: 'email' | 'push' | 'sms';
  message?: string;
  createdAt: string;
}

export interface AlertCondition {
  type: 'price_above' | 'price_below' | 'rsi_above' | 'rsi_below' | 'volume_spike';
  value: number;
}

export const alertService = {
  getAll: async (): Promise<Alert[]> => {
    const response = await api.get<Alert[]>('/alerts');
    return response.data;
  },

  create: async (data: Omit<Alert, '_id' | 'user' | 'currentValue' | 'createdAt'>): Promise<Alert> => {
    const response = await api.post<Alert>('/alerts', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Alert>): Promise<Alert> => {
    const response = await api.put<Alert>(`/alerts/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/alerts/${id}`);
  },

  toggle: async (id: string): Promise<Alert> => {
    const response = await api.post<Alert>(`/alerts/${id}/toggle`);
    return response.data;
  },
};
