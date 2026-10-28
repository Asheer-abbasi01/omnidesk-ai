import { Router } from 'express';
import { isDatabaseReady } from '../../config/database.js';
import { isRedisReady } from '../../config/redis.js';

export const healthRouter = Router();

healthRouter.get('/live', (_req, res) => res.json({ status: 'ok' }));

healthRouter.get('/ready', async (_req, res) => {
  const mongo = isDatabaseReady();
  const redisOk = await isRedisReady();
  const ready = mongo && redisOk;
  res.status(ready ? 200 : 503).json({
    status: ready ? 'ready' : 'not_ready',
    checks: { mongodb: mongo ? 'up' : 'down', redis: redisOk ? 'up' : 'down' },
  });
});