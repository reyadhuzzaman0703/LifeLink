import React, { useState } from 'react';

export default function HomeFeed({
  requests = [],
  collaborations = [],
  onAcceptDonate,
  onReferSuccess,
  onOpenChat,
  onGoToCreate
}) {
  const [referringId, setReferringId] = useState(null);
  const [friendData, setFriendData] = useState({
    friendName: '',
    friendPhone: '',
    relation: 'Friend'
  });

  const handleReferSubmit = (e, req) => {
    e.preventDefault();
    if (!friendData.friendName || !friendData.friendPhone) return;

    const referralEntry = {
      id: Date.now(),
      requestId: req.id,
      patient: req.patient,
      bloodGroup: req.bloodGroup,
      hospital: req.hospital,
      donorName: friendData.friendName,
      donorPhone: friendData.friendPhone,
      relation: friendData.relation,
      status: 'Referred & On The Way 🚗'
    };

    if (onReferSuccess) {
      onReferSuccess(referralEntry);
    }

    setReferringId(null);
    setFriendData({ friendName: '', friendPhone: '', relation: 'Friend' });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ color: '#c0392b', margin: 0 }}>🩸 Live Blood Requests ({requests.length})</h2>
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
          const activeCollab = collaborations.find((c) => c.requestId === req.id);

          return (
            <div
              key={req.id}
              style={{
                backgroundColor: '#fff',
                padding: '18px',
                borderRadius: '8px',
                marginBottom: '15px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                borderLeft: activeCollab ? '6px solid #27ae60' : '6px solid #c0392b'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ backgroundColor: '#c0392b', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold', marginRight: '8px' }}>
                    {req.bloodGroup}
                  </span>
                  <strong style={{ fontSize: '17px' }}>Patient: {req.patient}</strong>
                  <small style={{ color: '#888', marginLeft: '8px' }}>• Posted by {req.requestedBy} ({req.createdAt})</small>
                  <p style={{ margin: '6px 0 2px 0', color: '#444' }}>
                    🏥 <strong>Hospital:</strong> {req.hospital} ({req.location})
                  </p>
                  <p style={{ margin: '2px 0', color: '#666', fontSize: '14px' }}>
                    🩸 {req.bags} Bag(s) | ⏰ {req.urgency} | 📞 {req.contact}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {activeCollab ? (
                    <button
                      onClick={() => onOpenChat(activeCollab)}
                      style={{ backgroundColor: '#16a085', color: '#fff', border: 'none', padding: '9px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      💬 Chat & Coordinate ({activeCollab.progress})
                    </button>
                  ) : (
                    <button
                      onClick={() => onAcceptDonate(req)}
                      style={{ backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '9px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      🩸 I Will Donate
                    </button>
                  )}

                  <button
                    onClick={() => setReferringId(referringId === req.id ? null : req.id)}
                    style={{ backgroundColor: '#2980b9', color: '#fff', border: 'none', padding: '9px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    🤝 Refer a Friend
                  </button>
                </div>
              </div>

              {activeCollab && (
                <div style={{ marginTop: '12px', padding: '10px 14px', backgroundColor: '#eafaf1', borderRadius: '6px', border: '1px solid #a9dfbf', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ color: '#1e8449', fontSize: '14px' }}>
                    ✅ <strong>Collaboration Active:</strong> You committed to donate for <strong>{req.patient}</strong>. Stage: <strong>{activeCollab.progress}</strong>
                  </span>
                  <button
                    onClick={() => onOpenChat(activeCollab)}
                    style={{ backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                  >
                    Open Live Chat ➔
                  </button>
                </div>
              )}

              {referringId === req.id && (
                <form
                  onSubmit={(e) => handleReferSubmit(e, req)}
                  style={{ marginTop: '15px', padding: '15px', backgroundColor: '#ebf5fb', borderRadius: '6px', border: '1px solid #aed6f1' }}
                >
                  <h4 style={{ margin: '0 0 10px 0', color: '#1b4f72' }}>
                    🤝 Refer a Friend or Contact ({req.bloodGroup}) for {req.patient}:
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                    <input
                      type="text"
                      required
                      placeholder="Friend's Full Name"
                      value={friendData.friendName}
                      onChange={(e) => setFriendData({ ...friendData, friendName: e.target.value })}
                      style={inputStyle}
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Friend's Phone Number"
                      value={friendData.friendPhone}
                      onChange={(e) => setFriendData({ ...friendData, friendPhone: e.target.value })}
                      style={inputStyle}
                    />
                    <select
                      value={friendData.relation}
                      onChange={(e) => setFriendData({ ...friendData, relation: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="Friend">Friend</option>
                      <option value="Relative">Relative</option>
                      <option value="Colleague">Colleague</option>
                    </select>
                  </div>
                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                    <button type="submit" style={{ backgroundColor: '#1b4f72', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                      Send Friend's Info
                    </button>
                    <button type="button" onClick={() => setReferringId(null)} style={{ backgroundColor: '#95a5a6', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

const inputStyle = { padding: '9px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' };