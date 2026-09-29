import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/connection.js';
import { ENV } from '../config/env.js';
import { User, Faculty, AuthTokenPayload, UserPublic } from '../types/index.js';

export class AuthService {
  public async login(email: string, password: string): Promise<{
    token: string;
    user: UserPublic;
    faculty: Faculty | null;
  }> {
    const users = await db.query<User>(
      'SELECT id, email, password_hash, role, faculty_id, is_active FROM users WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    if (!users.length) {
      throw new Error('Invalid email or password');
    }

    const user = users[0];

    if (!user.is_active) {
      throw new Error('Account has been deactivated. Please contact Estate Office administration.');
    }

    // Verify password with bcrypt (supports fallback for legacy plain text migration)
    let isMatch = false;
    if (user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password_hash);
    } else {
      // Legacy plain text check & auto-migration
      if (password === user.password_hash) {
        isMatch = true;
        const newHash = await bcrypt.hash(password, 10);
        await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, user.id]);
        console.log(`[AuthService] Migrated plain text password to bcrypt for ${user.email}`);
      }
    }

    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    // Dynamic hasHouse check
    let hasHouse = false;
    let faculty: Faculty | null = null;

    if (user.faculty_id) {
      const facs = await db.query<Faculty>(
        'SELECT id, name, email, department, grade_id, contact, joined_since FROM faculty WHERE id = ?',
        [user.faculty_id]
      );
      if (facs.length) {
        faculty = facs[0];
        const activeTenancies = await db.query(
          'SELECT id FROM tenancies WHERE faculty_id = ? AND end_date IS NULL',
          [faculty.id]
        );
        hasHouse = activeTenancies.length > 0;
      }
    }

    const payload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      facultyId: user.faculty_id
    };

    const token = jwt.sign(payload, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_EXPIRES_IN as any
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        faculty_id: user.faculty_id,
        hasHouse
      },
      faculty
    };
  }

  public async register(email: string, password: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Verify that email exists in the official faculty employee roster
    const facs = await db.query<Faculty>(
      'SELECT id, name, email FROM faculty WHERE email = ?',
      [cleanEmail]
    );

    if (!facs.length) {
      throw new Error('This email is not associated with any registered university faculty member.');
    }

    const faculty = facs[0];

    // 2. Verify that a user account does not already exist
    const existingUsers = await db.query<User>(
      'SELECT id FROM users WHERE email = ?',
      [cleanEmail]
    );

    if (existingUsers.length > 0) {
      throw new Error('An account with this email address already exists. Please sign in.');
    }

    // 3. Hash password and insert user linked to faculty
    const passwordHash = await bcrypt.hash(password, 10);

    await db.execute(
      'INSERT INTO users (email, password_hash, role, faculty_id, is_active) VALUES (?, ?, ?, ?, ?)',
      [cleanEmail, passwordHash, 'faculty', faculty.id, true]
    );

    await db.execute(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [null, 'USER_REGISTERED', 'user', faculty.id, `Faculty member ${faculty.name} registered account`]
    );

    return {
      success: true,
      message: 'Account created successfully. You can now sign in.'
    };
  }

  public async getCurrentUser(userId: number): Promise<{
    user: UserPublic;
    faculty: Faculty | null;
  }> {
    const users = await db.query<User>(
      'SELECT id, email, role, faculty_id, is_active FROM users WHERE id = ?',
      [userId]
    );

    if (!users.length) {
      throw new Error('User not found');
    }

    const user = users[0];
    let hasHouse = false;
    let faculty: Faculty | null = null;

    if (user.faculty_id) {
      const facs = await db.query<Faculty>(
        'SELECT id, name, email, department, grade_id, contact, joined_since FROM faculty WHERE id = ?',
        [user.faculty_id]
      );
      if (facs.length) {
        faculty = facs[0];
        const activeTenancies = await db.query(
          'SELECT id FROM tenancies WHERE faculty_id = ? AND end_date IS NULL',
          [faculty.id]
        );
        hasHouse = activeTenancies.length > 0;
      }
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        faculty_id: user.faculty_id,
        hasHouse
      },
      faculty
    };
  }
}

export const authService = new AuthService();
