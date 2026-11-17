import { db } from '../db/connection.js';
import { House } from '../types/index.js';

export class HouseService {
  public async getVacantHouses(): Promise<House[]> {
    return await db.query<House>(
      `SELECT id, house_number, address, capacity, status, description, created_at, updated_at
       FROM houses
       WHERE status = 'vacant'
       ORDER BY house_number ASC`
    );
  }

  public async getAllHouses(): Promise<House[]> {
    const houses = await db.query<House>(
      `SELECT id, house_number, address, capacity, status, description, created_at, updated_at
       FROM houses
       ORDER BY house_number ASC`
    );

    const tenancies = await db.query(
      `SELECT id, house_id, faculty_id, start_date FROM tenancies WHERE end_date IS NULL`
    );
    const facultyList = await db.query(`SELECT id, name FROM faculty`);
    const facMap = new Map<number, string>(facultyList.map((f: any) => [f.id, f.name]));
    const tenMap = new Map<number, any>(tenancies.map((t: any) => [t.house_id, t]));

    return houses.map((h: any) => {
      const ten = tenMap.get(h.id);
      if (ten) {
        return {
          ...h,
          house_address: h.address,
          current_tenant: {
            tenancy_id: ten.id,
            faculty_id: ten.faculty_id,
            faculty_name: facMap.get(ten.faculty_id) || h.current_tenant?.faculty_name || 'Resident',
            start_date: ten.start_date
          }
        };
      }
      return { ...h, house_address: h.address, current_tenant: h.current_tenant || null };
    });
  }

  public async getHouseById(id: number): Promise<House | null> {
    const houses = await db.query<House>(
      `SELECT id, house_number, address, capacity, status, description, created_at, updated_at
       FROM houses
       WHERE id = ?`,
      [id]
    );
    if (!houses.length) return null;
    const house = houses[0];

    const tenancies = await db.query(
      `SELECT id, house_id, faculty_id, start_date FROM tenancies WHERE house_id = ? AND end_date IS NULL`,
      [id]
    );
    if (tenancies.length > 0) {
      const ten = tenancies[0];
      const facs = await db.query(`SELECT id, name FROM faculty WHERE id = ?`, [ten.faculty_id]);
      return {
        ...house,
        house_address: house.address,
        current_tenant: {
          tenancy_id: ten.id,
          faculty_id: ten.faculty_id,
          faculty_name: facs[0]?.name || (house as any).current_tenant?.faculty_name || 'Resident',
          start_date: ten.start_date
        }
      };
    }
    return { ...house, house_address: house.address, current_tenant: (house as any).current_tenant || null };
  }

  public async getMyHouse(facultyId: number): Promise<House | null> {
    const tenancies = await db.query(
      `SELECT id, house_id, faculty_id, start_date, notes
       FROM tenancies
       WHERE faculty_id = ? AND end_date IS NULL`,
      [facultyId]
    );

    if (!tenancies.length) {
      return null;
    }

    const tenancy = tenancies[0];
    const houses = await db.query<House>(
      `SELECT id, house_number, address, capacity, status, description, created_at, updated_at
       FROM houses
       WHERE id = ?`,
      [tenancy.house_id]
    );

    if (!houses.length) {
      return null;
    }

    const house = houses[0];
    const facultyRows = await db.query(
      `SELECT id, name FROM faculty WHERE id = ?`,
      [facultyId]
    );
    const faculty = facultyRows[0];

    return {
      ...house,
      house_address: house.address,
      current_tenant: {
        tenancy_id: tenancy.id,
        faculty_id: facultyId,
        faculty_name: faculty?.name || 'Resident',
        start_date: tenancy.start_date
      }
    };
  }

  public async createHouse(data: {
    house_number: string;
    address: string;
    capacity?: number;
    description?: string;
  }): Promise<{ id: number }> {
    const existing = await db.query('SELECT id FROM houses WHERE house_number = ?', [data.house_number]);
    if (existing.length > 0) {
      throw new Error(`House number ${data.house_number} already exists`);
    }

    const result = await db.execute(
      `INSERT INTO houses (house_number, address, capacity, status, description) VALUES (?, ?, ?, 'vacant', ?)`,
      [data.house_number, data.address, data.capacity || 1, data.description || null]
    );

    return { id: result.insertId };
  }

  public async updateHouseStatus(id: number, status: 'vacant' | 'occupied' | 'maintenance'): Promise<void> {
    await db.execute('UPDATE houses SET status = ? WHERE id = ?', [status, id]);
  }
}

export const houseService = new HouseService();
