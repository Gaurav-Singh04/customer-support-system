import { Hono } from 'hono';
import { createDbStatus } from '@swades/db';

export const healthRoutes = new Hono().get('/health', (c) => {
  return c.json({
    status: 'ok' as const,
    database: createDbStatus(),
    timestamp: new Date().toISOString(),
  });
});
