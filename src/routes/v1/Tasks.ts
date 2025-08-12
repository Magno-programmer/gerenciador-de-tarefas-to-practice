// src/routes/v1/tasks.ts
import { Router } from 'express';
import { authenticateJWT } from '../../middleware/AuthenticateJWT';
import { TaskController } from '../../controllers/TaskController';
import { listQueryRules, createTaskRules, updateTaskRules, idParamRules } from '../../validators/Task';
import { validate } from '../../validators/Validate';

const router = Router();
const ctrl = new TaskController();

router.use(authenticateJWT);

router.get('/tasks', listQueryRules, validate, ctrl.list);
router.get('/tasks/:id', idParamRules, validate, ctrl.get);
router.post('/tasks', createTaskRules, validate, ctrl.create);
router.put('/tasks/:id', updateTaskRules, validate, ctrl.update);
router.delete('/tasks/:id', idParamRules, validate, ctrl.remove);

export default router;
