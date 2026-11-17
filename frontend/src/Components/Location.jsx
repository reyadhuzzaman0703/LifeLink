import React, { useState } from 'react';

export default function Location({ currentLocation, onLocationUpdate }) {
  const [cityCountry, setCityCountry] = useState(currentLocation || 'Dhaka, Bangladesh');
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);

  const saveLocationToBackend = async (payload) => {
    try {
      const token = localStorage.getItem('lifelink_token');
      await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...payload,
          location: payload.cityCountry
        })
      });
    } catch (err) {
      console.error('Failed to save location to backend:', err);
    }
  };

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
          const locPayload = { cityCountry: formatted, latitude, longitude };
          if (onLocationUpdate) onLocationUpdate(locPayload);
          await saveLocationToBackend(locPayload);
        } catch {
          const locPayload = { cityCountry, latitude, longitude };
          if (onLocationUpdate) onLocationUpdate(locPayload);
          await saveLocationToBackend(locPayload);
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
    const locPayload = { cityCountry, ...(coords || {}) };
    if (onLocationUpdate) onLocationUpdate(locPayload);
    await saveLocationToBackend(locPayload);
    alert('📍 Location updated in your profile!');
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h3 style={{ color: '#2c3e50', marginTop: 0 }}>📍 Live Donor & Hospital Location</h3>

      <form onSubmit={handleManualSave} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <input
          type="text"
          value={cityCountry}
          onChange={(e) => setCityCountry(e.target.value)}
          placeholder="City, Country"
          style={{ flex: 1, minWidth: '200px', padding: '9px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px' }}
        />
        <button
          type="submit"
          style={{ backgroundColor: '#2980b9', color: '#fff', border: 'none', padding: '9px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Save Location
        </button>
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={loading}
          style={{ backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '9px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? '📡 Locating...' : '🎯 Use Current GPS'}
        </button>
      </form>

      {coords && (
        <iframe
          title="Live Location Map"
          width="100%"
          height="220"
          style={{ border: 0, borderRadius: '6px' }}
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.longitude - 0.02}%2C${coords.latitude - 0.02}%2C${coords.longitude + 0.02}%2C${coords.latitude + 0.02}&layer=mapnik&marker=${coords.latitude}%2C${coords.longitude}`}
        />
      )}
    </div>
  );
}