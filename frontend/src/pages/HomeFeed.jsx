import React, { useState } from 'react';
import LocationMatch from '../components/LocationMatch';

const mockRequests = [
  { id: 'REQ-101', bloodGroup: 'A+', units: 2, hospital: 'Dhaka Medical College', distance: '2.5 km', reason: 'Emergency Surgery', type: 'ASAP' },
  { id: 'REQ-102', bloodGroup: 'O-', units: 1, hospital: 'Square Hospital', distance: '4.1 km', reason: 'Thalassemia Patient', type: 'Scheduled' }
];

export default function HomeFeed() {
  const [filterGroup, setFilterGroup] = useState('All');
  const filteredRequests = filterGroup === 'All' ? mockRequests : mockRequests.filter(r => r.bloodGroup === filterGroup);

  return (
    <div>
      <LocationMatch isASAP={true} />
      <h2>🩸 Centralized Blood Requests Feed</h2>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ fontWeight: 'bold' }}>Filter Blood Group: </label>
        <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)} style={{ padding: '6px' }}>
          <option value="All">All Groups</option>
          <option value="A+">A+</option><option value="O-">O-</option><option value="B+">B+</option><option value="AB+">AB+</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
        {filteredRequests.map((req) => (
          <div key={req.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', borderLeft: req.type === 'ASAP' ? '5px solid #e74c3c' : '5px solid #3498db', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#c0392b' }}>{req.bloodGroup} ({req.type})</h3>
            <p style={{ margin: '4px 0' }}><strong>Hospital:</strong> {req.hospital}</p>
            <p style={{ margin: '4px 0' }}><strong>Units Needed:</strong> {req.units} Bag(s)</p>
            <p style={{ margin: '4px 0' }}><strong>Approx Distance:</strong> {req.distance}</p>
            <p style={{ margin: '4px 0' }}><strong>Reason:</strong> {req.reason}</p>
            <button onClick={() => alert('Donor Offer Sent to Requester!')} style={{ width: '100%', backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
              Offer to Donate
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}