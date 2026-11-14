import React, { useState, useEffect } from 'react';

export default function LocationMatch({ isASAP }) {
  const [radius, setRadius] = useState(2);
  const [donorFound, setDonorFound] = useState(false);

  useEffect(() => {
    if (!isASAP || donorFound) return;
    const interval = setInterval(() => {
      setRadius((prev) => {
        if (prev >= 15) {
          clearInterval(interval);
          return 15;
        }
        return prev + 3;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [isASAP, donorFound]);

  return (
    <div style={{ backgroundColor: '#ebf5fb', border: '1px solid #aed6f1', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
      <p style={{ margin: 0, color: '#2980b9', fontWeight: 'bold' }}>
        📍 Intelligent Radius Search Engine (MongoDB 2dsphere Simulation)
      </p>
      <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
        Active Expansion Radius: <strong>{radius} km</strong> | Matching nearby eligible donors...
      </p>
      <button onClick={() => setDonorFound(true)} style={{ marginTop: '8px', backgroundColor: '#3498db', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
        {donorFound ? '✅ Donor Responded' : 'Simulate Donor Response'}
      </button>
    </div>
  );
}