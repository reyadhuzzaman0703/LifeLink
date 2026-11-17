import React, { useState, useEffect } from 'react';

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
import Dashboard from './pages/Dashboard';
import Certificate from './pages/Certificate';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lifelink_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem('lifelink_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState('feed');
  const [donorStatus, setDonorStatus] = useState(() => {
    return localStorage.getItem('lifelink_donor_status') || 'Not Answered';
  });

  const [bloodRequests, setBloodRequests] = useState(() => {
    const saved = localStorage.getItem('lifelink_requests');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 101,
            patient: 'Rahim Uddin',
            bloodGroup: 'O+',
            hospital: 'Dhaka Medical College Hospital, Ward-3',
            location: 'Dhaka, Bangladesh',
            bags: 2,
            urgency: 'Emergency (Within 2 Hours)',
            contact: '01711000000',
            status: 'Active',
            createdBy: 'demo@lifelink.com'
          }
        ];
  });

  const [collaborations, setCollaborations] = useState(() => {
    const saved = localStorage.getItem('lifelink_collabs');
    return saved ? JSON.parse(saved) : [];
  });

  const [referrals, setReferrals] = useState(() => {
    const saved = localStorage.getItem('lifelink_referrals');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeChatContext, setActiveChatContext] = useState(null);
  const [toastAlert, setToastAlert] = useState(null);

  const isAdmin = user?.role === 'admin' || user?.isAdmin === true;

  useEffect(() => {
    if (user) {
      localStorage.setItem('lifelink_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('lifelink_current_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('lifelink_requests', JSON.stringify(bloodRequests));
  }, [bloodRequests]);

  useEffect(() => {
    localStorage.setItem('lifelink_collabs', JSON.stringify(collaborations));
  }, [collaborations]);

  useEffect(() => {
    localStorage.setItem('lifelink_referrals', JSON.stringify(referrals));
  }, [referrals]);

  useEffect(() => {
    localStorage.setItem('lifelink_donor_status', donorStatus);
  }, [donorStatus]);

  if (!user) {
    return (
      <Auth
        onLoginSuccess={(userData) => {
          setUser(userData);
          setActiveTab('feed');
          if (userData.availability) setDonorStatus(userData.availability);
          const allUsers = JSON.parse(localStorage.getItem('lifelink_users') || '[]');
          setRegisteredUsers(allUsers);
        }}
      />
    );
  }

  const incrementUserDonationCount = (requestId) => {
    const alreadyCounted = collaborations.find(
      (c) => c.requestId === requestId && c.donationCounted
    );
    if (alreadyCounted) return;

    if (requestId) {
      setCollaborations((prev) =>
        prev.map((c) =>
          c.requestId === requestId
            ? { ...c, progress: 'Donated ✅', donationCounted: true }
            : c
        )
      );
    }

    const newCount = (user.donationCount || 0) + 1;
    const updatedUser = { ...user, donationCount: newCount };
    setUser(updatedUser);
    localStorage.setItem('lifelink_current_user', JSON.stringify(updatedUser));

    const updatedUsersList = registeredUsers.map((u) =>
      u.email === user.email ? { ...u, donationCount: newCount } : u
    );
    setRegisteredUsers(updatedUsersList);
    localStorage.setItem('lifelink_users', JSON.stringify(updatedUsersList));
  };

  const handleStatusChange = (newStatus) => {
    setDonorStatus(newStatus);
    setUser((prev) => ({ ...prev, availability: newStatus }));
  };

  const handleAddRequest = (newReq) => {
    const reqWithId = {
      ...newReq,
      id: Date.now(),
      status: 'Active',
      createdBy: user.email
    };
    setBloodRequests((prev) => [reqWithId, ...prev]);
    setToastAlert(`🩸 New Blood Request: ${reqWithId.patient} (${reqWithId.bloodGroup}) at ${reqWithId.hospital}`);
    setTimeout(() => setToastAlert(null), 5000);
    setActiveTab('feed');
  };

  const handleAcceptDonate = (req) => {
    const reqId = req.id;
    const exists = collaborations.find((c) => c.requestId === reqId);

    if (!exists) {
      const newCollab = {
        requestId: reqId,
        chatId: `chat_${reqId}`,
        patient: req.patient,
        bloodGroup: req.bloodGroup,
        hospital: req.hospital,
        location: req.location,
        donorName: user.name,
        donorPhone: user.contact || 'Verified Donor',
        progress: 'Accepted & Preparing 🩸',
        donationCounted: false
      };
      setCollaborations((prev) => [newCollab, ...prev]);
      setActiveChatContext(newCollab);
    } else {
      setActiveChatContext(exists);
    }
    setActiveTab('chat');
  };

  const handleUpdateProgress = (requestId, newProgress) => {
    setCollaborations((prev) =>
      prev.map((c) => (c.requestId === requestId ? { ...c, progress: newProgress } : c))
    );
    if (newProgress === 'Donated ✅') {
      incrementUserDonationCount(requestId);
    }
  };

  const handleReferSuccess = (requestId, referralInfo) => {
    setReferrals((prev) => [
      { id: Date.now(), requestId, referredBy: user.name, ...referralInfo },
      ...prev
    ]);
    alert(`🤝 Thank you! Referral for ${referralInfo.friendName} submitted.`);
  };

  const handleMarkCompleted = (id) => {
    setBloodRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Completed' } : r))
    );
  };

  const handleCancelRequest = (id) => {
    setBloodRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Cancelled' } : r))
    );
  };

  const handleDeleteRequest = (id) => {
    setBloodRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleOpenChat = (chatObj) => {
    setActiveChatContext(chatObj);
    setActiveTab('chat');
  };

  const handleLogout = () => {
    localStorage.removeItem('lifelink_current_user');
    setUser(null);
    setActiveTab('feed');
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#f4f6f9', display: 'flex', flexDirection: 'column' }}>
      {toastAlert && (
        <div
          className="no-print"
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

      <header
        style={{
          width: '100%',
          background: 'linear-gradient(90deg, #8b0000 0%, #c0392b 100%)',
          color: 'white',
          padding: '14px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
        }}
      >
        <div>
          <h1 onClick={() => setActiveTab('feed')} style={{ cursor: 'pointer', margin: 0, fontSize: '24px' }}>
            🩸 LifeLink
          </h1>
          <small style={{ opacity: 0.92 }}>
            👤 {user.name} ({user.bloodGroup}) • 🏅 {user.donationCount || 0} Donation(s) {isAdmin && '• 🛡️ Admin'}
          </small>
        </div>

        <nav style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab('feed')} style={btnStyle(activeTab === 'feed')}>
            Feed ({bloodRequests.length})
          </button>
          <button onClick={() => setActiveTab('create')} style={btnStyle(activeTab === 'create')}>
            + Request
          </button>
          <button onClick={() => setActiveTab('chat')} style={btnStyle(activeTab === 'chat')}>
            Chat
          </button>
          <button onClick={() => setActiveTab('user-request')} style={btnStyle(activeTab === 'user-request')}>
            User Request
          </button>

          {isAdmin && (
            <button onClick={() => setActiveTab('dashboard')} style={btnStyle(activeTab === 'dashboard')}>
              📊 Dashboard
            </button>
          )}

          <button onClick={() => setActiveTab('certificate')} style={btnStyle(activeTab === 'certificate')}>
            Certificate
          </button>

          <NotificationBell
            bloodRequests={bloodRequests}
            currentUser={user}
            onAcceptDonate={handleAcceptDonate}
          />

          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#1f2937',
              color: 'white',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px'
            }}
          >
            Logout
          </button>
        </nav>
      </header>

      <main
        style={{
          width: '100%',
          flex: 1,
          padding: '20px 28px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '22px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ flex: '1 1 640px', minWidth: 0 }}>
          <div className="no-print">
            <Availability initialStatus={donorStatus} onStatusChange={handleStatusChange} />
          </div>

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
              onConfirmationSuccess={(reqId) => {
                if (reqId) handleMarkCompleted(reqId);
                incrementUserDonationCount(reqId);
                setActiveTab('certificate');
              }}
            />
          )}

          {activeTab === 'user-request' && (
            <UserDashboard
              userAvailability={donorStatus}
              user={user}
              requests={bloodRequests}
              collaborations={collaborations}
              referrals={referrals}
              onAcceptDonate={handleAcceptDonate}
              onUpdateProgress={handleUpdateProgress}
              onMarkCompleted={handleMarkCompleted}
              onCancelRequest={handleCancelRequest}
              onOpenChat={handleOpenChat}
            />
          )}

          {activeTab === 'dashboard' &&
            (isAdmin ? (
              <Dashboard
                registeredUsers={registeredUsers.length > 0 ? registeredUsers : [user]}
                activeRequests={bloodRequests}
                onMarkCompleted={handleMarkCompleted}
                onCancelRequest={handleCancelRequest}
                onDeleteRequest={handleDeleteRequest}
              />
            ) : (
              <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', textAlign: 'center', borderTop: '5px solid #c0392b' }}>
                <h2 style={{ color: '#c0392b', marginTop: 0 }}>⛔ Access Denied</h2>
                <p style={{ color: '#555' }}>Only authorized Admins can access the Dashboard.</p>
                <button
                  onClick={() => setActiveTab('feed')}
                  style={{ backgroundColor: '#2c3e50', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Back to Feed
                </button>
              </div>
            ))}

          {activeTab === 'certificate' && <Certificate user={user} />}
        </div>

        <aside
          style={{
            flex: '0 0 360px',
            width: '360px',
            maxWidth: '100%',
            position: 'sticky',
            top: '20px'
          }}
        >
          <Location
            currentLocation={user.cityCountry}
            onLocationUpdate={(locData) => setUser((prev) => ({ ...prev, ...locData }))}
          />
        </aside>
      </main>
    </div>
  );
}

const btnStyle = (active) => ({
  backgroundColor: active ? 'rgba(0, 0, 0, 0.28)' : 'transparent',
  color: 'white',
  border: active ? '1px solid rgba(255,255,255,0.4)' : '1px solid transparent',
  padding: '8px 12px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '13px'
});