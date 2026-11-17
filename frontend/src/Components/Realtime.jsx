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
  const [allMessages, setAllMessages] = useState(() => {
    const saved = localStorage.getItem('lifelink_chat_messages');
    return saved ? JSON.parse(saved) : {};
  });

  const messagesEndRef = useRef(null);

  const fallbackChat =
    collaborations[0] ||
    (requests[0]
      ? {
          requestId: requests[0].id,
          chatId: `chat_${requests[0].id}`,
          patient: requests[0].patient,
          bloodGroup: requests[0].bloodGroup,
          hospital: requests[0].hospital
        }
      : null);

  const selectedChat = activeChatContext || fallbackChat;
  const chatId = selectedChat?.chatId || (selectedChat?.requestId ? `chat_${selectedChat.requestId}` : null);
  const currentRoomMessages = chatId ? allMessages[chatId] || [] : [];

  useEffect(() => {
    localStorage.setItem('lifelink_chat_messages', JSON.stringify(allMessages));
  }, [allMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentRoomMessages.length]);

  const handleSendMessage = (text) => {
    if (!chatId) return;
    const newMsg = {
      id: Date.now(),
      senderEmail: currentUser?.email,
      senderName: currentUser?.name || 'Donor',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAllMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMsg]
    }));
  };

  const handleShareLocation = () => {
    if (!chatId) return;
    if (!navigator.geolocation) {
      handleSendMessage(`📍 Current Location: ${currentUser?.cityCountry || 'On the way to hospital'}`);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const mapLink = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
        handleSendMessage(`📍 My Live Location: ${mapLink}`);
      },
      () => {
        handleSendMessage(`📍 Current Location: ${currentUser?.cityCountry || 'On the way to hospital'}`);
      }
    );
  };

  const handleConfirmDonation = () => {
    alert('🎉 Donation Confirmed! Opening your Certificate...');
    if (onConfirmationSuccess) {
      onConfirmationSuccess(selectedChat?.requestId);
    }
  };

  const chatRooms =
    collaborations.length > 0
      ? collaborations
      : requests.map((r) => ({
          requestId: r.id,
          chatId: `chat_${r.id}`,
          patient: r.patient,
          bloodGroup: r.bloodGroup,
          hospital: r.hospital
        }));

  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      {chatRooms.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '14px', borderBottom: '1px solid #eee' }}>
          {chatRooms.map((room) => {
            const roomId = room.chatId || `chat_${room.requestId}`;
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
            ✅ Confirm Donation Completed
          </button>
        )}
      </div>

      <div style={{ height: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '6px', padding: '12px', backgroundColor: '#f9f9f9', marginBottom: '12px' }}>
        {currentRoomMessages.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', marginTop: '110px', fontSize: '14px' }}>
            {selectedChat
              ? 'No messages yet. Use the chatbar below to coordinate!'
              : 'No active blood request selected yet.'}
          </p>
        ) : (
          currentRoomMessages.map((msg) => {
            const isMine = msg.senderEmail === currentUser?.email;
            return (
              <div key={msg.id} style={{ textAlign: isMine ? 'right' : 'left', marginBottom: '10px' }}>
                <div
                  style={{
                    display: 'inline-block',
                    backgroundColor: isMine ? '#c0392b' : '#e9ecef',
                    color: isMine ? '#fff' : '#2c3e50',
                    padding: '8px 13px',
                    borderRadius: '10px',
                    maxWidth: '75%',
                    textAlign: 'left',
                    wordBreak: 'break-word'
                  }}
                >
                  <div style={{ fontSize: '11px', opacity: 0.85, fontWeight: 'bold', marginBottom: '2px' }}>
                    {isMine ? 'You' : msg.senderName} • {msg.time}
                  </div>
                  <div style={{ fontSize: '14px' }}>{msg.text}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <Chatbar
        disabled={!selectedChat}
        onMessageSent={handleSendMessage}
        onShareLocation={handleShareLocation}
      />
    </div>
  );
}