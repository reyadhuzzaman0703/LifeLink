import React from 'react';

export default function RequesterDashboard({
  requests = [],
  collaborations = [],
  onMarkCompleted,
  onOpenChat,
  referredDonors = []
}) {
  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h2 style={{ color: '#2980b9', marginTop: 0, borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        🏥 Requester Dashboard (Donor Collaboration & Requests)
      </h2>

      {collaborations.length > 0 && (
        <div style={{ backgroundColor: '#ebf5fb', border: '1px solid #aed6f1', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3 style={{ color: '#1b4f72', marginTop: 0 }}>🩸 Active Donors Collaborating With You ({collaborations.length})</h3>
          {collaborations.map((collab) => (
            <div key={collab.id} style={{ backgroundColor: '#fff', padding: '14px', borderRadius: '6px', marginBottom: '10px', borderLeft: '5px solid #2980b9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <strong style={{ fontSize: '16px' }}>Donor: {collab.donorName}</strong> ({collab.donorBloodGroup}) • 📞 {collab.donorContact}
                <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>
                  For Patient: <strong>{collab.patient}</strong> | Hospital: {collab.hospital}
                </div>
                <div style={{ marginTop: '6px' }}>
                  <span style={{ backgroundColor: '#27ae60', color: '#fff', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                    Live Status: {collab.progress}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onOpenChat(collab)}
                style={{ backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '9px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                💬 Live Chat & Location
              </button>
            </div>
          ))}
        </div>
      )}

      {referredDonors.length > 0 && (
        <div style={{ backgroundColor: '#eafaf1', border: '1px solid #a9dfbf', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
          <h3 style={{ color: '#1e8449', marginTop: 0 }}>🤝 Referred Donors Coming For You ({referredDonors.length})</h3>
          {referredDonors.map((ref) => (
            <div key={ref.id} style={{ backgroundColor: '#fff', padding: '10px 14px', borderRadius: '5px', marginBottom: '8px', borderLeft: '4px solid #27ae60' }}>
              <strong>Donor: {ref.donorName}</strong> ({ref.bloodGroup}) — 📞 <strong>{ref.donorPhone}</strong>
              <div style={{ fontSize: '13px', color: '#555', marginTop: '3px' }}>
                For Patient: <strong>{ref.patient}</strong> | Referred by: <strong>{ref.referredBy}</strong> ({ref.relation}) | Hospital: {ref.hospital}
              </div>
            </div>
          ))}
        </div>
      )}

      <h4>📋 Posted Blood Requests</h4>
      {requests.length === 0 ? (
        <p style={{ color: '#666', fontSize: '14px' }}>No blood requests posted yet. Go to <strong>+ Request</strong> to create one.</p>
      ) : (
        requests.map((req) => (
          <div key={req.id} style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '15px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <strong style={{ fontSize: '16px' }}>Patient: {req.patient}</strong> — <span style={{ color: '#c0392b', fontWeight: 'bold' }}>{req.bloodGroup} ({req.bags} Bag)</span>
              <div style={{ color: '#555', fontSize: '14px', marginTop: '4px' }}>
                📍 Hospital: {req.hospital} ({req.location}) | Status: <strong>{req.status}</strong>
              </div>
            </div>
            {!req.status.includes('Completed') && (
              <button
                onClick={() => onMarkCompleted(req.id)}
                style={{ backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Mark as Fulfilled
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}