import { AuditLogModel } from '../models/audit-log.model';
import {
  IAuditLogRepository,
  CreateAuditLogData,
} from '../../../domain/interfaces/repositories';
import { AuditLogEntity } from '../../../domain/entities';

function mapAuditLog(doc: InstanceType<typeof AuditLogModel>): AuditLogEntity {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    action: doc.action,
    entityType: doc.entityType,
    entityId: doc.entityId?.toString(),
    changes: doc.changes,
    metadata: doc.metadata,
    ipAddress: doc.ipAddress,
    userAgent: doc.userAgent,
    createdAt: doc.createdAt,
  };
}

export class AuditLogRepository implements IAuditLogRepository {
  async create(data: CreateAuditLogData): Promise<AuditLogEntity> {
    const doc = await AuditLogModel.create(data);
    return mapAuditLog(doc);
  }

  async findAll(options: {
    page: number;
    limit: number;
    userId?: string;
    entityType?: string;
  }): Promise<{ logs: AuditLogEntity[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (options.userId) filter.userId = options.userId;
    if (options.entityType) filter.entityType = options.entityType;

    const skip = (options.page - 1) * options.limit;

    const [docs, total] = await Promise.all([
      AuditLogModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(options.limit)
        .exec(),
      AuditLogModel.countDocuments(filter).exec(),
    ]);

    return {
      logs: docs.map(mapAuditLog),
      total,
    };
  }
}
