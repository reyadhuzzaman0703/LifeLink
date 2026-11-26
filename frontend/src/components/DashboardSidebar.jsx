import "./Dashboard.css";

const navigationItems = [
  {
    id: "overview",
    label: "Overview",
    icon: "⌂",
  },
  {
    id: "blood-requests",
    label: "Blood Requests",
    icon: "♡",
  },
  {
    id: "donations",
    label: "Donation History",
    icon: "✚",
  },
  {
    id: "request-history",
    label: "Request History",
    icon: "▤",
  },
  {
    id: "emergency",
    label: "Emergency Bulletin",
    icon: "⚠",
  },
  {
    id: "profile",
    label: "My Profile",
    icon: "♙",
  },
];

function DashboardSidebar({
  activeSection,
  onNavigate,
  user,
  onLogout,
}) {
  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">L</div>

        <div>
          <h2>LifeLink</h2>
          <p>Blood Donation Platform</p>
        </div>
      </div>

      <div className="sidebar-menu">
        <p className="sidebar-menu-title">MAIN MENU</p>

        {navigationItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${
              activeSection === item.id ? "active" : ""
            }`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}

        {user?.role === "admin" && (
          <>
            <p className="sidebar-menu-title sidebar-admin-title">
              ADMINISTRATION
            </p>

            <button
              className={`sidebar-nav-item ${
                activeSection === "admin" ? "active" : ""
              }`}
              onClick={() => onNavigate("admin")}
            >
              <span className="sidebar-nav-icon">⚙</span>
              <span>Admin Panel</span>
            </button>
          </>
        )}
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className="sidebar-user-info">
            <h4>{user?.name || "LifeLink User"}</h4>
            <p>{user?.role === "admin" ? "Administrator" : "Donor"}</p>
          </div>
        </div>

        <button className="sidebar-logout" onClick={onLogout}>
          <span>↪</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default DashboardSidebar;