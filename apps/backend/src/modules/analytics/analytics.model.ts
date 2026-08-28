import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['portfolio', 'strategy', 'trade', 'risk'],
    required: true,
  },
  metrics: {
    sharpeRatio: Number,
    sortinoRatio: Number,
    maxDrawdown: Number,
    volatility: Number,
    winRate: Number,
    profitFactor: Number,
    alpha: Number,
    beta: Number,
    correlation: Map<String, Number>,
    sectorAllocation: Map<String, Number>,
    riskExposure: Number,
  },
  period: {
    start: Date,
    end: Date,
  },
  snapshot: {
    totalValue: Number,
    investedValue: Number,
    absoluteReturn: Number,
    percentageReturn: Number,
    dayChange: Number,
  },
}, {
  timestamps: true,
});

analyticsSchema.index({ userId: 1, type: 1, createdAt: -1 });

export const Analytics = mongoose.model('Analytics', analyticsSchema);
