import React, { useState } from 'react';

export default function CreateRequest({ onAddRequest, currentUser }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patient: '',
    bloodGroup: 'A+',
    hospital: '',
    location: currentUser?.cityCountry || currentUser?.location || '',
    bags: 1,
    urgency: 'Emergency (Within 2 Hours)',
    contact: currentUser?.contact || currentUser?.phone || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient.trim() || !formData.hospital.trim()) return;
    setLoading(true);

    try {
      const token = localStorage.getItem('lifelink_token');
      const res = await fetch('/api/blood-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          patientName: formData.patient,
          contactNumber: formData.contact,
          phone: formData.contact,
          bagsNeeded: formData.bags
        })
      });

      const rawText = await res.text();
      const data = rawText ? JSON.parse(rawText) : {};

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to create blood request');
      }

      const rawCreated = data.request || data.bloodRequest || data.data || data;
      const normalized = {
        ...rawCreated,
        id: rawCreated._id || rawCreated.id,
        patient: rawCreated.patient || rawCreated.patientName || formData.patient,
        contact: rawCreated.contact || rawCreated.contactNumber || rawCreated.phone || formData.contact,
        bags: rawCreated.bags || rawCreated.bagsNeeded || formData.bags
      };

      onAddRequest(normalized);
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '22px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: '#c0392b', marginTop: 0, borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        ➕ Post New Blood Request
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={labelStyle}>Patient Name *</label>
          <input type="text" required placeholder="Enter patient's full name" value={formData.patient} onChange={(e) => setFormData({ ...formData, patient: e.target.value })} style={inputStyle} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Blood Group *</label>
            <select value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })} style={inputStyle}>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Required Bags *</label>
            <input type="number" min="1" max="10" required value={formData.bags} onChange={(e) => setFormData({ ...formData, bags: Number(e.target.value) })} style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Hospital Name & Ward *</label>
          <input type="text" required placeholder="e.g., City General Hospital, Ward-4" value={formData.hospital} onChange={(e) => setFormData({ ...formData, hospital: e.target.value })} style={inputStyle} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>City / Country *</label>
            <input type="text" required placeholder="e.g., Dhaka, Bangladesh" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Contact Number *</label>
            <input type="text" required placeholder="Emergency contact number" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Urgency Level</label>
          <select value={formData.urgency} onChange={(e) => setFormData({ ...formData, urgency: e.target.value })} style={inputStyle}>
            <option value="Emergency (Within 2 Hours)">🚨 Emergency (Within 2 Hours)</option>
            <option value="Urgent (Today)">⚡ Urgent (Today)</option>
            <option value="Scheduled Surgery">📅 Scheduled Surgery</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ backgroundColor: loading ? '#95a5a6' : '#c0392b', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '6px' }}
        >
          {loading ? '⏳ Publishing...' : '🩸 Publish Blood Request'}
        </button>
      </form>
    </div>
  );
}

const labelStyle = { display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px', color: '#333' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' };