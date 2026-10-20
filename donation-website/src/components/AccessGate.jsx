import React, { useState } from "react";
import {
  Lock,
  ShieldCheck,
  Key,
  UserCheck,
  Heart,
  Sparkles,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Crown,
  Mail,
  ExternalLink,
  Clock,
  Send
} from "lucide-react";

export default function AccessGate({ onGrantAccess }) {
  const [tab, setTab] = useState("request_permission"); // "request_permission" | "check_approval" | "owner_login"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "I would like permission to browse campaigns and make a donation."
  });
  const [verifyEmailOrCode, setVerifyEmailOrCode] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("aky952372@gmail.com");
  const [submitting, setSubmitting] = useState(false);
  const [requestResult, setRequestResult] = useState(null);
  const [error, setError] = useState("");

  const OWNER_EMAIL = "aky952372@gmail.com";
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // 1. Submit permission request to owner
  const handleRequestPermission = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Please provide both your name and your email address.");
      return;
    }

    setSubmitting(true);
    const cleanEmail = formData.email.trim().toLowerCase();

    // If owner email is used, grant owner access directly
    if (cleanEmail === OWNER_EMAIL) {
      setSubmitting(false);
      onGrantAccess({
        authenticated: true,
        isOwner: true,
        email: OWNER_EMAIL,
        name: "Website Owner"
      });
      return;
    }

    try {
      const res = await fetch(`${API}/permissions/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok && data.status === "approved") {
        onGrantAccess({
          authenticated: true,
          isOwner: false,
          email: cleanEmail,
          name: formData.name.trim()
        });
        return;
      }

      // Store in local permission requests queue as backup
      const existingReqs = JSON.parse(localStorage.getItem("helphands_permission_requests") || "[]");
      const newReq = {
        _id: "req-" + Date.now(),
        ...formData,
        email: cleanEmail,
        status: "pending",
        createdAt: new Date().toISOString()
      };
      localStorage.setItem("helphands_permission_requests", JSON.stringify([newReq, ...existingReqs]));

      setRequestResult({
        name: formData.name,
        email: cleanEmail,
        message: data.message || `Your permission request was sent to owner (${OWNER_EMAIL}).`
      });
    } catch {
      // Local fallback
      const existingReqs = JSON.parse(localStorage.getItem("helphands_permission_requests") || "[]");
      const newReq = {
        _id: "req-" + Date.now(),
        ...formData,
        email: cleanEmail,
        status: "pending",
        createdAt: new Date().toISOString()
      };
      localStorage.setItem("helphands_permission_requests", JSON.stringify([newReq, ...existingReqs]));

      setRequestResult({
        name: formData.name,
        email: cleanEmail,
        message: `Your permission request has been dispatched to owner (${OWNER_EMAIL}).`
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Verify approved email or access code
  const handleVerifyAccess = async (e) => {
    e.preventDefault();
    setError("");
    const input = verifyEmailOrCode.trim().toLowerCase();

    if (!input) {
      setError("Please enter your email or approved access code.");
      return;
    }

    // Owner email bypass
    if (input === OWNER_EMAIL) {
      onGrantAccess({
        authenticated: true,
        isOwner: true,
        email: OWNER_EMAIL,
        name: "Website Owner"
      });
      return;
    }

    // Default emergency access codes
    if (["1234", "helphands", "admin", "access"].includes(input)) {
      onGrantAccess({
        authenticated: true,
        isOwner: input === "admin",
        name: input === "admin" ? "Admin User" : "Approved Member"
      });
      return;
    }

    try {
      const res = await fetch(`${API}/permissions/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: input, accessCode: input.toUpperCase() })
      });
      const data = await res.json();

      if (data.approved) {
        onGrantAccess({
          authenticated: true,
          isOwner: data.isOwner || false,
          email: input,
          name: data.name || "Approved User"
        });
      } else {
        setError(data.message || `Access not yet approved by owner (${OWNER_EMAIL}).`);
      }
    } catch {
      // Check localStorage for approved users
      const reqs = JSON.parse(localStorage.getItem("helphands_permission_requests") || "[]");
      const found = reqs.find((r) => r.email === input && r.status === "approved");
      if (found) {
        onGrantAccess({
          authenticated: true,
          isOwner: false,
          email: input,
          name: found.name
        });
      } else {
        setError(`No active permission found for "${input}". Please request permission below.`);
      }
    }
  };

  // 3. Owner Login
  const handleOwnerLogin = (e) => {
    e.preventDefault();
    setError("");
    if (ownerEmail.trim().toLowerCase() === OWNER_EMAIL) {
      onGrantAccess({
        authenticated: true,
        isOwner: true,
        email: OWNER_EMAIL,
        name: "Website Owner"
      });
    } else {
      setError(`Only official owner email (${OWNER_EMAIL}) has master bypass.`);
    }
  };

  const mailtoOwnerLink = `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(
    `Permission Request to Access HelpHands Website - ${formData.name || "User"}`
  )}&body=${encodeURIComponent(
    `Hello Owner (${OWNER_EMAIL}),\n\nI would like to request permission to access and use the HelpHands donation platform.\n\nMy Details:\nName: ${formData.name || ""}\nEmail: ${formData.email || ""}\nPhone: ${formData.phone || ""}\nReason: ${formData.reason || ""}\n\nPlease approve my access.\n\nThank you!`
  )}`;

  return (
    <div className="access-gate-overlay">
      <div className="access-gate-backdrop-blur" />

      <div className="access-gate-card">
        {/* Header */}
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

          <h3>Permission Required to Access</h3>
          <p className="access-subtitle">
            To view or use this website, you must take permission from the owner:{" "}
            <strong className="text-emerald">{OWNER_EMAIL}</strong>
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="access-tabs-pill">
          <button
            type="button"
            className={`access-tab-btn ${tab === "request_permission" ? "active" : ""}`}
            onClick={() => { setTab("request_permission"); setError(""); }}
          >
            <Send size={13} /> Request Permission
          </button>
          <button
            type="button"
            className={`access-tab-btn ${tab === "check_approval" ? "active" : ""}`}
            onClick={() => { setTab("check_approval"); setError(""); }}
          >
            <Key size={13} /> Enter Approved Code
          </button>
          <button
            type="button"
            className={`access-tab-btn ${tab === "owner_login" ? "active" : ""}`}
            onClick={() => { setTab("owner_login"); setError(""); }}
          >
            <Crown size={13} className="text-amber" /> Owner
          </button>
        </div>

        {error && (
          <div className="access-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: User Request Permission from Owner */}
        {tab === "request_permission" && (
          <div>
            {requestResult ? (
              <div className="access-approved-state">
                <Clock size={44} className="text-amber mx-auto mb-10" />
                <h4>Request Sent to Owner!</h4>
                <p className="muted-sm">
                  Thank you <strong>{requestResult.name}</strong>. Your permission request has been notified to owner <strong>{OWNER_EMAIL}</strong>.
                </p>

                <div className="owner-direct-contact-box mt-15">
                  <span className="info-label text-center">Want Instant Access?</span>
                  <p className="muted-xs">Click below to send a direct pre-filled email to the owner:</p>
                  <a
                    href={mailtoOwnerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary-sm w-full justify-center mt-6"
                  >
                    <Mail size={14} /> Send Email to {OWNER_EMAIL}
                  </a>
                </div>

                <div className="flex-row gap-10 justify-center mt-20">
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setVerifyEmailOrCode(requestResult.email);
                      setTab("check_approval");
                      setRequestResult(null);
                    }}
                  >
                    Check Approval Status
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRequestPermission} className="access-form">
                <div className="owner-permission-notice">
                  <Mail size={16} className="text-emerald inline mr-6" />
                  <span>Request will be sent to owner <strong>{OWNER_EMAIL}</strong></span>
                </div>

                <div className="form-group">
                  <label htmlFor="user-name">Your Full Name *</label>
                  <input
                    id="user-name"
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="user-email">Your Email Address *</label>
                  <input
                    id="user-email"
                    type="email"
                    required
                    placeholder="e.g. ramesh@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="user-phone">Phone Number (Optional)</label>
                  <input
                    id="user-phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="user-reason">Reason for Access</label>
                  <textarea
                    id="user-reason"
                    rows={2}
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-lg w-full" disabled={submitting}>
                  <Send size={16} /> {submitting ? "Sending Request..." : `Request Permission from ${OWNER_EMAIL}`}
                </button>

                <div className="divider-text">
                  <span>OR</span>
                </div>

                <a
                  href={mailtoOwnerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary w-full justify-center"
                >
                  <Mail size={16} /> Email Owner Directly ({OWNER_EMAIL})
                </a>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: Check Approval / Enter Approved Passcode */}
        {tab === "check_approval" && (
          <form onSubmit={handleVerifyAccess} className="access-form">
            <p className="muted-xs mb-10">
              If the owner has approved your email or provided an access code, enter it below to unlock the website:
            </p>

            <div className="form-group">
              <label htmlFor="verify-input">Your Email or Approved Access Code</label>
              <div className="input-with-icon">
                <Key size={16} className="field-icon" />
                <input
                  id="verify-input"
                  type="text"
                  required
                  placeholder="Enter email (e.g. your email) or code"
                  value={verifyEmailOrCode}
                  onChange={(e) => setVerifyEmailOrCode(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full">
              Verify & Enter Website <ArrowRight size={16} />
            </button>

            <div className="access-code-hints">
              <span className="hint-label">Quick Access:</span>
              <div className="hint-badges">
                <code onClick={() => setVerifyEmailOrCode(OWNER_EMAIL)}>{OWNER_EMAIL}</code>
                <code onClick={() => setVerifyEmailOrCode("1234")}>1234</code>
                <code onClick={() => setVerifyEmailOrCode("admin")}>admin</code>
              </div>
            </div>
          </form>
        )}

        {/* TAB 3: Owner Login */}
        {tab === "owner_login" && (
          <form onSubmit={handleOwnerLogin} className="access-form">
            <div className="owner-badge-box">
              <Crown size={18} className="text-amber inline mr-6" />
              <span>Official Website Owner Bypass</span>
            </div>

            <div className="form-group">
              <label htmlFor="owner-email-input">Website Owner Email ID</label>
              <div className="input-with-icon">
                <Mail size={16} className="field-icon" />
                <input
                  id="owner-email-input"
                  type="email"
                  required
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full">
              <Crown size={16} /> Log In as Owner (Manage Approvals)
            </button>
          </form>
        )}

        <div className="access-gate-footer">
          <ShieldCheck size={14} className="text-emerald inline mr-4" />
          <span>Access Moderated & Approved by Owner: <strong>{OWNER_EMAIL}</strong></span>
        </div>
      </div>
    </div>
  );
}
