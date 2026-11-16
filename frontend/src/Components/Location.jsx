import React, { useState } from 'react';

const PROFILE_API = 'http://localhost:5000/api/auth/profile';

export default function Location({ currentLocation = '', onLocationUpdate }) {
  const [cityInput, setCityInput] = useState(currentLocation);
 
  const [coords, setCoords] = useState({ lat: 23.8103, lng: 90.4125 });
  const [showMap, setShowMap] = useState(true);
  const [detecting, setDetecting] = useState(false);

  const syncLocationToBackend = async (locationPayload) => {
    try {
      await fetch(PROFILE_API, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(locationPayload)
      });
    } catch (err) {
      console.error('Location sync failed:', err);
    }
  };
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = Number(position.coords.latitude.toFixed(5));
        const lng = Number(position.coords.longitude.toFixed(5));
        const gpsLabel = `GPS (${lat}, ${lng})`;

        setCoords({ lat, lng });
        setCityInput(gpsLabel);
        setShowMap(true);
        setDetecting(false);

        await syncLocationToBackend({
          cityCountry: gpsLabel,
          latitude: lat,
          longitude: lng
        });

        if (onLocationUpdate) {
          onLocationUpdate({ cityCountry: gpsLabel, latitude: lat, longitude: lng });
        }
      },
      (err) => {
        setDetecting(false);
        alert('Could not access GPS location: ' + err.message);
      }
    );
  };

  const handleManualSave = async (e) => {
    e.preventDefault();
    if (!cityInput.trim()) return;

    let updatedCoords = coords;

    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityInput)}`
      );
      const geoData = await geoRes.json();

      if (geoData && geoData.length > 0) {
        updatedCoords = {
          lat: Number(parseFloat(geoData[0].lat).toFixed(5)),
          lng: Number(parseFloat(geoData[0].lon).toFixed(5))
        };
        setCoords(updatedCoords);
        setShowMap(true);
      }
    } catch (err) {
      console.error('Geocoding search error:', err);
    }

    await syncLocationToBackend({
      cityCountry: cityInput,
      latitude: updatedCoords.lat,
      longitude: updatedCoords.lng
    });

    if (onLocationUpdate) {
      onLocationUpdate({
        cityCountry: cityInput,
        latitude: updatedCoords.lat,
        longitude: updatedCoords.lng
      });
    }

    alert('📍 Location & Map updated!');
  };

  const bbox = `${coords.lng - 0.015}%2C${coords.lat - 0.015}%2C${coords.lng + 0.015}%2C${coords.lat + 0.015}`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`;

  return (
    <div style={{ backgroundColor: '#fff', padding: '16px 18px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', borderLeft: '5px solid #27ae60' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <strong style={{ color: '#2c3e50', fontSize: '15px' }}>📍 Live Donor Location:</strong>
          <span style={{ marginLeft: '8px', fontSize: '14px', color: '#1e8449', fontWeight: 'bold' }}>
            {cityInput || 'Dhaka, Bangladesh (Default)'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={detecting}
            style={{
              backgroundColor: '#27ae60',
              color: 'white',
              border: 'none',
              padding: '7px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px'
            }}
          >
            {detecting ? 'Detecting...' : '🛰️ Auto-Detect GPS'}
          </button>

          <form onSubmit={handleManualSave} style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              placeholder="Search City / Hospital / Area..."
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: '#2c3e50',
                color: 'white',
                border: 'none',
                padding: '7px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px'
              }}
            >
              Locate & Save
            </button>
          </form>

          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            style={{
              backgroundColor: '#ecf0f1',
              color: '#2c3e50',
              border: '1px solid #bdc3c7',
              padding: '6px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '12px'
            }}
          >
            {showMap ? '▲ Hide Map' : '🗺️ Show Map'}
          </button>
        </div>
      </div>

     
      {showMap && (
        <div style={{ marginTop: '14px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #ddd' }}>
          <iframe
            title="Donor Live Location Map"
            width="100%"
            height="240"
            frameBorder="0"
            scrolling="no"
            src={osmEmbedUrl}
            style={{ display: 'block' }}
          />
          <div style={{ backgroundColor: '#f8f9fa', padding: '6px 12px', fontSize: '12px', color: '#555', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span>
              📌 Coordinates: <strong>{coords.lat}, {coords.lng}</strong>
            </span>
            <a
              href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: '#2980b9', fontWeight: 'bold', textDecoration: 'none' }}
            >
              Open Fullscreen in Google Maps ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}