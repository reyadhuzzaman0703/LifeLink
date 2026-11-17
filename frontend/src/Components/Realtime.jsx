import React, { useState, useEffect, useRef } from 'react';
import Chatbar from './Chatbar';

export default function Realtime({
  currentUser,
  activeChatContext,
  collaborations = [],
  requests = [],
  onSelectChat,
  onConfirmationSuccess
}) {
  const [messages, setMessages] = useState([]);
  const [confirming, setConfirming] = useState(false);
  const messagesEndRef = useRef(null);

  const fallbackChat =
    collaborations[0] ||
    (requests[0]
      ? {
          requestId: requests[0]._id || requests[0].id,
          chatId: requests[0]._id || requests[0].id,
          patient: requests[0].patient || requests[0].patientName,
          bloodGroup: requests[0].bloodGroup,
          hospital: requests[0].hospital
        }
      : null);

  const selectedChat = activeChatContext || fallbackChat;
  const chatId = selectedChat?.chatId || selectedChat?._id || selectedChat?.id;

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }
    let isMounted = true;

    const loadMessages = async () => {
      try {
        const token = localStorage.getItem('lifelink_token');
        const res = await fetch(`/api/chats/${chatId}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};

        if (res.ok && isMounted) {
          const list = Array.isArray(data) ? data : data.messages || data.data || [];
          setMessages(list);
        }
      } catch (err) {
        console.error('Failed to load chat messages:', err);
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleConfirmDonation = async () => {
    if (!chatId) return;
    setConfirming(true);

    try {
      const token = localStorage.getItem('lifelink_token');
      const res = await fetch(`/api/chats/${chatId}/confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          confirmedBy: currentUser?._id || currentUser?.id,
          status: 'Completed'
        })
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.message || data.error || 'Confirmation failed');

      alert('🎉 Donation Confirmed! Opening your Certificate...');
      if (onConfirmationSuccess) onConfirmationSuccess();
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setConfirming(false);
    }
  };

  const chatRooms =
    collaborations.length > 0
      ? collaborations
      : requests.map((r) => ({
          requestId: r._id || r.id,
          chatId: r._id || r.id,
          patient: r.patient || r.patientName,
          bloodGroup: r.bloodGroup,
          hospital: r.hospital
        }));

  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      {chatRooms.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '14px', borderBottom: '1px solid #eee' }}>
          {chatRooms.map((room) => {
            const roomId = room.chatId || room.requestId;
            const isSelected = roomId === chatId;
            return (
              <button
                key={roomId}
                type="button"
                onClick={() => onSelectChat && onSelectChat(room)}
                style={{
                  backgroundColor: isSelected ? '#c0392b' : '#f1f3f5',
                  color: isSelected ? '#fff' : '#2c3e50',
                  border: 'none',
                  padding: '7px 12px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  whiteSpace: 'nowrap'
                }}
              >
                💬 {room.patient} ({room.bloodGroup})
              </button>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '2px solid #eee', paddingBottom: '12px', marginBottom: '15px' }}>
        <div>
          <h3 style={{ color: '#c0392b', margin: 0 }}>
            {selectedChat
              ? `💬 Live Chat — Patient: ${selectedChat.patient} (${selectedChat.bloodGroup})`
              : '💬 Live Coordination Chat'}
          </h3>
          <small style={{ color: '#555' }}>
            {selectedChat ? `🏥 ${selectedChat.hospital}` : 'Accept a blood request in Feed to start coordination'}
          </small>
        </div>

        {selectedChat && (
          <button
            onClick={handleConfirmDonation}
            disabled={confirming}
            style={{
              backgroundColor: '#27ae60',
              color: '#fff',
              border: 'none',
              padding: '9px 14px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px'
            }}
          >
            {confirming ? '⏳ Confirming...' : '✅ Confirm Donation Completed'}
          </button>
        )}
      </div>

      <div style={{ height: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '6px', padding: '12px', backgroundColor: '#f9f9f9', marginBottom: '12px' }}>
        {messages.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', marginTop: '110px', fontSize: '14px' }}>
            {selectedChat
              ? 'No messages yet. Use the chatbar below to coordinate!'
              : 'No active blood request selected yet.'}
          </p>
        ) : (
          messages.map((msg, idx) => {
            const senderId = msg.sender?._id || msg.sender?.id || msg.sender;
            const myId = currentUser?._id || currentUser?.id;
            const isMine = senderId === myId || msg.senderName === currentUser?.name;
            const senderLabel = msg.sender?.name || msg.senderName || (isMine ? 'You' : 'Coordinator');
            const bodyText = msg.text || msg.message || msg.content;

            return (
              <div key={msg._id || msg.id || idx} style={{ textAlign: isMine ? 'right' : 'left', marginBottom: '10px' }}>
                <div
                  style={{
                    display: 'inline-block',
                    backgroundColor: isMine ? '#c0392b' : '#e9ecef',
                    color: isMine ? '#fff' : '#2c3e50',
                    padding: '8px 13px',
                    borderRadius: '10px',
                    maxWidth: '75%',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontSize: '11px', opacity: 0.85, fontWeight: 'bold', marginBottom: '2px' }}>
                    {senderLabel}
                  </div>
                  <div style={{ fontSize: '14px' }}>{bodyText}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <Chatbar
        chatId={chatId}
        currentUser={currentUser}
        disabled={!selectedChat}
        onMessageSent={(newMsg) => setMessages((prev) => [...prev, newMsg])}
      />
    </div>
  );
}