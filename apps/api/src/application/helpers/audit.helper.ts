import { IAuditLogRepository } from '../../domain/interfaces/repositories';

export class AuditHelper {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async log(params: {
    userId: string;
    action: string;
    entityType: string;
    entityId?: string;
    changes?: { before?: Record<string, unknown>; after?: Record<string, unknown> };
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.auditLogRepository.create(params);
  }
}
