import React from 'react';

export default function Certificate({ user }) {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const certId = `LL-${String(user?._id || user?.id || '2026').slice(-6).toUpperCase()}`;

  return (
    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ color: '#c0392b', margin: 0 }}>🏆 Blood Donation Certificate</h2>
        <button
          onClick={() => window.print()}
          style={{
            backgroundColor: '#2c3e50',
            color: '#fff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '13px'
          }}
        >
          🖨️ Print / Save as PDF
        </button>
      </div>

      <div
        style={{
          border: '10px double #c0392b',
          borderRadius: '10px',
          padding: '36px 24px',
          textAlign: 'center',
          backgroundColor: '#fffdf9',
          position: 'relative'
        }}
      >
        <div style={{ fontSize: '42px', marginBottom: '8px' }}>🩸</div>
        <h1 style={{ color: '#c0392b', margin: '0 0 6px 0', letterSpacing: '2px', fontSize: '28px', textTransform: 'uppercase' }}>
          Certificate of Appreciation
        </h1>
        <p style={{ color: '#7f8c8d', fontSize: '14px', margin: '0 0 24px 0', letterSpacing: '1px' }}>
          LIFELINK EMERGENCY BLOOD DONATION NETWORK
        </p>

        <p style={{ fontSize: '16px', color: '#333', margin: '0 0 10px 0' }}>
          This certificate is proudly presented to
        </p>

        <h2
          style={{
            fontSize: '30px',
            color: '#2c3e50',
            margin: '8px auto 14px auto',
            borderBottom: '2px solid #c0392b',
            display: 'inline-block',
            padding: '0 24px 6px 24px'
          }}
        >
          {user?.name || 'Valued Blood Donor'}
        </h2>

        <p style={{ fontSize: '15px', color: '#444', maxWidth: '620px', margin: '10px auto 22px auto', lineHeight: '1.6' }}>
          In grateful recognition of your selfless, life-saving voluntary blood donation (Blood Group:{' '}
          <strong style={{ color: '#c0392b' }}>{user?.bloodGroup || 'O+'}</strong>). Your generosity and quick response help save human lives in critical emergencies.
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            marginTop: '32px',
            paddingTop: '18px',
            borderTop: '1px solid #eee',
            fontSize: '13px',
            color: '#555'
          }}
        >
          <div>
            <strong>Date Issued</strong>
            <div>{today}</div>
          </div>

          <div>
            <strong>Certificate ID</strong>
            <div>{certId}</div>
          </div>

          <div>
            <strong>Verified By</strong>
            <div style={{ color: '#c0392b', fontWeight: 'bold' }}>LifeLink Coordination Team</div>
          </div>
        </div>
      </div>
    </div>
  );
}
