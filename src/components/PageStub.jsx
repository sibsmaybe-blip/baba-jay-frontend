// Placeholder for modules not built yet (Phases 2-6).
// Swap this out for the real page component when you build that module —
// the route in App.jsx won't need to change, just the import.
function PageStub({ title, phase }) {
  return (
    <div>
      <h2 style={{ color: "var(--plum)" }}>{title}</h2>
      <div className="alert" style={{ background: "var(--cream)", color: "var(--plum)" }}>
        This module is planned for <strong>{phase}</strong>. Layout and routing
        are already wired up — build the real screen here when you get to it.
      </div>
    </div>
  );
}

export default PageStub;
