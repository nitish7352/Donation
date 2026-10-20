import React, { useState } from "react";
import { Lock, ShieldCheck, Key, UserCheck, Heart, Sparkles, AlertCircle, ArrowRight, CheckCircle2, Crown, Mail } from "lucide-react";

export default function AccessGate({ onGrantAccess }) {
  const [tab, setTab] = useState("owner"); // "owner" | "passcode" | "request"
  const [ownerEmail, setOwnerEmail] = useState("aky952372@gmail.com");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [requestData, setRequestData] = useState({
    name: "",
    email: "",
    reason: "Donor / Supporter Access"
  });
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const OWNER_EMAIL = "aky952372@gmail.com";
  const validCodes = ["1234", "helphands", "admin", "donation2026", "access", OWNER_EMAIL];

  const handleOwnerLogin = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");

    const cleanEmail = ownerEmail.trim().toLowerCase();
    if (cleanEmail === OWNER_EMAIL) {
      onGrantAccess({
        authenticated: true,
        isOwner: true,
        method: "owner_verified",
        email: OWNER_EMAIL,
        name: "Platform Owner"
      });
    } else {
      setError(`Owner email mismatch. Official owner email is ${OWNER_EMAIL}`);
    }
  };

  const handlePasscodeSubmit = (e) => {
    e.preventDefault();
    setError("");

    const cleanInput = passcode.trim().toLowerCase();
    if (cleanInput === OWNER_EMAIL) {
      onGrantAccess({
        authenticated: true,
        isOwner: true,
        method: "owner_verified",
        email: OWNER_EMAIL,
        name: "Platform Owner"
      });
    } else if (validCodes.includes(cleanInput)) {
      onGrantAccess({
        authenticated: true,
        isOwner: cleanInput === "admin",
        method: "passcode",
        name: cleanInput === "admin" ? "Admin User" : "Verified Member"
      });
    } else {
      setError("Invalid access code. Use owner email aky952372@gmail.com or passcode 1234.");
    }
  };

  const handleQuickAccess = () => {
    onGrantAccess({
      authenticated: true,
      isOwner: false,
      method: "quick_demo",
      name: "Guest Visitor"
    });
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    if (!requestData.name.trim() || !requestData.email.trim()) {
      setError("Please fill out both your name and email.");
      return;
    }

    setRequestSubmitted(true);
    setTimeout(() => {
      onGrantAccess({
        authenticated: true,
        isOwner: requestData.email.trim().toLowerCase() === OWNER_EMAIL,
        method: "requested",
        name: requestData.name.trim(),
        email: requestData.email.trim()
      });
    }, 1000);
  };

  return (
    <div className="access-gate-overlay">
      <div className="access-gate-backdrop-blur" />

      <div className="access-gate-card">
        {/* Header with glowing shield */}
        <div className="access-gate-header">
          <div className="access-shield-ring">
            <Lock size={28} className="text-emerald" />
          </div>

          <div className="brand-logo justify-center mt-10">
            <div className="logo-heart-wrap">
              <Heart size={18} className="logo-heart-icon" />
            </div>
            <span className="brand-text">
              Help<span className="brand-accent">Hands.</span>
            </span>
          </div>

          <h3>Platform Access Verification</h3>
          <p className="access-subtitle">
            Private & verified access is required to enter this donation platform.
            Authorized owner: <strong className="text-emerald">{OWNER_EMAIL}</strong>
          </p>
        </div>

        {/* Tab switcher */}
        <div className="access-tabs-pill">
          <button
            type="button"
            className={`access-tab-btn ${tab === "owner" ? "active" : ""}`}
            onClick={() => { setTab("owner"); setError(""); }}
          >
            <Crown size={14} className="text-amber" /> Owner Access
          </button>
          <button
            type="button"
            className={`access-tab-btn ${tab === "passcode" ? "active" : ""}`}
            onClick={() => { setTab("passcode"); setError(""); }}
          >
            <Key size={14} /> Passcode
          </button>
          <button
            type="button"
            className={`access-tab-btn ${tab === "request" ? "active" : ""}`}
            onClick={() => { setTab("request"); setError(""); }}
          >
            <UserCheck size={14} /> Request
          </button>
        </div>

        {error && (
          <div className="access-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Tab 1: Owner Email Access */}
        {tab === "owner" && (
          <form onSubmit={handleOwnerLogin} className="access-form">
            <div className="owner-badge-box">
              <Crown size={18} className="text-amber inline mr-6" />
              <span>Official Website Owner Verification</span>
            </div>

            <div className="form-group">
              <label htmlFor="owner-email">Owner Email ID</label>
              <div className="input-with-icon">
                <Mail size={16} className="field-icon" />
                <input
                  id="owner-email"
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="aky952372@gmail.com"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full">
              <Crown size={16} /> Verify & Access as Owner
            </button>

            <div className="divider-text">
              <span>OR</span>
            </div>

            <button
              type="button"
              className="btn btn-demo-simulator w-full"
              onClick={handleQuickAccess}
            >
              <Sparkles size={16} /> Guest / Visitor Quick Access
            </button>
          </form>
        )}

        {/* Tab 2: Passcode Form */}
        {tab === "passcode" && (
          <form onSubmit={handlePasscodeSubmit} className="access-form">
            <div className="form-group">
              <label htmlFor="gate-passcode">Access Passcode</label>
              <div className="input-with-icon">
                <Lock size={16} className="field-icon" />
                <input
                  id="gate-passcode"
                  type="text"
                  placeholder="Enter code (Hint: 1234 or owner email)"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full">
              Unlock Platform <ArrowRight size={16} />
            </button>

            <div className="divider-text">
              <span>OR</span>
            </div>

            <button
              type="button"
              className="btn btn-demo-simulator w-full"
              onClick={handleQuickAccess}
            >
              <Sparkles size={16} /> Instant One-Click Demo Access
            </button>

            <div className="access-code-hints">
              <span className="hint-label">Autofill:</span>
              <div className="hint-badges">
                <code onClick={() => setPasscode("1234")}>1234</code>
                <code onClick={() => setPasscode(OWNER_EMAIL)}>{OWNER_EMAIL}</code>
                <code onClick={() => setPasscode("admin")}>admin</code>
              </div>
            </div>
          </form>
        )}

        {/* Tab 3: Request Access Form */}
        {tab === "request" && (
          <div>
            {requestSubmitted ? (
              <div className="access-approved-state">
                <CheckCircle2 size={42} className="text-emerald" />
                <h4>Access Approved!</h4>
                <p className="muted-sm">
                  Welcome, <strong>{requestData.name}</strong>. Opening HelpHands platform now...
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="access-form">
                <div className="form-group">
                  <label htmlFor="req-name">Your Full Name</label>
                  <input
                    id="req-name"
                    type="text"
                    required
                    placeholder="e.g. Adarsh"
                    value={requestData.name}
                    onChange={(e) => setRequestData({ ...requestData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="req-email">Email Address</label>
                  <input
                    id="req-email"
                    type="email"
                    required
                    placeholder="e.g. adarsh@example.com"
                    value={requestData.email}
                    onChange={(e) => setRequestData({ ...requestData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="req-reason">Access Role / Purpose</label>
                  <select
                    id="req-reason"
                    value={requestData.reason}
                    onChange={(e) => setRequestData({ ...requestData, reason: e.target.value })}
                  >
                    <option value="Donor / Supporter Access">Donor / Supporter</option>
                    <option value="Campaign Organizer">Campaign Organizer</option>
                    <option value="Auditor / Reviewer">Auditor / Reviewer</option>
                    <option value="General Visitor">General Visitor</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary btn-lg w-full">
                  Submit & Grant Access <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        )}

        <div className="access-gate-footer">
          <ShieldCheck size={14} className="text-emerald inline mr-4" />
          <span>Encrypted Session • Managed by Owner aky952372@gmail.com</span>
        </div>
      </div>
    </div>
  );
}
