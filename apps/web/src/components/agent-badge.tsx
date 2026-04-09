import type { AgentType } from '../types';

const AGENT_CONFIG: Record<string, { label: string; className: string }> = {
  support: { label: 'Support', className: 'agent-badge--support' },
  order: { label: 'Order', className: 'agent-badge--order' },
  billing: { label: 'Billing', className: 'agent-badge--billing' },
  fallback: { label: 'Assistant', className: 'agent-badge--support' },
};

interface Props {
  agentType: AgentType;
}

export function AgentBadge({ agentType }: Props) {
  const config = AGENT_CONFIG[agentType] ?? AGENT_CONFIG.fallback;
  return <span className={`agent-badge ${config.className}`}>{config.label}</span>;
}
