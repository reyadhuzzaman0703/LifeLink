import React from 'react';

export default function Certificate() {
  return (
    <div style={{ textAlign: 'center' }}>
      <h2>🎓 Downloadable QR Certificate</h2>
      <div style={{ border: '8px solid #c0392b', padding: '30px', backgroundColor: '#fff', borderRadius: '10px', maxWidth: '600px', margin: '20px auto', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <h1 style={{ color: '#c0392b', marginTop: 0 }}>CERTIFICATE OF APPRECIATION</h1>
        <p style={{ fontSize: '16px' }}>Awarded to <strong>Verified Donor User</strong> for saving lives on LifeLink.</p>
        <div style={{ margin: '20px 0' }}>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=LifeLink-Cert-ID-99214" alt="Certificate QR" />
          <p style={{ fontSize: '12px', color: '#7f8c8d' }}>Certificate ID: LL-2026-99214 (Public Verified)</p>
        </div>
        <button onClick={() => window.print()} style={{ backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
          🖨️ Print / Download PDF
        </button>
      </div>
    </div>
  );
}