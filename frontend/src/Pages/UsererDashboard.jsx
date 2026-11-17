import React, { useState, useEffect } from 'react';

export default function UserDashboard({
  userAvailability,
  user,
  collaborations = [],
  referrals = [],
  onAcceptDonate,
  onUpdateProgress,
  onOpenChat,
  onRequestsMutated
}) {
  const [viewFilter, setViewFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [selectedNotifDetails, setSelectedNotifDetails] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [matchingDonorsMap, setMatchingDonorsMap] = useState({});
  const [busyId, setBusyId] = useState(null);

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('lifelink_token')}`
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [notifRes, myReqRes] = await Promise.all([
          fetch('/api/donor-notifications', { headers: authHeaders() }),
          fetch('/api/blood-requests/my', { headers: authHeaders() })
        ]);

        const notifText = await notifRes.text();
        const notifData = notifText ? JSON.parse(notifText) : {};
        if (notifRes.ok) {
          const list = Array.isArray(notifData) ? notifData : notifData.notifications || notifData.data || [];
          setNotifications(list);
        }

        const myReqText = await myReqRes.text();
        const myReqData = myReqText ? JSON.parse(myReqText) : {};
        if (myReqRes.ok) {
          const list = Array.isArray(myReqData) ? myReqData : myReqData.requests || myReqData.data || [];
          setMyRequests(list);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      }
    };

    loadDashboardData();
  }, []);

  const handleViewNotifDetails = async (notifId) => {
    setBusyId(notifId);
    try {
      const res = await fetch(`/api/donor-notifications/${notifId}`, { headers: authHeaders() });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.message || 'Failed to fetch details');
      setSelectedNotifDetails(data.notification || data.data || data);
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setBusyId(null);
    }
  };

  const handleAcceptNotification = async (notif) => {
    const notifId = notif._id || notif.id;
    const reqObj = notif.bloodRequest || notif.request || notif;
    const reqId = reqObj._id || reqObj.id || notifId;
    setBusyId(notifId);

    try {
      const res = await fetch(`/api/chats/notification/${notifId}/start`, {
        method: 'POST',
        headers: authHeaders()
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.message || 'Could not start chat');

      const chatObj = data.chat || data.data || data;
      const realChatId = chatObj._id || chatObj.id || notifId;

      onAcceptDonate({
        ...reqObj,
        id: reqId,
        notificationId: notifId,
        chatId: realChatId,
        patient: reqObj.patient || reqObj.patientName || 'Patient'
      });
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setBusyId(null);
    }
  };

  const handleLoadDonors = async (reqId) => {
    setBusyId(reqId);
    try {
      const res = await fetch(`/api/blood-requests/${reqId}/donors`, { headers: authHeaders() });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.message || 'Failed to fetch matching donors');
      const list = Array.isArray(data) ? data : data.donors || data.data || [];
      setMatchingDonorsMap((prev) => ({ ...prev, [reqId]: list }));
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setBusyId(null);
    }
  };

  const handleNotifyNext = async (reqId) => {
    setBusyId(reqId);
    try {
      const res = await fetch(`/api/blood-requests/${reqId}/notify-next-donor`, {
        method: 'POST',
        headers: authHeaders()
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.message || 'Failed to notify next donor');
      alert(`🔔 ${data.message || 'Next matching donor notified!'}`);
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkFulfilled = async (reqId) => {
    setBusyId(reqId);
    try {
      const res = await fetch(`/api/blood-requests/${reqId}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status: 'Completed' })
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.message || 'Failed to update status');

      setMyRequests((prev) =>
        prev.map((r) => ((r._id || r.id) === reqId ? { ...r, status: 'Completed' } : r))
      );
      if (onRequestsMutated) onRequestsMutated();
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setBusyId(null);
    }
  };

  const handleCancelRequest = async (reqId) => {
    setBusyId(reqId);
    try {
      const res = await fetch(`/api/blood-requests/${reqId}/cancel`, {
        method: 'PATCH',
        headers: authHeaders()
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.message || 'Failed to cancel request');

      setMyRequests((prev) =>
        prev.map((r) => ((r._id || r.id) === reqId ? { ...r, status: 'Cancelled' } : r))
      );
      if (onRequestsMutated) onRequestsMutated();
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '2px solid #eee', paddingBottom: '12px', marginBottom: '18px' }}>
        <h2 style={{ color: '#c0392b', margin: 0 }}>🩸 User Request & Donation Hub</h2>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button onClick={() => setViewFilter('all')} style={tabBtn(viewFilter === 'all', '#2c3e50')}>
            📋 All Activity
          </button>
          <button onClick={() => setViewFilter('donor')} style={tabBtn(viewFilter === 'donor', '#27ae60')}>
            🩸 Donor Alerts ({notifications.length})
          </button>
          <button onClick={() => setViewFilter('requester')} style={tabBtn(viewFilter === 'requester', '#2980b9')}>
            🏥 My Requests ({myRequests.length})
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', marginBottom: '22px' }}>
        <div style={cardStyle('#fdecea', '#c0392b')}>
          <small>User Profile</small>
          <h3 style={{ margin: '5px 0' }}>{user?.name} ({user?.bloodGroup})</h3>
        </div>
        <div style={cardStyle('#eafaf1', '#27ae60')}>
          <small>Availability Status</small>
          <h3 style={{ margin: '5px 0' }}>{userAvailability}</h3>
        </div>
        <div style={cardStyle('#fef9e7', '#e67e22')}>
          <small>Donor Notifications</small>
          <h3 style={{ margin: '5px 0' }}>{notifications.length} Alert(s)</h3>
        </div>
        <div style={cardStyle('#ebf5fb', '#2980b9')}>
          <small>My Blood Requests</small>
          <h3 style={{ margin: '5px 0' }}>{myRequests.length} Request(s)</h3>
        </div>
      </div>

      {(viewFilter === 'all' || viewFilter === 'donor') && (
        <div style={{ marginBottom: '28px' }}>
          {collaborations.length > 0 && (
            <>
              <h3 style={{ color: '#27ae60', borderLeft: '4px solid #27ae60', paddingLeft: '10px' }}>
                🤝 Active Donation Missions ({collaborations.length})
              </h3>
              {collaborations.map((collab) => (
                <div key={collab.requestId} style={{ border: '1px solid #a9dfbf', borderRadius: '6px', padding: '15px', marginBottom: '12px', backgroundColor: '#eafaf1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <strong>Patient: {collab.patient} ({collab.bloodGroup})</strong>
                      <div style={{ fontSize: '13px', color: '#555', marginTop: '3px' }}>🏥 {collab.hospital} ({collab.location})</div>
                      <div style={{ fontSize: '13px', color: '#1e8449', fontWeight: 'bold', marginTop: '4px' }}>🚦 Status: {collab.progress}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button onClick={() => onUpdateProgress(collab.requestId, 'On The Way 🚗')} style={progBtn('#e67e22')}>🚗 On The Way</button>
                      <button onClick={() => onUpdateProgress(collab.requestId, 'Reached Hospital 🏥')} style={progBtn('#2980b9')}>🏥 Reached Hospital</button>
                      <button onClick={() => onUpdateProgress(collab.requestId, 'Donated ✅')} style={progBtn('#27ae60')}>✅ Mark Donated</button>
                      <button onClick={() => onOpenChat(collab)} style={progBtn('#8e44ad')}>💬 Chat</button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          <h3 style={{ color: '#c0392b', borderLeft: '4px solid #c0392b', paddingLeft: '10px' }}>
            🔔 My Donor Notifications ({notifications.length})
          </h3>
          {notifications.length === 0 ? (
            <p style={{ color: '#777', fontSize: '14px' }}>No donor notifications assigned to you right now.</p>
          ) : (
            notifications.map((notif) => {
              const notifId = notif._id || notif.id;
              const reqObj = notif.bloodRequest || notif.request || notif;

              return (
                <div key={notifId} style={{ border: '1px solid #f5b7b1', backgroundColor: '#fef9e7', borderRadius: '6px', padding: '15px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <strong>Patient: {reqObj.patient || reqObj.patientName || 'Emergency Request'} ({reqObj.bloodGroup})</strong>
                    <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>
                      🏥 Hospital: {reqObj.hospital} ({reqObj.location})
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      disabled={busyId === notifId}
                      onClick={() => handleViewNotifDetails(notifId)}
                      style={{ backgroundColor: '#2980b9', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                    >
                      📄 Details
                    </button>
                    <button
                      disabled={busyId === notifId}
                      onClick={() => handleAcceptNotification(notif)}
                      style={{ backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                    >
                      🩸 Accept & Start Live Chat
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {selectedNotifDetails && (
            <div style={{ backgroundColor: '#ebf5fb', border: '1px solid #aed6f1', padding: '14px', borderRadius: '6px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>📋 Notification Details</strong>
                <button onClick={() => setSelectedNotifDetails(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}>✖</button>
              </div>
              <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap', margin: '8px 0 0 0', color: '#2c3e50' }}>
                {JSON.stringify(selectedNotifDetails, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {(viewFilter === 'all' || viewFilter === 'requester') && (
        <div>
          <h3 style={{ color: '#2980b9', borderLeft: '4px solid #2980b9', paddingLeft: '10px' }}>
            📋 My Blood Requests & Donor Control ({myRequests.length})
          </h3>

          {myRequests.length === 0 ? (
            <p style={{ color: '#666', fontSize: '14px' }}>You have not created any blood requests yet.</p>
          ) : (
            myRequests.map((req) => {
              const reqId = req._id || req.id;
              const donors = matchingDonorsMap[reqId];

              return (
                <div key={reqId} style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '15px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <strong style={{ fontSize: '16px' }}>Patient: {req.patient || req.patientName}</strong> —{' '}
                      <span style={{ color: '#c0392b', fontWeight: 'bold' }}>{req.bloodGroup}</span>
                      <div style={{ color: '#555', fontSize: '14px', marginTop: '4px' }}>
                        Hospital: {req.hospital} ({req.location}) | Status: <strong>{req.status || 'Active'}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        disabled={busyId === reqId}
                        onClick={() => handleLoadDonors(reqId)}
                        style={{ backgroundColor: '#8e44ad', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                      >
                        👥 Matching Donors
                      </button>
                      <button
                        disabled={busyId === reqId}
                        onClick={() => handleNotifyNext(reqId)}
                        style={{ backgroundColor: '#2980b9', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                      >
                        🔔 Notify Next Donor
                      </button>
                      {req.status !== 'Completed' && req.status !== 'Cancelled' && (
                        <>
                          <button
                            disabled={busyId === reqId}
                            onClick={() => handleMarkFulfilled(reqId)}
                            style={{ backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                          >
                            Mark Fulfilled
                          </button>
                          <button
                            disabled={busyId === reqId}
                            onClick={() => handleCancelRequest(reqId)}
                            style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {donors && (
                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f4f6f7', borderRadius: '5px', fontSize: '13px' }}>
                      <strong>Matched Donors ({donors.length}):</strong>
                      {donors.length === 0 ? (
                        <span style={{ color: '#666', marginLeft: '6px' }}>No matching donors found nearby yet.</span>
                      ) : (
                        <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
                          {donors.map((d) => (
                            <li key={d._id || d.id}>
                              {d.name} ({d.bloodGroup}) — {d.location || d.cityCountry || 'Verified'} {(d.contact || d.phone) ? `| 📞 ${d.contact || d.phone}` : ''}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {referrals.length > 0 && (
            <>
              <h3 style={{ color: '#8e44ad', borderLeft: '4px solid #8e44ad', paddingLeft: '10px', marginTop: '20px' }}>
                🤝 Referred Friends ({referrals.length})
              </h3>
              {referrals.map((ref) => (
                <div key={ref.id} style={{ padding: '10px', backgroundColor: '#f4ecf7', borderRadius: '6px', marginBottom: '8px', fontSize: '14px' }}>
                  👤 <strong>{ref.friendName}</strong> ({ref.friendPhone}) — Referred by {ref.referredBy}
                </div>
              ))}
            </>
          )}
        </div>
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

const progBtn = (bg) => ({
  backgroundColor: bg,
  color: 'white',
  border: 'none',
  padding: '7px 11px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '12px'
});

const tabBtn = (active, activeBg) => ({
  backgroundColor: active ? activeBg : '#ecf0f1',
  color: active ? '#fff' : '#2c3e50',
  border: 'none',
  padding: '7px 12px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '12px'
});