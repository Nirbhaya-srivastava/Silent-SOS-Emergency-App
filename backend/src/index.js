import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { apiRouter } from './routes/index.js';
import { dbService } from './services/databaseService.js';

async function bootstrap() {
  await dbService.init();

  const app = express();
  const PORT = config.port || 5000;

  app.use(helmet());

  app.use(
    cors({
      origin: config.frontendUrl || true,
      credentials: true,
    })
  );

  app.use(express.json());

  app.use('/api', apiRouter);
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `[BACKEND API] Silent SOS API standalone server active on port ${PORT}`
    );
  });
}

bootstrap().catch((err) => {
  console.error('[FATAL BOOTSTRAP ERROR]', err);
  process.exit(1);
});