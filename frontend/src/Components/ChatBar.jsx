import React, { useState } from 'react';

export default function Chatbar({ chatId, currentUser, onMessageSent, disabled = false }) {
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const quickReplies = [
    '🚗 On the way to hospital',
    '🏥 Reached hospital gate',
    '🩸 Ready for cross-matching'
  ];

  const sendMessageToApi = async (messageText) => {
    if (!messageText.trim() || !chatId || sending) return;
    setSending(true);

    try {
      const token = localStorage.getItem('lifelink_token');
      const res = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          text: messageText.trim(),
          message: messageText.trim(),
          content: messageText.trim()
        })
      });

      const rawText = await res.text();
      const data = rawText ? JSON.parse(rawText) : {};

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to send message');
      }

      const newMsg = data.message || data.data || {
        _id: Date.now(),
        sender: {
          _id: currentUser?._id || currentUser?.id,
          name: currentUser?.name || 'You'
        },
        text: messageText.trim(),
        createdAt: new Date().toISOString()
      };

      if (onMessageSent) onMessageSent(newMsg);
      setInputText('');
    } catch (err) {
      alert(`❌ Message send failed: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessageToApi(inputText);
  };

  return (
    <div style={{ borderTop: '1px solid #eee', paddingTop: '10px' }}>
      {!disabled && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {quickReplies.map((qr) => (
            <button
              key={qr}
              type="button"
              disabled={sending}
              onClick={() => sendMessageToApi(qr)}
              style={{
                backgroundColor: '#f1f3f5',
                color: '#2c3e50',
                border: '1px solid #dcdde1',
                padding: '4px 10px',
                borderRadius: '14px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {qr}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={disabled || sending}
          placeholder={disabled ? 'Select or accept a blood request first...' : 'Type your message here...'}
          style={{
            flex: 1,
            padding: '11px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '14px',
            backgroundColor: disabled ? '#f1f3f5' : '#fff'
          }}
        />
        <button
          type="submit"
          disabled={disabled || sending || !inputText.trim()}
          style={{
            backgroundColor: disabled ? '#95a5a6' : '#2980b9',
            color: '#fff',
            border: 'none',
            padding: '11px 20px',
            borderRadius: '6px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          {sending ? 'Sending...' : 'Send ➤'}
        </button>
      </form>
    </div>
  );
}