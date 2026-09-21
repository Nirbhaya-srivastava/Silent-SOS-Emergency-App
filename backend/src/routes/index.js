import { Router } from 'express';
import { adminRouter } from './adminRoutes.js';
import { alertRouter } from './alertRoutes.js';
import { authRouter } from './authRoutes.js';
import { contactRouter } from './contactRoutes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/contacts', contactRouter);
apiRouter.use('/alerts', alertRouter);
apiRouter.use('/admin', adminRouter);

apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Silent SOS API',
    timestamp: new Date().toISOString(),
  });
});
