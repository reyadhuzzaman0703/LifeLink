import React, { useState } from 'react';

export default function AdminDashboard({ registeredUsers = [], activeRequests = [] }) {
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [verifiedIds, setVerifiedIds] = useState([]);

  const approveUser = (id) => {
    setVerifiedIds([...verifiedIds, id]);
    setPendingVerifications(pendingVerifications.filter((u) => u.id !== id));
    alert('User Verified Successfully!');
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h2 style={{ color: '#2c3e50', marginTop: 0, borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        🛡️ Global Admin Control Panel
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div style={cardStyle('#f4f6f7', '#2c3e50')}>
          <small>Active Users Online</small>
          <h3 style={{ margin: '5px 0' }}>{registeredUsers.length}</h3>
        </div>
        <div style={cardStyle('#fdecea', '#c0392b')}>
          <small>Live Emergency Requests</small>
          <h3 style={{ margin: '5px 0' }}>{activeRequests.length}</h3>
        </div>
        <div style={cardStyle('#eafaf1', '#27ae60')}>
          <small>Verified Profiles</small>
          <h3 style={{ margin: '5px 0' }}>{verifiedIds.length}</h3>
        </div>
      </div>

      <h4>⏳ Pending Donor Verifications ({pendingVerifications.length})</h4>
      {pendingVerifications.length === 0 ? (
        <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '6px', color: '#666', fontSize: '14px' }}>
          No pending verification requests right now. New verification submissions from global users will appear here automatically.
        </div>
      ) : (
        pendingVerifications.map((item) => (
          <div key={item.id} style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <strong>{item.name}</strong> ({item.bloodGroup}) • {item.country}
              <div style={{ fontSize: '13px', color: '#666' }}>Document: {item.doc}</div>
            </div>
            <button
              onClick={() => approveUser(item.id)}
              style={{ backgroundColor: '#2980b9', color: 'white', border: 'none', padding: '7px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Approve & Verify
            </button>
          </div>
        ))
      )}
    </div>
  );
}

const cardStyle = (bg, borderColor) => ({
  backgroundColor: bg,
  borderLeft: `5px solid ${borderColor}`,
  padding: '15px',
  borderRadius: '6px'
});