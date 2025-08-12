// src/controllers/TaskController.ts
import { TaskService, NotFoundError } from '../service/TaskService';

export class TaskController {
  constructor(private service = new TaskService()) {}

  list = async (req: any, res: any) => {
    const userId = req.user.id;
    const tasks = await this.service.list(userId, {
      status: req.query.status,
      order: req.query.order,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      offset: req.query.offset ? Number(req.query.offset) : undefined,
    });
    res.json(tasks);
  };

  get = async (req: any, res: any) => {
    try {
      const userId = req.user.id;
      const id = Number(req.params.id);
      const task = await this.service.get(id, userId);
      res.json(task);
    } catch (e: any) {
      if (e instanceof NotFoundError) return res.status(404).json({ error: 'not found' });
      throw e;
    }
  };

  create = async (req: any, res: any) => {
    const userId = req.user.id;
    const task = await this.service.create(userId, req.body ?? {});
    res.status(201).json(task);
  };

  update = async (req: any, res: any) => {
    try {
      const userId = req.user.id;
      const id = Number(req.params.id);
      const task = await this.service.update(id, userId, req.body ?? {});
      res.json(task);
    } catch (e: any) {
      if (e instanceof NotFoundError) return res.status(404).json({ error: 'not found' });
      throw e;
    }
  };

  remove = async (req: any, res: any) => {
    try {
      const userId = req.user.id;
      const id = Number(req.params.id);
      await this.service.remove(id, userId);
      res.status(204).send();
    } catch (e: any) {
      if (e instanceof NotFoundError) return res.status(404).json({ error: 'not found' });
      throw e;
    }
  };
}
