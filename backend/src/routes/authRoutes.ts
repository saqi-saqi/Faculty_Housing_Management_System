import { Router } from 'express';
import { login, register, me, loginSchema, registerSchema } from '../controllers/authController.js';
import { validateBody } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.post('/login', validateBody(loginSchema), login);
router.post('/register', validateBody(registerSchema), register);
router.get('/me', authenticate, me);

export default router;
