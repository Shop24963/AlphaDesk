import { Candle, Timeframe } from '@alphadesk/shared-types';

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(data: number[], period: number): number | null {
  if (data.length < period) return null;
  const slice = data.slice(-period);
  const sum = slice.reduce((acc, val) => acc + val, 0);
  return sum / period;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(
  data: number[],
  period: number,
  previousEMA?: number
): number | null {
  if (data.length === 0) return null;
  
  const multiplier = 2 / (period + 1);
  
  if (previousEMA !== undefined) {
    return data[data.length - 1] * multiplier + previousEMA * (1 - multiplier);
  }
  
  if (data.length < period) return null;
  
  // Start with SMA for first EMA value
  const initialSMA = calculateSMA(data.slice(0, period), period);
  if (!initialSMA) return null;
  
  let ema = initialSMA;
  for (let i = period; i < data.length; i++) {
    ema = data[i] * multiplier + ema * (1 - multiplier);
  }
  
  return ema;
}

/**
 * Calculate Relative Strength Index (RSI)
 */
export function calculateRSI(prices: number[], period: number = 14): number | null {
  if (prices.length < period + 1) return null;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
  candles: Candle[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number | null; signal: number | null; histogram: number | null } | null {
  if (candles.length < slowPeriod + signalPeriod) return null;
  
  const closes = candles.map(c => c.close);
  
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);
  
  if (fastEMA === null || slowEMA === null) return null;
  
  const macd = fastEMA - slowEMA;
  
  // For signal line, we need historical MACD values
  // This is a simplified version
  const signal = macd; // In production, calculate proper signal EMA
  const histogram = macd - signal;
  
  return { macd, signal, histogram };
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(
  prices: number[],
  period: number = 20,
  stdDevMultiplier: number = 2
): { upper: number | null; middle: number | null; lower: number | null } | null {
  if (prices.length < period) return null;
  
  const slice = prices.slice(-period);
  const middle = calculateSMA(slice, period);
  if (!middle) return null;
  
  const squaredDiffs = slice.map(p => Math.pow(p - middle, 2));
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / period;
  const stdDev = Math.sqrt(variance);
  
  return {
    upper: middle + stdDevMultiplier * stdDev,
    middle,
    lower: middle - stdDevMultiplier * stdDev
  };
}

/**
 * Calculate Average True Range (ATR)
 */
export function calculateATR(candles: Candle[], period: number = 14): number | null {
  if (candles.length < period + 1) return null;
  
  const trueRanges: number[] = [];
  
  for (let i = 1; i < candles.length; i++) {
    const candle = candles[i];
    const prevCandle = candles[i - 1];
    
    const highLow = candle.high - candle.low;
    const highClose = Math.abs(candle.high - prevCandle.close);
    const lowClose = Math.abs(candle.low - prevCandle.close);
    
    const trueRange = Math.max(highLow, highClose, lowClose);
    trueRanges.push(trueRange);
  }
  
  if (trueRanges.length < period) return null;
  
  return calculateSMA(trueRanges.slice(-period), period);
}

/**
 * Calculate Stochastic Oscillator
 */
export function calculateStochastic(
  candles: Candle[],
  kPeriod: number = 14,
  dPeriod: number = 3
): { k: number | null; d: number | null } | null {
  if (candles.length < kPeriod) return null;
  
  const kValues: number[] = [];
  
  for (let i = kPeriod - 1; i < candles.length; i++) {
    const slice = candles.slice(i - kPeriod + 1, i + 1);
    const high = Math.max(...slice.map(c => c.high));
    const low = Math.min(...slice.map(c => c.low));
    const close = candles[i].close;
    
    if (high === low) {
      kValues.push(50);
    } else {
      kValues.push(((close - low) / (high - low)) * 100);
    }
  }
  
  const k = kValues[kValues.length - 1];
  const d = calculateSMA(kValues, dPeriod);
  
  return { k, d };
}

/**
 * Format currency for INR
 */
export function formatINR(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 2): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers (K, L, Cr)
 */
export function formatNumber(num: number): string {
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  }
  if (num >= 1000) {
    return `₹${(num / 1000).toFixed(2)} K`;
  }
  return `₹${num.toFixed(2)}`;
}

/**
 * Parse timeframe to minutes
 */
export function timeframeToMinutes(timeframe: Timeframe): number {
  const match = timeframe.match(/^(\d+)([mhdw])$/);
  if (!match) return 1440; // Default to 1D
  
  const [, value, unit] = match;
  const num = parseInt(value, 10);
  
  switch (unit) {
    case 'm': return num;
    case 'h': return num * 60;
    case 'd': return num * 1440;
    case 'w': return num * 10080;
    default: return 1440;
  }
}

/**
 * Check if market is open (NSE trading hours)
 */
export function isMarketOpen(date: Date = new Date()): boolean {
  const day = date.getDay();
  if (day === 0 || day === 6) return false; // Weekend
  
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeInMinutes = hours * 60 + minutes;
  
  // NSE: 9:15 AM to 3:30 PM IST
  const marketOpen = 9 * 60 + 15; // 555
  const marketClose = 15 * 60 + 30; // 930
  
  return timeInMinutes >= marketOpen && timeInMinutes <= marketClose;
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Generate a unique ID
 */
export function generateId(prefix: string = ''): string {
  const id = Math.random().toString(36).substring(2, 15);
  return prefix ? `${prefix}_${id}` : id;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Calculate risk-reward ratio
 */
export function calculateRiskReward(
  entryPrice: number,
  stopLoss: number,
  target: number
): number {
  const risk = Math.abs(entryPrice - stopLoss);
  const reward = Math.abs(target - entryPrice);
  
  if (risk === 0) return 0;
  return reward / risk;
}

/**
 * Calculate position size based on risk
 */
export function calculatePositionSize(
  capital: number,
  riskPercent: number,
  entryPrice: number,
  stopLoss: number
): number {
  const riskAmount = capital * (riskPercent / 100);
  const riskPerShare = Math.abs(entryPrice - stopLoss);
  
  if (riskPerShare === 0) return 0;
  return Math.floor(riskAmount / riskPerShare);
}
