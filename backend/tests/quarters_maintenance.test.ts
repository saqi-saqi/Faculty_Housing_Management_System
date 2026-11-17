import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../src/db/connection.js';
import { houseService } from '../src/services/houseService.js';
import { maintenanceService } from '../src/services/maintenanceService.js';
import { applicationService } from '../src/services/applicationService.js';

describe('Faculty Quarters and Maintenance Service', () => {
  beforeEach(() => {
    db.initMemoryStore();
  });

  describe('My Quarters (Allocated House)', () => {
    it('should return allocated house details for resident faculty member', async () => {
      // Faculty 2 is Dr. Aris Thorne with House 1 (H-101)
      const house = await houseService.getMyHouse(2);

      expect(house).not.toBeNull();
      expect(house?.id).toBe(1);
      expect(house?.house_number).toBe('H-101');
      expect(house?.address).toContain('Sector 1');
      expect(house?.current_tenant?.faculty_id).toBe(2);
      expect(house?.current_tenant?.faculty_name).toBe('Dr. Aris Thorne');
    });

    it('should return null for faculty member without an allocated house', async () => {
      // Faculty 4 (Dr. Robert Chen) has no active tenancy
      const house = await houseService.getMyHouse(4);

      expect(house).toBeNull();
    });
  });

  describe('Maintenance Cancellation and Deletion', () => {
    it('should properly cancel a pending maintenance request and update status to cancelled', async () => {
      // Seed maintenance request 1 is user 2, status pending
      const beforeReqs = await maintenanceService.getMyRequests(2);
      const targetReq = beforeReqs.find(r => r.id === 1);
      expect(targetReq?.status).toBe('pending');

      await maintenanceService.cancelRequest(1, 2);

      const afterReqs = await maintenanceService.getMyRequests(2);
      const updatedReq = afterReqs.find(r => r.id === 1);
      expect(updatedReq?.status).toBe('cancelled');

      // Verify it is no longer returned in getMyPendingRequests
      const pendingReqs = await maintenanceService.getMyPendingRequests(2);
      expect(pendingReqs.some(r => r.id === 1)).toBe(false);
    });

    it('should prevent cancelling a request that is not pending', async () => {
      // Request 2 is in_progress
      await expect(maintenanceService.cancelRequest(2, 2)).rejects.toThrow(
        "Cannot cancel a request that is currently 'in_progress'"
      );
    });

    it('should prevent another user from cancelling someone else request', async () => {
      // User 3 trying to cancel user 2's request 1
      await expect(maintenanceService.cancelRequest(1, 3)).rejects.toThrow(
        'You can only cancel your own maintenance requests'
      );
    });

    it('should delete a cancelled maintenance request', async () => {
      // First cancel request 1
      await maintenanceService.cancelRequest(1, 2);

      // Now delete it
      await maintenanceService.deleteRequest(1, 2);

      const afterReqs = await maintenanceService.getMyRequests(2);
      expect(afterReqs.some(r => r.id === 1)).toBe(false);
    });
  });

  describe('Application Withdrawal', () => {
    it('should properly withdraw a pending application', async () => {
      // Application 1 is faculty 4, status pending
      await applicationService.withdrawApplication(1, 4);

      const apps = await applicationService.getMyApplications(4);
      const app = apps.find(a => a.id === 1);
      expect(app?.status).toBe('withdrawn');
    });
  });
});
