import React from 'react';

export default function Certificate({ user }) {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const verificationId = `LL-${user?.id ? String(user.id).slice(-6) : 'GLOBAL'}`;

  return (
    <div style={{ textAlign: 'center', padding: '10px' }}>
      {/* প্রিন্ট করার সময় শুধুমাত্র A4 সার্টিফিকেটটি দেখানোর জন্য CSS */}
      <style>
        {`
          @page {
            size: A4 landscape;
            margin: 0;
          }
          @media print {
            body * {
              visibility: hidden;
            }
            #a4-certificate-sheet, #a4-certificate-sheet * {
              visibility: visible;
            }
            #a4-certificate-sheet {
              position: fixed;
              left: 0;
              top: 0;
              width: 297mm !important;
              height: 210mm !important;
              margin: 0 !important;
              padding: 15mm !important;
              box-sizing: border-box !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              background: #fffdf9 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      {/* A4 প্রোপোরশনাল সার্টিফিকেট কন্টেইনার (297mm x 210mm অনুপাতে) */}
      <div
        id="a4-certificate-sheet"
        style={{
          width: '100%',
          maxWidth: '900px',
          minHeight: '620px',
          margin: '0 auto',
          backgroundColor: '#fffdf9',
          padding: '28px',
          boxSizing: 'border-box',
          boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
          borderRadius: '6px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        {/* বাইরের ও ভেতরের ডাবল বর্ডার ফ্রেম */}
        <div
          style={{
            border: '8px double #c0392b',
            outline: '2px solid #d4ac0d',
            outlineOffset: '-14px',
            padding: '45px 35px',
            height: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          {/* হেডার অংশ */}
          <div>
            <div style={{ fontSize: '36px', marginBottom: '5px' }}>🩸</div>
            <h4
              style={{
                color: '#c0392b',
                letterSpacing: '3px',
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
                fontSize: '14px'
              }}
            >
              LifeLink Global Humanitarian Network
            </h4>
            <h1
              style={{
                fontSize: '38px',
                color: '#2c3e50',
                margin: '8px 0',
                fontFamily: 'Georgia, serif',
                letterSpacing: '1px'
              }}
            >
              Certificate of Appreciation
            </h1>
            <div
              style={{
                width: '120px',
                height: '3px',
                backgroundColor: '#d4ac0d',
                margin: '10px auto'
              }}
            />
          </div>

          {/* মূল বডি ও ডোনারের নাম */}
          <div style={{ margin: '20px 0' }}>
            <p style={{ color: '#555', fontSize: '16px', margin: '0 0 10px 0', fontStyle: 'italic' }}>
              This certificate is proudly presented to
            </p>

            <h2
              style={{
                fontSize: '34px',
                color: '#c0392b',
                margin: '8px 0 14px 0',
                fontFamily: 'Georgia, serif',
                borderBottom: '2px solid #bdc3c7',
                display: 'inline-block',
                padding: '0 40px 6px 40px'
              }}
            >
              {user?.name || 'Valued LifeSaver'}
            </h2>

            <p
              style={{
                color: '#34495e',
                fontSize: '16px',
                maxWidth: '680px',
                margin: '12px auto 0 auto',
                lineHeight: '1.7'
              }}
            >
              In grateful recognition of your selfless humanitarian act as a voluntary blood donor
              (Blood Group: <strong style={{ color: '#c0392b' }}>{user?.bloodGroup || 'O+'}</strong>) from{' '}
              <strong>{user?.cityCountry || 'Global Community'}</strong>, saving precious human lives in critical medical emergencies.
            </p>
          </div>

          {/* ফুটার ও ভেরিফিকেশন সিগনেচার অংশ */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'flex-end',
              marginTop: '30px',
              paddingTop: '15px',
              fontSize: '14px',
              color: '#2c3e50'
            }}
          >
            <div>
              <div style={{ fontWeight: 'bold', borderBottom: '1px solid #7f8c8d', paddingBottom: '4px', marginBottom: '4px', minWidth: '140px' }}>
                {today}
              </div>
              <small style={{ color: '#7f8c8d' }}>Date Issued</small>
            </div>

            <div>
              <div
                style={{
                  border: '2px solid #27ae60',
                  color: '#27ae60',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  letterSpacing: '1px'
                }}
              >
                ✔ VERIFIED ID: {verificationId}
              </div>
            </div>

            <div>
              <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 'bold', borderBottom: '1px solid #7f8c8d', paddingBottom: '4px', marginBottom: '4px', minWidth: '160px' }}>
                LifeLink Global Board
              </div>
              <small style={{ color: '#7f8c8d' }}>Authorized Signature</small>
            </div>
          </div>
        </div>
      </div>

      {/* প্রিন্ট বাটন (কাগজে প্রিন্ট হবে না) */}
      <div className="no-print" style={{ marginTop: '20px' }}>
        <button
          onClick={() => window.print()}
          style={{
            backgroundColor: '#c0392b',
            color: 'white',
            border: 'none',
            padding: '12px 26px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '15px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
          }}
        >
          🖨️ Print / Save A4 Certificate (PDF)
        </button>
      </div>
    </div>
  );
}