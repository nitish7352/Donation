import React, { useState } from "react";
import { ShieldCheck, Lock, User, Key, AlertCircle, ArrowRight, Heart } from "lucide-react";
import API from "../config/api";

export default function AdminLogin({ onLoginSuccess, onCancel }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim() || !password.trim()) {
      setError("Please enter both administrator identifier and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: identifier.trim(),
          password: password.trim()
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid administrator credentials.");
      }

      // Store authenticated session
      if (data.token) {
        sessionStorage.setItem("helphands_admin_token", data.token);
      }
      sessionStorage.setItem("helphands_is_admin", "true");

      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-head">
          <div className="admin-shield-icon-wrap">
            <ShieldCheck size={32} className="text-emerald" />
          </div>

          <div className="brand-logo justify-center mt-12 mb-8">
            <div className="logo-heart-wrap">
              <Heart size={18} className="logo-heart-icon" />
            </div>
            <span className="brand-text">
              Help<span className="brand-accent">Hands.</span>
            </span>
          </div>

          <h3>Management Portal Access</h3>
          <p className="muted-xs">
            Authorized administration and platform oversight console.
          </p>
        </div>

        {error && (
          <div className="access-error-banner mt-15">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form mt-20">
          <div className="form-group">
            <label htmlFor="admin-id">Admin Username / Email</label>
            <div className="input-with-icon-wrap">
              <User size={16} className="input-icon-left" />
              <input
                id="admin-id"
                type="text"
                required
                autoComplete="username"
                placeholder="Enter admin identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="input-padded-left"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="admin-pass">Password / Security Key</label>
            <div className="input-with-icon-wrap">
              <Key size={16} className="input-icon-left" />
              <input
                id="admin-pass"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-padded-left"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full mt-10 justify-center"
            disabled={loading}
          >
            {loading ? (
              <span>Verifying Credentials...</span>
            ) : (
              <>
                <Lock size={16} /> Authenticate & Enter
              </>
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              className="btn btn-secondary-sm w-full mt-10 justify-center"
              onClick={onCancel}
            >
              Return to Public Website
            </button>
          )}
        </form>

        <div className="admin-login-foot mt-20 text-center">
          <span className="tiny-security-disclaimer">
            🔒 Protected by HMAC token validation & rate limiting
          </span>
        </div>
      </div>
    </div>
  );
}
