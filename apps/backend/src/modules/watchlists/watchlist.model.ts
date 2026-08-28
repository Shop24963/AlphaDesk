import mongoose, { Document, Schema } from 'mongoose';

export interface IWatchlist extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  symbols: string[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const watchlistSchema = new Schema<IWatchlist>(
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
      trim: true,
      maxlength: 500,
    },
    symbols: {
      type: [String],
      default: [],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

watchlistSchema.index({ user: 1, name: 1 }, { unique: true });

export const Watchlist = mongoose.model<IWatchlist>('Watchlist', watchlistSchema);
