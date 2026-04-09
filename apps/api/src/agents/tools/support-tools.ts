import { tool, zodSchema } from 'ai';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import {
  messages,
  customers,
  conversations,
  type DatabaseClient,
} from '@swades/db';

export function createSupportTools(db: DatabaseClient, customerId: string) {
  return {
    getConversationHistory: tool({
      description:
        'Retrieve messages from a specific conversation. Useful for reviewing context beyond the recent message window.',
      parameters: zodSchema(
        z.object({
          conversationId: z.string().uuid().describe('The conversation ID'),
        }),
      ),
      execute: async ({ conversationId }) => {
        const convo = await db.query.conversations.findFirst({
          where: and(
            eq(conversations.id, conversationId),
            eq(conversations.customerId, customerId),
          ),
        });
        if (!convo) return { error: 'Conversation not found' };

        const rows = await db.query.messages.findMany({
          where: eq(messages.conversationId, conversationId),
          orderBy: [messages.createdAt],
          limit: 50,
        });
        return rows.map((m) => ({
          role: m.role,
          content: m.content,
          agentType: m.agentType,
          createdAt: m.createdAt.toISOString(),
        }));
      },
    }),

    getCustomerInfo: tool({
      description:
        'Look up the current customer profile including name, email, and phone.',
      parameters: zodSchema(z.object({})),
      execute: async () => {
        const customer = await db.query.customers.findFirst({
          where: eq(customers.id, customerId),
        });
        if (!customer) return { error: 'Customer not found' };
        return {
          id: customer.id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
        };
      },
    }),
  };
}
