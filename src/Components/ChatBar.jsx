import React, { useState } from 'react';

export default function ChatBar({ onSendMessage, onShareLocation }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        marginTop: '12px',
        backgroundColor: '#f1f3f5',
        padding: '10px',
        borderRadius: '6px'
      }}
    >
      <button
        type="button"
        onClick={onShareLocation}
        style={{
          backgroundColor: '#2980b9',
          color: 'white',
          border: 'none',
          padding: '10px 14px',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold',
          whiteSpace: 'nowrap'
        }}
      >
        📍 Location
      </button>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Coordinate arrival time, gate number, or blood bank details..."
        style={{
          flex: 1,
          padding: '10px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          fontSize: '14px'
        }}
      />

      <button
        type="submit"
        style={{
          backgroundColor: '#27ae60',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Send ➤
      </button>
    </form>
  );
}