import mongoose, { Document, Schema } from 'mongoose';

export interface ITrade extends Document {
  user: mongoose.Types.ObjectId;
  account: mongoose.Types.ObjectId;
  strategy?: mongoose.Types.ObjectId;
  symbol: string;
  exchange: string;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'sl' | 'slm';
  quantity: number;
  price?: number;
  triggerPrice?: number;
  status: 'pending' | 'open' | 'executed' | 'cancelled' | 'rejected';
  filledQuantity: number;
  averagePrice: number;
  orderId?: string;
  exchangeOrderId?: string;
  entryDate?: Date;
  exitDate?: Date;
  pnl?: number;
  pnlPercent?: number;
  charges?: {
    brokerage: number;
    stt: number;
    transactionCharge: number;
    gst: number;
    stampDuty: number;
    total: number;
  };
  stopLoss?: number;
  target?: number;
  notes?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const tradeSchema = new Schema<ITrade>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    account: {
      type: Schema.Types.ObjectId,
      ref: 'PaperAccount',
      required: true,
    },
    strategy: {
      type: Schema.Types.ObjectId,
      ref: 'Strategy',
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
    type: {
      type: String,
      required: true,
      enum: ['buy', 'sell'],
    },
    orderType: {
      type: String,
      required: true,
      enum: ['market', 'limit', 'sl', 'slm'],
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      min: 0,
    },
    triggerPrice: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'open', 'executed', 'cancelled', 'rejected'],
      default: 'pending',
    },
    filledQuantity: {
      type: Number,
      default: 0,
    },
    averagePrice: {
      type: Number,
      default: 0,
    },
    orderId: {
      type: String,
    },
    exchangeOrderId: {
      type: String,
    },
    entryDate: {
      type: Date,
    },
    exitDate: {
      type: Date,
    },
    pnl: {
      type: Number,
    },
    pnlPercent: {
      type: Number,
    },
    charges: {
      brokerage: { type: Number, default: 0 },
      stt: { type: Number, default: 0 },
      transactionCharge: { type: Number, default: 0 },
      gst: { type: Number, default: 0 },
      stampDuty: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    stopLoss: {
      type: Number,
    },
    target: {
      type: Number,
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
    tags: {
      type: [String],
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

tradeSchema.index({ user: 1, status: 1 });
tradeSchema.index({ symbol: 1, exchange: 1 });
tradeSchema.index({ account: 1, createdAt: -1 });

export const Trade = mongoose.model<ITrade>('Trade', tradeSchema);
