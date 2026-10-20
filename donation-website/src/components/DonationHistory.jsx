import React, { useState } from "react";
import {
  Search,
  Filter,
  DollarSign,
  Calendar,
  FileText,
  Mail,
  ShieldCheck,
  TrendingUp,
  Award,
  ArrowUpDown,
  Download,
  Users,
  Trash2,
  Crown
} from "lucide-react";

export default function DonationHistory({
  donations,
  isOwner,
  onClearHistory,
  onViewReceipt,
  onContactDonor
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Calculate live statistics
  const totalAmount = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const totalCount = donations.length;
  const avgDonation = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;
  const topDonation = donations.reduce((max, d) => Math.max(max, Number(d.amount) || 0), 0);

  // Filter & Search logic
  const filteredDonations = donations
    .filter((d) => {
      const matchSearch =
        d.donorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.campaignTitle || d.campaign?.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.transactionId || "").toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      if (filterType === "high") return Number(d.amount) >= 2500;
      if (filterType === "demo") return d.isDemo || d.status === "demo";
      if (filterType === "online") return !d.isDemo && d.status !== "demo";

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "highest") {
        return (Number(b.amount) || 0) - (Number(a.amount) || 0);
      }
      // default newest
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

  const getInitials = (name) => {
    if (!name) return "D";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const formatDate = (isoString) => {
    if (!isoString) return "Recently";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="section-history-wrapper">
      {/* Header Banner */}
      <div className="history-hero-banner">
        <div className="history-hero-text">
          <span className="eyebrow">Real-Time Transparency Ledger</span>
          <h2>Money Received History</h2>
          <p className="muted">
            Every rupee received is publicly tracked with complete accountability.
            View live donations, verify transactions, download official 80G tax receipts, and connect with donors.
          </p>
        </div>
        <div className="ledger-badge-chip">
          <ShieldCheck size={20} className="text-emerald" />
          <span>100% Audited & Verified Records</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-metric-grid">
        <div className="metric-card">
          <div className="metric-icon-box bg-emerald-subtle">
            <DollarSign size={24} className="text-emerald" />
          </div>
          <div>
            <span className="metric-label">Total Funds Received</span>
            <strong className="metric-value">₹{totalAmount.toLocaleString("en-IN")}</strong>
            <span className="metric-sub text-success">↑ Across all campaigns</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box bg-blue-subtle">
            <Users size={24} className="text-blue" />
          </div>
          <div>
            <span className="metric-label">Total Received Transactions</span>
            <strong className="metric-value">{totalCount}</strong>
            <span className="metric-sub">Contributions recorded</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box bg-amber-subtle">
            <TrendingUp size={24} className="text-amber" />
          </div>
          <div>
            <span className="metric-label">Average Contribution</span>
            <strong className="metric-value">₹{avgDonation.toLocaleString("en-IN")}</strong>
            <span className="metric-sub">Per donor</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box bg-purple-subtle">
            <Award size={24} className="text-purple" />
          </div>
          <div>
            <span className="metric-label">Highest Single Grant</span>
            <strong className="metric-value">₹{topDonation.toLocaleString("en-IN")}</strong>
            <span className="metric-sub">Largest contribution</span>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Filter */}
      <div className="history-controls-bar">
        <div className="search-box-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by donor name, campaign, or transaction ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search-btn" onClick={() => setSearchTerm("")}>
              ✕
            </button>
          )}
        </div>

        <div className="filters-group">
          <div className="filter-select-wrapper">
            <Filter size={16} className="select-icon" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="custom-select"
            >
              <option value="all">All Transactions</option>
              <option value="high">Major Grants (₹2,500+)</option>
              <option value="online">Online Payment Gateway</option>
              <option value="demo">Verified Demo Donations</option>
            </select>
          </div>

          <div className="filter-select-wrapper">
            <ArrowUpDown size={16} className="select-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="custom-select"
            >
              <option value="newest">Newest First</option>
              <option value="highest">Highest Amount First</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Ledger Table */}
      <div className="ledger-card-wrapper">
        <div className="ledger-table-header">
          <div>
            <h3>Received Donations Ledger ({filteredDonations.length})</h3>
            <span className="muted-xs">Showing real-time records updated automatically</span>
          </div>

          <div className="flex-row items-center gap-8">
            {isOwner && (
              <span className="owner-badge-tag">
                <Crown size={12} className="text-amber inline mr-4" /> Owner
              </span>
            )}
            {donations.length > 0 && onClearHistory && (
              <button
                className="btn-clear-history"
                onClick={onClearHistory}
                title="Remove all previous transaction history"
              >
                <Trash2 size={13} /> Clear History
              </button>
            )}
          </div>
        </div>

        {filteredDonations.length === 0 ? (
          <div className="empty-ledger-view">
            <p>No transactions match your current search criteria.</p>
            <button className="btn btn-secondary-sm mt-10" onClick={() => { setSearchTerm(""); setFilterType("all"); }}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Donor Details</th>
                  <th>Campaign Supported</th>
                  <th>Amount Received</th>
                  <th>Date & Time</th>
                  <th>Payment Mode</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((item) => {
                  const campaignTitle = item.campaignTitle || item.campaign?.title || "Community Welfare Fund";
                  const isLarge = Number(item.amount) >= 5000;

                  return (
                    <tr key={item._id} className={isLarge ? "highlight-row" : ""}>
                      {/* Donor */}
                      <td>
                        <div className="donor-cell">
                          <div className={`donor-avatar ${isLarge ? "avatar-gold" : ""}`}>
                            {getInitials(item.donorName)}
                          </div>
                          <div>
                            <div className="donor-name-row">
                              <strong>{item.donorName || "Anonymous"}</strong>
                              {isLarge && <span className="top-donor-badge">★ Top Supporter</span>}
                            </div>
                            {item.email && <span className="donor-email">{item.email}</span>}
                            {item.message && (
                              <p className="donor-note-snippet">
                                💬 "{item.message}"
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Campaign */}
                      <td>
                        <div className="campaign-cell">
                          <span className="campaign-link-text">{campaignTitle}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td>
                        <div className="amount-received-cell">
                          <span className="amount-plus-tag">+₹{Number(item.amount).toLocaleString("en-IN")}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td>
                        <div className="date-cell">
                          <Calendar size={13} className="text-muted" />
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                      </td>

                      {/* Payment Mode */}
                      <td>
                        <span className="payment-mode-pill">
                          {item.paymentMode || (item.isDemo ? "Verified Demo" : "Razorpay Online")}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span className="status-badge-verified">
                          <ShieldCheck size={13} />
                          {item.status === "successful" ? "Received" : item.status === "demo" ? "Recorded" : "Confirmed"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="row-actions">
                          <button
                            className="btn-action-receipt"
                            onClick={() => onViewReceipt && onViewReceipt(item)}
                            title="Generate Official 80G Receipt"
                          >
                            <FileText size={14} /> Receipt
                          </button>

                          <button
                            className="btn-action-contact"
                            onClick={() => onContactDonor && onContactDonor(item)}
                            title="Contact or Send Thank You Message to this User"
                          >
                            <Mail size={14} /> Contact
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
