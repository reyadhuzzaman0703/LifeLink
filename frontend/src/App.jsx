import React, { useState } from 'react';

// Components
import Auth from './components/Auth';
import Availability from './components/Availability';
import Realtime from './components/Realtime';

// Pages
import HomeFeed from './pages/HomeFeed';
import CreateRequest from './pages/CreateRequest';
import Dashboard from './pages/Dashboard';
import Certificate from './pages/Certificate';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [donorStatus, setDonorStatus] = useState('Not Answered');

  if (!user) {
    return <Auth onLoginSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px' }}>
      <header style={{ backgroundColor: '#c0392b', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px' }}>
        <h1 onClick={() => setActiveTab('feed')} style={{ cursor: 'pointer', margin: 0 }}>🩸 LifeLink</h1>
        <nav style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setActiveTab('feed')} style={btnStyle(activeTab === 'feed')}>Feed</button>
          <button onClick={() => setActiveTab('create')} style={btnStyle(activeTab === 'create')}>+ Request</button>
          <button onClick={() => setActiveTab('chat')} style={btnStyle(activeTab === 'chat')}>Chat</button>
          <button onClick={() => setActiveTab('dashboard')} style={btnStyle(activeTab === 'dashboard')}>Dashboard</button>
          <button onClick={() => setActiveTab('certificate')} style={btnStyle(activeTab === 'certificate')}>Certificate</button>
        </nav>
      </header>

      <main style={{ marginTop: '20px', maxWidth: '1000px', margin: '20px auto 0 auto' }}>
        <Availability onStatusChange={(st) => setDonorStatus(st)} />

        {activeTab === 'feed' && <HomeFeed />}
        {activeTab === 'create' && <CreateRequest onSuccess={() => setActiveTab('feed')} />}
        {activeTab === 'chat' && <Realtime />}
        {activeTab === 'dashboard' && <Dashboard userAvailability={donorStatus} />}
        {activeTab === 'certificate' && <Certificate />}
      </main>
    </div>
  );
}

const btnStyle = (active) => ({
  backgroundColor: active ? '#962d22' : 'transparent',
  color: 'white',
  border: 'none',
  padding: '8px 12px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold'
});