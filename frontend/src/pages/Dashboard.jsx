import React from 'react';

export default function Dashboard({ userAvailability }) {
  return (
    <div>
      <h2>📊 Common User Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div style={{ backgroundColor: '#e74c3c', color: 'white', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ margin: 0 }}>Total Verified Donations</h3>
          <h2 style={{ margin: '10px 0 0 0' }}>4 Times</h2>
        </div>
        <div style={{ backgroundColor: '#f39c12', color: 'white', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ margin: 0 }}>90-Day Cooldown</h3>
          <h2 style={{ margin: '10px 0 0 0' }}>31 Days Left</h2>
          <small>Next Eligible Date: 2026-12-01</small>
        </div>
        <div style={{ backgroundColor: '#27ae60', color: 'white', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ margin: 0 }}>Donation Reward Points</h3>
          <h2 style={{ margin: '10px 0 0 0' }}>400 PTS</h2>
        </div>
      </div>
    </div>
  );
}
