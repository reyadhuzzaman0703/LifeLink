import React, { useState } from 'react';

export default function CreateRequest({ onSuccess }) {
  const [formData, setFormData] = useState({ bloodGroup: 'A+', units: 1, hospital: '', contactNumber: '', type: 'ASAP' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Blood Request Posted Successfully!');
    if (onSuccess) onSuccess();
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', maxWidth: '500px', margin: '0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#c0392b', marginTop: 0 }}>🩸 Create Blood Request</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Blood Group:</label>
          <select value={formData.bloodGroup} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})} style={{ width: '100%', padding: '8px' }}>
            <option value="A+">A+</option><option value="O-">O-</option><option value="B+">B+</option><option value="AB+">AB+</option>
          </select>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Request Type:</label>
          <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} style={{ width: '100%', padding: '8px' }}>
            <option value="ASAP">ASAP (Emergency Expansion)</option>
            <option value="Scheduled">Scheduled (Auto-Expires on End Date)</option>
          </select>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Hospital Name:</label>
          <input type="text" placeholder="e.g. Dhaka Medical College" value={formData.hospital} onChange={(e) => setFormData({...formData, hospital: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} required />
        </div>
        <button type="submit" style={{ width: '100%', backgroundColor: '#c0392b', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
          Publish Request
        </button>
      </form>
    </div>
  );
}
