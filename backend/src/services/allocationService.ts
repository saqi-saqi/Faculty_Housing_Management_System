import { db } from '../db/connection.js';
import { Application, House } from '../types/index.js';

export interface AllocationCandidate {
  applicationId: number;
  facultyId: number;
  facultyName: string;
  department: string;
  gradeName: string;
  gradeRank: number;
  joinedSince: string;
  desiredHouseId: number;
  desiredHouseNumber: string;
  desiredHouseAddress: string;
}

export interface AllocationPreviewMatch {
  applicationId: number;
  facultyId: number;
  facultyName: string;
  gradeName: string;
  gradeRank: number;
  joinedSince: string;
  houseId: number;
  houseNumber: string;
  houseAddress: string;
  reason: string;
}

export class AllocationService {
  /**
   * Fetch all pending applications sorted strictly by seniority:
   * 1. Academic Rank DESC (e.g. Senior Professor > Professor > Associate > Assistant > Lecturer)
   * 2. Joined Date ASC (seniority in service)
   * 3. Application ID ASC (deterministic tiebreaker)
   */
  public async getSortedApplicationQueue(): Promise<AllocationCandidate[]> {
    const apps = await db.query<Application>(
      `SELECT a.id, a.faculty_id, a.house_id, a.status, a.applied_at
       FROM applications a
       WHERE a.status = 'pending'`
    );

    const candidates: AllocationCandidate[] = [];

    for (const app of apps) {
      const facs = await db.query(
        `SELECT f.id, f.name, f.department, f.grade_id, f.joined_since
         FROM faculty f WHERE f.id = ?`,
        [app.faculty_id]
      );
      if (!facs.length) continue;
      const fac = facs[0];

      // Check if faculty already has an active house
      const activeTenancies = await db.query(
        `SELECT id FROM tenancies WHERE faculty_id = ? AND end_date IS NULL`,
        [fac.id]
      );
      if (activeTenancies.length > 0) {
        continue; // Skip if already allocated
      }

      const grades = await db.query(
        `SELECT name, rank FROM grades WHERE id = ?`,
        [fac.grade_id]
      );
      const grade = grades[0] || { name: 'Unknown', rank: 0 };

      const houses = await db.query(
        `SELECT house_number, address, status FROM houses WHERE id = ?`,
        [app.house_id]
      );
      const house = houses[0] || { house_number: 'N/A', address: 'N/A', status: 'vacant' };

      candidates.push({
        applicationId: app.id,
        facultyId: fac.id,
        facultyName: fac.name,
        department: fac.department,
        gradeName: grade.name,
        gradeRank: grade.rank,
        joinedSince: fac.joined_since,
        desiredHouseId: app.house_id,
        desiredHouseNumber: house.house_number,
        desiredHouseAddress: house.address
      });
    }

    // Deterministic Seniority Sorting
    candidates.sort((a, b) => {
      // 1. Grade Rank (higher rank first)
      if (b.gradeRank !== a.gradeRank) {
        return b.gradeRank - a.gradeRank;
      }
      // 2. Joined Date (earlier join date first)
      const dateA = new Date(a.joinedSince).getTime();
      const dateB = new Date(b.joinedSince).getTime();
      if (dateA !== dateB) {
        return dateA - dateB;
      }
      // 3. Application ID tiebreaker
      return a.applicationId - b.applicationId;
    });

    return candidates;
  }

