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
    return await db.query<House>(
      `SELECT id, house_number, address, capacity, status, description, created_at, updated_at
       FROM houses
       ORDER BY house_number ASC`
    );
  }

  public async getHouseById(id: number): Promise<House | null> {
    const houses = await db.query<House>(
      `SELECT id, house_number, address, capacity, status, description, created_at, updated_at
       FROM houses
       WHERE id = ?`,
      [id]
    );
    return houses.length ? houses[0] : null;
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
