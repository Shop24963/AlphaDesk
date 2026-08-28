import mongoose, { Document, Schema } from 'mongoose';

export interface IAlert extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  type: 'price' | 'indicator' | 'news' | 'custom';
  symbol: string;
  exchange: string;
  condition: {
    field: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'cross_above' | 'cross_below';
    value: number;
  };
  triggerPrice?: number;
  isActive: boolean;
  triggeredAt?: Date;
  expiresAt?: Date;
  notifyVia: ('email' | 'sms' | 'push' | 'webhook')[];
  webhookUrl?: string;
  message?: string;
  triggeredCount: number;
  maxTriggers?: number;
  lastTriggeredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const alertSchema = new Schema<IAlert>(
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
    type: {
      type: String,
      required: true,
      enum: ['price', 'indicator', 'news', 'custom'],
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
      uppercase: true,
    },
    condition: {
      field: { type: String, required: true },
      operator: {
        type: String,
        required: true,
        enum: ['gt', 'lt', 'eq', 'gte', 'lte', 'cross_above', 'cross_below'],
      },
      value: { type: Number, required: true },
    },
    triggerPrice: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    triggeredAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    notifyVia: {
      type: [String],
      enum: ['email', 'sms', 'push', 'webhook'],
      default: ['push'],
    },
    webhookUrl: {
      type: String,
    },
    message: {
      type: String,
      maxlength: 500,
    },
    triggeredCount: {
      type: Number,
      default: 0,
    },
    maxTriggers: {
      type: Number,
      default: 1,
    },
    lastTriggeredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

alertSchema.index({ user: 1, isActive: 1 });
alertSchema.index({ symbol: 1, exchange: 1 });
alertSchema.methods.shouldNotify = function () {
  if (!this.isActive) return false;
  if (this.maxTriggers && this.triggeredCount >= this.maxTriggers) return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  return true;
};

export const Alert = mongoose.model<IAlert>('Alert', alertSchema);
