import React, { useState } from 'react';

export default function Auth({ onLoginSuccess }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    bloodGroup: 'O+',
    contact: '',
    cityCountry: ''
  });
  const [otp, setOtp] = useState('');

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.contact.trim()) return;
    setStep(2);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length < 4) {
      alert('Please enter the 4-6 digit verification code.');
      return;
    }
    onLoginSuccess({
      id: Date.now(),
      ...formData
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa', fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px', borderTop: '6px solid #c0392b' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: '#c0392b', margin: '0 0 5px 0' }}>🩸 LifeLink</h1>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Global Emergency Blood Donation Network</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input
                type="text"
                required
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Blood Group *</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                style={inputStyle}
              >
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Email or Phone Number *</label>
              <input
                type="text"
                required
                placeholder="e.g., name@example.com or +123456789"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>City & Country *</label>
              <input
                type="text"
                required
                placeholder="e.g., Dhaka, Bangladesh or London, UK"
                value={formData.cityCountry}
                onChange={(e) => setFormData({ ...formData, cityCountry: e.target.value })}
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              style={{ backgroundColor: '#c0392b', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '6px' }}
            >
              Send Verification OTP ➔
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ backgroundColor: '#eafaf1', padding: '10px', borderRadius: '6px', fontSize: '13px', color: '#1e8449', textAlign: 'center' }}>
              Verification code sent to <strong>{formData.contact}</strong>
            </div>

            <div>
              <label style={labelStyle}>Enter OTP Code (Any 4-6 digits) *</label>
              <input
                type="text"
                required
                maxLength="6"
                placeholder="e.g., 123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{ ...inputStyle, textAlign: 'center', fontSize: '18px', letterSpacing: '4px', fontWeight: 'bold' }}
              />
            </div>

            <button
              type="submit"
              style={{ backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
            >
              Verify & Enter LifeLink ✅
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              style={{ backgroundColor: 'transparent', color: '#555', border: 'none', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
            >
              ← Edit Contact Info
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px', color: '#333' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' };