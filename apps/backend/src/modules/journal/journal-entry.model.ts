import mongoose, { Document, Schema } from 'mongoose';

export interface IJournalEntry extends Document {
  user: mongoose.Types.ObjectId;
  date: Date;
  type: 'trade' | 'observation' | 'lesson' | 'review';
  title: string;
  content: string;
  tags: string[];
  relatedStocks?: string[];
  relatedTrade?: mongoose.Types.ObjectId;
  emotions?: {
    before: string[];
    after: string[];
  };
  rating?: number; // 1-5
  lessonsLearned?: string;
  screenshots?: string[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const journalEntrySchema = new Schema<IJournalEntry>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ['trade', 'observation', 'lesson', 'review'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    relatedStocks: {
      type: [String],
      default: [],
    },
    relatedTrade: {
      type: Schema.Types.ObjectId,
      ref: 'Trade',
    },
    emotions: {
      before: [String],
      after: [String],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    lessonsLearned: {
      type: String,
    },
    screenshots: {
      type: [String],
      default: [],
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient querying
journalEntrySchema.index({ user: 1, date: -1 });
journalEntrySchema.index({ user: 1, type: 1 });
journalEntrySchema.index({ tags: 1 });
journalEntrySchema.index({ relatedStocks: 1 });

// Virtual for week number
journalEntrySchema.virtual('weekNumber').get(function () {
  const date = this.date as Date;
  const oneJan = new Date(date.getFullYear(), 0, 1);
  const numberOfDays = Math.floor((date.getTime() - oneJan.getTime()) / 86400000);
  return Math.ceil((date.getDay() + 1 + numberOfDays) / 7);
});

export const JournalEntry = mongoose.model<IJournalEntry>(
  'JournalEntry',
  journalEntrySchema
);
