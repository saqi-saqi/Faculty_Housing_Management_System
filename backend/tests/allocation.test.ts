import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../src/db/connection.js';
import { allocationService } from '../src/services/allocationService.js';

describe('Seniority & House Allocation Service', () => {
  beforeEach(() => {
    // Reset in-memory database to seed state before each test
    db.initMemoryStore();
  });

  describe('Seniority Sorting Engine', () => {
    it('should sort applicants by Academic Grade Rank descending', async () => {
      // In seed data:
      // Faculty 4: Dr. Robert Chen (Associate Professor, Rank 50, joined 2017)
      // Faculty 5: Dr. Elena Rostova (Assistant Professor, Rank 40, joined 2020)
      // Both applied for House #3 (H-201)
      const queue = await allocationService.getSortedApplicationQueue();

      expect(queue.length).toBeGreaterThanOrEqual(2);
      expect(queue[0].facultyId).toBe(4); // Dr. Robert Chen should be #1
      expect(queue[0].gradeRank).toBe(50);
      expect(queue[1].facultyId).toBe(5); // Dr. Elena Rostova should be #2
      expect(queue[1].gradeRank).toBe(40);
    });

    it('should break ties by earlier service join date when ranks are equal', async () => {
      const store = db.getMemoryStore();
      
      // Add two faculty with identical Assistant Professor rank (40) but different join dates
      store.faculty.push({
        id: 101,
        name: 'Dr. Senior Joiner',
        email: 'senior.joiner@fhms.edu',
        department: 'Physics',
        grade_id: 4, // Rank 40
        contact: '123',
        joined_since: '2019-01-01'
      });
      store.faculty.push({
        id: 102,
        name: 'Dr. Junior Joiner',
        email: 'junior.joiner@fhms.edu',
        department: 'Physics',
        grade_id: 4, // Rank 40
        contact: '124',
        joined_since: '2023-01-01'
      });

      // Submit applications for vacant House 4
      store.applications.push({
        id: 501,
        faculty_id: 102,
        house_id: 4,
        status: 'pending',
        applied_at: '2026-09-01'
      });
      store.applications.push({
        id: 502,
        faculty_id: 101,
        house_id: 4,
        status: 'pending',
        applied_at: '2026-09-02'
      });

      const queue = await allocationService.getSortedApplicationQueue();
      const testCandidates = queue.filter(c => c.facultyId === 101 || c.facultyId === 102);

      expect(testCandidates.length).toBe(2);
      expect(testCandidates[0].facultyId).toBe(101); // Senior joiner (2019) comes before Junior joiner (2023)
      expect(testCandidates[1].facultyId).toBe(102);
    });

    it('should ignore applicants who already have an active housing tenancy', async () => {
      const store = db.getMemoryStore();
      
      // Faculty 2 already has House 1 allocated (in initialTenancies)
      // If they somehow had a pending application, it must be ignored by the queue
      store.applications.push({
        id: 999,
        faculty_id: 2,
        house_id: 3,
        status: 'pending',
        applied_at: '2026-09-01'
      });

      const queue = await allocationService.getSortedApplicationQueue();
      const candidateIds = queue.map(c => c.facultyId);
      expect(candidateIds).not.toContain(2);
    });
  });

  describe('Auto-Allocation Preview and Transactional Execution', () => {
    it('should preview correct matches without altering database records', async () => {
      const preview = await allocationService.previewAutoAllocation();

      expect(preview.matches.length).toBe(1);
      expect(preview.matches[0].facultyName).toBe('Dr. Robert Chen');
      expect(preview.matches[0].houseNumber).toBe('H-201');

      // Verify DB remains untouched during preview
      const houses = await db.query('SELECT status FROM houses WHERE id = 3');
      expect(houses[0].status).toBe('vacant');

      const app = await db.query('SELECT status FROM applications WHERE id = 1');
      expect(app[0].status).toBe('pending');
    });

    it('should execute auto-allocation atomically and update tenancy, house, and application statuses', async () => {
      const result = await allocationService.executeAutoAllocation(1);

      expect(result.allocatedCount).toBe(1);
      expect(result.allocations[0].facultyId).toBe(4);
      expect(result.allocations[0].houseId).toBe(3);

      // Verify house is now occupied
      const house = await db.query('SELECT status FROM houses WHERE id = 3');
      expect(house[0].status).toBe('occupied');

      // Verify application is now allocated
      const app = await db.query('SELECT status FROM applications WHERE id = 1');
      expect(app[0].status).toBe('allocated');

      // Verify active tenancy record was created
      const tenancies = await db.query(
        'SELECT id, house_id, faculty_id, end_date FROM tenancies WHERE house_id = 3 AND end_date IS NULL'
      );
      expect(tenancies.length).toBe(1);
      expect(tenancies[0].faculty_id).toBe(4);
    });

    it('should correctly detect competing applicants for the same house', async () => {
      const conflicts = await allocationService.getConflictingApplicants();

      expect(conflicts.length).toBe(1);
      expect(conflicts[0].houseNumber).toBe('H-201');
      expect(conflicts[0].applicants.length).toBe(2);
      expect(conflicts[0].applicants[0].facultyName).toBe('Dr. Robert Chen');
      expect(conflicts[0].applicants[1].facultyName).toBe('Dr. Elena Rostova');
    });

    it('should vacate an active tenancy and return house to vacant status', async () => {
      // Tenancy 1 is Dr. Aris Thorne in House 1 (occupied)
      const vacateResult = await allocationService.vacateHouse(1, 1, 'Faculty retired');
      expect(vacateResult.success).toBe(true);

      const house = await db.query('SELECT status FROM houses WHERE id = 1');
      expect(house[0].status).toBe('vacant');

      const tenancy = await db.query('SELECT end_date FROM tenancies WHERE id = 1');
      expect(tenancy[0].end_date).not.toBeNull();
    });
  });
});
