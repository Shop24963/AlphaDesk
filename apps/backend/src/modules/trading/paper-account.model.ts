import mongoose, { Document, Schema } from 'mongoose';

export interface IPaperAccount extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  balance: {
    cash: number;
    invested: number;
    total: number;
    dayProfit: number;
    totalProfit: number;
  };
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
  }[];
  orders: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const paperAccountSchema = new Schema<IPaperAccount>(
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
      default: 'Paper Trading Account',
    },
    description: {
      type: String,
      maxlength: 500,
    },
    balance: {
      cash: { type: Number, default: 1000000 },
      invested: { type: Number, default: 0 },
      total: { type: Number, default: 1000000 },
      dayProfit: { type: Number, default: 0 },
      totalProfit: { type: Number, default: 0 },
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
      },
    ],
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Trade',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

paperAccountSchema.index({ user: 1, isActive: 1 });

export const PaperAccount = mongoose.model<IPaperAccount>('PaperAccount', paperAccountSchema);
