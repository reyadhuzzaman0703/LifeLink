import React, { useState } from 'react';

export default function Availability({ onStatusChange }) {
  const [status, setStatus] = useState('Not Answered');

  const handleResponse = (val) => {
    setStatus(val);
    if (onStatusChange) onStatusChange(val);
  };

  return (
    <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeeba', padding: '12px 15px', borderRadius: '6px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <strong style={{ color: '#856404' }}>☀️ Morning Donor Prompt:</strong> Are you available to donate blood today?
        <span style={{ marginLeft: '10px', fontWeight: 'bold', color: status === 'Available' ? '#27ae60' : '#c0392b' }}>[ Current: {status} ]</span>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => handleResponse('Available')} style={{ backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Available</button>
        <button onClick={() => handleResponse('Emergency Only')} style={{ backgroundColor: '#e67e22', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Emergency Only</button>
        <button onClick={() => handleResponse('Not Available')} style={{ backgroundColor: '#95a5a6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Not Available</button>
      </div>
    </div>
  );
}