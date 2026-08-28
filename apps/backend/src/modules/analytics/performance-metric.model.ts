import mongoose, { Document, Schema } from 'mongoose';

export interface IPerformanceMetric extends Document {
  user: mongoose.Types.ObjectId;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate: Date;
  metrics: {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    totalPnL: number;
    totalProfit: number;
    totalLoss: number;
    averageWin: number;
    averageLoss: number;
    profitFactor: number;
    largestWin: number;
    largestLoss: number;
    averageHoldingPeriod: number; // in days
    maxDrawdown: number;
    sharpeRatio?: number;
    sortinoRatio?: number;
    expectancy: number;
    consecutiveWins: number;
    consecutiveLosses: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const performanceMetricSchema = new Schema<IPerformanceMetric>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    metrics: {
      totalTrades: { type: Number, default: 0 },
      winningTrades: { type: Number, default: 0 },
      losingTrades: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 },
      totalPnL: { type: Number, default: 0 },
      totalProfit: { type: Number, default: 0 },
      totalLoss: { type: Number, default: 0 },
      averageWin: { type: Number, default: 0 },
      averageLoss: { type: Number, default: 0 },
      profitFactor: { type: Number, default: 0 },
      largestWin: { type: Number, default: 0 },
      largestLoss: { type: Number, default: 0 },
      averageHoldingPeriod: { type: Number, default: 0 },
      maxDrawdown: { type: Number, default: 0 },
      sharpeRatio: { type: Number },
      sortinoRatio: { type: Number },
      expectancy: { type: Number, default: 0 },
      consecutiveWins: { type: Number, default: 0 },
      consecutiveLosses: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying
performanceMetricSchema.index({ user: 1, period: 1, startDate: -1 });

export const PerformanceMetric = mongoose.model<IPerformanceMetric>(
  'PerformanceMetric',
  performanceMetricSchema
);
