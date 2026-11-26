
import { useState } from "react";
import api from "../services/api";
import "./Auth.css";

const bloodGroups = [
  "A+", "A-", "B+", "B-",
  "AB+", "AB-", "O+", "O-",
];

function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [verificationSent, setVerificationSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    bloodGroup: "",
  });

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isLogin) {
        const response = await api.post("/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        const { token, user } = response.data;

        localStorage.setItem("lifelink_token", token);
        localStorage.setItem("lifelink_user", JSON.stringify(user));

        onAuthSuccess(user);
      } else {
        const response = await api.post("/auth/register", {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          bloodGroup: formData.bloodGroup || null,
        });

        setVerificationSent(true);
        setSuccess(response.data.message);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    setResending(true);

    try {
      const response = await api.post(
        "/auth/resend-verification",
        { email: formData.email }
      );

      setSuccess(response.data.message);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not resend verification email."
      );
    } finally {
      setResending(false);
    }
  };

  const switchMode = () => {
    setIsLogin((previous) => !previous);
    setError("");
    setSuccess("");
    setVerificationSent(false);
    setShowPassword(false);
  };

  if (verificationSent) {
    return (
      <main className="auth-page">
        <div className="auth-container">
          <section className="auth-brand-panel">
            <div className="auth-brand">
              <span className="auth-brand-icon">♥</span>
              <span>LifeLink</span>
            </div>

            <div className="brand-content">
              <span className="brand-label">
                BLOOD DONATION COMMUNITY
              </span>

              <h1>
                Every Drop
                <br />
                <span>Matters.</span>
              </h1>

              <p>
                Connect with blood donors, help people in
                emergencies, and become someone's reason
                to live.
              </p>
            </div>

            <div className="brand-footer">
              LifeLink © 2026
            </div>
          </section>

          <section className="auth-form-panel">
            <div className="auth-form-wrapper">
              <div className="auth-mobile-brand">
                <span className="auth-brand-icon">♥</span>
                <span>LifeLink</span>
              </div>

              <div className="auth-heading">
                <span className="form-eyebrow">
                  ONE LAST STEP
                </span>

                <h2>Check your email</h2>

                <p>
                  We've sent a verification link to:
                </p>

                <strong>{formData.email}</strong>
              </div>

              <div className="auth-message success-message">
                {success ||
                  "Please open your inbox and click the verification link."}
              </div>

              <p>
                Didn't receive the email? Check your spam folder
                or request another verification email.
              </p>

              {error && (
                <div className="auth-message error-message">
                  {error}
                </div>
              )}

              <button
                className="auth-submit"
                type="button"
                onClick={handleResend}
                disabled={resending}
              >
                {resending
                  ? "Sending..."
                  : "Resend Verification Email"}
              </button>

              <p className="auth-switch">
                Already verified?

                <button
                  type="button"
                  onClick={() => {
                    setVerificationSent(false);
                    setIsLogin(true);
                    setSuccess("");
                    setError("");
                  }}
                >
                  Login
                </button>
              </p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-container">
        <section className="auth-brand-panel">
          <div className="auth-brand">
            <span className="auth-brand-icon">♥</span>
            <span>LifeLink</span>
          </div>

          <div className="brand-content">
            <span className="brand-label">
              BLOOD DONATION COMMUNITY
            </span>

            <h1>
              Every Drop
              <br />
              <span>Matters.</span>
            </h1>

            <p>
              Connect with blood donors, help people in
              emergencies, and become someone's reason
              to live.
            </p>

            <div className="brand-highlight">
              <span className="highlight-heart">♥</span>
              <div>
                <strong>Be someone's hero</strong>
                <p>One donation can save lives.</p>
              </div>
            </div>
          </div>

          <div className="brand-footer">
            LifeLink © 2026
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-wrapper">
            <div className="auth-mobile-brand">
              <span className="auth-brand-icon">♥</span>
              <span>LifeLink</span>
            </div>

            <div className="auth-heading">
              <span className="form-eyebrow">
                WELCOME TO LIFELINK
              </span>

              <h2>
                {isLogin
                  ? "Welcome back"
                  : "Create your account"}
              </h2>

              <p>
                {isLogin
                  ? "Sign in to continue your journey."
                  : "Join our community and make a difference."}
              </p>
            </div>

            <div className="auth-tabs">
              <button
                type="button"
                className={isLogin ? "active" : ""}
                onClick={() => {
                  setIsLogin(true);
                  setError("");
                  setSuccess("");
                  setShowPassword(false);
                }}
              >
                Login
              </button>

              <button
                type="button"
                className={!isLogin ? "active" : ""}
                onClick={() => {
                  setIsLogin(false);
                  setError("");
                  setSuccess("");
                  setShowPassword(false);
                }}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <div className="form-field">
                    <label htmlFor="name">Full name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      minLength={2}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="phone">Phone number</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="bloodGroup">
                      Blood group
                      <span className="optional">Optional</span>
                    </label>

                    <select
                      id="bloodGroup"
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                    >
                      <option value="">Select blood group</option>

                      {bloodGroups.map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="form-field">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="password">Password</label>

                <div className="password-input-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    title={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 3l18 18" />
                        <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                        <path d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 9 4 10 7-0.4 1.3-1.3 2.5-2.5 3.5" />
                        <path d="M6.2 6.2C3.8 7.5 2.4 9.5 2 12c1 3 5 7 10 7 1 0 2-.2 2.9-.5" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="auth-message error-message">
                  {error}
                </div>
              )}

              {success && (
                <div className="auth-message success-message">
                  {success}
                </div>
              )}

              <button
                className="auth-submit"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : isLogin
                    ? "Sign In"
                    : "Create Account"}

                {!loading && <span>→</span>}
              </button>
            </form>

            <p className="auth-switch">
              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}

              <button type="button" onClick={switchMode}>
                {isLogin ? "Register" : "Login"}
              </button>
            </p>

            <div className="auth-bottom-note">
              <span>♥</span>
              Every Drop Matters. Every Life Counts.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Auth;
