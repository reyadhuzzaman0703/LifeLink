import React, { useState } from 'react';

// টিমমেটের ব্যাকএন্ড পোর্ট বা রাউট প্রিফিক্স ভিন্ন হলে শুধু এই লিংকটি বদলে দেবে
const AUTH_API_URL = 'http://localhost:5000/api/auth';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bloodGroup: 'O+',
    contact: '',
    cityCountry: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Login মোডে /login এবং Register মোডে /register এন্ডপয়েন্টে রিকোয়েস্ট যাবে
    const endpoint = isLogin ? `${AUTH_API_URL}/login` : `${AUTH_API_URL}/register`;
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed. Please try again.');
      }

      // ব্যাকএন্ড থেকে আসা JWT টোকেন ব্রাউজারে সেভ করা
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      // সফল হলে ইউজার ডেটা App.jsx-এ পাঠানো
      onLoginSuccess(data.user || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa', fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px', borderTop: '6px solid #c0392b' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: '#c0392b', margin: '0 0 5px 0' }}>🩸 LifeLink</h1>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Global Emergency Blood Donation Network</p>
        </div>

        {/* Login ও Register ট্যাব বাটন */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            style={tabStyle(isLogin)}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            style={tabStyle(!isLogin)}
          >
            Register
          </button>
        </div>

        {/* সার্ভার থেকে কোনো এরর আসলে এখানে দেখাবে */}
        {error && (
          <div style={{ backgroundColor: '#fdecea', color: '#c0392b', padding: '10px', borderRadius: '5px', fontSize: '13px', marginBottom: '12px', border: '1px solid #f5c6cb' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!isLogin && (
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
          )}

          <div>
            <label style={labelStyle}>Email *</label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Password *</label>
            <input
              type="password"
              required
              placeholder="Enter password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={inputStyle}
            />
          </div>

          {!isLogin && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
                  <label style={labelStyle}>Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+8801..."
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>City & Country *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Dhaka, Bangladesh"
                  value={formData.cityCountry}
                  onChange={(e) => setFormData({ ...formData, cityCountry: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? '#95a5a6' : '#c0392b',
              color: 'white',
              border: 'none',
              padding: '12px',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '15px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '6px'
            }}
          >
            {loading ? 'Connecting...' : isLogin ? 'Login ➔' : 'Register ✅'}
          </button>
        </form>
      </div>
    </div>
  );
}

const tabStyle = (active) => ({
  flex: 1,
  padding: '10px',
  border: 'none',
  borderRadius: '5px',
  fontWeight: 'bold',
  cursor: 'pointer',
  backgroundColor: active ? '#2c3e50' : '#ecf0f1',
  color: active ? '#fff' : '#2c3e50'
});

const labelStyle = { display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px', color: '#333' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' };