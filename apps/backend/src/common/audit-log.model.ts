import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  entity: string;
  entityId?: mongoose.Types.ObjectId;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'create',
        'read',
        'update',
        'delete',
        'login',
        'logout',
        'password_change',
        'permission_change',
        'settings_change',
      ],
    },
    entity: {
      type: String,
      required: true,
      index: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    changes: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });

// Static method to create audit log entry
auditLogSchema.statics.log = async function (data: {
  userId: mongoose.Types.ObjectId;
  action: string;
  entity: string;
  entityId?: mongoose.Types.ObjectId;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}) {
  return this.create(data);
};

// Static method to get logs for an entity
auditLogSchema.statics.getEntityLogs = async function (
  entity: string,
  entityId: mongoose.Types.ObjectId,
  limit: number = 50
) {
  return this.find({ entity, entityId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'email name');
};

// Static method to get user activity
auditLogSchema.statics.getUserActivity = async function (
  userId: mongoose.Types.ObjectId,
  days: number = 30
) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return this.find({
    userId,
    createdAt: { $gte: startDate },
  })
    .sort({ createdAt: -1 })
    .limit(100);
};

// TTL index to auto-delete old logs (optional, e.g., after 90 days)
// Uncomment if you want automatic cleanup
// auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
