import { ApiError } from '../lib/errors';
import { listAgents, getAgentCapabilities } from '../agents/capabilities';

export function getAll() {
  return listAgents();
}

export function getCapabilities(type: string) {
  const agent = getAgentCapabilities(type);

  if (!agent) {
    throw ApiError.notFound(`Agent type '${type}' not found`);
  }

  return agent;
}
