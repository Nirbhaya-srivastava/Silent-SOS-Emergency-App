import { Router } from 'express';
import { getAdminAlerts, getAdminMetrics } from '../controllers/adminController.js';
import { requireAdmin, requireAuth } from '../middleware/authMiddleware.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/alerts', getAdminAlerts);
adminRouter.get('/metrics', getAdminMetrics);
