// src/repositories/TaskRepository.ts
import { db } from '../db';
import type { Task } from '../models/Task';

export type ListFilters = {
  status?: Task['status'];
  order?: 'due_date_asc' | 'due_date_desc' | 'id_desc' | 'id_asc';
  limit?: number;
  offset?: number;
};

export class TaskRepository {
  async listByUser(userId: number, f: ListFilters = {}): Promise<Task[]> {
    const order =
      f.order === 'due_date_asc'  ? 'due_date ASC NULLS LAST' :
      f.order === 'due_date_desc' ? 'due_date DESC NULLS LAST' :
      f.order === 'id_asc'        ? 'id ASC' : 'id DESC';

    const params: any[] = [userId];
    let where = 'WHERE user_id=$1';
    if (f.status) {
      params.push(f.status);
      where += ` AND status=$${params.length}`;
    }

    params.push(f.limit ?? 50);
    params.push(f.offset ?? 0);

    const { rows } = await db.query<Task>(
      `SELECT id, title, description, status, due_date, user_id
         FROM tasks
         ${where}
         ORDER BY ${order}
         LIMIT $${params.length - 1}
        OFFSET $${params.length}`,
      params
    );
    return rows;
  }

  async getById(id: number, userId: number): Promise<Task | null> {
    const { rows } = await db.query<Task>(
      `SELECT id, title, description, status, due_date, user_id
         FROM tasks
        WHERE id=$1 AND user_id=$2`,
      [id, userId]
    );
    return rows[0] ?? null;
  }

  async create(input: Omit<Task, 'id' | 'user_id'> & { user_id: number }): Promise<Task> {
    const { title, description, status, due_date, user_id } = input;
    const { rows } = await db.query<Task>(
      `INSERT INTO tasks (title, description, status, due_date, user_id)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, title, description, status, due_date, user_id`,
      [title, description ?? null, status ?? 'pending', due_date ?? null, user_id]
    );
    return rows[0];
  }

  async update(id: number, userId: number, patch: Partial<Omit<Task, 'id' | 'user_id'>>): Promise<Task | null> {
    const { title, description, status, due_date } = patch;
    const { rows } = await db.query<Task>(
      `UPDATE tasks SET
         title       = COALESCE($1, title),
         description = COALESCE($2, description),
         status      = COALESCE($3, status),
         due_date    = COALESCE($4, due_date)
       WHERE id=$5 AND user_id=$6
       RETURNING id, title, description, status, due_date, user_id`,
      [title ?? null, description ?? null, status ?? null, due_date ?? null, id, userId]
    );
    return rows[0] ?? null;
  }

  async remove(id: number, userId: number): Promise<boolean> {
    const { rowCount } = await db.query(`DELETE FROM tasks WHERE id=$1 AND user_id=$2`, [id, userId]);
    return !!rowCount;
  }
}
