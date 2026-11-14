import React, { useState } from 'react';

// Components
import Auth from './components/Auth';
import Availability from './components/Availability';
import Realtime from './components/Realtime';

// Pages
import HomeFeed from './pages/HomeFeed';
import CreateRequest from './pages/CreateRequest';
import DonorDashboard from './pages/DonorDashboard';
import RequesterDashboard from './pages/RequesterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Certificate from './pages/Certificate';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [donorStatus, setDonorStatus] = useState('Not Answered');
  const [bloodRequests, setBloodRequests] = useState([]);
  const [collaborations, setCollaborations] = useState([]);
  const [referredDonors, setReferredDonors] = useState([]);
  const [activeChatContext, setActiveChatContext] = useState(null);

  if (!user) {
    return <Auth onLoginSuccess={(userData) => setUser(userData)} />;
  }

  const handleAddRequest = (newReq) => {
    setBloodRequests((prev) => [newReq, ...prev]);
    setActiveTab('feed');
  };

  const handleAcceptDonate = (req) => {
    const newCollab = {
      id: Date.now(),
      requestId: req.id,
      patient: req.patient,
      bloodGroup: req.bloodGroup,
      hospital: req.hospital,
      location: req.location,
      contact: req.contact,
      donorName: user.name,
      donorBloodGroup: user.bloodGroup,
      donorContact: user.contact,
      progress: 'Accepted & Preparing'
    };

    setCollaborations((prev) => [newCollab, ...prev]);
    setBloodRequests((prev) =>
      prev.map((r) => (r.id === req.id ? { ...r, status: `Donor Matched (${user.name})` } : r))
    );
    setActiveChatContext(newCollab);
  };

  const handleUpdateProgress = (collabId, newProgress) => {
    setCollaborations((prev) =>
      prev.map((c) => (c.id === collabId ? { ...c, progress: newProgress } : c))
    );
  };

  const handleOpenChat = (collabContext) => {
    setActiveChatContext(collabContext);
    setActiveTab('chat');
  };

  const handleMarkCompleted = (id) => {
    setBloodRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: 'Completed ✅' } : req))
    );
  };

  const handleReferSuccess = (referralInfo) => {
    const fullReferral = {
      ...referralInfo,
      referredBy: user.name
    };
    setReferredDonors((prev) => [fullReferral, ...prev]);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px' }}>
      <header style={{ backgroundColor: '#c0392b', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 onClick={() => setActiveTab('feed')} style={{ cursor: 'pointer', margin: 0 }}>🩸 LifeLink</h1>
          <small style={{ opacity: 0.9 }}>
            👤 {user.name} ({user.bloodGroup}) | 🤝 Active Collabs: {collaborations.length} | Referrals: {referredDonors.length}
          </small>
        </div>

        <nav style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab('feed')} style={btnStyle(activeTab === 'feed')}>
            Feed ({bloodRequests.length})
          </button>
          <button onClick={() => setActiveTab('create')} style={btnStyle(activeTab === 'create')}>+ Request</button>
          <button onClick={() => setActiveTab('chat')} style={btnStyle(activeTab === 'chat')}>Chat</button>
          <button onClick={() => setActiveTab('donor-dash')} style={btnStyle(activeTab === 'donor-dash')}>
            Donor Dash {collaborations.length > 0 && `(${collaborations.length})`}
          </button>
          <button onClick={() => setActiveTab('requester-dash')} style={btnStyle(activeTab === 'requester-dash')}>
            Requester Dash {bloodRequests.length > 0 && `(${bloodRequests.length})`}
          </button>
          <button onClick={() => setActiveTab('admin-dash')} style={btnStyle(activeTab === 'admin-dash')}>Admin Dash</button>
          <button onClick={() => setActiveTab('certificate')} style={btnStyle(activeTab === 'certificate')}>Certificate</button>
          <button onClick={() => setUser(null)} style={{ backgroundColor: '#2c3e50', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Logout
          </button>
        </nav>
      </header>

      <main style={{ marginTop: '20px', maxWidth: '1000px', margin: '20px auto 0 auto' }}>
        <Availability onStatusChange={(st) => setDonorStatus(st)} />

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
          <Realtime currentUser={user} activeChatContext={activeChatContext} />
        )}
        {activeTab === 'donor-dash' && (
          <DonorDashboard
            userAvailability={donorStatus}
            user={user}
            collaborations={collaborations}
            onUpdateProgress={handleUpdateProgress}
            onOpenChat={handleOpenChat}
          />
        )}
        {activeTab === 'requester-dash' && (
          <RequesterDashboard
            requests={bloodRequests}
            collaborations={collaborations}
            onMarkCompleted={handleMarkCompleted}
            onOpenChat={handleOpenChat}
            referredDonors={referredDonors}
          />
        )}
        {activeTab === 'admin-dash' && (
          <AdminDashboard registeredUsers={user ? [user] : []} activeRequests={bloodRequests} />
        )}
        {activeTab === 'certificate' && <Certificate user={user} />}
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