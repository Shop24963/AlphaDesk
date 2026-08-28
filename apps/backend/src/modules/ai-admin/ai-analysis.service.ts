export interface Pattern {
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  description: string;
  detectedAt: Date;
}

export interface AIAnalysis {
  symbol: string;
  patterns: Pattern[];
  sentiment: 'bullish' | 'bearish' | 'neutral';
  sentimentScore: number;
  supportLevels: number[];
  resistanceLevels: number[];
  trend: 'uptrend' | 'downtrend' | 'sideways';
  volatility: 'low' | 'medium' | 'high';
  recommendation: 'buy' | 'sell' | 'hold';
  targetPrice?: number;
  stopLoss?: number;
  riskRewardRatio?: number;
  analysis: string;
  generatedAt: Date;
}

export function analyzeCandlestickPatterns(candles: any[]): Pattern[] {
  const patterns: Pattern[] = [];
  
  if (candles.length < 3) return patterns;

  const latest = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const prev2 = candles[candles.length - 3];

  // Doji pattern
  const dojiRange = Math.max(latest.open, latest.close) - Math.min(latest.open, latest.close);
  const avgBodySize = (candles.slice(-10).reduce((sum, c) => sum + Math.abs(c.close - c.open), 0)) / 10;
  
  if (dojiRange < avgBodySize * 0.3) {
    patterns.push({
      name: 'Doji',
      type: 'neutral',
      confidence: 0.8,
      description: 'Indecision in the market, potential reversal signal',
      detectedAt: new Date(),
    });
  }

  // Hammer pattern
  const lowerShadow = Math.min(latest.open, latest.close) - latest.low;
  const upperShadow = latest.high - Math.max(latest.open, latest.close);
  const bodySize = Math.abs(latest.close - latest.open);
  
  if (lowerShadow > bodySize * 2 && upperShadow < bodySize * 0.5 && latest.close > latest.open) {
    patterns.push({
      name: 'Hammer',
      type: 'bullish',
      confidence: 0.75,
      description: 'Potential bullish reversal after downtrend',
      detectedAt: new Date(),
    });
  }

  // Shooting Star
  if (upperShadow > bodySize * 2 && lowerShadow < bodySize * 0.5 && latest.close < latest.open) {
    patterns.push({
      name: 'Shooting Star',
      type: 'bearish',
      confidence: 0.75,
      description: 'Potential bearish reversal after uptrend',
      detectedAt: new Date(),
    });
  }

  // Bullish Engulfing
  if (prev.close < prev.open && 
      latest.close > latest.open && 
      latest.open < prev.close && 
      latest.close > prev.open) {
    patterns.push({
      name: 'Bullish Engulfing',
      type: 'bullish',
      confidence: 0.85,
      description: 'Strong bullish reversal pattern',
      detectedAt: new Date(),
    });
  }

  // Bearish Engulfing
  if (prev.close > prev.open && 
      latest.close < latest.open && 
      latest.open > prev.close && 
      latest.close < prev.open) {
    patterns.push({
      name: 'Bearish Engulfing',
      type: 'bearish',
      confidence: 0.85,
      description: 'Strong bearish reversal pattern',
      detectedAt: new Date(),
    });
  }

  // Morning Star
  if (prev2.close < prev2.open && 
      Math.abs(prev.close - prev.open) < Math.abs(prev2.close - prev2.open) * 0.5 &&
      latest.close > latest.open &&
      latest.close > (prev2.open + prev2.close) / 2) {
    patterns.push({
      name: 'Morning Star',
      type: 'bullish',
      confidence: 0.9,
      description: 'Three-candle bullish reversal pattern',
      detectedAt: new Date(),
    });
  }

  // Evening Star
  if (prev2.close > prev2.open && 
      Math.abs(prev.close - prev.open) < Math.abs(prev2.close - prev2.open) * 0.5 &&
      latest.close < latest.open &&
      latest.close < (prev2.open + prev2.close) / 2) {
    patterns.push({
      name: 'Evening Star',
      type: 'bearish',
      confidence: 0.9,
      description: 'Three-candle bearish reversal pattern',
      detectedAt: new Date(),
    });
  }

  return patterns;
}

export function calculateSupportResistance(candles: any[], period: number = 20): { support: number[]; resistance: number[] } {
  if (candles.length < period) return { support: [], resistance: [] };

  const recentCandles = candles.slice(-period);
  const highs = recentCandles.map(c => c.high);
  const lows = recentCandles.map(c => c.low);
  
  // Simple pivot points
  const highestHigh = Math.max(...highs);
  const lowestLow = Math.min(...lows);
  const avgHigh = highs.reduce((sum, h) => sum + h, 0) / highs.length;
  const avgLow = lows.reduce((sum, l) => sum + l, 0) / lows.length;

  // Find local maxima and minima
  const resistance: number[] = [];
  const support: number[] = [];

  for (let i = 1; i < highs.length - 1; i++) {
    if (highs[i] > highs[i-1] && highs[i] > highs[i+1]) {
      resistance.push(highs[i]);
    }
    if (lows[i] < lows[i-1] && lows[i] < lows[i+1]) {
      support.push(lows[i]);
    }
  }

  // Sort and take top levels
  resistance.sort((a, b) => b - a);
  support.sort((a, b) => b - a);

  return {
    resistance: resistance.slice(0, 3),
    support: support.slice(0, 3),
  };
}

