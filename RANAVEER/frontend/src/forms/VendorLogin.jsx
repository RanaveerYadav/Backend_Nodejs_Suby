import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, saveVendorSession } from "../api";

export default function VendorLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState("credentials");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const request = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const d = await api("/vendor/login/request-otp", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setMessage(d.message || "Verification code sent to your email.");
      setStage("otp");
      setCooldown(60);
    } catch (err) {
      setError(err.message || "Unable to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (otp.length !== 6) {
      setError("Enter the 6-digit verification code");
      return;
    }

    setLoading(true);

    try {
      const d = await api("/vendor/login/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email: form.email, otp })
      });
      saveVendorSession(d.token);
      localStorage.setItem(
        "subyUser",
        JSON.stringify({
          username: d.username || "Vendor",
          email: d.email || form.email
        })
      );
      navigate("/vendor/dashboard");
    } catch (err) {
      setError(err.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const d = await api("/vendor/login/request-otp", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setMessage(d.message || "Verification code resent to your email.");
      setCooldown(60);
    } catch (err) {
      setError(err.message || "Unable to resend OTP");
    } finally {
      setLoading(false);
    }
  };

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
            👨‍🍳 RANAVEER
          </Link>
          <div className="auth-role-tag">Vendor Partner Portal</div>

          <h1 className="auth-title">
            {stage === "credentials" ? "Vendor Login" : "Verify Vendor Access"}
          </h1>

          <p className="auth-subtitle">
            {stage === "credentials"
              ? "Access your restaurant dashboard and manage orders securely."
              : "We sent a 6-digit verification code to:"}
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
            {loading ? "📨" : stage === "otp" ? "🔐" : "🏪"}
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
          <form onSubmit={request}>
            <div className="form-group">
              <label className="form-label">Vendor Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="vendor@restaurant.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
            </div>

            <button className="btn btn-primary full-btn" disabled={loading}>
              {loading ? "Sending OTP..." : "Continue to Verification →"}
            </button>
          </form>
        ) : (
          <form onSubmit={verify}>
            <div className="form-group otp-input-container">
              <label className="form-label" style={{ textAlign: "center" }}>
                Enter 6-Digit Verification Code
              </label>
              <input
                className="form-input otp-input"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
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
              {loading ? "Signing in..." : "Verify & Open Dashboard"}
            </button>

            <button
              type="button"
              className="btn btn-outline full-btn"
              onClick={resend}
              disabled={loading || cooldown > 0}
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "🔄 Resend OTP"}
            </button>

            <button
              type="button"
              className="text-button"
              onClick={() => {
                setStage("credentials");
                setMessage("");
                setError("");
                setOtp("");
              }}
            >
              ← Change Vendor Email or Password
            </button>
          </form>
        )}

        <p className="auth-footer">
          New vendor? <Link to="/vendor/register">Register Restaurant</Link>
        </p>

        <p className="auth-footer">
          <Link to="/">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
