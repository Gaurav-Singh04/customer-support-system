import { generateObject, zodSchema } from 'ai';
import { z } from 'zod';
import { getChatModel } from './model';
import type { ModelMessage } from 'ai';
import type { RoutableAgentType } from './types';

const ROUTER_SYSTEM_PROMPT = `You are an intent classifier for a customer support system.
Classify the user's latest message into exactly one agent type:

- "order": orders, deliveries, shipments, tracking, delays, cancellations
- "billing": invoices, payments, refunds, charges, pricing, billing discrepancies
- "support": general questions, greetings, unclear intent, policy questions, or anything else

When uncertain, choose "support".`;

export async function classifyIntent(contextMessages: ModelMessage[]): Promise<RoutableAgentType> {
  try {
    const { object } = await generateObject({
      model: getChatModel(),
      schema: zodSchema(
        z.object({
          agentType: z.enum(['support', 'order', 'billing']),
        }),
      ),
      system: ROUTER_SYSTEM_PROMPT,
      messages: contextMessages,
    });

    return object.agentType;
  } catch {
    return 'support';
  }
}