  /**
   * Preview auto-allocation matches without making any database changes
   */
  public async previewAutoAllocation(): Promise<{
    matches: AllocationPreviewMatch[];
    unallocatedCandidates: AllocationCandidate[];
    vacantHousesRemaining: House[];
  }> {
    const candidates = await this.getSortedApplicationQueue();
    const vacantHouses = await db.query<House>(
      `SELECT id, house_number, address, status, capacity FROM houses WHERE status = 'vacant'`
    );

    const availableHouseMap = new Map<number, House>();
    vacantHouses.forEach(h => availableHouseMap.set(h.id, h));

    const matches: AllocationPreviewMatch[] = [];
    const unallocatedCandidates: AllocationCandidate[] = [];
    const allocatedFacultyIds = new Set<number>();

    for (const candidate of candidates) {
      if (allocatedFacultyIds.has(candidate.facultyId)) {
        continue;
      }

      // Check if desired house is vacant
      if (availableHouseMap.has(candidate.desiredHouseId)) {
        const house = availableHouseMap.get(candidate.desiredHouseId)!;
        matches.push({
          applicationId: candidate.applicationId,
          facultyId: candidate.facultyId,
          facultyName: candidate.facultyName,
          gradeName: candidate.gradeName,
          gradeRank: candidate.gradeRank,
          joinedSince: candidate.joinedSince,
          houseId: house.id,
          houseNumber: house.house_number,
          houseAddress: house.address,
          reason: `Top applicant by Seniority (Rank ${candidate.gradeRank}, joined ${candidate.joinedSince})`
        });
        availableHouseMap.delete(house.id);
        allocatedFacultyIds.add(candidate.facultyId);
      } else {
        unallocatedCandidates.push(candidate);
      }
    }

    return {
      matches,
      unallocatedCandidates,
      vacantHousesRemaining: Array.from(availableHouseMap.values())
    };
  }

  /**
   * Execute auto-allocation inside an atomic transaction
   */
  public async executeAutoAllocation(adminUserId: number): Promise<{
    allocatedCount: number;
    allocations: AllocationPreviewMatch[];
  }> {
    const preview = await this.previewAutoAllocation();

    if (preview.matches.length === 0) {
      return { allocatedCount: 0, allocations: [] };
    }

    await db.transaction(async (tx) => {
      const today = new Date().toISOString().slice(0, 10);

      for (const match of preview.matches) {
        // 1. Double check and lock house
        const houseRows = await tx.query(
          `SELECT id, status FROM houses WHERE id = ? FOR UPDATE`,
          [match.houseId]
        );
        if (!houseRows.length || houseRows[0].status !== 'vacant') {
          throw new Error(`House ${match.houseNumber} is no longer vacant`);
        }

        // 2. Double check faculty has no active tenancy
        const activeTenancies = await tx.query(
          `SELECT id FROM tenancies WHERE faculty_id = ? AND end_date IS NULL FOR UPDATE`,
          [match.facultyId]
        );
        if (activeTenancies.length > 0) {
          continue; // Already allocated
        }

        // 3. Create active tenancy record
        await tx.execute(
          `INSERT INTO tenancies (house_id, faculty_id, start_date, notes) VALUES (?, ?, ?, ?)`,
          [match.houseId, match.facultyId, today, 'Auto-allocated by Seniority Matrix']
        );

        // 4. Update house status to occupied
        await tx.execute(
          `UPDATE houses SET status = ? WHERE id = ?`,
          ['occupied', match.houseId]
        );

        // 5. Update winning application to allocated
        await tx.execute(
          `UPDATE applications SET status = ? WHERE id = ?`,
          ['allocated', match.applicationId]
        );

        // 6. Record in audit log
        await tx.execute(
          `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)`,
          [
            adminUserId,
            'HOUSE_ALLOCATED_AUTO',
            'tenancy',
            match.houseId,
            `House ${match.houseNumber} allocated to ${match.facultyName} (Rank: ${match.gradeRank})`
          ]
        );
      }
    });

    return {
      allocatedCount: preview.matches.length,
      allocations: preview.matches
    };
  }

