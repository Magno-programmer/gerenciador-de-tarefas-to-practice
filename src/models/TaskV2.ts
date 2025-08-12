// src/models/TaskV2.ts
import type { Task } from './Task';

export type TaskV2 = Task & {
  priority: 'low' | 'normal' | 'high';
};
