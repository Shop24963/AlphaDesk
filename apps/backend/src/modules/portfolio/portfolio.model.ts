import mongoose, { Document, Schema } from 'mongoose';

export interface IPortfolio extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  type: 'live' | 'paper' | 'model';
  totalValue: number;
  investedValue: number;
  currentValue: number;
  totalProfit: number;
  totalProfitPercent: number;
  dayProfit: number;
  dayProfitPercent: number;
  holdings: {
    symbol: string;
    exchange: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    investedValue: number;
    currentValue: number;
    profit: number;
    profitPercent: number;
    dayChange: number;
    dayChangePercent: number;
    allocation: number;
  }[];
  transactions: mongoose.Types.ObjectId[];
  riskMetrics: {
    beta?: number;
    volatility?: number;
    sharpeRatio?: number;
    maxDrawdown?: number;
    var95?: number;
  };
  sectorAllocation: Record<string, number>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const portfolioSchema = new Schema<IPortfolio>(
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
      maxlength: 500,
    },
    type: {
      type: String,
      required: true,
      enum: ['live', 'paper', 'model'],
      default: 'live',
    },
    totalValue: {
      type: Number,
      default: 0,
    },
    investedValue: {
      type: Number,
      default: 0,
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    totalProfit: {
      type: Number,
      default: 0,
    },
    totalProfitPercent: {
      type: Number,
      default: 0,
    },
    dayProfit: {
      type: Number,
      default: 0,
    },
    dayProfitPercent: {
      type: Number,
      default: 0,
    },
    holdings: [
      {
        symbol: { type: String, required: true },
        exchange: { type: String, required: true, enum: ['NSE', 'BSE'] },
        quantity: { type: Number, required: true, min: 0 },
        averagePrice: { type: Number, required: true, min: 0 },
        currentPrice: { type: Number, default: 0 },
        investedValue: { type: Number, default: 0 },
        currentValue: { type: Number, default: 0 },
        profit: { type: Number, default: 0 },
        profitPercent: { type: Number, default: 0 },
        dayChange: { type: Number, default: 0 },
        dayChangePercent: { type: Number, default: 0 },
        allocation: { type: Number, default: 0 },
      },
    ],
    transactions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Transaction',
      },
    ],
    riskMetrics: {
      beta: { type: Number },
      volatility: { type: Number },
      sharpeRatio: { type: Number },
      maxDrawdown: { type: Number },
      var95: { type: Number },
    },
    sectorAllocation: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

portfolioSchema.index({ user: 1, type: 1 });

export const Portfolio = mongoose.model<IPortfolio>('Portfolio', portfolioSchema);
