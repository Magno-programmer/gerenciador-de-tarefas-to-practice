import { Router } from 'express';
import { AuthController } from '../../controllers/AuthController';
import { registerRules, loginRules } from '../../validators/Auth';
import { validate } from '../../validators/Validate';

const router = Router();
const ctrl = new AuthController();

router.post('/register', registerRules, validate, ctrl.register);
router.post('/login', loginRules, validate, ctrl.login)

export default router;