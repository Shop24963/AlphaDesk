import mongoose, { Document, Schema } from 'mongoose';
import { Instrument as InstrumentType } from './types';

export interface IInstrument extends Document {
  _id: mongoose.Types.ObjectId;
  symbol: string;
  exchange: 'NSE' | 'BSE' | 'NFO' | 'BFO';
  instrumentType: 'EQ' | 'FUT' | 'OPT' | 'IDX';
  name: string;
  segment: string;
  lotSize: number;
  tickSize: number;
  strikePrice?: number;
  expiryDate?: string;
  isin?: string;
  series: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

const instrumentSchema = new Schema<IInstrument>(
  {
    symbol: { type: String, required: true, index: true },
    exchange: { 
      type: String, 
      required: true, 
      enum: ['NSE', 'BSE', 'NFO', 'BFO'],
      index: true,
    },
    instrumentType: { 
      type: String, 
      required: true, 
      enum: ['EQ', 'FUT', 'OPT', 'IDX'],
      index: true,
    },
    name: { type: String, required: true },
    segment: { type: String, required: true },
    lotSize: { type: Number, default: 1 },
    tickSize: { type: Number, default: 0.05 },
    strikePrice: { type: Number },
    expiryDate: { type: String, index: true },
    isin: { type: String, unique: true, sparse: true },
    series: { type: String, default: 'EQ' },
    status: { 
      type: String, 
      enum: ['active', 'inactive', 'suspended'], 
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for efficient queries
instrumentSchema.index({ exchange: 1, instrumentType: 1, status: 1 });
instrumentSchema.index({ symbol: 1, exchange: 1 }, { unique: true });
instrumentSchema.index({ expiryDate: 1 }, { sparse: true });

// Virtual for full symbol
instrumentSchema.virtual('fullSymbol').get(function() {
  return `${this.exchange}:${this.symbol}`;
});

export const InstrumentModel = mongoose.model<IInstrument>('Instrument', instrumentSchema);
