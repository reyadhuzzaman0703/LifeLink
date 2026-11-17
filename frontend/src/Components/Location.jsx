import React, { useState } from 'react';

const BLOOD_COMPATIBILITY = {
  'O-': { donateTo: 'All Groups (Universal Donor)', receiveFrom: 'O-' },
  'O+': { donateTo: 'O+, A+, B+, AB+', receiveFrom: 'O+, O-' },
  'A-': { donateTo: 'A+, A-, AB+, AB-', receiveFrom: 'A-, O-' },
  'A+': { donateTo: 'A+, AB+', receiveFrom: 'A+, A-, O+, O-' },
  'B-': { donateTo: 'B+, B-, AB+, AB-', receiveFrom: 'B-, O-' },
  'B+': { donateTo: 'B+, AB+', receiveFrom: 'B+, B-, O+, O-' },
  'AB-': { donateTo: 'AB+, AB-', receiveFrom: 'AB-, A-, B-, O-' },
  'AB+': { donateTo: 'AB+ Only', receiveFrom: 'All Groups (Universal Recipient)' }
};

export default function Location({ currentLocation, onLocationUpdate }) {
  const savedUser = JSON.parse(localStorage.getItem('lifelink_current_user') || '{}');

  const [cityCountry, setCityCountry] = useState(currentLocation || 'Dhaka, Bangladesh');
  const [coords, setCoords] = useState({ latitude: 23.8103, longitude: 90.4125 });
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(savedUser?.bloodGroup || 'O+');

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });

        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const geoData = await geoRes.json();
          const city = geoData.address?.city || geoData.address?.town || geoData.address?.state || 'Dhaka';
          const country = geoData.address?.country || 'Bangladesh';
          const formatted = `${city}, ${country}`;

          setCityCountry(formatted);
          if (onLocationUpdate) onLocationUpdate({ cityCountry: formatted, latitude, longitude });
        } catch {
          if (onLocationUpdate) onLocationUpdate({ cityCountry, latitude, longitude });
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        alert('Unable to access GPS location.');
      }
    );
  };

  const handleManualSave = async (e) => {
    e.preventDefault();
    if (!cityCountry.trim()) return;
    setSearching(true);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(cityCountry)}`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const newCoords = {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };
        setCoords(newCoords);
        if (onLocationUpdate) onLocationUpdate({ cityCountry, ...newCoords });
      } else {
        if (onLocationUpdate) onLocationUpdate({ cityCountry, ...coords });
      }
    } catch {
      if (onLocationUpdate) onLocationUpdate({ cityCountry, ...coords });
    } finally {
      setSearching(false);
    }
  };

  const compatInfo = BLOOD_COMPATIBILITY[selectedGroup] || BLOOD_COMPATIBILITY['O+'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Live Map Card */}
      <div style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', borderTop: '4px solid #e11d48' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ color: '#1e293b', margin: 0, fontSize: '16px' }}>
            📍 Live Donor & Hospital Map
          </h3>
          <span style={{ fontSize: '11px', backgroundColor: '#fff1f2', color: '#e11d48', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
            Live GPS
          </span>
        </div>

        <iframe
          title="Live Location Map"
          width="100%"
          height="320"
          style={{ border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '12px' }}
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.longitude - 0.03}%2C${coords.latitude - 0.03}%2C${coords.longitude + 0.03}%2C${coords.latitude + 0.03}&layer=mapnik&marker=${coords.latitude}%2C${coords.longitude}`}
        />

        <form onSubmit={handleManualSave} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            type="text"
            value={cityCountry}
            onChange={(e) => setCityCountry(e.target.value)}
            placeholder="Enter city (e.g., Mymensingh, Dhaka)"
            style={{ width: '100%', padding: '9px 11px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
          />

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="submit"
              disabled={searching}
              style={{ flex: 1, backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '9px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
            >
              {searching ? '🔍 Finding...' : 'Save Location'}
            </button>
            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={loading}
              style={{ flex: 1, backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '9px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
            >
              {loading ? '📡 Locating...' : '🎯 Use GPS'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Blood Group Compatibility Quick Guide */}
      <div style={{ backgroundColor: '#fff', padding: '16px 18px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', borderLeft: '4px solid #e11d48' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '14px' }}>
          🩸 Blood Compatibility Guide
        </h4>

        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {Object.keys(BLOOD_COMPATIBILITY).map((bg) => (
            <button
              key={bg}
              type="button"
              onClick={() => setSelectedGroup(bg)}
              style={{
                padding: '4px 9px',
                borderRadius: '6px',
                border: selectedGroup === bg ? '1px solid #e11d48' : '1px solid #e2e8f0',
                backgroundColor: selectedGroup === bg ? '#e11d48' : '#f8fafc',
                color: selectedGroup === bg ? '#fff' : '#334155',
                fontWeight: 'bold',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {bg}
            </button>
          ))}
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div>
            <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✅ Can Donate To: </span>
            <span style={{ color: '#334155', fontWeight: '600' }}>{compatInfo.donateTo}</span>
          </div>
          <div>
            <span style={{ color: '#2563eb', fontWeight: 'bold' }}>💉 Can Receive From: </span>
            <span style={{ color: '#334155', fontWeight: '600' }}>{compatInfo.receiveFrom}</span>
          </div>
        </div>
      </div>

      {/* 3. Emergency Helplines */}
      <div style={{ backgroundColor: '#fff', padding: '16px 18px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', borderLeft: '4px solid #0f172a' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '14px' }}>
          🚑 Emergency Blood Helplines
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#475569' }}>
          <div style={helplineRowStyle}>
            <span>🚨 National Emergency</span>
            <strong style={{ color: '#e11d48' }}>999</strong>
          </div>
          <div style={helplineRowStyle}>
            <span>🏥 Red Crescent Blood Bank</span>
            <strong style={{ color: '#0f172a' }}>01811-458537</strong>
          </div>
          <div style={helplineRowStyle}>
            <span>🩸 Quantum Blood Lab</span>
            <strong style={{ color: '#0f172a' }}>01714-010869</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

const helplineRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '6px 10px',
  backgroundColor: '#f8fafc',
  borderRadius: '6px'
};