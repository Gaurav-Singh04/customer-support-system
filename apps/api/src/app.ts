import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { healthRoutes } from './routes/health';
import { chatRoutes } from './routes/chat';
import { agentRoutes } from './routes/agents';

const app = new Hono();

app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    maxAge: 86400,
  }),
);

app.onError(errorHandler);
app.notFound(notFoundHandler);

const routes = app
  .route('/api', healthRoutes)
  .route('/api/chat', chatRoutes)
  .route('/api/agents', agentRoutes);

export type AppType = typeof routes;

export { app };
