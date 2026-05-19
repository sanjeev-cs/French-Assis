import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import aiRoutes from './routes/ai.js';
import historyRoutes from './routes/history.js';
import translateRoutes from './routes/translate.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: false
  })
);
app.use(express.json({ limit: '16kb' }));
app.use(apiRateLimiter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', translateRoutes);
app.use('/api', aiRoutes);
app.use('/api', historyRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(env.port, () => {
      console.log(`FrenchEase API running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

export default app;