export function determineTrend(candles: any[], period: number = 20): 'uptrend' | 'downtrend' | 'sideways' {
  if (candles.length < period) return 'sideways';

  const recentCandles = candles.slice(-period);
  const closes = recentCandles.map(c => c.close);
  
  // Calculate simple moving average
  const sma = closes.reduce((sum, c) => sum + c, 0) / closes.length;
  
  // Count candles above and below SMA
  let above = 0;
  let below = 0;
  
  closes.forEach(close => {
    if (close > sma) above++;
    else if (close < sma) below++;
  });

  const currentPrice = closes[closes.length - 1];
  const startPrice = closes[0];
  const priceChange = (currentPrice - startPrice) / startPrice;

  if (above > below * 1.5 && priceChange > 0.02) {
    return 'uptrend';
  } else if (below > above * 1.5 && priceChange < -0.02) {
    return 'downtrend';
  }
  
  return 'sideways';
}

export function calculateVolatility(candles: any[], period: number = 14): 'low' | 'medium' | 'high' {
  if (candles.length < period) return 'medium';

  const recentCandles = candles.slice(-period);
  const returns = recentCandles.slice(1).map((c, i) => {
    const prevClose = recentCandles[i].close;
    return (c.close - prevClose) / prevClose;
  });

  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  // Annualized volatility
  const annualizedVol = stdDev * Math.sqrt(252);

  if (annualizedVol < 0.15) return 'low';
  if (annualizedVol > 0.35) return 'high';
  return 'medium';
}

export function generateAIAnalysis(symbol: string, candles: any[], indicators?: any): AIAnalysis {
  const patterns = analyzeCandlestickPatterns(candles);
  const { support, resistance } = calculateSupportResistance(candles);
  const trend = determineTrend(candles);
  const volatility = calculateVolatility(candles);

  // Calculate sentiment based on patterns and trend
  let bullishCount = patterns.filter(p => p.type === 'bullish').length;
  let bearishCount = patterns.filter(p => p.type === 'bearish').length;
  
  if (trend === 'uptrend') bullishCount += 2;
  if (trend === 'downtrend') bearishCount += 2;

  const totalSignals = bullishCount + bearishCount || 1;
  const sentimentScore = (bullishCount - bearishCount) / totalSignals;
  
  let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (sentimentScore > 0.3) sentiment = 'bullish';
  else if (sentimentScore < -0.3) sentiment = 'bearish';

  // Generate recommendation
  let recommendation: 'buy' | 'sell' | 'hold' = 'hold';
  if (sentiment === 'bullish' && patterns.some(p => p.confidence > 0.8)) {
    recommendation = 'buy';
  } else if (sentiment === 'bearish' && patterns.some(p => p.confidence > 0.8)) {
    recommendation = 'sell';
  }

  // Calculate target and stop loss
  const currentPrice = candles[candles.length - 1].close;
  let targetPrice: number | undefined;
  let stopLoss: number | undefined;
  let riskRewardRatio: number | undefined;

  if (recommendation === 'buy') {
    targetPrice = resistance.length > 0 ? resistance[0] : currentPrice * 1.05;
    stopLoss = support.length > 0 ? support[support.length - 1] : currentPrice * 0.95;
    riskRewardRatio = targetPrice && stopLoss ? (targetPrice - currentPrice) / (currentPrice - stopLoss) : undefined;
  } else if (recommendation === 'sell') {
    targetPrice = support.length > 0 ? support[support.length - 1] : currentPrice * 0.95;
    stopLoss = resistance.length > 0 ? resistance[0] : currentPrice * 1.05;
    riskRewardRatio = targetPrice && stopLoss ? (currentPrice - targetPrice) / (stopLoss - currentPrice) : undefined;
  }

  // Generate analysis text
  const analysisParts: string[] = [];
  if (patterns.length > 0) {
    analysisParts.push(`Detected ${patterns.length} candlestick pattern(s): ${patterns.map(p => p.name).join(', ')}.`);
  }
  analysisParts.push(`The stock is currently in a ${trend} with ${volatility} volatility.`);
  if (support.length > 0) {
    analysisParts.push(`Key support levels at ₹${support.join(', ₹')}.`);
  }
  if (resistance.length > 0) {
    analysisParts.push(`Key resistance levels at ₹${resistance.join(', ₹')}.`);
  }
  analysisParts.push(`Overall sentiment is ${sentiment} with a score of ${(sentimentScore * 100).toFixed(1)}%.`);

  return {
    symbol,
    patterns,
    sentiment,
    sentimentScore,
    supportLevels: support,
    resistanceLevels: resistance,
    trend,
    volatility,
    recommendation,
    targetPrice,
    stopLoss,
    riskRewardRatio,
    analysis: analysisParts.join(' '),
    generatedAt: new Date(),
  };
}
