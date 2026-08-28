import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  user: mongoose.Types.ObjectId;
  portfolio: mongoose.Types.ObjectId;
  type: 'buy' | 'sell';
  symbol: string;
  exchange: string;
  quantity: number;
  price: number;
  totalValue: number;
  charges: {
    brokerage: number;
    stt: number;
    transactionCharge: number;
    gst: number;
    stampDuty: number;
    sebiTurnoverFee: number;
    total: number;
  };
  netAmount: number;
  orderId?: string;
  tradeId?: string;
  strategy?: mongoose.Types.ObjectId;
  notes?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    portfolio: {
      type: Schema.Types.ObjectId,
      ref: 'Portfolio',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['buy', 'sell'],
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
    },
    exchange: {
      type: String,
      required: true,
      enum: ['NSE', 'BSE'],
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    totalValue: {
      type: Number,
      required: true,
      min: 0,
    },
    charges: {
      brokerage: { type: Number, default: 0 },
      stt: { type: Number, default: 0 },
      transactionCharge: { type: Number, default: 0 },
      gst: { type: Number, default: 0 },
      stampDuty: { type: Number, default: 0 },
      sebiTurnoverFee: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    netAmount: {
      type: Number,
      required: true,
    },
    orderId: {
      type: String,
    },
    tradeId: {
      type: String,
    },
    strategy: {
      type: Schema.Types.ObjectId,
      ref: 'Strategy',
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
    tags: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ user: 1, symbol: 1 });
transactionSchema.index({ portfolio: 1, createdAt: -1 });
transactionSchema.index({ type: 1, createdAt: -1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
