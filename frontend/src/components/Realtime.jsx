import React, { useState } from 'react';

export default function Realtime() {
  const [messages, setMessages] = useState([
    { sender: 'Requester', type: 'text', text: 'Apni ki Dhaka Medical-e ashte parben?' },
    { sender: 'You', type: 'text', text: 'Haan, ami 15 minute-er bhetor pouchacchi.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loadingLoc, setLoadingLoc] = useState(false);

  // সাধারণ টেক্সট মেসেজ পাঠানোর ফাংশন
  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setMessages([...messages, { sender: 'You', type: 'text', text: inputText }]);
    setInputText('');
  };

  // বর্তমান লোকেশন পাঠানোর ফাংশন (HTML5 Geolocation API)
  const sendMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Apnar browser-e Geolocation support korche na!');
      return;
    }

    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        
        setMessages((prev) => [
          ...prev,
          {
            sender: 'You',
            type: 'location',
            text: '📍 My Current Location',
            mapUrl,
            coords: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          }
        ]);
        setLoadingLoc(false);
      },
      (error) => {
        alert('Location access dewa hoyni! Browser settings theke Location allow korun.');
        setLoadingLoc(false);
      }
    );
  };

  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0, color: '#27ae60' }}>💬 Socket.IO Secure Private Chat (Privacy Protection Active)</h3>
      
      {/* মেসেজ দেখানোর বক্স */}
      <div style={{ height: '240px', overflowY: 'auto', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '6px', marginBottom: '10px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: '10px', textAlign: msg.sender === 'You' ? 'right' : 'left' }}>
            <span style={{ fontSize: '12px', color: '#7f8c8d', display: 'block' }}>{msg.sender}</span>
            
            {msg.type === 'location' ? (
              <div style={{ backgroundColor: '#2980b9', color: 'white', padding: '8px 12px', borderRadius: '12px', display: 'inline-block', textAlign: 'left' }}>
                <strong>{msg.text}</strong>
                <div style={{ fontSize: '11px', opacity: 0.9 }}>Lat/Lng: {msg.coords}</div>
                <a 
                  href={msg.mapUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ color: '#ffeaa7', fontSize: '12px', fontWeight: 'bold', display: 'block', marginTop: '4px', textDecoration: 'underline' }}
                >
                  🗺️ Open in Google Maps
                </a>
              </div>
            ) : (
              <span style={{ backgroundColor: msg.sender === 'You' ? '#27ae60' : '#e74c3c', color: 'white', padding: '6px 12px', borderRadius: '12px', display: 'inline-block' }}>
                {msg.text}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* মেসেজ ইনপুট এবং লোকেশন বাটন */}
      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '8px' }}>
        <button 
          type="button" 
          onClick={sendMyLocation} 
          disabled={loadingLoc}
          title="Send My Current Location"
          style={{ backgroundColor: '#2980b9', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loadingLoc ? '⏳...' : '📍 Location'}
        </button>

        <input 
          type="text" 
          value={inputText} 
          onChange={(e) => setInputText(e.target.value)} 
          placeholder="Write message..." 
          style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} 
        />
        
        <button type="submit" style={{ backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Send
        </button>
      </form>
    </div>
  );
}