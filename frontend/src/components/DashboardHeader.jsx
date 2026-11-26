import "./Dashboard.css";

const sectionDetails = {
  overview: {
    title: "Dashboard",
    subtitle: "Welcome back to your LifeLink dashboard.",
  },
  "blood-requests": {
    title: "Blood Requests",
    subtitle: "Find and manage blood donation requests.",
  },
  donations: {
    title: "Donation History",
    subtitle: "Your contribution to saving lives.",
  },
  "request-history": {
    title: "Request History",
    subtitle: "Track your previous blood requests.",
  },
  emergency: {
    title: "Emergency Bulletin",
    subtitle: "Stay informed about critical blood emergencies.",
  },
  profile: {
    title: "My Profile",
    subtitle: "Manage your personal information.",
  },
  admin: {
    title: "Admin Panel",
    subtitle: "Manage and monitor the LifeLink platform.",
  },
};

function DashboardHeader({ user, activeSection }) {
  const currentSection =
    sectionDetails[activeSection] || sectionDetails.overview;

  return (
    <header className="dashboard-header">
      <div className="header-page-info">
        <p className="header-breadcrumb">
          LifeLink <span>/</span> {currentSection.title}
        </p>

        <h1>{currentSection.title}</h1>

        <p className="header-subtitle">
          {currentSection.subtitle}
        </p>
      </div>

      <div className="header-user">
        <div className="header-user-info">
          <h4>{user?.name || "LifeLink User"}</h4>
          <p>
            {user?.role === "admin"
              ? "Administrator"
              : "Blood Donor"}
          </p>
        </div>

        <div className="header-user-avatar">
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;