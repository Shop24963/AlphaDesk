export interface PortfolioMetrics {
  totalValue: number;
  investedValue: number;
  absoluteReturn: number;
  percentageReturn: number;
  dayChange: number;
  dayChangePercent: number;
  xirr: number;
}

export interface RiskMetrics {
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  volatility: number;
  beta: number;
  alpha: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  avgTradeDuration: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
}

export function calculatePortfolioMetrics(holdings: any[], transactions: any[]): PortfolioMetrics {
  const totalValue = holdings.reduce((sum, h) => sum + (h.currentPrice * h.quantity), 0);
  const investedValue = holdings.reduce((sum, h) => sum + (h.avgPrice * h.quantity), 0);
  const absoluteReturn = totalValue - investedValue;
  const percentageReturn = investedValue > 0 ? (absoluteReturn / investedValue) * 100 : 0;

  // Calculate day change (simplified - would need previous close prices)
  const dayChange = holdings.reduce((sum, h) => {
    const prevClose = h.previousClose || h.currentPrice * 0.98;
    return sum + ((h.currentPrice - prevClose) * h.quantity);
  }, 0);
  const dayChangePercent = investedValue > 0 ? (dayChange / investedValue) * 100 : 0;

  // XIRR calculation (simplified)
  const xirr = calculateXIRR(transactions, totalValue);

  return {
    totalValue,
    investedValue,
    absoluteReturn,
    percentageReturn,
    dayChange,
    dayChangePercent,
    xirr,
  };
}

export function calculateRiskMetrics(trades: any[], equityCurve: number[]): RiskMetrics {
  if (trades.length === 0 || equityCurve.length < 2) {
    return {
      sharpeRatio: 0,
      sortinoRatio: 0,
      maxDrawdown: 0,
      maxDrawdownPercent: 0,
      volatility: 0,
      beta: 0,
      alpha: 0,
      winRate: 0,
      profitFactor: 0,
      avgWin: 0,
      avgLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      avgTradeDuration: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
    };
  }

  // Calculate returns
  const returns = equityCurve.slice(1).map((value, i) => {
    const prevValue = equityCurve[i];
    return (value - prevValue) / prevValue;
  });

  // Average return
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

  // Standard deviation (volatility)
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance) * Math.sqrt(252); // Annualized

  // Sharpe Ratio (assuming risk-free rate of 6%)
  const riskFreeRate = 0.06 / 252;
  const excessReturns = returns.map(r => r - riskFreeRate);
  const avgExcessReturn = excessReturns.reduce((sum, r) => sum + r, 0) / excessReturns.length;
  const sharpeRatio = volatility > 0 ? (avgExcessReturn * 252) / volatility : 0;

  // Sortino Ratio (only downside deviation)
  const downsideReturns = returns.filter(r => r < 0);
  const downsideVariance = downsideReturns.length > 0
    ? downsideReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / downsideReturns.length
    : 0;
  const downsideDeviation = Math.sqrt(downsideVariance) * Math.sqrt(252);
  const sortinoRatio = downsideDeviation > 0 ? (avgReturn * 252) / downsideDeviation : 0;

  // Max Drawdown
  let peak = equityCurve[0];
  let maxDrawdown = 0;
  equityCurve.forEach(value => {
    if (value > peak) peak = value;
    const drawdown = (peak - value) / peak;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  });

  // Trade analysis
  const winningTrades = trades.filter(t => t.pnl > 0);
  const losingTrades = trades.filter(t => t.pnl <= 0);
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  const grossProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));

  return {
    sharpeRatio,
    sortinoRatio,
    maxDrawdown,
    maxDrawdownPercent: maxDrawdown * 100,
    volatility: volatility * 100,
    beta: 1.0, // Simplified - would need benchmark data
    alpha: 0, // Simplified - would need benchmark data
    winRate: trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit,
    avgWin: winningTrades.length > 0 ? grossProfit / winningTrades.length : 0,
    avgLoss: losingTrades.length > 0 ? grossLoss / losingTrades.length : 0,
    largestWin: winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnl)) : 0,
    largestLoss: losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnl)) : 0,
    avgTradeDuration: 0, // Would need entry/exit timestamps
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
  };
}

function calculateXIRR(transactions: any[], currentValue: number): number {
  if (transactions.length === 0) return 0;

  // Simplified XIRR calculation
  const totalInvested = transactions
    .filter(t => t.type === 'BUY')
    .reduce((sum, t) => sum + (t.price * t.quantity), 0);

  const totalReturned = transactions
    .filter(t => t.type === 'SELL')
    .reduce((sum, t) => sum + (t.price * t.quantity), 0);

  const netReturn = currentValue + totalReturned - totalInvested;
  const years = 1; // Simplified assumption
  return totalInvested > 0 ? (netReturn / totalInvested) / years * 100 : 0;
}

export function calculateCorrelation(returns1: number[], returns2: number[]): number {
  if (returns1.length !== returns2.length || returns1.length === 0) return 0;

  const n = returns1.length;
  const mean1 = returns1.reduce((sum, r) => sum + r, 0) / n;
  const mean2 = returns2.reduce((sum, r) => sum + r, 0) / n;

  let covariance = 0;
  let variance1 = 0;
  let variance2 = 0;

  for (let i = 0; i < n; i++) {
    const diff1 = returns1[i] - mean1;
    const diff2 = returns2[i] - mean2;
    covariance += diff1 * diff2;
    variance1 += diff1 * diff1;
    variance2 += diff2 * diff2;
  }

  const denominator = Math.sqrt(variance1 * variance2);
  return denominator > 0 ? covariance / denominator : 0;
}
