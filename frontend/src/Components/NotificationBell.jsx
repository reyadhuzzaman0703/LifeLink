import React, { useState, useEffect, useRef } from 'react';

export default function NotificationBell({
  notifications = [],
  bloodRequests = [],
  currentUser,
  onAcceptDonate,
  onRefreshNotifications
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    const saved = localStorage.getItem('lifelink_read_notifs');
    return saved ? JSON.parse(saved) : [];
  });
  const [startingId, setStartingId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const backendNotifItems = notifications.map((n) => {
    const req = n.bloodRequest || n.request || n;
    return {
      id: n._id || n.id,
      notificationId: n._id || n.id,
      requestId: req._id || req.id || n._id || n.id,
      type: 'DIRECT_ALERT',
      title: `🚨 Direct Donor Alert (${req.bloodGroup || currentUser?.bloodGroup})`,
      message: `Patient ${req.patient || req.patientName || 'Emergency'} needs blood at ${req.hospital || 'Hospital'} (${req.location || ''})`,
      rawReq: req,
      createdAt: n.createdAt
    };
  });

  const matchingFeedItems = bloodRequests
    .filter(
      (r) =>
        (r.status || 'Active') === 'Active' &&
        r.bloodGroup === currentUser?.bloodGroup &&
        !backendNotifItems.some((b) => b.requestId === (r._id || r.id))
    )
    .map((r) => ({
      id: `feed-${r._id || r.id}`,
      notificationId: r._id || r.id,
      requestId: r._id || r.id,
      type: 'BLOOD_MATCH',
      title: `🩸 Matching Blood Group (${r.bloodGroup})`,
      message: `Patient ${r.patient || r.patientName} at ${r.hospital} (${r.location})`,
      rawReq: r,
      createdAt: r.createdAt
    }));

  const allAlerts = [...backendNotifItems, ...matchingFeedItems];
  const unreadCount = allAlerts.filter((item) => !readIds.includes(item.id)).length;

  const markAsRead = (id) => {
    if (readIds.includes(id)) return;
    const updated = [...readIds, id];
    setReadIds(updated);
    localStorage.setItem('lifelink_read_notifs', JSON.stringify(updated));
  };

  const handleMarkAllRead = () => {
    const allIds = allAlerts.map((item) => item.id);
    const merged = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(merged);
    localStorage.setItem('lifelink_read_notifs', JSON.stringify(merged));
  };

  const handleAcceptFromBell = async (alertItem) => {
    markAsRead(alertItem.id);
    setStartingId(alertItem.id);

    try {
      const token = localStorage.getItem('lifelink_token');
      const res = await fetch(`/api/chats/notification/${alertItem.notificationId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Could not start chat');
      }

      const chatObj = data.chat || data.data || data;
      const realChatId = chatObj._id || chatObj.id || alertItem.notificationId;

      setIsOpen(false);
      if (onAcceptDonate) {
        onAcceptDonate({
          ...alertItem.rawReq,
          id: alertItem.requestId,
          notificationId: alertItem.notificationId,
          chatId: realChatId
        });
      }
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setStartingId(null);
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen && onRefreshNotifications) onRefreshNotifications();
        }}
        style={{
          backgroundColor: '#962d22',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.25)',
          padding: '7px 11px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '14px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              backgroundColor: '#f1c40f',
              color: '#2c3e50',
              borderRadius: '50%',
              padding: '1px 6px',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '42px',
            width: '340px',
            maxWidth: '90vw',
            backgroundColor: '#fff',
            color: '#2c3e50',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            zIndex: 1000,
            overflow: 'hidden',
            border: '1px solid #ddd'
          }}
        >
          <div
            style={{
              backgroundColor: '#2c3e50',
              color: '#fff',
              padding: '10px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <strong style={{ fontSize: '14px' }}>🔔 Notifications ({unreadCount} unread)</strong>
            {allAlerts.length > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.4)',
                  color: '#fff',
                  fontSize: '11px',
                  padding: '3px 7px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {allAlerts.length === 0 ? (
              <p style={{ padding: '24px 16px', textAlign: 'center', color: '#777', fontSize: '13px', margin: 0 }}>
                No new blood notifications right now.
              </p>
            ) : (
              allAlerts.map((item) => {
                const isUnread = !readIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => markAsRead(item.id)}
                    style={{
                      padding: '12px 14px',
                      borderBottom: '1px solid #eee',
                      backgroundColor: isUnread ? '#fef9e7' : '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '13px', color: '#c0392b' }}>{item.title}</strong>
                      {isUnread && (
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#e74c3c' }} />
                      )}
                    </div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#444', lineHeight: '1.4' }}>
                      {item.message}
                    </p>
                    <button
                      type="button"
                      disabled={startingId === item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcceptFromBell(item);
                      }}
                      style={{
                        backgroundColor: '#27ae60',
                        color: '#fff',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      {startingId === item.id ? '⏳ Starting...' : '🩸 Accept & Start Chat'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
