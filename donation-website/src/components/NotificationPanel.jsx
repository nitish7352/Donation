import React, { useState } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  DollarSign,
  TrendingUp,
  Mail,
  Sparkles,
  X,
  ExternalLink
} from "lucide-react";

export default function NotificationPanel({
  notifications,
  isOpen,
  onClose,
  onMarkAllAsRead,
  onClearAll,
  onSelectNotification,
  onSimulateIncomingDonation
}) {
  const [filter, setFilter] = useState("all");

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "money") return n.type === "money";
    if (filter === "messages") return n.type === "contact";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="notif-dropdown-wrapper" onClick={(e) => e.stopPropagation()}>
      <div className="notif-panel-header">
        <div className="notif-title-row">
          <div className="flex-row items-center gap-8">
            <div className="bell-glow-icon">
              <Bell size={18} />
            </div>
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <span className="notif-unread-pill">{unreadCount} new</span>
            )}
          </div>
          <button className="btn-icon-ghost" onClick={onClose} aria-label="Close notifications">
            <X size={18} />
          </button>
        </div>

        {/* Filter chips */}
        <div className="notif-filter-bar">
          <button
            className={`notif-filter-chip ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({notifications.length})
          </button>
          <button
            className={`notif-filter-chip ${filter === "money" ? "active" : ""}`}
            onClick={() => setFilter("money")}
          >
            💰 Money Received
          </button>
          <button
            className={`notif-filter-chip ${filter === "messages" ? "active" : ""}`}
            onClick={() => setFilter("messages")}
          >
            ✉️ Messages
          </button>
        </div>
      </div>

      <div className="notif-list-container">
        {filteredNotifications.length === 0 ? (
          <div className="notif-empty-state">
            <Sparkles size={32} className="text-muted" />
            <p>No notifications in this filter.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`notif-item ${notif.read ? "read" : "unread"}`}
              onClick={() => onSelectNotification && onSelectNotification(notif)}
            >
              <div className={`notif-type-icon notif-${notif.type}`}>
                {notif.type === "money" && <DollarSign size={16} />}
                {notif.type === "milestone" && <TrendingUp size={16} />}
                {notif.type === "contact" && <Mail size={16} />}
              </div>

              <div className="notif-item-body">
                <div className="notif-item-top">
                  <span className="notif-item-title">{notif.title}</span>
                  <span className="notif-item-time">{notif.time || "Just now"}</span>
                </div>
                <p className="notif-item-msg">{notif.message}</p>
                {notif.amount && (
                  <span className="notif-amount-badge">
                    +₹{Number(notif.amount).toLocaleString("en-IN")} received
                  </span>
                )}
              </div>

              {!notif.read && <span className="notif-dot" title="Unread" />}
            </div>
          ))
        )}
      </div>

      <div className="notif-panel-footer">
        <div className="flex-row gap-8">
          <button
            className="notif-footer-btn"
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck size={14} /> Mark all read
          </button>
          <button
            className="notif-footer-btn text-danger"
            onClick={onClearAll}
            disabled={notifications.length === 0}
          >
            <Trash2 size={14} /> Clear
          </button>
        </div>

        <button
          className="notif-test-btn"
          onClick={onSimulateIncomingDonation}
          title="Simulate receiving real-time funds"
        >
          <Sparkles size={13} /> Trigger Test Alert
        </button>
      </div>
    </div>
  );
}
