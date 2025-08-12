// src/repositories/TaskRepositoryV2.ts
import { db } from '../db';
import type { TaskV2 } from '../models/TaskV2';
import type { ListFilters } from './TaskRepository';

export class TaskRepositoryV2 {
  async listByUser(userId: number, f: ListFilters = {}): Promise<TaskV2[]> {
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

    const { rows } = await db.query<TaskV2>(
      `SELECT id, title, description, status, due_date, user_id, priority
         FROM tasks
         ${where}
         ORDER BY ${order}
         LIMIT $${params.length - 1}
        OFFSET $${params.length}`,
      params
    );
    return rows;
  }

  async getById(id: number, userId: number): Promise<TaskV2 | null> {
    const { rows } = await db.query<TaskV2>(
      `SELECT id, title, description, status, due_date, user_id, priority
         FROM tasks
        WHERE id=$1 AND user_id=$2`,
      [id, userId]
    );
    return rows[0] ?? null;
  }

  async create(input: Omit<TaskV2, 'id' | 'user_id'> & { user_id: number }): Promise<TaskV2> {
    const { title, description, status, due_date, priority, user_id } = input;
    const { rows } = await db.query<TaskV2>(
      `INSERT INTO tasks (title, description, status, due_date, user_id, priority)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, title, description, status, due_date, user_id, priority`,
      [title, description ?? null, status ?? 'pending', due_date ?? null, user_id, priority ?? 'normal']
    );
    return rows[0];
  }

  async update(id: number, userId: number, patch: Partial<Omit<TaskV2, 'id' | 'user_id'>>): Promise<TaskV2 | null> {
    const { title, description, status, due_date, priority } = patch;
    const { rows } = await db.query<TaskV2>(
      `UPDATE tasks SET
         title       = COALESCE($1, title),
         description = COALESCE($2, description),
         status      = COALESCE($3, status),
         due_date    = COALESCE($4, due_date),
         priority    = COALESCE($5, priority)
       WHERE id=$6 AND user_id=$7
       RETURNING id, title, description, status, due_date, user_id, priority`,
      [title ?? null, description ?? null, status ?? null, due_date ?? null, priority ?? null, id, userId]
    );
    return rows[0] ?? null;
  }

  async remove(id: number, userId: number): Promise<boolean> {
    const { rowCount } = await db.query(`DELETE FROM tasks WHERE id=$1 AND user_id=$2`, [id, userId]);
    return !!rowCount;
  }
}
