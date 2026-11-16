import React, { useState, useEffect, useRef } from 'react';
import ChatBar from './ChatBar';

export default function Realtime({ currentUser, activeChatContext }) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const generateGlobalReply = (userText) => {
    const text = userText.toLowerCase();
    if (text.includes('location') || text.includes('where') || text.includes('map') || text.includes('hospital')) {
      return `We are waiting near ${activeChatContext?.hospital || 'the hospital blood bank'}. Please share your live GPS location.`;
    }
    if (text.includes('blood') || text.includes('bag') || text.includes('time') || text.includes('coming')) {
      return `Thank you so much for helping ${activeChatContext?.patient || 'the patient'}! Let us know when you arrive.`;
    }
    return 'Received! Stay safe and message here if you need any directions.';
  };

  const handleSendMessage = (text) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [
      ...prev,
      { sender: currentUser?.name || 'You', isMe: true, text, time: now }
    ]);
    setIsTyping(true);

    setTimeout(() => {
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          sender: activeChatContext ? `${activeChatContext.patient}'s Coordinator` : 'Coordinator',
          isMe: false,
          text: generateGlobalReply(text),
          time: replyTime
        }
      ]);
      setIsTyping(false);
    }, 1200);
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setMessages((prev) => [
          ...prev,
          { sender: currentUser?.name || 'You', isMe: true, text: '📍 Shared Live GPS Location:', link: mapLink, time: now }
        ]);
      },
      () => {
        alert('Please allow location access in your browser.');
      }
    );
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        <h3 style={{ color: '#27ae60', margin: 0 }}>
          💬 Donor-Patient Live Coordination Chat
        </h3>
        {activeChatContext && (
          <span style={{ backgroundColor: '#fdecea', color: '#c0392b', padding: '5px 10px', borderRadius: '5px', fontSize: '13px', fontWeight: 'bold' }}>
            🏥 Patient: {activeChatContext.patient} ({activeChatContext.bloodGroup}) • {activeChatContext.hospital}
          </span>
        )}
      </div>

      <div style={{ height: '260px', overflowY: 'auto', border: '1px solid #ddd', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', marginTop: '90px' }}>
            {activeChatContext
              ? `Connected for ${activeChatContext.patient} at ${activeChatContext.hospital}. Send a message or share your live GPS location.`
              : 'No active chat session selected. Click "I Will Donate" on any request to collaborate directly.'}
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} style={{ textAlign: msg.isMe ? 'right' : 'left', marginBottom: '12px' }}>
              <small style={{ color: '#7f8c8d', display: 'block', marginBottom: '2px' }}>
                {msg.sender} • {msg.time}
              </small>
              <span
                style={{
                  display: 'inline-block',
                  padding: '9px 14px',
                  borderRadius: '14px',
                  backgroundColor: msg.isMe ? '#27ae60' : '#2980b9',
                  color: 'white',
                  maxWidth: '75%',
                  textAlign: 'left'
                }}
              >
                {msg.text}
                {msg.link && (
                  <div style={{ marginTop: '5px' }}>
                    <a href={msg.link} target="_blank" rel="noreferrer" style={{ color: '#f1c40f', fontWeight: 'bold', textDecoration: 'underline' }}>
                      Open in Maps ↗
                    </a>
                  </div>
                )}
              </span>
            </div>
          ))
        )}

        {isTyping && (
          <div style={{ textAlign: 'left', color: '#7f8c8d', fontStyle: 'italic', fontSize: '13px' }}>
            Typing...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <ChatBar onSendMessage={handleSendMessage} onShareLocation={handleShareLocation} />
    </div>
  );
}