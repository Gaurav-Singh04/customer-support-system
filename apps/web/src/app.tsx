const WORKSPACES = ['apps/api', 'apps/web', 'packages/db'];

export function App() {
  return (
    <main className="app-shell">
      <section className="card">
        <p className="eyebrow">Swades Assignment</p>
        <h1>Monorepo bootstrap complete</h1>
        <p className="copy">
          The Turborepo foundation is in place. Next steps can add chat routes, agents, and
          database-backed tools on top of these workspaces.
        </p>

        <ul className="workspace-list">
          {WORKSPACES.map((workspace) => (
            <li key={workspace}>{workspace}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
