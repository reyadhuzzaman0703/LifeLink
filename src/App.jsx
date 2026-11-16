import React, { useState, useEffect } from 'react';

// Components
import Auth from './components/Auth';
import Availability from './components/Availability';
import Location from './components/Location';
import Realtime from './components/Realtime';

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
            status: 'Active'
          }
        ];
  });

  const [collaborations, setCollaborations] = useState(() => {
    const saved = localStorage.getItem('lifelink_collabs');
    return saved ? JSON.parse(saved) : [];
  });

  const [referrals, setReferrals] = useState([]);
  const [activeChatContext, setActiveChatContext] = useState(null);

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
    localStorage.setItem('lifelink_donor_status', donorStatus);
  }, [donorStatus]);

  if (!user) {
    return (
      <Auth
        onLoginSuccess={(userData) => {
          setUser(userData);
          if (userData.availability) setDonorStatus(userData.availability);
        }}
      />
    );
  }

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
        progress: 'Accepted & Preparing 🩸'
      };
      setCollaborations((prev) => [newCollab, ...prev]);
      setActiveChatContext(newCollab);
    } else {
      setActiveChatContext(exists);
    }
    setActiveTab('user-request');
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

  const handleOpenChat = (chatObj) => {
    setActiveChatContext(chatObj);
    setActiveTab('chat');
  };

  const handleLogout = () => {
    localStorage.removeItem('lifelink_current_user');
    setUser(null);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px' }}>
      <header style={{ backgroundColor: '#c0392b', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 onClick={() => setActiveTab('feed')} style={{ cursor: 'pointer', margin: 0 }}>🩸 LifeLink</h1>
          <small style={{ opacity: 0.9 }}>
            👤 {user.name}
          </small>
        </div>

        <nav style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab('feed')} style={btnStyle(activeTab === 'feed')}>
            Feed ({bloodRequests.length})
          </button>
          <button onClick={() => setActiveTab('create')} style={btnStyle(activeTab === 'create')}>+ Request</button>
          <button onClick={() => setActiveTab('chat')} style={btnStyle(activeTab === 'chat')}>Chat</button>
          <button onClick={() => setActiveTab('user-request')} style={btnStyle(activeTab === 'user-request')}>
            User Request
          </button>
          <button onClick={() => setActiveTab('admin-dash')} style={btnStyle(activeTab === 'admin-dash')}>Admin Dash</button>
          <button onClick={() => setActiveTab('certificate')} style={btnStyle(activeTab === 'certificate')}>Certificate</button>
          <button onClick={handleLogout} style={{ backgroundColor: '#2c3e50', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Logout
          </button>
        </nav>
      </header>

      <main style={{ marginTop: '20px', maxWidth: '1000px', margin: '20px auto 0 auto' }}>
        <Availability initialStatus={donorStatus} onStatusChange={handleStatusChange} />

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
            onConfirmationSuccess={() => setActiveTab('certificate')}
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
        {activeTab === 'admin-dash' && (
          <AdminDashboard registeredUsers={[user]} activeRequests={bloodRequests} />
        )}
        {activeTab === 'certificate' && <Certificate user={user} />}

        <div style={{ marginTop: '25px' }}>
          <Location
            currentLocation={user.cityCountry}
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