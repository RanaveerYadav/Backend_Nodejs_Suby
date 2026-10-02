import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api";

export default function VendorRegister() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api("/vendor/register", {
        method: "POST",
        body: JSON.stringify(form)
      });
      navigate("/vendor/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link className="auth-logo" to="/">Ranaveer</Link>
        <h1>Vendor Register</h1>
        <p className="muted center">Create your vendor account.</p>
        <form onSubmit={submit}>
          {error && <div className="alert error">{error}</div>}
          {["username", "email", "password"].map(name => (
            <label className="field" key={name}>
              <span>{name[0].toUpperCase() + name.slice(1)}</span>
              <input
                type={name === "password" ? "password" : name === "email" ? "email" : "text"}
                value={form[name]}
                onChange={e => setForm({ ...form, [name]: e.target.value })}
                required
                minLength={name === "password" ? 6 : undefined}
              />
            </label>
          ))}
          <button className="btn primary full" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>
          <p className="auth-footer">
            Already registered? <Link to="/vendor/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}