import { Router } from 'express';
import { getMe, login, logout, register } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/me', requireAuth, getMe);
authRouter.post('/logout', logout);
