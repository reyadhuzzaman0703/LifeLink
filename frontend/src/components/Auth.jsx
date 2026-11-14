import React, { useState } from 'react';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otpSent) {
      setOtpSent(true);
      alert(`OTP sent to ${phone}`);
    } else {
      alert('Authentication Successful!');
      onLoginSuccess({ name: 'Donor User', phone, bloodGroup: 'A+' });
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#c0392b', marginTop: 0 }}>{isLogin ? '🔑 LifeLink Login' : '📝 Register Donor Account'}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Full Name:</label>
            <input type="text" placeholder="John Doe" required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
        )}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Phone Number:</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="017XXXXXXXX" required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        {otpSent && (
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Enter OTP Code:</label>
            <input type="text" placeholder="123456" required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
        )}
        <button type="submit" style={{ width: '100%', backgroundColor: '#c0392b', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          {otpSent ? 'Verify OTP & Enter' : (isLogin ? 'Send OTP Login' : 'Send Registration OTP')}
        </button>
      </form>
      <p onClick={() => { setIsLogin(!isLogin); setOtpSent(false); }} style={{ color: '#2980b9', cursor: 'pointer', marginTop: '15px', textAlign: 'center' }}>
        {isLogin ? "Don't have an account? Register" : "Already registered? Login"}
      </p>
    </div>
  );
}