import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, saveCustomerSession } from "../../api";

export default function CustomerLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState("credentials");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  function change(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function requestOtp(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      const data = await api("/customer/login/request-otp", {
        method: "POST",
        body: JSON.stringify(form)
      });

      setMessage(data?.message || "Verification code sent to your email.");
      setStage("otp");
      setCooldown(60);
    } catch (err) {
      setError(err.message || "Unable to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (otp.length !== 6) {
      setError("Enter the 6-digit verification code");
      return;
    }

    setLoading(true);

    try {
      const data = await api("/customer/login/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          otp
        })
      });

      saveCustomerSession(data?.customer, data?.token);
      navigate("/customer/home");
    } catch (err) {
      setError(err.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    if (cooldown > 0) return;
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const data = await api("/customer/login/request-otp", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setMessage(data?.message || "OTP resent to your email.");
      setCooldown(60);
    } catch (err) {
      setError(err.message || "Unable to resend OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Ambient background floating food elements */}
      <div className="auth-bg-decor">
        <span className="floating-food f-1">🍕</span>
        <span className="floating-food f-2">🍔</span>
        <span className="floating-food f-3">🥗</span>
        <span className="floating-food f-4">🍜</span>
        <span className="floating-food f-5">🍛</span>
        <span className="floating-food f-6">🍰</span>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <Link className="auth-logo" to="/">
            🍽️ RANAVEER
          </Link>
          <div className="auth-role-tag">Customer Portal</div>

          <h1 className="auth-title">
            {stage === "credentials" ? "Welcome Back" : "Verify Your Email"}
          </h1>

          <p className="auth-subtitle">
            {stage === "credentials"
              ? "Sign in to order your favorite local meals fast."
              : `We sent a 6-digit verification code to:`}
          </p>

          {stage === "otp" && (
            <div className="email-target-pill">
              <span>✉️</span> {form.email}
            </div>
          )}

          {/* 2-Step indicator dots */}
          <div className="auth-step-bar">
            <div className={`auth-step-dot ${stage === "credentials" ? "active" : ""}`} />
            <div className={`auth-step-dot ${stage === "otp" ? "active" : ""}`} />
          </div>
        </div>

        {/* Hero visual bubble with sending animation */}
        <div className="otp-hero-graphic">
          <div className={`otp-icon-bubble ${loading ? "sending" : ""}`}>
            {loading ? "📨" : stage === "otp" ? "🔐" : "👤"}
          </div>
        </div>

        {/* Dynamic sending status banner */}
        {loading && stage === "credentials" && (
          <div className="sending-status-box">
            <div className="sending-status-spinner"></div>
            <p className="sending-status-title">Sending Verification Code</p>
            <p className="sending-status-desc">
              Dispatching secure 6-digit OTP to {form.email}...
            </p>
          </div>
        )}

        {error && <div className="alert alert-error">⚠️ {error}</div>}
        {message && <div className="alert alert-success">✅ {message}</div>}

        {stage === "credentials" ? (
          <form onSubmit={requestOtp}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={change}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={change}
                minLength={6}
                required
                autoComplete="current-password"
              />
            </div>

            <button className="btn btn-primary full-btn" disabled={loading}>
              {loading ? "Sending OTP..." : "Continue with Email Verification →"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp}>
            <div className="form-group otp-input-container">
              <label className="form-label" style={{ textAlign: "center" }}>
                Enter 6-Digit Verification Code
              </label>
              <input
                className="form-input otp-input"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                autoFocus
                required
              />
            </div>

            <button
              className="btn btn-primary full-btn"
              disabled={loading || otp.length !== 6}
            >
              {loading ? "Verifying..." : "Verify & Sign In"}
            </button>

            <button
              type="button"
              className="btn btn-outline full-btn"
              onClick={resendOtp}
              disabled={loading || cooldown > 0}
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "🔄 Resend OTP"}
            </button>

            <button
              type="button"
              className="text-button"
              onClick={() => {
                setStage("credentials");
                setOtp("");
                setError("");
                setMessage("");
              }}
            >
              ← Change Email or Password
            </button>
          </form>
        )}

        <p className="auth-footer">
          Don't have an account? <Link to="/customer/register">Register</Link>
        </p>

        <p className="auth-footer">
          <Link to="/">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
