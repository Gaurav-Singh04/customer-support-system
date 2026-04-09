interface Props {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: Props) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <h2 className="empty-state__title">{title}</h2>
      <p className="empty-state__description">{description}</p>
    </div>
  );
}
