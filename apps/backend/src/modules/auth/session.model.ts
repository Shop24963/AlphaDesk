import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  createdAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient cleanup and queries
sessionSchema.index({ userId: 1, expiresAt: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-cleanup

// Static method to find valid sessions
sessionSchema.statics.findValidSessions = async function (userId: mongoose.Types.ObjectId) {
  return this.find({
    userId,
    expiresAt: { $gt: new Date() },
  });
};

// Static method to delete expired sessions
sessionSchema.statics.deleteExpiredSessions = async function () {
  return this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
};

export const Session = mongoose.model<ISession>('Session', sessionSchema);
