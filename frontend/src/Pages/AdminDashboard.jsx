import React, { useState } from 'react';

export default function AdminDashboard({ registeredUsers = [], activeRequests = [] }) {
  const [filterStatus, setFilterStatus] = useState('ALL');

  const totalRequests = activeRequests.length;
  const activeCount = activeRequests.filter(
    (r) => (r.status || 'Active') === 'Active'
  ).length;
  const completedCount = activeRequests.filter(
    (r) => r.status === 'Completed'
  ).length;

  const filteredRequests = activeRequests.filter((req) => {
    if (filterStatus === 'ALL') return true;
    return (req.status || 'Active') === filterStatus;
  });

  return (
    <div style={{ backgroundColor: '#fff', padding: '22px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '2px solid #eee', paddingBottom: '12px', marginBottom: '20px' }}>
        <h2 style={{ color: '#2c3e50', margin: 0 }}>🛡️ LifeLink Admin Control Panel</h2>
        <span style={{ backgroundColor: '#fdecea', color: '#c0392b', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
          Admin Only Access
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div style={statCard('#ebf5fb', '#2980b9')}>
          <small style={{ color: '#555' }}>Active Users</small>
          <h2 style={{ margin: '6px 0 0 0', color: '#2980b9' }}>{registeredUsers.length}</h2>
        </div>

        <div style={statCard('#fef9e7', '#e67e22')}>
          <small style={{ color: '#555' }}>Active Blood Requests</small>
          <h2 style={{ margin: '6px 0 0 0', color: '#e67e22' }}>{activeCount}</h2>
        </div>

        <div style={statCard('#eafaf1', '#27ae60')}>
          <small style={{ color: '#555' }}>Completed Donations</small>
          <h2 style={{ margin: '6px 0 0 0', color: '#27ae60' }}>{completedCount}</h2>
        </div>

        <div style={statCard('#fdecea', '#c0392b')}>
          <small style={{ color: '#555' }}>Total Requests</small>
          <h2 style={{ margin: '6px 0 0 0', color: '#c0392b' }}>{totalRequests}</h2>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
        <h3 style={{ color: '#2c3e50', margin: 0 }}>📋 All Blood Requests Log ({filteredRequests.length})</h3>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['ALL', 'Active', 'Completed', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                backgroundColor: filterStatus === status ? '#2c3e50' : '#ecf0f1',
                color: filterStatus === status ? '#fff' : '#2c3e50',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '12px'
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <p style={{ color: '#777', textAlign: 'center', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
          No blood requests found under "{filterStatus}" filter.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f4f6f7', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                <th style={thStyle}>Patient</th>
                <th style={thStyle}>Blood</th>
                <th style={thStyle}>Hospital & Location</th>
                <th style={thStyle}>Contact</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req, idx) => {
                const status = req.status || 'Active';
                const statusColor =
                  status === 'Completed' ? '#27ae60' : status === 'Cancelled' ? '#e74c3c' : '#e67e22';

                return (
                  <tr key={req._id || req.id || idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={tdStyle}><strong>{req.patient || req.patientName || 'Patient'}</strong></td>
                    <td style={tdStyle}>
                      <span style={{ backgroundColor: '#c0392b', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' }}>
                        {req.bloodGroup}
                      </span>
                    </td>
                    <td style={tdStyle}>{req.hospital} ({req.location})</td>
                    <td style={tdStyle}>{req.contact || req.contactNumber || req.phone || 'N/A'}</td>
                    <td style={tdStyle}>
                      <span style={{ color: statusColor, fontWeight: 'bold' }}>{status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <h3 style={{ color: '#2c3e50', marginTop: '24px', marginBottom: '10px' }}>
        👥 Active Admin Session ({registeredUsers.length})
      </h3>
      {registeredUsers.map((u, idx) => (
        <div key={u._id || u.id || idx} style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e1e4e8', fontSize: '14px' }}>
          <strong>{u.name}</strong> ({u.bloodGroup}) — 📧 {u.email} | 📍 {u.cityCountry || u.location || 'Location Verified'}
        </div>
      ))}
    </div>
  );
}

const statCard = (bg, border) => ({
  backgroundColor: bg,
  borderLeft: `5px solid ${border}`,
  padding: '15px',
  borderRadius: '6px'
});

const thStyle = { padding: '10px 12px', color: '#2c3e50' };
const tdStyle = { padding: '10px 12px', color: '#333' };