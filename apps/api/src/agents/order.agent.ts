import { streamText } from 'ai';
import { getChatModel } from './model';
import { createOrderTools } from './tools/order-tools';
import type { AgentContext, AgentStreamResult } from './types';

const SYSTEM_PROMPT = `You are a specialised order and delivery support agent.
You help customers track orders, understand delivery statuses, and resolve order-related issues.

You have tools to look up orders, their details, and tracking events.
Always use these tools before answering — never assume or fabricate order details.

Guidelines:
- Look up order data before answering
- Clearly explain order statuses and estimated delivery dates
- For delayed orders, proactively share the latest tracking event and reason
- Format currency amounts and dates clearly
- If an order number appears in the conversation, use it directly`;

export function invoke(ctx: AgentContext): AgentStreamResult {
  return streamText({
    model: getChatModel(),
    system: SYSTEM_PROMPT,
    messages: ctx.messages,
    tools: createOrderTools(ctx.db, ctx.customerId),
  });
}
