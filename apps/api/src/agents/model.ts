import { google } from '@ai-sdk/google';

export function getChatModel() {
  return google(process.env.AI_MODEL ?? 'gemini-3.1-flash-lite-preview');
}
