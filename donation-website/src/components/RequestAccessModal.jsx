import React, { useState } from "react";
import { X, Send, CheckCircle2, AlertCircle, Shield, Sparkles } from "lucide-react";
import API from "../config/api";

export default function RequestAccessModal({ isOpen, onClose, onRequestSubmitted }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "Interested in partner / volunteer access to HelpHands programs"
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Please provide both your full name and a valid email address.");
      return;
    }

    setSubmitting(true);
    const cleanEmail = formData.email.trim().toLowerCase();

    try {
      const res = await fetch(`${API}/permissions/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: cleanEmail,
          phone: formData.phone.trim(),
          reason: formData.reason.trim()
        })
      });

      const isJson = res.headers.get("content-type")?.includes("application/json");
      const data = isJson ? await res.json() : {};

      // Also persist to local queue for offline/fallback continuity
      const existingReqs = JSON.parse(localStorage.getItem("helphands_permission_requests") || "[]");
      const newReq = {
        _id: "req-" + Date.now(),
        name: formData.name.trim(),
        email: cleanEmail,
        phone: formData.phone.trim(),
        reason: formData.reason.trim(),
        status: "pending",
        createdAt: new Date().toISOString()
      };
      localStorage.setItem("helphands_permission_requests", JSON.stringify([newReq, ...existingReqs]));

      if (onRequestSubmitted) {
        onRequestSubmitted(newReq);
      }

      setSubmitted(true);
    } catch {
      // Local backup save
      const existingReqs = JSON.parse(localStorage.getItem("helphands_permission_requests") || "[]");
      const newReq = {
        _id: "req-" + Date.now(),
        name: formData.name.trim(),
        email: cleanEmail,
        phone: formData.phone.trim(),
        reason: formData.reason.trim(),
        status: "pending",
        createdAt: new Date().toISOString()
      };
      localStorage.setItem("helphands_permission_requests", JSON.stringify([newReq, ...existingReqs]));

      if (onRequestSubmitted) {
        onRequestSubmitted(newReq);
      }

      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setError("");
    setFormData({
      name: "",
      email: "",
      phone: "",
      reason: "Interested in partner / volunteer access to HelpHands programs"
    });
    onClose();
  };

  return (
    <div className="modal-backdrop-overlay" onClick={handleResetAndClose}>
      <div
        className="modal-card-dialog request-access-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="request-access-title"
      >
        <button
          className="modal-close-icon-btn"
          onClick={handleResetAndClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {!submitted ? (
          <div>
            <div className="modal-header-compact">
              <div className="modal-icon-pill bg-emerald-subtle">
                <Shield size={20} className="text-emerald" />
              </div>
              <h3 id="request-access-title">Request Partner Access</h3>
              <p className="muted-xs">
                Request elevated access for NGO coordinators, field volunteers, and institutional partners. Public campaigns and donations are always open to everyone.
              </p>
            </div>

            {error && (
              <div className="access-error-banner mt-12">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-15">
              <div className="form-group">
                <label className="field-label" htmlFor="req-name">
                  Full Name *
                </label>
                <input
                  id="req-name"
                  type="text"
                  required
                  placeholder="e.g. Priyanshu Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="field-label" htmlFor="req-email">
                  Email Address *
                </label>
                <input
                  id="req-email"
                  type="email"
                  required
                  placeholder="e.g. priyanshu@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="field-label" htmlFor="req-phone">
                  Phone / WhatsApp (Optional)
                </label>
                <input
                  id="req-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="field-label" htmlFor="req-reason">
                  Reason for Requesting Access
                </label>
                <textarea
                  id="req-reason"
                  rows={3}
                  required
                  placeholder="Please describe why you are requesting special access..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>

              <div className="flex-row gap-10 mt-20">
                <button
                  type="button"
                  className="btn btn-outline flex-1 justify-center"
                  onClick={handleResetAndClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 justify-center"
                  disabled={submitting}
                >
                  {submitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send size={15} /> Submit Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="success-icon-wrap mx-auto mb-15">
              <CheckCircle2 size={44} className="text-emerald" />
            </div>
            <h3>Request Submitted Successfully</h3>
            <p className="muted-sm mt-10 max-w-400 mx-auto">
              Thank you, <strong>{formData.name}</strong>. Your access request has been recorded in our system. Our administration team will review your application.
            </p>
            <p className="tiny-security-disclaimer text-emerald mt-10">
              ✓ All public donation campaigns and transparency records remain freely accessible.
            </p>

            <button
              className="btn btn-primary mt-20 justify-center w-full"
              onClick={handleResetAndClose}
            >
              Continue Browsing Campaigns
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
