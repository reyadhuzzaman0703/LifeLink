import React, { useState } from 'react';

export default function Availability({ initialStatus = 'Not Answered', onStatusChange }) {
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);

  const updateAvailability = async (newStatus) => {
    setStatus(newStatus);
    setSaving(true);
    localStorage.setItem('lifelink_donor_status', newStatus);
    if (onStatusChange) onStatusChange(newStatus);

    try {
      const token = localStorage.getItem('lifelink_token');
      await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          availability: newStatus,
          isAvailable: newStatus.includes('Available')
        })
      });
    } catch (err) {
      console.error('Availability update failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '12px 16px', borderRadius: '8px', marginBottom: '18px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
      <div>
        <strong>🩸 Donor Availability: </strong>
        <span style={{ color: status.includes('Available') ? '#27ae60' : '#e67e22', fontWeight: 'bold' }}>
          {status} {saving && '(Saving...)'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => updateAvailability('Available Today ✅')}
          style={{ backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '7px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
        >
          ✅ Available Now
        </button>
        <button
          onClick={() => updateAvailability('Unavailable ⏸️')}
          style={{ backgroundColor: '#7f8c8d', color: '#fff', border: 'none', padding: '7px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
        >
          ⏸️ Unavailable
        </button>
      </div>
    </div>
  );
}