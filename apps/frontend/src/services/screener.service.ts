import api from './api';

export interface ScreenerResult {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  lastPrice: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  pbRatio: number;
  rsi: number;
  ema20: number;
  ema50: number;
  ema200: number;
  score: number;
}

export interface ScanCriteria {
  priceRange?: { min: number; max: number };
  volumeRange?: { min: number; max: number };
  rsiRange?: { min: number; max: number };
  peRange?: { min: number; max: number };
  marketCapRange?: { min: number; max: number };
  sectors?: string[];
  industries?: string[];
  technicalConditions?: string[];
}

export const screenerService = {
  runCustomScreener: async (criteria: ScanCriteria): Promise<ScreenerResult[]> => {
    const response = await api.post<ScreenerResult[]>('/screener/custom', criteria);
    return response.data;
  },

  getSwingCandidates: async (): Promise<ScreenerResult[]> => {
    const response = await api.get<ScreenerResult[]>('/screener/swing');
    return response.data;
  },

  getPositionalCandidates: async (): Promise<ScreenerResult[]> => {
    const response = await api.get<ScreenerResult[]>('/screener/positional');
    return response.data;
  },

  getRelativeStrength: async (): Promise<ScreenerResult[]> => {
    const response = await api.get<ScreenerResult[]>('/screener/relative-strength');
    return response.data;
  },
};
