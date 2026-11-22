
import React, { useState } from 'react';

export default function Auth({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Backend API URL
  const API_BASE_URL = (
    import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  ).replace(/\/$/, '');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bloodGroup: 'O+',
    cityCountry: 'Dhaka, Bangladesh',
    contact: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  // Login and Registration API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isSubmitting) return;

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = isRegister
        ? '/auth/register'
        : '/auth/login';

      const requestBody = isRegister
        ? {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.contact.trim(),
            password: formData.password,
            bloodGroup: formData.bloodGroup,
          }
        : {
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
          };

      const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Authentication failed. Please try again.'
        );
      }

      if (!data.token || !data.user) {
        throw new Error(
          'Server response is missing token or user information.'
        );
      }

      // Save JWT Token and User Information
      localStorage.setItem('lifelink_token', data.token);

      localStorage.setItem(
        'lifelink_current_user',
        JSON.stringify(data.user)
      );

      // Update user location after registration
      if (isRegister && formData.cityCountry.trim()) {
        try {
          const profileResponse = await fetch(
            `${API_BASE_URL}/auth/profile`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${data.token}`,
              },
              body: JSON.stringify({
                location: formData.cityCountry.trim(),
              }),
            }
          );

          const profileData = await profileResponse
            .json()
            .catch(() => ({}));

          if (
            profileResponse.ok &&
            profileData.success &&
            profileData.user
          ) {
            localStorage.setItem(
              'lifelink_current_user',
              JSON.stringify(profileData.user)
            );

            onLoginSuccess(profileData.user);
            return;
          }
        } catch (profileError) {
          console.error('Location update error:', profileError);
        }
      }

      onLoginSuccess(data.user);

    } catch (err) {
      setError(
        err.message ||
        'Unable to connect to the server. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputStyle = (fieldName) => ({
    width: '100%',
    padding: '11px 14px',
    borderRadius: '10px',
    border:
      focusedField === fieldName
        ? '1.5px solid #dc2626'
        : '1.5px solid #e2e8f0',
    backgroundColor:
      focusedField === fieldName ? '#fff' : '#f8fafc',
    boxShadow:
      focusedField === fieldName
        ? '0 0 0 4px rgba(220, 38, 38, 0.14)'
        : 'none',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#070203',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <style>{`
        @keyframes spinRedBlack {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes reverseSpinGlow {
          0% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
        }
      `}</style>

      {/* Layer 1 */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '210vmax',
          height: '210vmax',
          background:
            'conic-gradient(from 0deg, #050203 0deg, #991b1b 55deg, #09090b 120deg, #dc2626 185deg, #040102 250deg, #7f1d1d 310deg, #050203 360deg)',
          animation: 'spinRedBlack 14s linear infinite',
          filter: 'blur(42px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Layer 2 */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '170vmax',
          height: '170vmax',
          background:
            'radial-gradient(circle at 30% 30%, rgba(225, 29, 72, 0.45) 0%, transparent 45%), radial-gradient(circle at 70% 70%, rgba(127, 29, 29, 0.55) 0%, transparent 50%), radial-gradient(circle at 70% 25%, rgba(0, 0, 0, 0.85) 0%, transparent 50%)',
          animation: 'reverseSpinGlow 20s linear infinite',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Main Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '900px',
          backgroundColor: '#ffffff',
          borderRadius: '22px',
          boxShadow:
            '0 28px 70px rgba(0, 0, 0, 0.8), 0 0 36px rgba(220, 38, 38, 0.28)',
          display: 'flex',
          flexWrap: 'wrap',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
          border: '1px solid rgba(220, 38, 38, 0.35)'
        }}
      >
        {/* LEFT PANEL */}
        <div
          style={{
            flex: '1 1 350px',
            background:
              'linear-gradient(155deg, #090304 0%, #450a0a 48%, #b91c1c 100%)',
            color: '#ffffff',
            padding: '44px 36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <svg
            viewBox="0 0 400 120"
            style={{
              position: 'absolute',
              bottom: '24px',
              left: 0,
              width: '100%',
              opacity: 0.2,
              pointerEvents: 'none'
            }}
          >
            <path
              d="M0,60 L90,60 L110,20 L135,100 L160,40 L180,75 L200,60 L400,60"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                padding: '8px 18px',
                borderRadius: '30px',
                border: '1px solid rgba(248, 113, 113, 0.35)',
                marginBottom: '26px'
              }}
            >
              <span style={{ fontSize: '20px' }}>🩸</span>
              <strong
                style={{
                  fontSize: '16px',
                  letterSpacing: '0.6px'
                }}
              >
                LifeLink
              </strong>
            </div>

            <h1
              style={{
                fontSize: '36px',
                lineHeight: '1.22',
                margin: 0,
                fontWeight: '800',
                letterSpacing: '-0.5px'
              }}
            >
              Every Drop <br />
              Saves a Precious Life.
            </h1>
          </div>

          <div
            style={{
              marginTop: '48px',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.85)',
              fontWeight: '500'
            }}
          >
            Trusted by Donors, Hospitals & Volunteers ❤️
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div
          style={{
            flex: '1 1 400px',
            padding: '40px 36px',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <div style={{ marginBottom: '22px' }}>
            <h2
              style={{
                margin: '0 0 6px 0',
                color: '#0f172a',
                fontSize: '24px',
                fontWeight: '700'
              }}
            >
              {isRegister
                ? 'Create your account'
                : 'Welcome back'}
            </h2>

            <p
              style={{
                margin: 0,
                color: '#64748b',
                fontSize: '14px'
              }}
            >
              {isRegister
                ? 'Register as a donor or requester to join LifeLink'
                : 'Enter your credentials to access your dashboard'}
            </p>
          </div>

          {/* Login/Register Toggle */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#f1f5f9',
              padding: '4px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError('');
              }}
              style={toggleBtnStyle(!isRegister)}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError('');
              }}
              style={toggleBtnStyle(isRegister)}
            >
              Register
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                color: '#b91c1c',
                padding: '11px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                marginBottom: '16px',
                fontWeight: '600',
                border: '1px solid #fecaca'
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            {/* Full Name */}
            {isRegister && (
              <div>
                <label style={labelStyle}>Full Name</label>

                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., Ahosan Sabbir"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField('')}
                  style={getInputStyle('name')}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label style={labelStyle}>Email Address</label>

              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
                style={getInputStyle('email')}
              />
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>

              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  style={{
                    ...getInputStyle('password'),
                    paddingRight: '42px'
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '15px',
                    color: '#64748b'
                  }}
                  title={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Registration Fields */}
            {isRegister && (
              <>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px'
                  }}
                >
                  <div>
                    <label style={labelStyle}>Blood Group</label>

                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('bloodGroup')}
                      onBlur={() => setFocusedField('')}
                      style={getInputStyle('bloodGroup')}
                    >
                      {[
                        'A+', 'A-', 'B+', 'B-',
                        'O+', 'O-', 'AB+', 'AB-'
                      ].map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Phone Number</label>

                    <input
                      type="text"
                      name="contact"
                      required
                      placeholder="017XXXXXXXX"
                      value={formData.contact}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('contact')}
                      onBlur={() => setFocusedField('')}
                      style={getInputStyle('contact')}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px'
                  }}
                >
                  <div>
                    <label style={labelStyle}>City, Country</label>

                    <input
                      type="text"
                      name="cityCountry"
                      required
                      placeholder="Dhaka, Bangladesh"
                      value={formData.cityCountry}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('cityCountry')}
                      onBlur={() => setFocusedField('')}
                      style={getInputStyle('cityCountry')}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Account Role</label>

                    <div
                      style={{
                        ...getInputStyle('role'),
                        minHeight: '42px',
                        display: 'flex',
                        alignItems: 'center',
                        color: '#334155',
                        fontWeight: '600'
                      }}
                    >
                      User (Donor / Requester)
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background:
                  'linear-gradient(90deg, #111827 0%, #991b1b 50%, #dc2626 100%)',
                color: '#fff',
                border: 'none',
                padding: '13px',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '15px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                marginTop: '6px',
                boxShadow:
                  '0 8px 20px rgba(185, 28, 28, 0.35)',
                transition: 'transform 0.15s ease',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting
                ? 'Please wait...'
                : isRegister
                  ? 'Create LifeLink Account →'
                  : 'Sign In to LifeLink →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Label Style
const labelStyle = {
  display: 'block',
  fontWeight: '600',
  fontSize: '13px',
  marginBottom: '6px',
  color: '#334155'
};

// Toggle Button Style
const toggleBtnStyle = (active) => ({
  flex: 1,
  padding: '9px',
  border: 'none',
  borderRadius: '9px',
  cursor: 'pointer',
  fontWeight: '700',
  fontSize: '13px',
  transition: 'all 0.2s ease',
  backgroundColor: active ? '#111827' : 'transparent',
  color: active ? '#ffffff' : '#64748b',
  boxShadow: active
    ? '0 2px 8px rgba(0, 0, 0, 0.18)'
    : 'none'
});
