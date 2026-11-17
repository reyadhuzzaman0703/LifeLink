import React, { useState } from 'react';

export default function UserDashboard({
  userAvailability,
  user,
  requests = [],
  collaborations = [],
  referrals = [],
  onAcceptDonate,
  onUpdateProgress,
  onMarkCompleted,
  onCancelRequest,
  onOpenChat
}) {
  const [viewFilter, setViewFilter] = useState('all');

  const availableAlerts = requests.filter(
    (r) => (r.status || 'Active') === 'Active' && !collaborations.some((c) => c.requestId === r.id)
  );

  const myRequests = requests.filter(
    (r) => r.createdBy === user?.email || r.createdBy === 'demo@lifelink.com'
  );

  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '2px solid #eee', paddingBottom: '12px', marginBottom: '18px' }}>
        <h2 style={{ color: '#c0392b', margin: 0 }}>🩸 User Request & Donation Hub</h2>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button onClick={() => setViewFilter('all')} style={tabBtn(viewFilter === 'all', '#2c3e50')}>
            📋 All Activity
          </button>
          <button onClick={() => setViewFilter('donor')} style={tabBtn(viewFilter === 'donor', '#27ae60')}>
            🩸 Donor Alerts ({availableAlerts.length})
          </button>
          <button onClick={() => setViewFilter('requester')} style={tabBtn(viewFilter === 'requester', '#2980b9')}>
            🏥 My Requests ({myRequests.length})
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', marginBottom: '22px' }}>
        <div style={cardStyle('#fdecea', '#c0392b')}>
          <small>User Profile</small>
          <h3 style={{ margin: '5px 0' }}>{user?.name} ({user?.bloodGroup})</h3>
        </div>
        <div style={cardStyle('#eafaf1', '#27ae60')}>
          <small>Availability Status</small>
          <h3 style={{ margin: '5px 0' }}>{userAvailability}</h3>
        </div>
        <div style={cardStyle('#fef9e7', '#e67e22')}>
          <small>Active Missions</small>
          <h3 style={{ margin: '5px 0' }}>{collaborations.length} Mission(s)</h3>
        </div>
        <div style={cardStyle('#ebf5fb', '#2980b9')}>
          <small>My Blood Requests</small>
          <h3 style={{ margin: '5px 0' }}>{myRequests.length} Request(s)</h3>
        </div>
      </div>

      {(viewFilter === 'all' || viewFilter === 'donor') && (
        <div style={{ marginBottom: '28px' }}>
          {collaborations.length > 0 && (
            <>
              <h3 style={{ color: '#27ae60', borderLeft: '4px solid #27ae60', paddingLeft: '10px' }}>
                🤝 Active Donation Missions ({collaborations.length})
              </h3>
              {collaborations.map((collab) => (
                <div key={collab.requestId} style={{ border: '1px solid #a9dfbf', borderRadius: '6px', padding: '15px', marginBottom: '12px', backgroundColor: '#eafaf1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <strong>Patient: {collab.patient} ({collab.bloodGroup})</strong>
                      <div style={{ fontSize: '13px', color: '#555', marginTop: '3px' }}>🏥 {collab.hospital} ({collab.location})</div>
                      <div style={{ fontSize: '13px', color: '#1e8449', fontWeight: 'bold', marginTop: '4px' }}>🚦 Status: {collab.progress}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button onClick={() => onUpdateProgress(collab.requestId, 'On The Way 🚗')} style={progBtn('#e67e22')}>🚗 On The Way</button>
                      <button onClick={() => onUpdateProgress(collab.requestId, 'Reached Hospital 🏥')} style={progBtn('#2980b9')}>🏥 Reached Hospital</button>
                      <button onClick={() => onUpdateProgress(collab.requestId, 'Donated ✅')} style={progBtn('#27ae60')}>✅ Mark Donated</button>
                      <button onClick={() => onOpenChat(collab)} style={progBtn('#8e44ad')}>💬 Chat</button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          <h3 style={{ color: '#c0392b', borderLeft: '4px solid #c0392b', paddingLeft: '10px' }}>
            🔔 Available Emergency Requests ({availableAlerts.length})
          </h3>
          {availableAlerts.length === 0 ? (
            <p style={{ color: '#777', fontSize: '14px' }}>No pending emergency alerts right now.</p>
          ) : (
            availableAlerts.map((req) => (
              <div key={req.id} style={{ border: '1px solid #f5b7b1', backgroundColor: '#fef9e7', borderRadius: '6px', padding: '15px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <strong>Patient: {req.patient} ({req.bloodGroup})</strong>
                  <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>
                    🏥 Hospital: {req.hospital} ({req.location})
                  </div>
                </div>

                <button
                  onClick={() => onAcceptDonate(req)}
                  style={{ backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                >
                  🩸 Accept & Start Live Chat
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {(viewFilter === 'all' || viewFilter === 'requester') && (
        <div>
          <h3 style={{ color: '#2980b9', borderLeft: '4px solid #2980b9', paddingLeft: '10px' }}>
            📋 My Blood Requests ({myRequests.length})
          </h3>

          {myRequests.length === 0 ? (
            <p style={{ color: '#666', fontSize: '14px' }}>You have not created any blood requests yet.</p>
          ) : (
            myRequests.map((req) => (
              <div key={req.id} style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '15px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <strong style={{ fontSize: '16px' }}>Patient: {req.patient}</strong> —{' '}
                  <span style={{ color: '#c0392b', fontWeight: 'bold' }}>{req.bloodGroup}</span>
                  <div style={{ color: '#555', fontSize: '14px', marginTop: '4px' }}>
                    Hospital: {req.hospital} ({req.location}) | Status: <strong>{req.status || 'Active'}</strong>
                  </div>
                </div>

                {req.status !== 'Completed' && req.status !== 'Cancelled' && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => onMarkCompleted(req.id)}
                      style={{ backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                    >
                      Mark Fulfilled
                    </button>
                    <button
                      onClick={() => onCancelRequest(req.id)}
                      style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))
          )}

          {referrals.length > 0 && (
            <>
              <h3 style={{ color: '#8e44ad', borderLeft: '4px solid #8e44ad', paddingLeft: '10px', marginTop: '20px' }}>
                🤝 Referred Friends ({referrals.length})
              </h3>
              {referrals.map((ref) => (
                <div key={ref.id} style={{ padding: '10px', backgroundColor: '#f4ecf7', borderRadius: '6px', marginBottom: '8px', fontSize: '14px' }}>
                  👤 <strong>{ref.friendName}</strong> ({ref.friendPhone}) — Referred by {ref.referredBy}
                </div>
              ))}
            </>
          )}
        </div>
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

const progBtn = (bg) => ({
  backgroundColor: bg,
  color: 'white',
  border: 'none',
  padding: '7px 11px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '12px'
});

const tabBtn = (active, activeBg) => ({
  backgroundColor: active ? activeBg : '#ecf0f1',
  color: active ? '#fff' : '#2c3e50',
  border: 'none',
  padding: '7px 12px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '12px'
});
