// src/service/TaskServiceV2.ts
import { TaskRepositoryV2 } from '../repositories/TaskRepositoryV2';
import type { ListFilters } from '../repositories/TaskRepository';

export class NotFoundError extends Error { status = 404; }

export class TaskServiceV2 {
  constructor(private repo = new TaskRepositoryV2()) {}

  list(userId: number, f: ListFilters) {
    return this.repo.listByUser(userId, f);
  }

  async get(id: number, userId: number) {
    const t = await this.repo.getById(id, userId);
    if (!t) throw new NotFoundError('not found');
    return t;
  }

  create(userId: number, data: { title: string; description?: string | null; status?: 'pending' | 'done'; due_date?: string | null; priority?: 'low'|'normal'|'high' }) {
    return this.repo.create({
      title: String(data.title).trim(),
      description: data.description ?? null,
      status: (data.status ?? 'pending'),
      due_date: data.due_date ?? null,
      priority: data.priority ?? 'normal',
      user_id: userId,
    });
  }

  async update(id: number, userId: number, patch: Partial<{ title: string; description: string | null; status: 'pending' | 'done'; due_date: string | null; priority: 'low'|'normal'|'high' }>) {
    const updated = await this.repo.update(id, userId, patch);
    if (!updated) throw new NotFoundError('not found');
    return updated;
  }

  async remove(id: number, userId: number) {
    const ok = await this.repo.remove(id, userId);
    if (!ok) throw new NotFoundError('not found');
  }
}
