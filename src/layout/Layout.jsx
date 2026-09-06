import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { NAV_ITEMS } from "../data/navConfig";
import { useAuth } from "../context/AuthContext";
import BrandMark from "../components/BrandMark";
import ThemeToggle from "../components/ThemeToggle";

function Layout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(currentUser.role)
  );

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <aside
        className="d-flex flex-column p-3"
        style={{
          width: "230px",
          background: "var(--sidebar-bg)",
          color: "var(--text-main)",
          borderRight: "1px solid var(--border-soft)",
        }}
      >
        <div className="navbar-brand mb-4 d-flex align-items-center gap-2">
          <BrandMark size={22} color="var(--bubblegum)" />
          Baba-Jay Paints
        </div>
        <nav className="nav flex-column gap-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className="nav-link rounded px-2 py-2"
              style={({ isActive }) => ({
                background: isActive ? "var(--bubblegum)" : "transparent",
                color: isActive ? "#ffffff" : "var(--text-main)",
              })}
            >
              <i className={`bi ${item.icon} me-2`}></i>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Brand motto — small, always-present footer tagline */}
        <div className="mt-auto pt-3" style={{ borderTop: "1px solid var(--border-soft)" }}>
          <p className="small fst-italic mb-0" style={{ color: "var(--steel)", lineHeight: 1.3 }}>
            "Colours for Every Space, Quality for Every Project"
          </p>
        </div>
      </aside>

      <div className="flex-grow-1 d-flex flex-column">
        <header
          className="d-flex justify-content-between align-items-center px-4 py-3 bg-white"
          style={{ borderBottom: "3px solid var(--bubblegum)" }}
        >
          <span className="text-muted">Welcome back, {currentUser.name}</span>
          <div className="d-flex align-items-center gap-2">
            <ThemeToggle />
            <span className="badge" style={{ background: "var(--bubblegum)" }}>
              {currentUser.role}
            </span>
            <button className="btn btn-sm btn-outline-secondary" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </header>
        <main className="p-4 flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
