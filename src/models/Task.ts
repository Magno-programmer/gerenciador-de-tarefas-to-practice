import { User } from './User';

export type JWTPayload = { userId: User['id'] };

export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: 'pending' | 'done';
  due_date: string | null; // ISO
  user_id: User['id'];
  // v2
  // priority?: 'low' | 'normal' | 'high';
};
