import { db } from '../db/connection.js';
import { Application } from '../types/index.js';

export class ApplicationService {
  /**
   * Submit an application for an unallocated faculty member
   */
  public async submitApplication(facultyId: number, houseId: number): Promise<{ id: number }> {
    // 1. Verify faculty does not already have an active tenancy
    const activeTenancies = await db.query(
      `SELECT id FROM tenancies WHERE faculty_id = ? AND end_date IS NULL`,
      [facultyId]
    );
    if (activeTenancies.length > 0) {
      throw new Error('You already have an active house allocation. To change houses, please request a transfer.');
    }

    // 2. Verify faculty does not already have a pending application
    const pendingApps = await db.query(
      `SELECT id FROM applications WHERE faculty_id = ? AND status = 'pending'`,
      [facultyId]
    );
    if (pendingApps.length > 0) {
      throw new Error('You already have a pending housing application under review.');
    }

    // 3. Verify target house exists and is vacant
    const houses = await db.query(
      `SELECT id, status FROM houses WHERE id = ?`,
      [houseId]
    );
    if (!houses.length || houses[0].status !== 'vacant') {
      throw new Error('The selected house is no longer available for application.');
    }

    // 4. Insert application
    const result = await db.execute(
      `INSERT INTO applications (faculty_id, house_id, status) VALUES (?, ?, 'pending')`,
      [facultyId, houseId]
    );

    return { id: result.insertId };
  }

  /**
   * Faculty withdraws their own pending application
   */
  public async withdrawApplication(applicationId: number, facultyId: number): Promise<void> {
    const apps = await db.query<Application>(
      `SELECT id, faculty_id, status FROM applications WHERE id = ?`,
      [applicationId]
    );

    if (!apps.length) {
      throw new Error('Application not found');
    }

    const app = apps[0];
    if (app.faculty_id !== facultyId) {
      throw new Error('You can only withdraw your own applications');
    }

    if (app.status !== 'pending') {
      throw new Error(`Cannot withdraw an application with status '${app.status}'`);
    }

    await db.execute(
      `UPDATE applications SET status = ? WHERE id = ?`,
      ['withdrawn', applicationId]
    );
  }

  /**
   * Get applications submitted by a specific faculty member
   */
  public async getMyApplications(facultyId: number): Promise<Application[]> {
    return await db.query<Application>(
      `SELECT a.id, a.faculty_id, a.house_id, a.status, a.admin_notes, a.applied_at, a.updated_at
       FROM applications a
       WHERE a.faculty_id = ?
       ORDER BY a.applied_at DESC`,
      [facultyId]
    );
  }

  /**
   * Admin: Get all applications with complete faculty and house details
   */
  public async getAllApplications(): Promise<Application[]> {
    return await db.query<Application>(
      `SELECT a.id, a.faculty_id, a.house_id, a.status, a.admin_notes, a.applied_at, a.updated_at
       FROM applications a
       ORDER BY a.applied_at DESC`
    );
  }
}

export const applicationService = new ApplicationService();
