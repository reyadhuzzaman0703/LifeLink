import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Location({ currentLocation, onLocationUpdate }) {
  const [cityCountry, setCityCountry] = useState(currentLocation || 'Dhaka, Bangladesh');
  const [coords, setCoords] = useState({ latitude: 23.8103, longitude: 90.4125 });
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Esc চাপলে ফুল-স্ক্রিন ম্যাপ বন্ধ হবে
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

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
          const city =
            geoData.address?.city ||
            geoData.address?.town ||
            geoData.address?.state ||
            'Dhaka';
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
          longitude: parseFloat(data[0].lon),
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

  const getMapUrl = (zoomDelta = 0.03) =>
    `https://www.openstreetmap.org/export/embed.html?bbox=${coords.longitude - zoomDelta}%2C${coords.latitude - zoomDelta}%2C${coords.longitude + zoomDelta}%2C${coords.latitude + zoomDelta}&layer=mapnik&marker=${coords.latitude}%2C${coords.longitude}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* 1. Live Donor & Hospital Map Card */}
      <div
        style={{
          backgroundColor: '#131C2A',
          padding: '14px',
          borderRadius: '16px',
          border: '1px solid #263348',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
            gap: '8px',
          }}
        >
          <h3 style={{ color: '#FFFFFF', margin: 0, fontSize: '14.5px', fontWeight: 700 }}>
            📍 Live Donor & Hospital Map
          </h3>

          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            style={{
              fontSize: '11px',
              backgroundColor: '#E11D48',
              color: '#FFFFFF',
              border: 'none',
              padding: '4px 10px',
              borderRadius: '999px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 10px rgba(225, 29, 72, 0.45)',
            }}
          >
            ⛶ Full Screen
          </button>
        </div>

        {/* Clickable Map Preview */}
        <div
          onClick={() => setIsFullscreen(true)}
          title="Click to open Full Screen Map"
          style={{
            position: 'relative',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid #2D3B52',
            marginBottom: '10px',
            cursor: 'pointer',
          }}
        >
          <iframe
            key={`mini-map-${coords.latitude}-${coords.longitude}`}
            title="Live Location Map"
            width="100%"
            height="220"
            style={{ border: 'none', display: 'block', pointerEvents: 'none' }}
            src={getMapUrl(0.03)}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              backgroundColor: 'rgba(11, 17, 26, 0.88)',
              color: '#F8FAFC',
              border: '1px solid rgba(244, 63, 94, 0.5)',
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '999px',
            }}
          >
            ⛶ Tap for Full Screen
          </div>
        </div>

        <form
          onSubmit={handleManualSave}
          style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
        >
          <input
            type="text"
            value={cityCountry}
            onChange={(e) => setCityCountry(e.target.value)}
            placeholder="Enter city (e.g., Mymensingh, Dhaka)"
            style={{
              width: '100%',
              padding: '8px 11px',
              borderRadius: '8px',
              border: '1px solid #2D3B52',
              backgroundColor: '#0B111A',
              color: '#F1F5F9',
              fontSize: '12.5px',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="submit"
              disabled={searching}
              style={{
                flex: 1,
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                padding: '8px 10px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '12px',
              }}
            >
              {searching ? '🔍 Finding...' : 'Save Location'}
            </button>
            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={loading}
              style={{
                flex: 1,
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                border: 'none',
                padding: '8px 10px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '12px',
              }}
            >
              {loading ? '📡 Locating...' : '🎯 Use GPS'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Emergency Helplines */}
      <div
        style={{
          backgroundColor: '#131C2A',
          padding: '14px 16px',
          borderRadius: '16px',
          border: '1px solid #1E293B',
        }}
      >
        <h4 style={{ margin: '0 0 10px 0', color: '#FFFFFF', fontSize: '13.5px', fontWeight: 700 }}>
          🚑 Emergency Blood Helplines
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '12px', color: '#CBD5E1' }}>
          <div style={helplineRowStyle}>
            <span>🚨 National Emergency</span>
            <strong style={{ color: '#FB7185' }}>999</strong>
          </div>
          <div style={helplineRowStyle}>
            <span>🏥 Red Crescent Blood Bank</span>
            <strong style={{ color: '#F8FAFC' }}>01811-458537</strong>
          </div>
          <div style={helplineRowStyle}>
            <span>🩸 Quantum Blood Lab</span>
            <strong style={{ color: '#F8FAFC' }}>01714-010869</strong>
          </div>
        </div>
      </div>

      {/* 3. Full-Screen Map Modal (100% Full Viewport Width & Height) */}
      {isFullscreen &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999999,
              backgroundColor: '#070B12',
              display: 'flex',
              flexDirection: 'column',
              width: '100vw',
              height: '100vh',
              overflow: 'hidden',
            }}
          >
            {/* Fullscreen Top Control Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '12px 20px',
                backgroundColor: '#0F1724',
                borderBottom: '1px solid #1E293B',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>🗺️</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: '16px', color: '#FFFFFF' }}>
                    Live GPS Donor & Hospital Map — {cityCountry}
                  </h2>
                  <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>
                    Drag, zoom & explore nearby hospitals (Press Esc to exit)
                  </span>
                </div>
              </div>

              {/* Search & GPS controls inside Full Screen */}
              <form
                onSubmit={handleManualSave}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}
              >
                <input
                  type="text"
                  value={cityCountry}
                  onChange={(e) => setCityCountry(e.target.value)}
                  placeholder="Search city or hospital area..."
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    backgroundColor: '#131C2A',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    minWidth: '210px',
                  }}
                />
                <button
                  type="submit"
                  disabled={searching}
                  style={{
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {searching ? 'Finding...' : 'Search'}
                </button>
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={loading}
                  style={{
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {loading ? 'Locating...' : '🎯 My GPS'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  style={{
                    backgroundColor: '#E11D48',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '999px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginLeft: '6px',
                  }}
                >
                  ✖ Close Full Screen
                </button>
              </form>
            </div>

            {/* 100% Full Screen Map Container */}
            <div style={{ flex: 1, width: '100%', height: '100%', position: 'relative' }}>
              <iframe
                key={`fullscreen-map-${coords.latitude}-${coords.longitude}`}
                title="Full Screen GPS Map"
                width="100%"
                height="100%"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  display: 'block',
                }}
                src={getMapUrl(0.04)}
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

const helplineRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '6px 10px',
  backgroundColor: '#0B111A',
  borderRadius: '8px',
};