import React, { useState } from 'react';

export default function Auth({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bloodGroup: 'O+',
    cityCountry: 'Dhaka, Bangladesh',
    contact: '',
    role: 'user'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const url = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister
      ? {
          ...formData,
          location: formData.cityCountry,
          phone: formData.contact
        }
      : {
          email: formData.email,
          password: formData.password
        };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const rawText = await res.text();
      const data = rawText ? JSON.parse(rawText) : {};

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Authentication failed');
      }

      const token = data.token || data.accessToken;
      const rawUser = data.user || data.data || data;

      if (token) {
        localStorage.setItem('lifelink_token', token);
      }

      const normalizedUser = {
        ...rawUser,
        id: rawUser._id || rawUser.id,
        role: rawUser.role || (isRegister ? formData.role : 'user'),
        cityCountry: rawUser.cityCountry || rawUser.location || '',
        contact: rawUser.contact || rawUser.phone || ''
      };

      localStorage.setItem('lifelink_current_user', JSON.stringify(normalizedUser));
      onLoginSuccess(normalizedUser);
    } catch (err) {
      setError(err.message || 'Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px', borderTop: '6px solid #c0392b' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: '#c0392b', margin: '0 0 6px 0' }}>🩸 LifeLink</h1>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            {isRegister ? 'Create your Donor & Requester account' : 'Login to coordinate & save lives'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
          <button type="button" onClick={() => { setIsRegister(false); setError(''); }} style={toggleBtnStyle(!isRegister)}>
            Login
          </button>
          <button type="button" onClick={() => { setIsRegister(true); setError(''); }} style={toggleBtnStyle(isRegister)}>
            Register
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fdecea', color: '#c0392b', padding: '10px', borderRadius: '5px', fontSize: '13px', marginBottom: '14px', fontWeight: 'bold' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {isRegister && (
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input type="text" name="name" required placeholder="Enter your full name" value={formData.name} onChange={handleChange} style={inputStyle} />
            </div>
          )}

          <div>
            <label style={labelStyle}>Email *</label>
            <input type="email" name="email" required placeholder="you@example.com" value={formData.email} onChange={handleChange} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Password *</label>
            <input type="password" name="password" required placeholder="Enter password" value={formData.password} onChange={handleChange} style={inputStyle} />
          </div>

          {isRegister && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={labelStyle}>Blood Group *</label>
                  <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} style={inputStyle}>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Contact Number *</label>
                  <input type="text" name="contact" required placeholder="017XXXXXXXX" value={formData.contact} onChange={handleChange} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={labelStyle}>City / Country *</label>
                  <input type="text" name="cityCountry" required placeholder="Dhaka, Bangladesh" value={formData.cityCountry} onChange={handleChange} style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Account Role *</label>
                  <select name="role" value={formData.role} onChange={handleChange} style={inputStyle}>
                    <option value="user">User (Donor/Requester)</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: loading ? '#95a5a6' : '#c0392b', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px' }}
          >
            {loading ? '⏳ Connecting...' : isRegister ? '✅ Create Account' : '🔓 Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px', color: '#333' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' };
const toggleBtnStyle = (active) => ({
  flex: 1, padding: '9px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
  backgroundColor: active ? '#c0392b' : '#ecf0f1', color: active ? '#fff' : '#2c3e50'
});