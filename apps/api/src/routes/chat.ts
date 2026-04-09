import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import * as chatController from '../controllers/chat.controller';

const sendMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  customerId: z.string().uuid(),
  content: z.string().min(1).max(10_000),
});

export const chatRoutes = new Hono()
  .get('/conversations', async (c) => {
    const customerId = c.req.query('customerId');
    const conversations = await chatController.listConversations(customerId);
    return c.json({ conversations });
  })
  .get('/conversations/:id', async (c) => {
    const conversation = await chatController.getConversation(c.req.param('id'));
    return c.json({ conversation });
  })
  .delete('/conversations/:id', async (c) => {
    const result = await chatController.deleteConversation(c.req.param('id'));
    return c.json(result);
  })
  .post('/messages', zValidator('json', sendMessageSchema), async (c) => {
    const body = c.req.valid('json');
    const { response } = await chatController.sendMessage(body);
    return response;
  });
