import mysql from 'mysql2/promise';
import { ENV } from '../config/env.js';
import {
  initialGrades,
  initialCategories,
  initialFaculty,
  initialHouses,
  initialTenancies,
  getInitialUsers,
  initialApplications,
  initialMaintenanceRequests
} from './seedData.js';

export interface DbTransaction {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<{ insertId: number; affectedRows: number }>;
}

class DatabaseManager {
  private pool: mysql.Pool | null = null;
  private isConnectedToMySQL = false;
  private memoryStore: any = null;

  constructor() {
    this.initMemoryStore();
  }

  public initMemoryStore() {
    this.memoryStore = {
      grades: JSON.parse(JSON.stringify(initialGrades)),
      categories: JSON.parse(JSON.stringify(initialCategories)),
      faculty: JSON.parse(JSON.stringify(initialFaculty)),
      houses: JSON.parse(JSON.stringify(initialHouses)),
      tenancies: JSON.parse(JSON.stringify(initialTenancies)),
      users: getInitialUsers(),
      applications: JSON.parse(JSON.stringify(initialApplications)),
      maintenance_requests: JSON.parse(JSON.stringify(initialMaintenanceRequests)),
      audit_logs: [
        { id: 1, user_id: 1, action: 'SYSTEM_BOOT', entity_type: 'system', entity_id: 1, details: 'Initialized data store', created_at: new Date().toISOString() }
      ],
      counters: {
        grades: 10,
        categories: 20,
        faculty: 10,
        houses: 10,
        tenancies: 10,
        users: 10,
        applications: 10,
        maintenance_requests: 10,
        audit_logs: 10
      }
    };
  }

  public getMemoryStore() {
    return this.memoryStore;
  }

  public async connect(): Promise<boolean> {
    try {
      this.pool = mysql.createPool({
        host: ENV.DB_HOST,
        port: ENV.DB_PORT,
        user: ENV.DB_USER,
        password: ENV.DB_PASSWORD,
        database: ENV.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 2000
      });

      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      this.isConnectedToMySQL = true;
      console.log(`[Database] Successfully connected to MySQL at ${ENV.DB_HOST}:${ENV.DB_PORT}/${ENV.DB_NAME}`);
      return true;
    } catch (err: any) {
      this.isConnectedToMySQL = false;
      this.pool = null;
      console.log(`[Database] MySQL not reachable (${err.message}). Using resilient embedded in-memory data store with live state.`);
      return false;
    }
  }

  public isMySQL(): boolean {
    return this.isConnectedToMySQL;
  }