  /**
   * Manually allocate a specific house to an applicant inside an atomic transaction
   */
  public async allocateManually(
    adminUserId: number,
    applicationId: number,
    houseId: number,
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    return await db.transaction(async (tx) => {
      const appRows = await tx.query(
        `SELECT id, faculty_id, status FROM applications WHERE id = ? FOR UPDATE`,
        [applicationId]
      );
      if (!appRows.length || appRows[0].status !== 'pending') {
        throw new Error('Application is not pending or does not exist');
      }
      const app = appRows[0];

      // Lock house
      const houseRows = await tx.query(
        `SELECT id, house_number, status FROM houses WHERE id = ? FOR UPDATE`,
        [houseId]
      );
      if (!houseRows.length || houseRows[0].status !== 'vacant') {
        throw new Error('Selected house is not vacant');
      }
      const house = houseRows[0];

      // Check faculty active tenancy
      const tenancies = await tx.query(
        `SELECT id FROM tenancies WHERE faculty_id = ? AND end_date IS NULL FOR UPDATE`,
        [app.faculty_id]
      );
      if (tenancies.length > 0) {
        throw new Error('Faculty member already has an active tenancy');
      }

      const today = new Date().toISOString().slice(0, 10);

      // Create tenancy
      await tx.execute(
        `INSERT INTO tenancies (house_id, faculty_id, start_date, notes) VALUES (?, ?, ?, ?)`,
        [houseId, app.faculty_id, today, notes || 'Manual Estate Office Allocation']
      );

      // Update house status
      await tx.execute(`UPDATE houses SET status = ? WHERE id = ?`, ['occupied', houseId]);

      // Update application
      await tx.execute(`UPDATE applications SET status = ? WHERE id = ?`, ['allocated', applicationId]);

      // Audit log
      await tx.execute(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)`,
        [adminUserId, 'HOUSE_ALLOCATED_MANUAL', 'tenancy', houseId, `Manual allocation of ${house.house_number}`]
      );

      return { success: true, message: `Successfully allocated House ${house.house_number}` };
    });
  }

  /**
   * Vacate an active tenancy
   */
  public async vacateHouse(
    adminUserId: number,
    tenancyId: number,
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    return await db.transaction(async (tx) => {
      const tenancyRows = await tx.query(
        `SELECT id, house_id, faculty_id, end_date FROM tenancies WHERE id = ? FOR UPDATE`,
        [tenancyId]
      );
      if (!tenancyRows.length) {
        throw new Error('Tenancy not found');
      }
      const tenancy = tenancyRows[0];
      if (tenancy.end_date !== null) {
        throw new Error('Tenancy has already been vacated');
      }

      const today = new Date().toISOString().slice(0, 10);

      // End tenancy
      await tx.execute(
        `UPDATE tenancies SET end_date = ? WHERE id = ?`,
        [today, tenancyId]
      );

      // Set house back to vacant
      await tx.execute(
        `UPDATE houses SET status = ? WHERE id = ?`,
        ['vacant', tenancy.house_id]
      );

      // Audit log
      await tx.execute(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)`,
        [adminUserId, 'TENANCY_VACATED', 'tenancy', tenancyId, notes || 'Tenancy ended by Estate Admin']
      );

      return { success: true, message: 'House successfully marked as vacant' };
    });
  }

  /**
   * Conflict identification: Finds applicants contending for the same house or with matching ranks
   */
  public async getConflictingApplicants(): Promise<Array<{
    houseId: number;
    houseNumber: string;
    applicants: AllocationCandidate[];
  }>> {
    const queue = await this.getSortedApplicationQueue();
    const houseMap = new Map<number, AllocationCandidate[]>();

    for (const item of queue) {
      if (!houseMap.has(item.desiredHouseId)) {
        houseMap.set(item.desiredHouseId, []);
      }
      houseMap.get(item.desiredHouseId)!.push(item);
    }

    const conflicts: Array<{ houseId: number; houseNumber: string; applicants: AllocationCandidate[] }> = [];

    for (const [houseId, applicants] of houseMap.entries()) {
      if (applicants.length > 1) {
        conflicts.push({
          houseId,
          houseNumber: applicants[0].desiredHouseNumber,
          applicants
        });
      }
    }

    return conflicts;
  }
}

export const allocationService = new AllocationService();
