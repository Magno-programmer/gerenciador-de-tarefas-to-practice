// src/validators/task.ts
import { body, param, query } from 'express-validator';

export const listQueryRules = [
  query('status').optional().isIn(['pending', 'done']),
  query('order').optional().isIn(['due_date_asc', 'due_date_desc', 'id_desc', 'id_asc']),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('offset').optional().isInt({ min: 0, max: 10_000 }).toInt(),
];

export const createTaskRules = [
  body('title').isString().trim().isLength({ min: 1, max: 200 }),
  body('description').optional({ values: 'falsy' }).isString().trim().isLength({ max: 2000 }),
  body('status').optional().isIn(['pending', 'done']),
  body('due_date').optional({ values: 'falsy' }).isISO8601().toDate(),
];

export const updateTaskRules = [
  param('id').isInt({ min: 1 }).toInt(),
  body('title').optional().isString().trim().isLength({ min: 1, max: 200 }),
  body('description').optional({ values: 'falsy' }).isString().trim().isLength({ max: 2000 }),
  body('status').optional().isIn(['pending', 'done']),
  body('due_date').optional({ values: 'falsy' }).isISO8601().toDate(),
];

export const idParamRules = [param('id').isInt({ min: 1 }).toInt()];

// v2
export const createTaskV2Rules = [
  ...createTaskRules,
  body('priority').optional().isIn(['low', 'normal', 'high']),
];
export const updateTaskV2Rules = [
  ...updateTaskRules,
  body('priority').optional().isIn(['low', 'normal', 'high']),
];
