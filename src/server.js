import http from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { connectRedis, disconnectRedis } from './config/redis.js';

async function main() {
  await connectDatabase();
  await connectRedis();

  const server = http.createServer(createApp());
  server.listen(env.PORT, () => logger.info(`OmniDesk API on port ${env.PORT}`));

  let shuttingDown = false;
  const shutdown = (signal, exitCode = 0) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info(`${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDatabase();
      await disconnectRedis();
      process.exit(exitCode);
    });
    setTimeout(() => process.exit(1), 10_000).unref(); // force-exit if stuck
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (err) => {
    logger.error({ err }, 'unhandledRejection');
    shutdown('unhandledRejection', 1);
  });
  process.on('uncaughtException', (err) => {
    logger.error({ err }, 'uncaughtException');
    shutdown('uncaughtException', 1);
  });
}

main().catch((err) => {
  logger.error({ err }, 'Failed to start');
  process.exit(1);
});