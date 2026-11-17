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
  const [startingId, setStartingId] = useState(null);

  const handleDonateClick = async (req) => {
    const reqId = req._id || req.id;
    const notifId = req.notificationId || reqId;
    setStartingId(reqId);

    try {
      const token = localStorage.getItem('lifelink_token');
      const res = await fetch(`/api/chats/notification/${notifId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const rawText = await res.text();
      const data = rawText ? JSON.parse(rawText) : {};

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Could not start chat for this request');
      }

      const chatObj = data.chat || data.data || data;
      const realChatId = chatObj._id || chatObj.id || notifId;

      onAcceptDonate({ ...req, id: reqId, chatId: realChatId, notificationId: notifId });
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setStartingId(null);
    }
  };

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
          const reqId = req._id || req.id;
          const collab = collaborations.find((c) => c.requestId === reqId);

          return (
            <div
              key={reqId}
              style={{
                backgroundColor: '#fff',
                padding: '18px',
                borderRadius: '8px',
                marginBottom: '15px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                borderLeft: `6px solid ${collab ? '#27ae60' : '#c0392b'}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ backgroundColor: '#c0392b', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold', marginRight: '8px' }}>
                    {req.bloodGroup}
                  </span>
                  <strong style={{ fontSize: '17px' }}>Patient: {req.patient || req.patientName}</strong>
                  <p style={{ margin: '6px 0 2px 0', color: '#444' }}>
                    🏥 <strong>Hospital:</strong> {req.hospital} ({req.location})
                  </p>
                  <p style={{ margin: '2px 0', color: '#666', fontSize: '14px' }}>
                    🩸 {req.bags || req.bagsNeeded || 1} Bag(s) | ⏰ {req.urgency} | 📞 {req.contact || req.contactNumber || req.phone}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    disabled={startingId === reqId}
                    onClick={() => (collab ? onOpenChat(collab) : handleDonateClick(req))}
                    style={{ backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '9px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    {startingId === reqId ? '⏳ Starting...' : collab ? '✅ Open Live Chat' : '🩸 I Will Donate'}
                  </button>

                  <button
                    onClick={() => setReferModalId(referModalId === reqId ? null : reqId)}
                    style={{ backgroundColor: '#2980b9', color: '#fff', border: 'none', padding: '9px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    🤝 Refer a Friend
                  </button>
                </div>
              </div>

              {referModalId === reqId && (
                <form
                  onSubmit={(e) => handleReferSubmit(e, reqId)}
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