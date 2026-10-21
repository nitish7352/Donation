import React, { useState, useEffect } from "react";
import {
  Users,
  DollarSign,
  TrendingUp,
  Mail,
  FileText,
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Crown,
  Trash2,
  UserCheck,
  Check,
  X,
  ExternalLink,
  Key,
  LogOut
} from "lucide-react";

import API from "../config/api";

export default function AdminPortal({
  campaigns,
  donations,
  contacts,
  isOwner,
  onClearHistory,
  onViewReceipt,
  onContactUser,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "donations" | "contacts" | "permissions"
  const [permissionRequests, setPermissionRequests] = useState(() => {
    const saved = localStorage.getItem("helphands_permission_requests");
    return saved
      ? JSON.parse(saved)
      : [
        {
          _id: "demo-req-1",
          name: "Nitish Kumar",
          email: "[EMAIL_ADDRESS]",
          phone: "+91 9999999998",
          reason: "I would like permission to browse campaigns and make a donation.",
          status: "pending",
          createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString()
        }
      ];
  });

  const getAdminHeaders = () => {
    const token = sessionStorage.getItem("helphands_admin_token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  // Fetch permission requests from server
  useEffect(() => {
    fetch(`${API}/permissions`, {
      headers: getAdminHeaders()
    })
      .then((r) => {
        if (!r.ok || !r.headers.get("content-type")?.includes("application/json")) {
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPermissionRequests(data);
          localStorage.setItem("helphands_permission_requests", JSON.stringify(data));
        }
      })
      .catch(() => { });
  }, []);

  const handleApprove = (req) => {
    const generatedCode = "ACC-" + Math.floor(100000 + Math.random() * 900000);
    fetch(`${API}/permissions/${req._id}`, {
      method: "PATCH",
      headers: getAdminHeaders(),
      body: JSON.stringify({ status: "approved" })
    }).catch(() => { });

    setPermissionRequests((prev) => {
      const updated = prev.map((r) =>
        r._id === req._id || r.email === req.email
          ? { ...r, status: "approved", accessCode: generatedCode }
          : r
      );
      localStorage.setItem("helphands_permission_requests", JSON.stringify(updated));
      return updated;
    });
  };

  const handleReject = (req) => {
    fetch(`${API}/permissions/${req._id}`, {
      method: "PATCH",
      headers: getAdminHeaders(),
      body: JSON.stringify({ status: "rejected" })
    }).catch(() => { });

    setPermissionRequests((prev) => {
      const updated = prev.map((r) =>
        r._id === req._id || r.email === req.email ? { ...r, status: "rejected" } : r
      );
      localStorage.setItem("helphands_permission_requests", JSON.stringify(updated));
      return updated;
    });
  };

  const getApprovalMailto = (req) => {
    return `mailto:${req.email}?subject=${encodeURIComponent(
      "Access Request Approved - HelpHands Platform"
    )}&body=${encodeURIComponent(
      `Hello ${req.name},\n\nYour access request for HelpHands has been approved by the administration team.\n\nYou can now visit the website and use your approved access code: ${req.accessCode || "ACC-APPROVED"}.\n\nWarm regards,\nHelpHands Foundation\ncontact@helphands.org`
    )}`;
  };

  const totalCollected = campaigns.reduce((s, c) => s + (c.collectedAmount || 0), 0);
  const totalDonationsCount = donations.length;
  const unreadInquiries = contacts.filter((c) => c.status === "unread").length;
  const pendingPermissions = permissionRequests.filter((p) => p.status === "pending").length;

  return (
    <div className="admin-portal-wrapper">
      <div className="admin-header-row">
        <div>
          <div className="flex-row items-center gap-8 mb-4">
            <span className="eyebrow">Platform Management</span>
            <span className="owner-badge-tag">
              <ShieldCheck size={12} className="text-emerald inline mr-4" /> Secure Admin Console
            </span>
          </div>
          <h2>Admin & Organizer Portal</h2>
          <p className="muted">
            Authenticated administrator session. Review & approve user access requests, monitor real-time donations, and manage platform records.
          </p>
        </div>

        <div className="flex-row items-center gap-10 flex-wrap">
          {onLogout && (
            <button
              className="btn btn-secondary-sm"
              onClick={onLogout}
              title="End Administrator Session"
            >
              <LogOut size={13} /> Log Out
            </button>
          )}

          {donations.length > 0 && onClearHistory && (
            <button
              className="btn-clear-history"
              onClick={onClearHistory}
              title="Remove all previous transaction history"
            >
              <Trash2 size={13} /> Clear Previous History
            </button>
          )}

          {/* Tab switcher */}
          <div className="admin-tabs-pill">
            <button
              className={`admin-tab-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`admin-tab-btn ${activeTab === "permissions" ? "active" : ""}`}
              onClick={() => setActiveTab("permissions")}
            >
              <UserCheck size={13} /> Permission Requests ({permissionRequests.length})
              {pendingPermissions > 0 && <span className="tab-badge">{pendingPermissions} new</span>}
            </button>
            <button
              className={`admin-tab-btn ${activeTab === "donations" ? "active" : ""}`}
              onClick={() => setActiveTab("donations")}
            >
              Donations ({donations.length})
            </button>
            <button
              className={`admin-tab-btn ${activeTab === "contacts" ? "active" : ""}`}
              onClick={() => setActiveTab("contacts")}
            >
              User Inquiries ({contacts.length})
              {unreadInquiries > 0 && <span className="tab-badge">{unreadInquiries}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Top Stats Overview */}
      <div className="stats-metric-grid">
        <div className="metric-card">
          <div className="metric-icon-box bg-emerald-subtle">
            <DollarSign size={24} className="text-emerald" />
          </div>
          <div>
            <span className="metric-label">Total Funds Raised</span>
            <strong className="metric-value">₹{totalCollected.toLocaleString("en-IN")}</strong>
            <span className="metric-sub text-success">Verified donations</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box bg-blue-subtle">
            <UserCheck size={24} className="text-blue" />
          </div>
          <div>
            <span className="metric-label">Access Requests</span>
            <strong className="metric-value">{permissionRequests.length}</strong>
            <span className="metric-sub">{pendingPermissions} awaiting owner approval</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box bg-amber-subtle">
            <Users size={24} className="text-amber" />
          </div>
          <div>
            <span className="metric-label">Recorded Donors</span>
            <strong className="metric-value">{totalDonationsCount}</strong>
            <span className="metric-sub">Supporters engaged</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box bg-purple-subtle">
            <Mail size={24} className="text-purple" />
          </div>
          <div>
            <span className="metric-label">User Inquiries</span>
            <strong className="metric-value">{contacts.length}</strong>
            <span className="metric-sub">{unreadInquiries} pending reply</span>
          </div>
        </div>
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="admin-two-column-grid">
          {/* Recent Permission Requests */}
          <div className="admin-card-section">
            <div className="card-section-head">
              <h4>Pending Access Permissions</h4>
              <button className="link-action-sm" onClick={() => setActiveTab("permissions")}>
                View All ({permissionRequests.length}) →
              </button>
            </div>

            <div className="recent-list-compact">
              {permissionRequests.slice(0, 4).map((p) => (
                <div key={p._id} className="compact-contact-row">
                  <div className="contact-meta-row">
                    <strong>{p.name}</strong>
                    <span
                      className={`status-pill-xs ${p.status === "approved"
                        ? "status-pill-success"
                        : p.status === "rejected"
                          ? "status-pill-danger"
                          : "status-pill-warning"
                        }`}
                    >
                      {p.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="contact-msg-snippet">{p.email} • "{p.reason}"</p>
                  <div className="flex-row gap-6 mt-6 justify-end">
                    {p.status !== "approved" ? (
                      <button
                        className="btn-tiny btn-tiny-emerald"
                        onClick={() => handleApprove(p)}
                      >
                        <Check size={11} /> Approve
                      </button>
                    ) : (
                      <a
                        href={getApprovalMailto(p)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-tiny"
                      >
                        <Mail size={11} /> Email Approval
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Messages Received */}
          <div className="admin-card-section">
            <div className="card-section-head">
              <h4>Incoming User Inquiries</h4>
              <button className="link-action-sm" onClick={() => setActiveTab("contacts")}>
                View All ({contacts.length}) →
              </button>
            </div>

            <div className="recent-list-compact">
              {contacts.slice(0, 4).map((cnt) => (
                <div key={cnt._id} className="compact-contact-row">
                  <div className="contact-meta-row">
                    <strong>{cnt.name}</strong>
                    <span className="contact-subject-tag">{cnt.subject}</span>
                  </div>
                  <p className="contact-msg-snippet">"{cnt.message}"</p>
                  <div className="contact-action-row">
                    <span className="muted-xs">{cnt.email}</span>
                    <button
                      className="btn-pill-xs"
                      onClick={() => onContactUser && onContactUser(cnt)}
                    >
                      <Mail size={12} /> Reply to User
                    </button>
                  </div>
                </div>
              ))}
              {contacts.length === 0 && (
                <div className="empty-state-card">
                  <p className="muted">No user inquiries received yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. PERMISSION REQUESTS TAB */}
      {activeTab === "permissions" && (
        <div className="ledger-card-wrapper">
          <div className="ledger-table-header">
            <div>
              <h3>User Permission Requests to Owner ({permissionRequests.length})</h3>
              <p className="muted-xs">
                Users requesting permission from {OWNER_EMAIL} to access and use the platform
              </p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Contact Info</th>
                  <th>Reason / Purpose</th>
                  <th>Requested Date</th>
                  <th>Status</th>
                  <th className="text-right">Owner Actions</th>
                </tr>
              </thead>
              <tbody>
                {permissionRequests.map((req) => (
                  <tr key={req._id}>
                    <td>
                      <strong>{req.name}</strong>
                    </td>
                    <td>
                      <div>{req.email}</div>
                      {req.phone && <div className="muted-xs">{req.phone}</div>}
                    </td>
                    <td>
                      <p className="donor-note-snippet">{req.reason || "General browsing and donation"}</p>
                    </td>
                    <td className="muted-xs">
                      {req.createdAt ? new Date(req.createdAt).toLocaleString("en-IN") : "Recent"}
                    </td>
                    <td>
                      <span
                        className={`status-pill-xs ${req.status === "approved"
                          ? "status-pill-success"
                          : req.status === "rejected"
                            ? "status-pill-danger"
                            : "status-pill-warning"
                          }`}
                      >
                        {req.status === "approved"
                          ? "✓ Approved"
                          : req.status === "rejected"
                            ? "✗ Rejected"
                            : "⏳ Pending"}
                      </span>
                      {req.accessCode && (
                        <div className="mt-4">
                          <code className="mono-text">{req.accessCode}</code>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="row-actions justify-end">
                        {req.status !== "approved" ? (
                          <button
                            className="btn-action-contact"
                            onClick={() => handleApprove(req)}
                          >
                            <Check size={13} /> Grant Permission
                          </button>
                        ) : (
                          <a
                            href={getApprovalMailto(req)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-action-receipt"
                            title="Send confirmation email to user"
                          >
                            <Mail size={13} /> Send Email
                          </a>
                        )}

                        {req.status !== "rejected" && (
                          <button
                            className="btn-tiny text-danger"
                            onClick={() => handleReject(req)}
                            title="Revoke Permission"
                          >
                            <X size={13} /> Revoke
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {permissionRequests.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-30 muted">
                      No user permission requests received yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. DONATIONS TAB */}
      {activeTab === "donations" && (
        <div className="ledger-card-wrapper">
          <div className="ledger-table-header">
            <h3>Received Donations List ({donations.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Email</th>
                  <th>Campaign</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Payment Mode</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d._id}>
                    <td><strong>{d.donorName}</strong></td>
                    <td className="muted-sm">{d.email || "—"}</td>
                    <td>{d.campaignTitle || d.campaign?.title || "Campaign"}</td>
                    <td><strong className="text-emerald">+₹{Number(d.amount).toLocaleString("en-IN")}</strong></td>
                    <td className="muted-xs">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "Recent"}</td>
                    <td><span className="payment-mode-pill">{d.paymentMode || "Online"}</span></td>
                    <td>
                      <div className="row-actions justify-end">
                        <button className="btn-action-receipt" onClick={() => onViewReceipt(d)}>
                          <FileText size={13} /> Receipt
                        </button>
                        <button className="btn-action-contact" onClick={() => onContactUser(d)}>
                          <Mail size={13} /> Contact
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {donations.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-30 muted">
                      Previous history removed. Ledger is clean and ready for new live donations.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. USER INQUIRIES TAB */}
      {activeTab === "contacts" && (
        <div className="ledger-card-wrapper">
          <div className="ledger-table-header">
            <h3>User Messages & Inquiries ({contacts.length})</h3>
            <span className="muted-xs">Submitted via website contact form</span>
          </div>

          <div className="contacts-table-wrap">
            {contacts.map((cnt) => (
              <div key={cnt._id} className="user-inquiry-card">
                <div className="inquiry-card-top">
                  <div className="flex-row items-center gap-10">
                    <div className="donor-avatar">{cnt.name?.[0] || "U"}</div>
                    <div>
                      <strong>{cnt.name}</strong>
                      <span className="user-inquiry-email">({cnt.email} {cnt.phone ? `• ${cnt.phone}` : ""})</span>
                    </div>
                  </div>
                  <div className="flex-row items-center gap-8">
                    <span className="subject-pill">{cnt.subject}</span>
                    <button
                      className="btn btn-secondary-sm"
                      onClick={() => onContactUser(cnt)}
                    >
                      <Mail size={14} /> Reply / Email User
                    </button>
                  </div>
                </div>

                <div className="inquiry-message-body">
                  <p>{cnt.message}</p>
                </div>

                <div className="inquiry-card-bottom">
                  <span className="muted-xs">
                    <Clock size={12} className="inline mr-4" />
                    {cnt.createdAt ? new Date(cnt.createdAt).toLocaleString("en-IN") : "Recently"}
                  </span>
                  <span className="status-badge-verified">
                    <CheckCircle2 size={12} /> Logged
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
