import React from 'react';

export default function Certificate({ user }) {
  const certId = `LL-${String(user?.id || '2026').slice(-6).toUpperCase()}`;
  const donationCount = user?.donationCount || 0;
  const issueDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div style={{ width: '100%', padding: '10px 0 30px 0' }}>
      {/* Print-specific A4 Landscape setup */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm;
          }
          body {
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .a4-landscape-sheet {
            box-shadow: none !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: 192mm !important;
            padding: 36px 48px !important;
          }
        }
      `}</style>

      {/* Top Action Bar (Aligned to A4 Landscape Width) */}
      <div
        className="no-print"
        style={{
          maxWidth: '1123px',
          margin: '0 auto 16px auto',
          backgroundColor: '#fff',
          padding: '14px 22px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div>
          <h2 style={{ color: '#8b0000', margin: 0, fontSize: '18px' }}>
            🏆 Official Blood Donation Certificate
          </h2>
          <small style={{ color: '#64748b' }}>Standard A4 Landscape Format (297mm × 210mm)</small>
        </div>

        <button
          onClick={() => window.print()}
          style={{
            background: 'linear-gradient(90deg, #8b0000, #b8860b)',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '13px',
            boxShadow: '0 3px 10px rgba(139, 0, 0, 0.25)'
          }}
        >
          🖨️ Print / Save A4 Landscape PDF
        </button>
      </div>

      {/* Horizontal Scroll Wrapper for Smaller Screens */}
      <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '8px' }}>
        {/* Centered A4 Landscape Sheet (1123px x 794px) */}
        <div
          className="a4-landscape-sheet"
          style={{
            width: '100%',
            maxWidth: '1123px',
            minWidth: '820px',
            minHeight: '794px',
            margin: '0 auto',
            background: 'linear-gradient(145deg, #fdfbf5 0%, #f8efd4 50%, #fdfbf5 100%)',
            border: '12px double #b8860b',
            outline: '3px solid #8b0000',
            outlineOffset: '-18px',
            borderRadius: '4px',
            padding: '44px 56px',
            position: 'relative',
            fontFamily: "Georgia, 'Times New Roman', serif",
            color: '#2c221e',
            boxShadow: '0 14px 38px rgba(0, 0, 0, 0.16)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box'
          }}
        >
          {/* Top Header */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-block',
                padding: '6px 20px',
                borderRadius: '20px',
                backgroundColor: '#8b0000',
                color: '#f9e79f',
                fontSize: '12px',
                fontWeight: 'bold',
                letterSpacing: '2px',
                fontFamily: 'Arial, sans-serif',
                marginBottom: '12px'
              }}
            >
              🩸 LIFELINK HUMANITARIAN AWARD
            </div>

            <h1
              style={{
                color: '#8b0000',
                margin: '4px 0',
                fontSize: '36px',
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                textShadow: '1px 1px 0px rgba(184, 134, 11, 0.35)'
              }}
            >
              Certificate of Honor
            </h1>

            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: '12px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: '#7a5230',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'bold'
              }}
            >
              Voluntary Blood Donation Recognition
            </p>

            <div
              style={{
                width: '220px',
                height: '3px',
                background: 'linear-gradient(90deg, transparent, #b8860b, transparent)',
                margin: '14px auto 0 auto'
              }}
            />
          </div>

          {/* Middle Section: Left-Aligned Main Content */}
          <div
            style={{
              marginLeft: '0',
              paddingLeft: '24px',
              borderLeft: '4px solid #b8860b',
              textAlign: 'left',
              marginTop: '20px',
              marginBottom: '20px'
            }}
          >
            <p style={{ fontSize: '15px', fontStyle: 'italic', color: '#6e471b', margin: '0 0 6px 0' }}>
              This Certificate is Proudly Awarded To
            </p>

            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '14px' }}>
              <h2
                style={{
                  fontSize: '34px',
                  color: '#1f1612',
                  margin: 0,
                  borderBottom: '2px solid #8b0000',
                  paddingBottom: '6px',
                  display: 'inline-block',
                  minWidth: '280px'
                }}
              >
                {user?.name || 'Valued Blood Donor'}
              </h2>

              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: '#8b0000',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: '5px',
                  fontSize: '14px',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: 'bold',
                  border: '1px solid #b8860b'
                }}
              >
                🏅 Total Blood Donated: {donationCount} {donationCount === 1 ? 'Time' : 'Times'} • Blood Group ({user?.bloodGroup || 'O+'})
              </span>
            </div>

            <p style={{ fontSize: '16px', color: '#3b2f2a', lineHeight: '1.75', margin: '0 0 18px 0', maxWidth: '920px' }}>
              In sincere recognition and deep appreciation of your noble contribution to humanity by voluntarily donating blood{' '}
              <strong style={{ color: '#8b0000' }}>
                {donationCount} {donationCount === 1 ? 'Time' : 'Times'}
              </strong>{' '}
              through the <strong>LifeLink Emergency Blood Network</strong>. Your selfless generosity and timely support have directly helped save precious human lives.
            </p>

            {/* Horizontal Metadata Strip for Landscape Layout */}
            <div
              style={{
                fontSize: '13px',
                color: '#5c4033',
                fontFamily: 'Arial, sans-serif',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '28px',
                backgroundColor: 'rgba(184, 134, 11, 0.08)',
                padding: '8px 14px',
                borderRadius: '6px',
                width: 'fit-content'
              }}
            >
              <span>
                <strong>Certificate ID:</strong> {certId}
              </span>
              <span>
                <strong>Donor Location:</strong> {user?.cityCountry || 'Bangladesh'}
              </span>
              <span>
                <strong>Date of Issue:</strong> {issueDate}
              </span>
            </div>
          </div>

          {/* Bottom Section: Signatures & Gold Seal */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: '20px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(184, 134, 11, 0.45)'
            }}
          >
            {/* Left Signature: Reyadyzzaman (CEO) */}
            <div style={{ textAlign: 'center', minWidth: '200px' }}>
              <div
                style={{
                  fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
                  fontSize: '28px',
                  color: '#1a2530',
                  marginBottom: '4px'
                }}
              >
                Reyadyzzaman
              </div>
              <div style={{ borderTop: '1.5px solid #5c4033', paddingTop: '6px' }}>
                <strong style={{ fontSize: '15px', color: '#1f1612', display: 'block' }}>Reyadyzzaman</strong>
                <span style={{ fontSize: '12px', color: '#7a5230', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
                  Chief Executive Officer (CEO)
                </span>
              </div>
            </div>

            {/* Center Gold Seal */}
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '86px',
                  height: '86px',
                  margin: '0 auto',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #f9e79f 0%, #d4af37 65%, #9a7d0a 100%)',
                  border: '3px double #8b0000',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#5b0000',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: 'bold',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.2)'
                }}
              >
                <span style={{ fontSize: '18px' }}>🩸</span>
                <span style={{ fontSize: '9px', letterSpacing: '1px' }}>VERIFIED</span>
                <span style={{ fontSize: '8px' }}>{certId}</span>
              </div>
            </div>

            {/* Right Signature: Sabbir (Co-Founder) */}
            <div style={{ textAlign: 'center', minWidth: '200px' }}>
              <div
                style={{
                  fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
                  fontSize: '28px',
                  color: '#1a2530',
                  marginBottom: '4px'
                }}
              >
                Sabbir
              </div>
              <div style={{ borderTop: '1.5px solid #5c4033', paddingTop: '6px' }}>
                <strong style={{ fontSize: '15px', color: '#1f1612', display: 'block' }}>Sabbir</strong>
                <span style={{ fontSize: '12px', color: '#7a5230', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
                  Co-Founder, LifeLink
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}