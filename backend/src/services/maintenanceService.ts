import { db } from '../db/connection.js';
import { MaintenanceRequest, MaintenanceCategory, RequestStatus, RequestPriority } from '../types/index.js';

export class MaintenanceService {
  public async getCategories(): Promise<MaintenanceCategory[]> {
    return await db.query<MaintenanceCategory>(
      'SELECT id, name, default_priority, description FROM maintenance_categories ORDER BY id ASC'
    );
  }

  public async getMyRequests(userId: number): Promise<MaintenanceRequest[]> {
    return await db.query<MaintenanceRequest>(
      `SELECT r.id, r.user_id, r.house_id, r.category_id, r.problem, r.description,
              r.priority, r.status, r.admin_notes, r.resolved_at, r.created_at, r.updated_at
       FROM maintenance_requests r
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [userId]
    );
  }

  public async getMyPendingRequests(userId: number): Promise<MaintenanceRequest[]> {
    return await db.query<MaintenanceRequest>(
      `SELECT r.id, r.user_id, r.house_id, r.category_id, r.problem, r.description,
              r.priority, r.status, r.admin_notes, r.resolved_at, r.created_at, r.updated_at
       FROM maintenance_requests r
       WHERE r.user_id = ? AND r.status = 'pending'
       ORDER BY r.created_at DESC`,
      [userId]
    );
  }

  public async submitRequest(
    userId: number,
    facultyId: number,
    data: {
      categoryId: number;
      problem: string;
      description: string;
      priority?: RequestPriority;
    }
  ): Promise<{ id: number }> {
    // 1. Find resident's active allocated house
    const tenancies = await db.query(
      `SELECT house_id FROM tenancies WHERE faculty_id = ? AND end_date IS NULL`,
      [facultyId]
    );

    if (!tenancies.length) {
      throw new Error('You do not have an active house tenancy. Only residents can submit maintenance tickets.');
    }

    const houseId = tenancies[0].house_id;

    // 2. Validate category
    const categories = await db.query<MaintenanceCategory>(
      `SELECT id, name, default_priority FROM maintenance_categories WHERE id = ?`,
      [data.categoryId]
    );

    const priority = data.priority || (categories.length ? categories[0].default_priority : 'medium');
    const problemName = data.problem || (categories.length ? categories[0].name : 'General Maintenance');

    // 3. Insert request
    const result = await db.execute(
      `INSERT INTO maintenance_requests (user_id, house_id, category_id, problem, description, priority, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, houseId, data.categoryId, problemName, data.description, priority]
    );

    return { id: result.insertId };
  }

  public async cancelRequest(requestId: number, userId: number): Promise<void> {
    const requests = await db.query<MaintenanceRequest>(
      `SELECT id, user_id, status FROM maintenance_requests WHERE id = ?`,
      [requestId]
    );

    if (!requests.length) {
      throw new Error('Maintenance request not found');
    }

    const req = requests[0];
    if (req.user_id !== userId) {
      throw new Error('You can only cancel your own maintenance requests');
    }

    if (req.status !== 'pending') {
      throw new Error(`Cannot cancel a request that is currently '${req.status}'`);
    }

    await db.execute(
      `UPDATE maintenance_requests SET status = 'cancelled' WHERE id = ?`,
      [requestId]
    );
  }

  // Admin methods
  public async getAllRequests(filters?: { status?: RequestStatus; priority?: RequestPriority }): Promise<MaintenanceRequest[]> {
    let query = `SELECT r.id, r.user_id, r.house_id, r.category_id, r.problem, r.description,
                        r.priority, r.status, r.admin_notes, r.resolved_at, r.created_at, r.updated_at
                 FROM maintenance_requests r`;
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters?.status) {
      conditions.push('r.status = ?');
      params.push(filters.status);
    }
    if (filters?.priority) {
      conditions.push('r.priority = ?');
      params.push(filters.priority);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    query += ' ORDER BY r.created_at DESC';

    return await db.query<MaintenanceRequest>(query, params);
  }

  public async updateRequestStatus(
    requestId: number,
    adminUserId: number,
    newStatus: RequestStatus,
    adminNotes?: string
  ): Promise<void> {
    const requests = await db.query<MaintenanceRequest>(
      `SELECT id, status, problem, house_id FROM maintenance_requests WHERE id = ?`,
      [requestId]
    );

    if (!requests.length) {
      throw new Error('Maintenance request not found');
    }

    const req = requests[0];

    // Enforce valid status transitions
    if (req.status === 'resolved' || req.status === 'cancelled') {
      throw new Error(`Cannot modify a request that is already ${req.status}`);
    }

    const resolvedAt = newStatus === 'resolved' ? new Date().toISOString() : null;

    await db.execute(
      `UPDATE maintenance_requests
       SET status = ?, admin_notes = ?, resolved_at = ?
       WHERE id = ?`,
      [newStatus, adminNotes || null, resolvedAt, requestId]
    );

    await db.execute(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)`,
      [
        adminUserId,
        `MAINTENANCE_STATUS_${newStatus.toUpperCase()}`,
        'maintenance_request',
        requestId,
        `Changed status of #${requestId} (${req.problem}) to ${newStatus}. Notes: ${adminNotes || 'None'}`
      ]
    );
  }
}

export const maintenanceService = new MaintenanceService();
