import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { checkPoolHealth, getPoolStats } from './lib/db-pool.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

import onboardingRoutes from './routes/onboarding.routes.js';
import chatRoutes from './routes/chat.routes.js';
import healthRoutes from './routes/health.routes.js';

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api', onboardingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/health', healthRoutes);

app.get('/', (req, res) => {
  res.send('Yapay Zeka Chatbot API');
});

// Health check endpoint with database pool stats
app.get('/health', async (req, res) => {
  const poolStats = getPoolStats();
  const dbHealthy = await checkPoolHealth();
  
  const health = {
    status: dbHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      healthy: dbHealthy,
      pool: {
        total: poolStats.total,
        idle: poolStats.idle,
        waiting: poolStats.waiting,
        utilization: poolStats.total > 0 
          ? Math.round(((poolStats.total - poolStats.idle) / poolStats.total) * 100) 
          : 0,
      },
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
  };
  
  res.status(dbHealthy ? 200 : 503).json(health);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