  public async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (this.isConnectedToMySQL && this.pool) {
      try {
        const [rows] = await this.pool.query(sql, params);
        return rows as T[];
      } catch (err) {
        throw err;
      }
    }
    return this.executeMemoryQuery<T>(sql, params);
  }

  public async execute(sql: string, params: any[] = []): Promise<{ insertId: number; affectedRows: number }> {
    if (this.isConnectedToMySQL && this.pool) {
      const [result] = await this.pool.execute(sql, params) as any;
      return {
        insertId: result.insertId || 0,
        affectedRows: result.affectedRows || 0
      };
    }
    return this.executeMemoryCommand(sql, params);
  }

  public async transaction<T>(fn: (tx: DbTransaction) => Promise<T>): Promise<T> {
    if (this.isConnectedToMySQL && this.pool) {
      const connection = await this.pool.getConnection();
      await connection.beginTransaction();
      try {
        const txWrapper: DbTransaction = {
          query: async <R = any>(sql: string, params?: any[]) => {
            const [rows] = await connection.query(sql, params);
            return rows as R[];
          },
          execute: async (sql: string, params?: any[]) => {
            const [result] = await connection.execute(sql, params) as any;
            return {
              insertId: result.insertId || 0,
              affectedRows: result.affectedRows || 0
            };
          }
        };
        const result = await fn(txWrapper);
        await connection.commit();
        return result;
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    } else {
      // In-memory transaction wrapper
      const snapshot = JSON.stringify(this.memoryStore);
      try {
        const txWrapper: DbTransaction = {
          query: async <R = any>(sql: string, params?: any[]) => this.executeMemoryQuery<R>(sql, params || []),
          execute: async (sql: string, params?: any[]) => this.executeMemoryCommand(sql, params || [])
        };
        return await fn(txWrapper);
      } catch (err) {
        this.memoryStore = JSON.parse(snapshot);
        throw err;
      }
    }
  }

  // Memory query fallback engine for dev/test
  private executeMemoryQuery<T>(sql: string, params: any[]): T[] {
    // Normalize SQL: remove aliases like "f.", "a.", "h.", "t.", "r.", "u.", "g.", remove "for update"
    const s = sql
      .trim()
      .toLowerCase()
      .replace(/\b[a-z]\./g, '')
      .replace(/\s+for\s+update/g, '');
    
    // Auth queries
    if (s.includes('from users') && s.includes('where email =')) {
      const email = params[0];
      const user = this.memoryStore.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      return (user ? [user] : []) as T[];
    }
    if (s.includes('from users') && s.includes('where id =')) {
      const id = Number(params[0]);
      const user = this.memoryStore.users.find((u: any) => u.id === id);
      return (user ? [user] : []) as T[];
    }

    // Faculty queries
    if (s.includes('from faculty') && s.includes('where email =')) {
      const email = params[0];
      const fac = this.memoryStore.faculty.find((f: any) => f.email.toLowerCase() === email.toLowerCase());
      return (fac ? [fac] : []) as T[];
    }
    if (s.includes('from faculty') && s.includes('where id =')) {
      const id = Number(params[0]);
      const fac = this.memoryStore.faculty.find((f: any) => f.id === id);
      if (fac) {
        const grade = this.memoryStore.grades.find((g: any) => g.id === fac.grade_id);
        return [{ ...fac, grade_name: grade?.name, grade_rank: grade?.rank }] as T[];
      }
      return [] as T[];
    }

    // Houses queries
    if (s.includes('from houses') && s.includes("status = 'vacant'")) {
      const vacant = this.memoryStore.houses.filter((h: any) => h.status === 'vacant');
      return vacant as T[];
    }
    if (s.includes('from houses') && s.includes('where id =')) {
      const idMatch = s.match(/where\s+id\s*=\s*(\d+|\?)/);
      const id = params.length > 0 ? Number(params[0]) : (idMatch && idMatch[1] !== '?' ? Number(idMatch[1]) : NaN);
      const house = this.memoryStore.houses.find((h: any) => h.id === id);
      if (house) {
        const tenancy = this.memoryStore.tenancies.find((t: any) => t.house_id === id && t.end_date === null);
        let tenantInfo = null;
        if (tenancy) {
          const fac = this.memoryStore.faculty.find((f: any) => f.id === tenancy.faculty_id);
          tenantInfo = { faculty_id: tenancy.faculty_id, faculty_name: fac?.name || 'Unknown', start_date: tenancy.start_date };
        }
        return [{ ...house, current_tenant: tenantInfo }] as T[];
      }
      return [] as T[];
    }
    if (s.includes('from houses')) {
      return this.memoryStore.houses.map((h: any) => {
        const tenancy = this.memoryStore.tenancies.find((t: any) => t.house_id === h.id && t.end_date === null);
        let tenantInfo = null;
        if (tenancy) {
          const fac = this.memoryStore.faculty.find((f: any) => f.id === tenancy.faculty_id);
          tenantInfo = { faculty_id: tenancy.faculty_id, faculty_name: fac?.name || 'Unknown', start_date: tenancy.start_date };
        }
        return { ...h, current_tenant: tenantInfo };
      }) as T[];
    }

    // Tenancies queries
    if (s.includes('from tenancies') && s.includes('where id =')) {
      const idMatch = s.match(/where\s+id\s*=\s*(\d+|\?)/);
      const id = params.length > 0 ? Number(params[0]) : (idMatch && idMatch[1] !== '?' ? Number(idMatch[1]) : NaN);
      const tenancy = this.memoryStore.tenancies.find((t: any) => t.id === id);
      return (tenancy ? [tenancy] : []) as T[];
    }
    if (s.includes('from tenancies') && s.includes('faculty_id =') && s.includes('end_date is null')) {
      const match = s.match(/faculty_id\s*=\s*(\d+|\?)/);
      const facId = params.length > 0 ? Number(params[0]) : (match && match[1] !== '?' ? Number(match[1]) : NaN);
      const tenancy = this.memoryStore.tenancies.find((t: any) => t.faculty_id === facId && t.end_date === null);
      if (tenancy) {
        const house = this.memoryStore.houses.find((h: any) => h.id === tenancy.house_id);
        return [{ ...tenancy, house_number: house?.house_number, house_address: house?.address }] as T[];
      }
      return [] as T[];
    }
    if (s.includes('from tenancies') && s.includes('house_id =') && s.includes('end_date is null')) {
      const match = s.match(/house_id\s*=\s*(\d+|\?)/);
      const houseId = params.length > 0 ? Number(params[0]) : (match && match[1] !== '?' ? Number(match[1]) : NaN);
      const tenancy = this.memoryStore.tenancies.find((t: any) => t.house_id === houseId && t.end_date === null);
      return (tenancy ? [tenancy] : []) as T[];
    }

    // Applications queries
    if (s.includes('from applications') && s.includes('where id =')) {
      const idMatch = s.match(/where\s+id\s*=\s*(\d+|\?)/);
      const id = params.length > 0 ? Number(params[0]) : (idMatch && idMatch[1] !== '?' ? Number(idMatch[1]) : NaN);
      const app = this.memoryStore.applications.find((a: any) => a.id === id);
      return (app ? [app] : []) as T[];
    }
    if (s.includes('from applications') && s.includes('faculty_id =') && s.includes("status = 'pending'")) {
      const facId = Number(params[0]);
      const app = this.memoryStore.applications.find((a: any) => a.faculty_id === facId && a.status === 'pending');
      if (app) {
        const house = this.memoryStore.houses.find((h: any) => h.id === app.house_id);
        return [{ ...app, house_number: house?.house_number, house_address: house?.address }] as T[];
      }
      return [] as T[];
    }
    if (s.includes('from applications') && s.includes('faculty_id =')) {
      const facId = Number(params[0]);
      const apps = this.memoryStore.applications.filter((a: any) => a.faculty_id === facId);
      return apps.map((a: any) => {
        const house = this.memoryStore.houses.find((h: any) => h.id === a.house_id);
        return { ...a, house_number: house?.house_number, house_address: house?.address };
      }) as T[];
    }
    if (s.includes('from applications') && s.includes("status = 'pending'")) {
      const pendingApps = this.memoryStore.applications.filter((a: any) => a.status === 'pending');
      return pendingApps.map((a: any) => {
        const fac = this.memoryStore.faculty.find((f: any) => f.id === a.faculty_id);
        const grade = fac ? this.memoryStore.grades.find((g: any) => g.id === fac.grade_id) : null;
        const house = this.memoryStore.houses.find((h: any) => h.id === a.house_id);
        return {
          ...a,
          faculty_name: fac?.name,
          faculty_email: fac?.email,
          department: fac?.department,
          grade_name: grade?.name,
          grade_rank: grade?.rank,
          joined_since: fac?.joined_since,
          house_number: house?.house_number,
          house_address: house?.address
        };
      }) as T[];
    }
    if (s.includes('from applications')) {
      return this.memoryStore.applications.map((a: any) => {
        const fac = this.memoryStore.faculty.find((f: any) => f.id === a.faculty_id);
        const grade = fac ? this.memoryStore.grades.find((g: any) => g.id === fac.grade_id) : null;
        const house = this.memoryStore.houses.find((h: any) => h.id === a.house_id);
        return {
          ...a,
          faculty_name: fac?.name,
          faculty_email: fac?.email,
          department: fac?.department,
          grade_name: grade?.name,
          grade_rank: grade?.rank,
          joined_since: fac?.joined_since,
          house_number: house?.house_number,
          house_address: house?.address
        };
      }) as T[];
    }

    // Categories queries
    if (s.includes('from maintenance_categories')) {
      return this.memoryStore.categories as T[];
    }

    // Maintenance requests queries
    if (s.includes('from maintenance_requests') && s.includes('user_id =') && s.includes("status = 'pending'")) {
      const userId = Number(params[0]);
      const reqs = this.memoryStore.maintenance_requests.filter((r: any) => r.user_id === userId && r.status === 'pending');
      return this.enrichMaintenanceRequests(reqs) as T[];
    }
    if (s.includes('from maintenance_requests') && s.includes('user_id =')) {
      const userId = Number(params[0]);
      const reqs = this.memoryStore.maintenance_requests.filter((r: any) => r.user_id === userId);
      return this.enrichMaintenanceRequests(reqs) as T[];
    }
    if (s.includes('from maintenance_requests') && s.includes('where id =')) {
      const id = Number(params[0]);
      const req = this.memoryStore.maintenance_requests.find((r: any) => r.id === id);
      return (req ? this.enrichMaintenanceRequests([req]) : []) as T[];
    }
    if (s.includes('from maintenance_requests')) {
      return this.enrichMaintenanceRequests(this.memoryStore.maintenance_requests) as T[];
    }

    // Audit logs
    if (s.includes('from audit_logs')) {
      return this.memoryStore.audit_logs.slice().reverse() as T[];
    }

    // Grades
    if (s.includes('from grades') && s.includes('where id =')) {
      const id = Number(params[0]);
      const grade = this.memoryStore.grades.find((g: any) => g.id === id);
      return (grade ? [grade] : []) as T[];
    }
    if (s.includes('from grades')) {
      return this.memoryStore.grades as T[];
    }

    return [] as T[];
  }

  private enrichMaintenanceRequests(reqs: any[]) {
    return reqs.map((r: any) => {
      const cat = this.memoryStore.categories.find((c: any) => c.id === r.category_id);
      const house = this.memoryStore.houses.find((h: any) => h.id === r.house_id);
      const user = this.memoryStore.users.find((u: any) => u.id === r.user_id);
      const fac = user?.faculty_id ? this.memoryStore.faculty.find((f: any) => f.id === user.faculty_id) : null;
      return {
        ...r,
        category_name: cat?.name || r.problem,
        house_number: house?.house_number || 'N/A',
        house_address: house?.address || 'N/A',
        user_email: user?.email || '',
        faculty_name: fac?.name || user?.email || ''
      };
    });
  }

  private executeMemoryCommand(sql: string, params: any[]): { insertId: number; affectedRows: number } {
    const s = sql.trim().toLowerCase();

    // Insert user
    if (s.startsWith('insert into users')) {
      const id = ++this.memoryStore.counters.users;
      const [email, password_hash, role, faculty_id] = params;
      this.memoryStore.users.push({
        id,
        email,
        password_hash,
        role: role || 'faculty',
        faculty_id: faculty_id || null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      return { insertId: id, affectedRows: 1 };
    }

    // Insert application
    if (s.startsWith('insert into applications')) {
      const id = ++this.memoryStore.counters.applications;
      const [faculty_id, house_id, status] = params;
      this.memoryStore.applications.push({
        id,
        faculty_id,
        house_id,
        status: status || 'pending',
        admin_notes: null,
        applied_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });
      return { insertId: id, affectedRows: 1 };
    }

    // Update application
    if (s.startsWith('update applications')) {
      const id = Number(params[params.length - 1]);
      const app = this.memoryStore.applications.find((a: any) => a.id === id);
      if (app) {
        if (s.includes('status = ?')) {
          app.status = params[0];
        } else if (s.includes("status = 'withdrawn'")) {
          app.status = 'withdrawn';
        } else if (s.includes("status = 'allocated'")) {
          app.status = 'allocated';
        } else if (s.includes("status = 'rejected'")) {
          app.status = 'rejected';
        }
        app.updated_at = new Date().toISOString();
        return { insertId: 0, affectedRows: 1 };
      }
      return { insertId: 0, affectedRows: 0 };
    }

    // Insert tenancy
    if (s.startsWith('insert into tenancies')) {
      const id = ++this.memoryStore.counters.tenancies;
      const [house_id, faculty_id, start_date, notes] = params;
      this.memoryStore.tenancies.push({
        id,
        house_id,
        faculty_id,
        start_date: start_date || new Date().toISOString().slice(0, 10),
        end_date: null,
        notes: notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      return { insertId: id, affectedRows: 1 };
    }

    // Update tenancy (e.g. vacate)
    if (s.startsWith('update tenancies')) {
      const id = Number(params[params.length - 1]);
      const tenancy = this.memoryStore.tenancies.find((t: any) => t.id === id);
      if (tenancy) {
        if (s.includes('end_date = ?') || s.includes('end_date = curdate()')) {
          tenancy.end_date = params[0] || new Date().toISOString().slice(0, 10);
        }
        tenancy.updated_at = new Date().toISOString();
        return { insertId: 0, affectedRows: 1 };
      }
      return { insertId: 0, affectedRows: 0 };
    }

    // Update house
    if (s.startsWith('update houses')) {
      const id = Number(params[params.length - 1]);
      const house = this.memoryStore.houses.find((h: any) => h.id === id);
      if (house) {
        if (s.includes('status = ?')) {
          house.status = params[0];
        }
        house.updated_at = new Date().toISOString();
        return { insertId: 0, affectedRows: 1 };
      }
      return { insertId: 0, affectedRows: 0 };
    }

    // Insert maintenance request
    if (s.startsWith('insert into maintenance_requests')) {
      const id = ++this.memoryStore.counters.maintenance_requests;
      const [user_id, house_id, category_id, problem, description, priority] = params;
      this.memoryStore.maintenance_requests.push({
        id,
        user_id,
        house_id,
        category_id,
        problem,
        description,
        priority: priority || 'medium',
        status: 'pending',
        admin_notes: null,
        resolved_at: null,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });
      return { insertId: id, affectedRows: 1 };
    }

    // Update maintenance request
    if (s.startsWith('update maintenance_requests')) {
      const id = Number(params[params.length - 1]);
      const req = this.memoryStore.maintenance_requests.find((r: any) => r.id === id);
      if (req) {
        if (s.includes('status = ?')) {
          req.status = params[0];
        } else if (s.includes("status = 'cancelled'")) {
          req.status = 'cancelled';
        } else if (s.includes("status = 'pending'")) {
          req.status = 'pending';
        } else if (s.includes("status = 'in_progress'")) {
          req.status = 'in_progress';
        } else if (s.includes("status = 'resolved'")) {
          req.status = 'resolved';
        }
        if (s.includes('admin_notes = ?')) {
          req.admin_notes = params[1];
        }
        if (s.includes('resolved_at =')) {
          req.resolved_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
        }
        req.updated_at = new Date().toISOString();
        return { insertId: 0, affectedRows: 1 };
      }
      return { insertId: 0, affectedRows: 0 };
    }

    // Delete maintenance request
    if (s.startsWith('delete from maintenance_requests')) {
      const idMatch = s.match(/where\s+id\s*=\s*(\d+|\?)/);
      const id = params.length > 0 ? Number(params[0]) : (idMatch && idMatch[1] !== '?' ? Number(idMatch[1]) : NaN);
      const idx = this.memoryStore.maintenance_requests.findIndex((r: any) => r.id === id);
      if (idx !== -1) {
        this.memoryStore.maintenance_requests.splice(idx, 1);
        return { insertId: 0, affectedRows: 1 };
      }
      return { insertId: 0, affectedRows: 0 };
    }

    // Insert audit log
    if (s.startsWith('insert into audit_logs')) {
      const id = ++this.memoryStore.counters.audit_logs;
      const [user_id, action, entity_type, entity_id, details, ip_address] = params;
      this.memoryStore.audit_logs.push({
        id,
        user_id: user_id || null,
        action,
        entity_type,
        entity_id: entity_id || null,
        details: typeof details === 'object' ? JSON.stringify(details) : details,
        ip_address: ip_address || null,
        created_at: new Date().toISOString()
      });
      return { insertId: id, affectedRows: 1 };
    }

    return { insertId: 0, affectedRows: 0 };
  }
}

export const db = new DatabaseManager();
