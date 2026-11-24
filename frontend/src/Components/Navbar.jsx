import React, { useState, useEffect, useRef } from 'react';
import NotificationBell from './NotificationBell';

export default function Navbar({
  user,
  isAdmin,
  activeTab,
  setActiveTab,
  activeRequestsCount,
  collaborationsCount,
  bloodRequests,
  onAcceptDonate,
  onLogout,
  toastAlert,
  onCloseToast
}) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setIsProfileMenuOpen(false);
  };

  return (
    <>
      <style>{`
        .ll-navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          width: 100%;
          background: rgba(11, 17, 26, 0.95);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(244, 63, 94, 0.22);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.45);
          padding: 10px 24px 0 24px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }
        .ll-header-top {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 8px;
        }
        .ll-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          user-select: none;
        }
        .ll-logo-box {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: linear-gradient(135deg, #F43F5E 0%, #9F1239 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 14px rgba(244, 63, 94, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .ll-brand-title {
          margin: 0;
          font-size: 21px;
          font-weight: 800;
          letter-spacing: -0.4px;
          color: #FFFFFF;
        }
        .ll-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 8px #10B981;
        }
        .ll-top-status {
          font-size: 11.5px;
          font-weight: 600;
          color: #94A3B8;
          background: #131C2A;
          border: 1px solid #1E293B;
          padding: 4px 11px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ll-header-bottom {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          gap: 4px;
        }
        .ll-fb-tab {
          position: relative;
          flex: 1;
          height: 44px;
          background: transparent;
          color: #94A3B8;
          border: none;
          border-radius: 8px 8px 0 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.18s ease, color 0.18s ease;
        }
        .ll-fb-tab:hover {
          color: #FFFFFF;
          background: rgba(255, 255, 255, 0.05);
        }
        .ll-fb-tab.active {
          color: #F43F5E;
        }
        .ll-active-bar {
          position: absolute;
          bottom: 0;
          left: 14%;
          right: 14%;
          height: 3px;
          border-radius: 3px 3px 0 0;
          background: #F43F5E;
          box-shadow: 0 0 10px rgba(244, 63, 94, 0.7);
        }
        .ll-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ll-micro-badge {
          position: absolute;
          top: -6px;
          right: -9px;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          border-radius: 999px;
          background: #E11D48;
          color: #FFFFFF;
          font-size: 9.5px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #0B111A;
          box-sizing: border-box;
        }
        .ll-fb-utility-slot {
          flex: 1;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ll-add-icon-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #F43F5E 0%, #BE123C 100%);
          color: #FFFFFF;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 14px rgba(225, 29, 72, 0.45);
          transition: transform 0.15s ease;
        }
        .ll-add-icon-btn:hover {
          transform: scale(1.07);
        }
        .ll-tooltip-host {
          position: relative;
        }
        .ll-tooltip-host::after {
          content: attr(data-tooltip);
          position: absolute;
          top: calc(100% + 6px);
          left: 50%;
          transform: translateX(-50%);
          background: #1E293B;
          color: #F8FAFC;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          border: 1px solid #334155;
          transition: opacity 0.15s ease;
          z-index: 1600;
        }
        .ll-tooltip-host:hover::after {
          opacity: 1;
        }
        .ll-profile-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ll-profile-icon-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #131C2A;
          color: #E2E8F0;
          border: 1px solid #263348;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ll-profile-icon-btn:hover,
        .ll-profile-icon-btn.open {
          border-color: #F43F5E;
          color: #FFFFFF;
          background: #1B2638;
        }
        .ll-dropdown-menu {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 240px;
          background: #111927;
          border: 1px solid #263348;
          border-radius: 16px;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.65);
          padding: 12px;
          z-index: 1500;
        }
        .ll-dropdown-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid #1E293B;
          margin-bottom: 8px;
        }
        .ll-dropdown-avatar-lg {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #FB7185, #DC2626);
          color: #FFFFFF;
          font-size: 13px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ll-dropdown-user-info {
          min-width: 0;
          flex: 1;
        }
        .ll-dropdown-name {
          color: #FFFFFF;
          font-size: 13.5px;
          font-weight: 700;
          text-transform: capitalize;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ll-dropdown-email {
          color: #94A3B8;
          font-size: 11px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 1px;
        }
        .ll-dropdown-badge {
          display: inline-block;
          margin-top: 4px;
          background: rgba(251, 191, 36, 0.14);
          color: #FBBF24;
          border: 1px solid rgba(251, 191, 36, 0.3);
          font-size: 10.5px;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: 999px;
        }
        .ll-dropdown-item {
          width: 100%;
          background: transparent;
          border: none;
          color: #CBD5E1;
          padding: 8px 10px;
          border-radius: 9px;
          font-size: 12.5px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          text-align: left;
        }
        .ll-dropdown-item:hover {
          background: #1B2638;
          color: #FFFFFF;
        }
        .ll-dropdown-divider {
          height: 1px;
          background: #1E293B;
          margin: 7px 0;
        }
        .ll-dropdown-logout {
          width: 100%;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(244, 63, 94, 0.25);
          color: #FDA4AF;
          padding: 8px 12px;
          border-radius: 9px;
          font-size: 12.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
        }
        .ll-dropdown-logout:hover {
          background: #E11D48;
          color: #FFFFFF;
        }
      `}</style>

      {toastAlert && (
        <div
          className="no-print"
          style={{
            position: 'fixed',
            bottom: '22px',
            right: '22px',
            backgroundColor: '#131C2A',
            color: '#fff',
            padding: '14px 18px',
            borderRadius: '12px',
            boxShadow: '0 8px 28px rgba(0,0,0,0.45)',
            border: '1px solid #334155',
            borderLeft: '5px solid #f43f5e',
            zIndex: 2000,
            maxWidth: '340px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px'
          }}
        >
          <span style={{ flex: 1 }}>{toastAlert}</span>
          <button
            onClick={onCloseToast}
            style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ✖
          </button>
        </div>
      )}

      <header className="ll-navbar">
        <div className="ll-header-top">
          <div className="ll-brand" onClick={() => handleNavClick('feed')}>
            <div className="ll-logo-box">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#FFFFFF">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <h1 className="ll-brand-title">LifeLink</h1>
          </div>

          <div className="ll-top-status">
            <span className="ll-live-dot" />
            <span>Emergency Blood Network</span>
          </div>
        </div>

        <nav className="ll-header-bottom">
          <button
            onClick={() => handleNavClick('feed')}
            className={`ll-fb-tab ll-tooltip-host ${activeTab === 'feed' ? 'active' : ''}`}
            data-tooltip="Live Feed"
          >
            <div className="ll-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              {activeRequestsCount > 0 && <span className="ll-micro-badge">{activeRequestsCount}</span>}
            </div>
            {activeTab === 'feed' && <span className="ll-active-bar" />}
          </button>

          <button
            onClick={() => handleNavClick('chat')}
            className={`ll-fb-tab ll-tooltip-host ${activeTab === 'chat' ? 'active' : ''}`}
            data-tooltip="Live Chat"
          >
            <div className="ll-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              {collaborationsCount > 0 && <span className="ll-micro-badge">{collaborationsCount}</span>}
            </div>
            {activeTab === 'chat' && <span className="ll-active-bar" />}
          </button>

          <button
            onClick={() => handleNavClick('user-request')}
            className={`ll-fb-tab ll-tooltip-host ${activeTab === 'user-request' ? 'active' : ''}`}
            data-tooltip="My Requests"
          >
            <div className="ll-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="8" y1="16" x2="13" y2="16" />
              </svg>
            </div>
            {activeTab === 'user-request' && <span className="ll-active-bar" />}
          </button>

          {isAdmin && (
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`ll-fb-tab ll-tooltip-host ${activeTab === 'dashboard' ? 'active' : ''}`}
              data-tooltip="Admin Dashboard"
            >
              <div className="ll-icon-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
              </div>
              {activeTab === 'dashboard' && <span className="ll-active-bar" />}
            </button>
          )}

          <button
            onClick={() => handleNavClick('certificate')}
            className={`ll-fb-tab ll-tooltip-host ${activeTab === 'certificate' ? 'active' : ''}`}
            data-tooltip="Certificate"
          >
            <div className="ll-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1">
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
              </svg>
            </div>
            {activeTab === 'certificate' && <span className="ll-active-bar" />}
          </button>

          <div className="ll-fb-utility-slot">
            <button
              onClick={() => handleNavClick('create')}
              className="ll-add-icon-btn ll-tooltip-host"
              data-tooltip="Create Blood Request"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          <div className="ll-fb-utility-slot">
            <NotificationBell
              bloodRequests={bloodRequests}
              currentUser={user}
              onAcceptDonate={onAcceptDonate}
            />
          </div>

          <div className="ll-fb-utility-slot">
            <div className="ll-profile-wrapper" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                className={`ll-profile-icon-btn ll-tooltip-host ${isProfileMenuOpen ? 'open' : ''}`}
                data-tooltip="Profile & Settings"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>

              {isProfileMenuOpen && (
                <div className="ll-dropdown-menu">
                  <div className="ll-dropdown-header">
                    <div className="ll-dropdown-avatar-lg">{user.bloodGroup}</div>
                    <div className="ll-dropdown-user-info">
                      <div className="ll-dropdown-name">{user.name} {isAdmin && '🛡️'}</div>
                      {user.email && <div className="ll-dropdown-email">{user.email}</div>}
                      <div className="ll-dropdown-badge">🏅 {user.donationCount || 0} Donation(s)</div>
                    </div>
                  </div>

                  <button type="button" className="ll-dropdown-item" onClick={() => handleNavClick('user-request')}>
                    <span>📋</span> My Requests & Activity
                  </button>

                  <button type="button" className="ll-dropdown-item" onClick={() => handleNavClick('certificate')}>
                    <span>🏆</span> Donor Certificate
                  </button>

                  {isAdmin && (
                    <button type="button" className="ll-dropdown-item" onClick={() => handleNavClick('dashboard')}>
                      <span>⚙️</span> Admin Control Panel
                    </button>
                  )}

                  <div className="ll-dropdown-divider" />

                  <button
                    type="button"
                    className="ll-dropdown-logout"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onLogout();
                    }}
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}