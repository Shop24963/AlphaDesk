import mongoose, { Document, Schema } from 'mongoose';

export interface IStrategy extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  type: 'manual' | 'automated';
  category: 'swing' | 'positional' | 'intraday' | 'longterm' | 'scalping';
  timeframe: string;
  rules: {
    entry: any[];
    exit: any[];
    stopLoss: any;
    targets?: any[];
  };
  indicators?: Record<string, any>;
  riskManagement: {
    positionSize?: number;
    maxRiskPerTrade?: number;
    maxPositions?: number;
    stopLossPercent?: number;
  };
  isActive: boolean;
  isPublic: boolean;
  version: number;
  backtestStats?: {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    profitFactor: number;
    maxDrawdown: number;
    avgReturn: number;
    sharpeRatio?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const strategySchema = new Schema<IStrategy>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    type: {
      type: String,
      required: true,
      enum: ['manual', 'automated'],
    },
    category: {
      type: String,
      required: true,
      enum: ['swing', 'positional', 'intraday', 'longterm', 'scalping'],
    },
    timeframe: {
      type: String,
      required: true,
    },
    rules: {
      entry: [{ type: Schema.Types.Mixed }],
      exit: [{ type: Schema.Types.Mixed }],
      stopLoss: { type: Schema.Types.Mixed },
      targets: [{ type: Schema.Types.Mixed }],
    },
    indicators: {
      type: Schema.Types.Mixed,
    },
    riskManagement: {
      positionSize: { type: Number, min: 0, max: 100 },
      maxRiskPerTrade: { type: Number, min: 0, max: 100 },
      maxPositions: { type: Number, min: 1 },
      stopLossPercent: { type: Number, min: 0, max: 100 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    version: {
      type: Number,
      default: 1,
    },
    backtestStats: {
      totalTrades: { type: Number, default: 0 },
      winningTrades: { type: Number, default: 0 },
      losingTrades: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 },
      profitFactor: { type: Number, default: 0 },
      maxDrawdown: { type: Number, default: 0 },
      avgReturn: { type: Number, default: 0 },
      sharpeRatio: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

strategySchema.index({ user: 1, isActive: 1 });
strategySchema.index({ category: 1, isPublic: 1 });

export const Strategy = mongoose.model<IStrategy>('Strategy', strategySchema);
