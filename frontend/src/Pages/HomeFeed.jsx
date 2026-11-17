import React, { useState } from 'react';

export default function HomeFeed({
  requests = [],
  collaborations = [],
  onAcceptDonate,
  onReferSuccess,
  onOpenChat,
  onGoToCreate
}) {
  const [referModalId, setReferModalId] = useState(null);
  const [friendName, setFriendName] = useState('');
  const [friendPhone, setFriendPhone] = useState('');

  const handleReferSubmit = (e, reqId) => {
    e.preventDefault();
    if (!friendName.trim() || !friendPhone.trim()) return;
    if (onReferSuccess) {
      onReferSuccess(reqId, { friendName, friendPhone });
    }
    setFriendName('');
    setFriendPhone('');
    setReferModalId(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ color: '#c0392b', margin: 0 }}>🩸 Live Emergency Blood Feed ({requests.length})</h2>
        <button
          onClick={onGoToCreate}
          style={{ backgroundColor: '#c0392b', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Create Blood Request
        </button>
      </div>

      {requests.length === 0 ? (
        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', textAlign: 'center', border: '1px dashed #ccc' }}>
          <h3 style={{ color: '#555', marginTop: 0 }}>No active blood requests right now</h3>
          <p style={{ color: '#777', fontSize: '14px' }}>Click <strong>+ Create Blood Request</strong> above to post an emergency request.</p>
        </div>
      ) : (
        requests.map((req) => {
          const collab = collaborations.find((c) => c.requestId === req.id);

          return (
            <div
              key={req.id}
              style={{
                backgroundColor: '#fff',
                padding: '18px',
                borderRadius: '8px',
                marginBottom: '15px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                borderLeft: `6px solid ${collab ? '#27ae60' : '#c0392b'}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <span style={{ backgroundColor: '#c0392b', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold', marginRight: '8px' }}>
                    {req.bloodGroup}
                  </span>
                  <strong style={{ fontSize: '17px' }}>Patient: {req.patient}</strong>
                  <p style={{ margin: '8px 0 3px 0', color: '#444' }}>
                    🏥 <strong>Hospital:</strong> {req.hospital} ({req.location})
                  </p>
                  <p style={{ margin: '2px 0', color: '#666', fontSize: '14px' }}>
                    🩸 {req.bags || 1} Bag(s) | ⏰ {req.urgency} | 📞 {req.contact}
                  </p>
                </div>

                {/* Right-side top aligned buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignSelf: 'flex-start' }}>
                  <button
                    onClick={() => (collab ? onOpenChat(collab) : onAcceptDonate(req))}
                    style={{ backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                  >
                    {collab ? '✅ Open Live Chat' : '🩸 I Will Donate'}
                  </button>

                  <button
                    onClick={() => setReferModalId(referModalId === req.id ? null : req.id)}
                    style={{ backgroundColor: '#2980b9', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                  >
                    🤝 Refer a Friend
                  </button>
                </div>
              </div>

              {referModalId === req.id && (
                <form
                  onSubmit={(e) => handleReferSubmit(e, req.id)}
                  style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f1f3f5', borderRadius: '6px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}
                >
                  <input type="text" required placeholder="Friend's Name" value={friendName} onChange={(e) => setFriendName(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }} />
                  <input type="text" required placeholder="Friend's Phone" value={friendPhone} onChange={(e) => setFriendPhone(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }} />
                  <button type="submit" style={{ backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Submit Referral
                  </button>
                </form>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}