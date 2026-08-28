export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export function calculateRSI(closes: number[], period: number = 14): number[] {
  if (closes.length < period + 1) return [];

  const rsiValues: number[] = [];
  let gains = 0;
  let losses = 0;

  // Calculate initial average gain/loss
  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    rsiValues.push(rsi);
  }

  return rsiValues;
}

export function calculateEMA(values: number[], period: number): number[] {
  if (values.length < period) return [];

  const emaValues: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // Calculate SMA for first EMA value
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += values[i];
  }
  let ema = sum / period;
  emaValues.push(ema);

  // Calculate remaining EMA values
  for (let i = period; i < values.length; i++) {
    ema = (values[i] - ema) * multiplier + ema;
    emaValues.push(ema);
  }

  return emaValues;
}

export function calculateSMA(values: number[], period: number): number[] {
  if (values.length < period) return [];

  const smaValues: number[] = [];
  let sum = 0;

  for (let i = 0; i < period; i++) {
    sum += values[i];
  }
  smaValues.push(sum / period);

  for (let i = period; i < values.length; i++) {
    sum = sum - values[i - period] + values[i];
    smaValues.push(sum / period);
  }

  return smaValues;
}

export function calculateATR(candles: Candle[], period: number = 14): number[] {
  if (candles.length < period + 1) return [];

  const trValues: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const candle = candles[i];
    const prevCandle = candles[i - 1];
    
    const tr1 = candle.high - candle.low;
    const tr2 = Math.abs(candle.high - prevCandle.close);
    const tr3 = Math.abs(candle.low - prevCandle.close);
    
    trValues.push(Math.max(tr1, tr2, tr3));
  }

  return calculateSMA(trValues, period);
}

export function calculateMACD(closes: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) {
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);

  if (fastEMA.length === 0 || slowEMA.length === 0) {
    return { macd: [], signal: [], histogram: [] };
  }

  // Align EMAs
  const offset = slowEMA.length - fastEMA.length;
  const alignedFastEMA = fastEMA.slice(offset);

  const macdLine = alignedFastEMA.map((fast, i) => fast - slowEMA[i]);
  const signalLine = calculateEMA(macdLine, signalPeriod);
  const histogram = macdLine.map((macd, i) => {
    const signal = signalLine[i - (signalLine.length - macdLine.length)] || 0;
    return macd - signal;
  });

  return { macd: macdLine, signal: signalLine, histogram };
}

export function calculateBollingerBands(closes: number[], period: number = 20, stdDev: number = 2) {
  const sma = calculateSMA(closes, period);
  const upperBand: number[] = [];
  const lowerBand: number[] = [];

  const offset = closes.length - sma.length - period + 1;
  
  for (let i = 0; i < sma.length; i++) {
    const slice = closes.slice(offset + i, offset + i + period);
    const mean = sma[i];
    const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);

    upperBand.push(mean + stdDev * standardDeviation);
    lowerBand.push(mean - stdDev * standardDeviation);
  }

  return { upper: upperBand, middle: sma, lower: lowerBand };
}
