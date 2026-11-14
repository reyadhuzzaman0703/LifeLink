import React, { useState } from 'react';

export default function Availability({ onStatusChange }) {
  const [status, setStatus] = useState('Not Answered');

  const handleSelect = (newStatus) => {
    setStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '14px 18px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderLeft: '5px solid #2980b9' }}>
      <div>
        <strong style={{ color: '#2c3e50', fontSize: '15px' }}>🩺 Daily Donor Availability:</strong>
        <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: 'bold', color: status.includes('Available') ? '#27ae60' : '#7f8c8d' }}>
          {status}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => handleSelect('Available Today ✅')}
          style={statusBtnStyle(status === 'Available Today ✅', '#27ae60')}
        >
          ✅ Available Today
        </button>
        <button
          onClick={() => handleSelect('Emergency Only 🚨')}
          style={statusBtnStyle(status === 'Emergency Only 🚨', '#e67e22')}
        >
          🚨 Emergency Only
        </button>
        <button
          onClick={() => handleSelect('Not Available ❌')}
          style={statusBtnStyle(status === 'Not Available ❌', '#7f8c8d')}
        >
          ❌ Not Available
        </button>
      </div>
    </div>
  );
}

const statusBtnStyle = (active, color) => ({
  backgroundColor: active ? color : '#ecf0f1',
  color: active ? '#fff' : '#2c3e50',
  border: 'none',
  padding: '7px 12px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '13px'
});