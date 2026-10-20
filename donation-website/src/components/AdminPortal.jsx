import React, { useState } from "react";
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
  Trash2
} from "lucide-react";

export default function AdminPortal({
  campaigns,
  donations,
  contacts,
  isOwner,
  onClearHistory,
  onViewReceipt,
  onContactUser
}) {
  const [activeTab, setActiveTab] = useState("overview");

  const totalCollected = campaigns.reduce((s, c) => s + (c.collectedAmount || 0), 0);
  const totalDonationsCount = donations.length;
  const unreadInquiries = contacts.filter((c) => c.status === "unread").length;

  return (
    <div className="admin-portal-wrapper">
      <div className="admin-header-row">
        <div>
          <div className="flex-row items-center gap-8 mb-4">
            <span className="eyebrow">Platform Management</span>
            <span className="owner-badge-tag">
              <Crown size={12} className="text-amber inline mr-4" /> Owner: aky952372@gmail.com
            </span>
          </div>
          <h2>Admin & Organizer Portal</h2>
          <p className="muted">
            Logged in as authorized owner. Monitor real-time donations, clear previous history, and communicate directly with website users.
          </p>
        </div>

        <div className="flex-row items-center gap-10 flex-wrap">
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
            <TrendingUp size={24} className="text-blue" />
          </div>
          <div>
            <span className="metric-label">Active Campaigns</span>
            <strong className="metric-value">{campaigns.length}</strong>
            <span className="metric-sub">Ongoing causes</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box bg-amber-subtle">
            <Users size={24} className="text-amber" />
          </div>
          <div>
            <span className="metric-label">Registered Donors</span>
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

      {/* Overview tab */}
      {activeTab === "overview" && (
        <div className="admin-two-column-grid">
          {/* Recent Money Received */}
          <div className="admin-card-section">
            <div className="card-section-head">
              <h4>Recent Money Received</h4>
              <button className="link-action-sm" onClick={() => setActiveTab("donations")}>
                View All →
              </button>
            </div>

            <div className="recent-list-compact">
              {donations.slice(0, 5).map((d) => (
                <div key={d._id} className="compact-donation-row">
                  <div className="flex-row items-center gap-10">
                    <div className="compact-avatar">{d.donorName?.[0] || "D"}</div>
                    <div>
                      <strong>{d.donorName}</strong>
                      <p className="muted-xs">{d.campaignTitle || d.campaign?.title || "Campaign"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="compact-amount">+₹{Number(d.amount).toLocaleString("en-IN")}</span>
                    <div className="flex-row gap-6 mt-4 justify-end">
                      <button
                        className="btn-tiny"
                        onClick={() => onViewReceipt && onViewReceipt(d)}
                        title="View Official Receipt"
                      >
                        Receipt
                      </button>
                      <button
                        className="btn-tiny btn-tiny-emerald"
                        onClick={() => onContactUser && onContactUser(d)}
                        title="Message this donor"
                      >
                        Message
                      </button>
                    </div>
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

      {/* Donations tab */}
      {activeTab === "donations" && (
        <div className="ledger-card-wrapper">
          <div className="ledger-table-header">
            <h3>Full Received Donations List ({donations.length})</h3>
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
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Contacts tab */}
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
