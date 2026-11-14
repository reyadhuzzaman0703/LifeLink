import React, { useState } from 'react';

export default function DonorDashboard({
  userAvailability,
  user,
  collaborations = [],
  onUpdateProgress,
  onOpenChat
}) {
  const [donations, setDonations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newLog, setNewLog] = useState({ date: '', hospital: '', cityCountry: '', patient: '' });

  const handleAddDonation = (e) => {
    e.preventDefault();
    if (!newLog.hospital || !newLog.date) return;
    setDonations([{ id: Date.now(), ...newLog, status: 'Verified' }, ...donations]);
    setNewLog({ date: '', hospital: '', cityCountry: '', patient: '' });
    setShowForm(false);
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ color: '#c0392b', margin: 0 }}>🩸 Global Donor Dashboard</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Log Past Donation
        </button>
      </div>

      {collaborations.length > 0 && (
        <div style={{ backgroundColor: '#fef9e7', border: '1px solid #f7dc6f', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3 style={{ color: '#b7950b', marginTop: 0 }}>🤝 Active Patient Collaborations ({collaborations.length})</h3>
          {collaborations.map((collab) => (
            <div key={collab.id} style={{ backgroundColor: '#fff', padding: '14px', borderRadius: '6px', marginBottom: '10px', borderLeft: '5px solid #27ae60', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <strong style={{ fontSize: '16px' }}>Patient: {collab.patient}</strong> ({collab.bloodGroup})
                  <div style={{ fontSize: '13px', color: '#555', marginTop: '3px' }}>
                    🏥 {collab.hospital} ({collab.location}) | 📞 Requester: {collab.contact}
                  </div>
                </div>
                <button
                  onClick={() => onOpenChat(collab)}
                  style={{ backgroundColor: '#2980b9', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  💬 Chat with Requester
                </button>
              </div>

              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <small style={{ fontWeight: 'bold', color: '#555' }}>Update Live Status:</small>
                {['Accepted & Preparing', 'On The Way 🚗', 'Reached Hospital 🏥', 'Donated ✅'].map((step) => (
                  <button
                    key={step}
                    onClick={() => onUpdateProgress(collab.id, step)}
                    style={{
                      backgroundColor: collab.progress === step ? '#27ae60' : '#ecf0f1',
                      color: collab.progress === step ? '#fff' : '#2c3e50',
                      border: 'none',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    {step}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div style={cardStyle('#fdecea', '#c0392b')}>
          <small>Donor Name & Blood Group</small>
          <h3 style={{ margin: '5px 0' }}>{user?.name || 'Donor'} ({user?.bloodGroup || 'O+'})</h3>
        </div>
        <div style={cardStyle('#eafaf1', '#27ae60')}>
          <small>Availability Status</small>
          <h3 style={{ margin: '5px 0' }}>{userAvailability || 'Available'}</h3>
        </div>
        <div style={cardStyle('#ebf5fb', '#2980b9')}>
          <small>Completed Donations</small>
          <h3 style={{ margin: '5px 0' }}>
            {donations.length + collaborations.filter((c) => c.progress === 'Donated ✅').length} Time(s)
          </h3>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAddDonation} style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #ddd' }}>
          <h4 style={{ marginTop: 0 }}>Add Past Donation Record</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            <input type="date" required value={newLog.date} onChange={(e) => setNewLog({ ...newLog, date: e.target.value })} style={inputStyle} />
            <input type="text" required placeholder="Hospital Name" value={newLog.hospital} onChange={(e) => setNewLog({ ...newLog, hospital: e.target.value })} style={inputStyle} />
            <input type="text" required placeholder="City, Country" value={newLog.cityCountry} onChange={(e) => setNewLog({ ...newLog, cityCountry: e.target.value })} style={inputStyle} />
            <input type="text" placeholder="Patient Name (Optional)" value={newLog.patient} onChange={(e) => setNewLog({ ...newLog, patient: e.target.value })} style={inputStyle} />
          </div>
          <button type="submit" style={{ marginTop: '10px', backgroundColor: '#2980b9', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Save Record
          </button>
        </form>
      )}

      <h4>📜 Donation History</h4>
      {donations.length === 0 ? (
        <p style={{ color: '#777', fontSize: '14px' }}>No past donation records logged yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f6f7', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '10px' }}>Date</th>
              <th style={{ padding: '10px' }}>Hospital</th>
              <th style={{ padding: '10px' }}>City / Country</th>
              <th style={{ padding: '10px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((d) => (
              <tr key={d.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{d.date}</td>
                <td style={{ padding: '10px' }}>{d.hospital}</td>
                <td style={{ padding: '10px' }}>{d.cityCountry}</td>
                <td style={{ padding: '10px', color: '#27ae60', fontWeight: 'bold' }}>{d.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
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

const inputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #ccc' };