// src/routes/v2/tasks.ts
import { Router } from 'express';
import { authenticateJWT } from '../../middleware/AuthenticateJWT';
import { TaskControllerV2 } from '../../controllers/TaskControllerV2';
import { listQueryRules, createTaskV2Rules, updateTaskV2Rules, idParamRules } from '../../validators/Task';
import { validate } from '../../validators/Validate';

const router = Router();
const ctrl = new TaskControllerV2();

router.use(authenticateJWT);

router.get('/tasks', listQueryRules, validate, ctrl.list);
router.get('/tasks/:id', idParamRules, validate, ctrl.get);
router.post('/tasks', createTaskV2Rules, validate, ctrl.create);
router.put('/tasks/:id', updateTaskV2Rules, validate, ctrl.update);
router.delete('/tasks/:id', idParamRules, validate, ctrl.remove);

export default router;
