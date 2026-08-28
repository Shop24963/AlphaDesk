import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: 'alert' | 'system' | 'trade' | 'strategy' | 'portfolio';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  readAt?: Date;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['alert', 'system', 'trade', 'strategy', 'portfolio'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    actionUrl: {
      type: String,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, createdAt: -1 });

// Method to mark as read
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to mark all as read for a user
notificationSchema.statics.markAllAsRead = async function (userId: mongoose.Types.ObjectId) {
  return this.updateMany(
    { user: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
};

export const Notification = mongoose.model<INotification>(
  'Notification',
  notificationSchema
);
