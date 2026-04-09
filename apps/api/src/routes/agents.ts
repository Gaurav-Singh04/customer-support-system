import { Hono } from 'hono';
import * as agentsController from '../controllers/agents.controller';

export const agentRoutes = new Hono()
  .get('/agents', (c) => {
    const agents = agentsController.getAll();
    return c.json({ agents });
  })
  .get('/:type/capabilities', (c) => {
    const agent = agentsController.getCapabilities(c.req.param('type'));
    return c.json({ agent });
  });
