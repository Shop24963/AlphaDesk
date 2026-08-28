import mongoose, { Document, Schema } from 'mongoose';

export interface IBacktest extends Document {
  user: mongoose.Types.ObjectId;
  strategy: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  settings: {
    startDate: Date;
    endDate: Date;
    initialCapital: number;
    positionSize?: number;
    stopLossPercent?: number;
    targetPercent?: number;
    maxPositions?: number;
    transactionCost?: number;
    slippage?: number;
  };
  results: {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    profitFactor: number;
    totalReturn: number;
    totalReturnPercent: number;
    maxDrawdown: number;
    maxDrawdownPercent: number;
    avgWin: number;
    avgLoss: number;
    avgTradeDuration?: number;
    sharpeRatio?: number;
    sortinoRatio?: number;
    calmarRatio?: number;
    expectancy?: number;
  };
  trades: {
    entryDate: Date;
    exitDate?: Date;
    symbol: string;
    exchange: string;
    direction: 'long' | 'short';
    entryPrice: number;
    exitPrice?: number;
    quantity: number;
    pnl: number;
    pnlPercent: number;
    exitReason?: string;
    mae?: number;
    mfe?: number;
  }[];
  equityCurve: {
    date: Date;
    equity: number;
    drawdown: number;
  }[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const backtestSchema = new Schema<IBacktest>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    strategy: {
      type: Schema.Types.ObjectId,
      ref: 'Strategy',
      required: true,
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
    settings: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      initialCapital: { type: Number, required: true, min: 0 },
      positionSize: { type: Number, min: 0, max: 100 },
      stopLossPercent: { type: Number, min: 0, max: 100 },
      targetPercent: { type: Number, min: 0, max: 100 },
      maxPositions: { type: Number, min: 1 },
      transactionCost: { type: Number, default: 0, min: 0 },
      slippage: { type: Number, default: 0, min: 0 },
    },
    results: {
      totalTrades: { type: Number, default: 0 },
      winningTrades: { type: Number, default: 0 },
      losingTrades: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 },
      profitFactor: { type: Number, default: 0 },
      totalReturn: { type: Number, default: 0 },
      totalReturnPercent: { type: Number, default: 0 },
      maxDrawdown: { type: Number, default: 0 },
      maxDrawdownPercent: { type: Number, default: 0 },
      avgWin: { type: Number, default: 0 },
      avgLoss: { type: Number, default: 0 },
      avgTradeDuration: { type: Number },
      sharpeRatio: { type: Number },
      sortinoRatio: { type: Number },
      calmarRatio: { type: Number },
      expectancy: { type: Number },
    },
    trades: [
      {
        entryDate: { type: Date, required: true },
        exitDate: { type: Date },
        symbol: { type: String, required: true },
        exchange: { type: String, required: true },
        direction: { type: String, enum: ['long', 'short'], required: true },
        entryPrice: { type: Number, required: true },
        exitPrice: { type: Number },
        quantity: { type: Number, required: true },
        pnl: { type: Number, default: 0 },
        pnlPercent: { type: Number, default: 0 },
        exitReason: { type: String },
        mae: { type: Number },
        mfe: { type: Number },
      },
    ],
    equityCurve: [
      {
        date: { type: Date, required: true },
        equity: { type: Number, required: true },
        drawdown: { type: Number, default: 0 },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed'],
      default: 'pending',
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

backtestSchema.index({ user: 1, strategy: 1 });
backtestSchema.index({ status: 1, createdAt: -1 });

export const Backtest = mongoose.model<IBacktest>('Backtest', backtestSchema);
