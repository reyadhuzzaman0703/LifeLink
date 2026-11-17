import React, { useState } from 'react';

export default function Chatbar({ onMessageSent, onShareLocation, disabled = false }) {
  const [inputText, setInputText] = useState('');

  const quickReplies = [
    '🚗 On the way to hospital',
    '🏥 Reached hospital gate',
    '🩸 Ready for cross-matching'
  ];

  const handleSend = (textToSend) => {
    if (!textToSend.trim() || disabled) return;
    if (onMessageSent) onMessageSent(textToSend.trim());
    setInputText('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend(inputText);
  };

  return (
    <div style={{ borderTop: '1px solid #eee', paddingTop: '10px' }}>
      {!disabled && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {quickReplies.map((qr) => (
            <button
              key={qr}
              type="button"
              onClick={() => handleSend(qr)}
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
          {onShareLocation && (
            <button
              type="button"
              onClick={onShareLocation}
              style={{
                backgroundColor: '#eafaf1',
                color: '#1e8449',
                border: '1px solid #a9dfbf',
                padding: '4px 10px',
                borderRadius: '14px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              📍 Share Live GPS
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={disabled}
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
          disabled={disabled || !inputText.trim()}
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
          Send ➤
        </button>
      </form>
    </div>
  );
}