import React, { useState, useEffect, useCallback, useRef } from 'react';

// Components
import Auth from './components/Auth';
import Availability from './components/Availability';
import Location from './components/Location';
import Realtime from './components/Realtime';
import NotificationBell from './components/NotificationBell';

// Pages
import HomeFeed from './pages/HomeFeed';
import CreateRequest from './pages/CreateRequest';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Certificate from './pages/Certificate';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lifelink_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState('feed');
  const [donorStatus, setDonorStatus] = useState(() => {
    return localStorage.getItem('lifelink_donor_status') || 'Not Answered';
  });

  const [bloodRequests, setBloodRequests] = useState([]);
  const [donorNotifications, setDonorNotifications] = useState([]);
  const [toastAlert, setToastAlert] = useState(null);
  const prevNotifCountRef = useRef(0);

  const [collaborations, setCollaborations] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [activeChatContext, setActiveChatContext] = useState(null);

  const isAdmin = user?.role === 'admin' || user?.isAdmin === true;

  const fetchActiveRequests = useCallback(async () => {
    const token = localStorage.getItem('lifelink_token');
    if (!token) return;

    try {
      const res = await fetch('/api/blood-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (res.ok) {
        const list = Array.isArray(data) ? data : data.requests || data.data || [];
        setBloodRequests(list.map((r) => ({ ...r, id: r._id || r.id })));
      }
    } catch (err) {
      console.error('Failed to load active blood requests:', err);
    }
  }, []);

  const fetchDonorNotifications = useCallback(async () => {
    const token = localStorage.getItem('lifelink_token');
    if (!token) return;

    try {
      const res = await fetch('/api/donor-notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (res.ok) {
        const list = Array.isArray(data) ? data : data.notifications || data.data || [];
        if (list.length > prevNotifCountRef.current && prevNotifCountRef.current !== 0) {
          const latest = list[0]?.bloodRequest || list[0]?.request || list[0];
          setToastAlert(
            `🚨 New Blood Request Alert: ${latest?.patient || latest?.patientName || 'Emergency'} (${latest?.bloodGroup || ''}) at ${latest?.hospital || 'Hospital'}`
          );
          setTimeout(() => setToastAlert(null), 6000);
        }
        prevNotifCountRef.current = list.length;
        setDonorNotifications(list);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('lifelink_token');
    if (!token) return;

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        if (!res.ok) throw new Error('Session expired');
        const u = data.user || data.data || data;
        const normalized = { ...u, id: u._id || u.id };
        setUser(normalized);
        localStorage.setItem('lifelink_current_user', JSON.stringify(normalized));
        if (normalized.availability) setDonorStatus(normalized.availability);
        fetchActiveRequests();
        fetchDonorNotifications();
      })
      .catch(() => {
        localStorage.removeItem('lifelink_token');
        localStorage.removeItem('lifelink_current_user');
        setUser(null);
      });
  }, [fetchActiveRequests, fetchDonorNotifications]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchDonorNotifications();
      fetchActiveRequests();
    }, 15000);
    return () => clearInterval(interval);
  }, [user, fetchDonorNotifications, fetchActiveRequests]);

  if (!user) {
    return (
      <Auth
        onLoginSuccess={(userData) => {
          setUser(userData);
          setActiveTab('feed');
          if (userData.availability) setDonorStatus(userData.availability);
          fetchActiveRequests();
          fetchDonorNotifications();
        }}
      />
    );
  }

  const handleAddRequest = (createdReq) => {
    setBloodRequests((prev) => [createdReq, ...prev]);
    setToastAlert(`🩸 Blood request for ${createdReq.patient} (${createdReq.bloodGroup}) published!`);
    setTimeout(() => setToastAlert(null), 5000);
    setActiveTab('feed');
  };

  const handleAcceptDonate = (reqWithChat) => {
    const reqId = reqWithChat._id || reqWithChat.id;
    const collabItem = {
      requestId: reqId,
      chatId: reqWithChat.chatId,
      notificationId: reqWithChat.notificationId,
      patient: reqWithChat.patient || reqWithChat.patientName,
      bloodGroup: reqWithChat.bloodGroup,
      hospital: reqWithChat.hospital,
      location: reqWithChat.location,
      donorName: user.name,
      donorPhone: user.contact || user.phone || 'Verified Donor',
      progress: 'Accepted & Chat Started 🩸'
    };

    setCollaborations((prev) => {
      const exists = prev.find((c) => c.requestId === reqId);
      return exists ? prev : [collabItem, ...prev];
    });

    setActiveChatContext(collabItem);
    setActiveTab('chat');
  };

  const handleUpdateProgress = (requestId, newProgress) => {
    setCollaborations((prev) =>
      prev.map((c) => (c.requestId === requestId ? { ...c, progress: newProgress } : c))
    );
  };

  const handleReferSuccess = (requestId, referralInfo) => {
    setReferrals((prev) => [
      { id: Date.now(), requestId, referredBy: user.name, ...referralInfo },
      ...prev
    ]);
    alert(`🤝 Thank you! Referral for ${referralInfo.friendName} submitted.`);
  };

  const handleOpenChat = (chatObj) => {
    setActiveChatContext(chatObj);
    setActiveTab('chat');
  };

  const handleLogout = () => {
    localStorage.removeItem('lifelink_token');
    localStorage.removeItem('lifelink_current_user');
    setUser(null);
    setActiveTab('feed');
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px' }}>
      {toastAlert && (
        <div
          style={{
            position: 'fixed',
            bottom: '22px',
            right: '22px',
            backgroundColor: '#2c3e50',
            color: '#fff',
            padding: '14px 18px',
            borderRadius: '8px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
            borderLeft: '5px solid #f1c40f',
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
            onClick={() => setToastAlert(null)}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ✖
          </button>
        </div>
      )}

      <header style={{ backgroundColor: '#c0392b', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 onClick={() => setActiveTab('feed')} style={{ cursor: 'pointer', margin: 0 }}>🩸 LifeLink</h1>
          <small style={{ opacity: 0.9 }}>
            👤 {user.name} ({user.bloodGroup}) {isAdmin && '• 🛡️ Admin'}
          </small>
        </div>

        <nav style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab('feed')} style={btnStyle(activeTab === 'feed')}>
            Feed ({bloodRequests.length})
          </button>
          <button onClick={() => setActiveTab('create')} style={btnStyle(activeTab === 'create')}>+ Request</button>
          <button onClick={() => setActiveTab('chat')} style={btnStyle(activeTab === 'chat')}>Chat</button>
          <button onClick={() => setActiveTab('user-request')} style={btnStyle(activeTab === 'user-request')}>User Request</button>

          {isAdmin && (
            <button onClick={() => setActiveTab('admin-dash')} style={btnStyle(activeTab === 'admin-dash')}>
              🛡️ Admin Dash
            </button>
          )}

          <button onClick={() => setActiveTab('certificate')} style={btnStyle(activeTab === 'certificate')}>Certificate</button>

          <NotificationBell
            notifications={donorNotifications}
            bloodRequests={bloodRequests}
            currentUser={user}
            onAcceptDonate={handleAcceptDonate}
            onRefreshNotifications={fetchDonorNotifications}
          />

          <button onClick={handleLogout} style={{ backgroundColor: '#2c3e50', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Logout
          </button>
        </nav>
      </header>

      <main style={{ marginTop: '20px', maxWidth: '1000px', margin: '20px auto 0 auto' }}>
        <Availability
          initialStatus={donorStatus}
          onStatusChange={(newStatus) => {
            setDonorStatus(newStatus);
            setUser((prev) => ({ ...prev, availability: newStatus }));
          }}
        />

        {activeTab === 'feed' && (
          <HomeFeed
            requests={bloodRequests}
            collaborations={collaborations}
            onAcceptDonate={handleAcceptDonate}
            onReferSuccess={handleReferSuccess}
            onOpenChat={handleOpenChat}
            onGoToCreate={() => setActiveTab('create')}
          />
        )}
        {activeTab === 'create' && (
          <CreateRequest onAddRequest={handleAddRequest} currentUser={user} />
        )}
        {activeTab === 'chat' && (
          <Realtime
            currentUser={user}
            activeChatContext={activeChatContext}
            collaborations={collaborations}
            requests={bloodRequests}
            onSelectChat={(chatObj) => setActiveChatContext(chatObj)}
            onConfirmationSuccess={() => {
              fetchActiveRequests();
              setActiveTab('certificate');
            }}
          />
        )}
        {activeTab === 'user-request' && (
          <UserDashboard
            userAvailability={donorStatus}
            user={user}
            collaborations={collaborations}
            referrals={referrals}
            onAcceptDonate={handleAcceptDonate}
            onUpdateProgress={handleUpdateProgress}
            onOpenChat={handleOpenChat}
            onRequestsMutated={fetchActiveRequests}
          />
        )}

        {activeTab === 'admin-dash' &&
          (isAdmin ? (
            <AdminDashboard registeredUsers={[user]} activeRequests={bloodRequests} />
          ) : (
            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', textAlign: 'center', borderTop: '5px solid #c0392b' }}>
              <h2 style={{ color: '#c0392b', marginTop: 0 }}>⛔ Access Denied</h2>
              <p style={{ color: '#555' }}>Only authorized Admins can view the Admin Dashboard.</p>
              <button
                onClick={() => setActiveTab('feed')}
                style={{ backgroundColor: '#2c3e50', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Back to Feed
              </button>
            </div>
          ))}

        {activeTab === 'certificate' && <Certificate user={user} />}

        <div style={{ marginTop: '25px' }}>
          <Location
            currentLocation={user.cityCountry || user.location}
            onLocationUpdate={(locData) => setUser((prev) => ({ ...prev, ...locData }))}
          />
        </div>
      </main>
    </div>
  );
}

const btnStyle = (active) => ({
  backgroundColor: active ? '#962d22' : 'transparent',
  color: 'white',
  border: 'none',
  padding: '8px 10px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '13px'
});