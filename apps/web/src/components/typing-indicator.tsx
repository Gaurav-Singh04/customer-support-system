import type { AgentType } from '../types';

const AGENT_STATUS: Record<string, string> = {
  support: 'Thinking\u2026',
  order: 'Checking order\u2026',
  billing: 'Reviewing invoice\u2026',
};

interface Props {
  agentType: AgentType | null;
}

export function TypingIndicator({ agentType }: Props) {
  const label = (agentType && AGENT_STATUS[agentType]) || 'Thinking\u2026';

  return (
    <div className="typing-indicator">
      <div className="typing-indicator__dots">
        <span />
        <span />
        <span />
      </div>
      <span className="typing-indicator__label">{label}</span>
    </div>
  );
}
