import { db } from '../db/connection.js';
import { AuditLog } from '../types/index.js';

export class AuditService {
  public async getRecentLogs(limit = 50): Promise<AuditLog[]> {
    return await db.query<AuditLog>(
      `SELECT id, user_id, action, entity_type, entity_id, details, ip_address, created_at
       FROM audit_logs
       ORDER BY id DESC
       LIMIT ?`,
      [limit]
    );
  }

  public async log(data: {
    userId?: number | null;
    action: string;
    entityType: string;
    entityId?: number | null;
    details?: string | object;
    ipAddress?: string;
  }): Promise<void> {
    const detailsStr = typeof data.details === 'object' ? JSON.stringify(data.details) : data.details || null;
    await db.execute(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.userId || null, data.action, data.entityType, data.entityId || null, detailsStr, data.ipAddress || null]
    );
  }
}

export const auditService = new AuditService();
