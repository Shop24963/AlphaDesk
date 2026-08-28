import { Analytics } from './analytics.model';
import { Portfolio } from '../portfolio/portfolio.model';
import { Transaction } from '../portfolio/transaction.model';
import { Trade } from '../trading/trade.model';

interface RiskMetrics {
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  volatility: number;
  winRate: number;
  profitFactor: number;
}

export async function calculatePortfolioAnalytics(userId: string): Promise<RiskMetrics> {
  const portfolio = await Portfolio.findOne({ userId });
  if (!portfolio) {
    return {
      sharpeRatio: 0,
      sortinoRatio: 0,
      maxDrawdown: 0,
      volatility: 0,
      winRate: 0,
      profitFactor: 0,
    };
  }

  const transactions = await Transaction.find({ portfolio: portfolio._id }).sort({ date: 1 });
  const trades = await Trade.find({ userId }).sort({ exitDate: 1 });

  // Calculate equity curve from transactions
  const equityCurve: number[] = [];
  let currentValue = 0;
  
  for (const tx of transactions) {
    if (tx.type === 'BUY') {
      currentValue -= tx.price * tx.quantity;
    } else {
      currentValue += tx.price * tx.quantity;
    }
    equityCurve.push(currentValue);
  }

  // Add current portfolio value
  const holdings = await Portfolio.aggregate([
    { $match: { _id: portfolio._id } },
    { $unwind: '$holdings' },
    { $group: { 
      _id: null, 
      totalValue: { $sum: { $multiply: ['$holdings.quantity', '$holdings.currentPrice'] } }
    }}
  ]);
  
  const currentPortfolioValue = holdings.length > 0 ? holdings[0].totalValue : 0;
  equityCurve.push(currentValue + currentPortfolioValue);

  // Calculate returns
  if (equityCurve.length < 2) {
    return {
      sharpeRatio: 0,
      sortinoRatio: 0,
      maxDrawdown: 0,
      volatility: 0,
      winRate: 0,
      profitFactor: 0,
    };
  }

  const returns = equityCurve.slice(1).map((value, i) => {
    const prevValue = equityCurve[i];
    return prevValue !== 0 ? (value - prevValue) / Math.abs(prevValue) : 0;
  });

  // Average return
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

  // Volatility
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance) * Math.sqrt(252);

  // Sharpe Ratio
  const riskFreeRate = 0.06 / 252;
  const excessReturns = returns.map(r => r - riskFreeRate);
  const avgExcessReturn = excessReturns.reduce((sum, r) => sum + r, 0) / excessReturns.length;
  const sharpeRatio = volatility > 0 ? (avgExcessReturn * 252) / volatility : 0;

  // Sortino Ratio
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
    const drawdown = peak > 0 ? (peak - value) / peak : 0;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  });

  // Trade analysis
  const winningTrades = trades.filter(t => t.pnl > 0);
  const losingTrades = trades.filter(t => t.pnl <= 0);
  const grossProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));

  return {
    sharpeRatio,
    sortinoRatio,
    maxDrawdown,
    volatility: volatility * 100,
    winRate: trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit,
  };
}

export async function saveAnalytics(
  userId: string,
  type: 'portfolio' | 'strategy' | 'trade' | 'risk',
  metrics: any,
  period?: { start: Date; end: Date }
) {
  const analytics = new Analytics({
    userId,
    type,
    metrics,
    period,
  });
  
  await analytics.save();
  return analytics;
}

export async function getAnalyticsHistory(
  userId: string,
  type?: string,
  limit: number = 30
) {
  const query: any = { userId };
  if (type) query.type = type;
  
  return await Analytics.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);
}
