import mongoose, { Document, Schema } from 'mongoose';

export interface IStock extends Document {
  symbol: string;
  exchange: string;
  name: string;
  sector?: string;
  industry?: string;
  marketCap?: number;
  peRatio?: number;
  pbRatio?: number;
  dividendYield?: number;
  eps?: number;
  bookValue?: number;
  faceValue?: number;
  isin?: string;
  series?: string;
  listingDate?: Date;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const stockSchema = new Schema<IStock>(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    exchange: {
      type: String,
      required: true,
      enum: ['NSE', 'BSE'],
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sector: {
      type: String,
      trim: true,
      index: true,
    },
    industry: {
      type: String,
      trim: true,
      index: true,
    },
    marketCap: {
      type: Number,
      min: 0,
    },
    peRatio: {
      type: Number,
      min: 0,
    },
    pbRatio: {
      type: Number,
      min: 0,
    },
    dividendYield: {
      type: Number,
      min: 0,
      max: 100,
    },
    eps: {
      type: Number,
    },
    bookValue: {
      type: Number,
    },
    faceValue: {
      type: Number,
    },
    isin: {
      type: String,
      uppercase: true,
      unique: true,
      sparse: true,
    },
    series: {
      type: String,
      default: 'EQ',
      uppercase: true,
    },
    listingDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

stockSchema.index({ symbol: 1, exchange: 1 }, { unique: true });
stockSchema.index({ name: 'text' });
stockSchema.index({ sector: 1, industry: 1 });

export const Stock = mongoose.model<IStock>('Stock', stockSchema);
