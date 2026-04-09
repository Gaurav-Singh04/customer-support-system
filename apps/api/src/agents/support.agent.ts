import { streamText } from 'ai';
import { getChatModel } from './model';
import { createSupportTools } from './tools/support-tools';
import type { AgentContext, AgentStreamResult } from './types';

const SYSTEM_PROMPT = `You are a friendly and professional customer support agent.
You help customers with general inquiries, provide policy guidance, and offer assistance.

You have tools to look up customer information and conversation history.
Use them when needed to give accurate, personalised responses.

Guidelines:
- Be concise but thorough
- If you lack information, ask a clarifying question
- Never fabricate data — use your tools to look up real records
- Format currency amounts clearly (e.g. USD 12.99)`;

export function invoke(ctx: AgentContext): AgentStreamResult {
  return streamText({
    model: getChatModel(),
    system: SYSTEM_PROMPT,
    messages: ctx.messages,
    tools: createSupportTools(ctx.db, ctx.customerId),
    maxSteps: 3,
  });
}
