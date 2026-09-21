import { Router } from 'express';
import {
  acknowledgeAlert,
  createAlert,
  getAlertById,
  getAlerts,
  resolveAlert,
  updateAlertLocation,
  updateAlertStatus,
} from '../controllers/alertController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

export const alertRouter = Router();

alertRouter.use(requireAuth);

alertRouter.post('/', createAlert);
alertRouter.get('/', getAlerts);
alertRouter.get('/:id', getAlertById);
alertRouter.patch('/:id/location', updateAlertLocation);
alertRouter.patch('/:id/status', updateAlertStatus);
alertRouter.post('/:id/acknowledge', acknowledgeAlert);
alertRouter.post('/:id/resolve', resolveAlert);
