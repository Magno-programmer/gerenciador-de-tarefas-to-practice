import { db } from '../db';
import type { User } from '../models/User';

export class UserRepository {
    async findUserByEmail(email: string): Promise<User | null> {
        const { rows } = await db.query<User>(
            'SELECT id, name, email, password_hash FROM users WHERE email=$1',
            [email]
        );
        return rows[0] ?? null;
    }

    async createUser(name: string, email: string, password_hash: string) {
        const { rows } = await db.query(
            `INSERT INTO users (name, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, name, email`,
             [name, email, password_hash]
        );
        return rows[0];
    }
    
    async updateUser(email: string, name: string, password_hash: string): Promise<User | null> 
    {
        const { rows } = await db.query(
            `UPDATE users
            SET name=$1, password_hash=$2
            WHERE email=$3
            RETURNING id, name, email`,
            [name, password_hash, email]
        );
        return rows[0] ?? null;
    }

    async deleteUserByEmail(email: string): Promise<User | null> {
        const { rows } = await db.query(
            'DELETE FROM users WHERE email=$1 RETURNING id, name, email',
            [email]
        );
        return rows[0] ?? null;
    }
}