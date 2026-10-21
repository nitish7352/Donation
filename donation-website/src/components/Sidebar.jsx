import React from "react";
import {
  Heart,
  Home,
  Layers,
  History,
  PhoneCall,
  KeyRound,
  X,
  ShieldCheck,
  Sparkles,
  Users,
  Gift
} from "lucide-react";

export default function Sidebar({
  isOpen,
  onClose,
  currentPage,
  onNavigate,
  onRequestAccessClick,
  onSelectCategory
}) {
  if (!isOpen) return null;

  return (
    <div className="sidebar-backdrop-overlay" onClick={onClose}>
      <aside
        className="sidebar-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        aria-label="Sidebar navigation"
      >
        {/* Sidebar Header */}
        <div className="sidebar-drawer-header">
          <div className="brand-logo">
            <div className="logo-heart-wrap">
              <Heart size={20} className="logo-heart-icon" />
            </div>
            <div className="brand-text">
              <span>Help</span>
              <span className="brand-accent">Hands.</span>
            </div>
          </div>

          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Body */}
        <div className="sidebar-drawer-body">
          {/* Main Navigation */}
          <div className="sidebar-section">
            <span className="sidebar-section-title">Navigation</span>
            <nav className="sidebar-nav-list">
              <button
                className={`sidebar-nav-item ${currentPage === "home" ? "active" : ""}`}
                onClick={() => {
                  onNavigate("home");
                  onClose();
                }}
              >
                <Home size={18} />
                <span>Home</span>
              </button>

              <button
                className={`sidebar-nav-item ${currentPage === "campaigns" ? "active" : ""}`}
                onClick={() => {
                  onNavigate("campaigns");
                  onClose();
                }}
              >
                <Layers size={18} />
                <span>Causes & Campaigns</span>
              </button>

              <button
                className={`sidebar-nav-item ${currentPage === "history" ? "active" : ""}`}
                onClick={() => {
                  onNavigate("history");
                  onClose();
                }}
              >
                <History size={18} />
                <span>Received History</span>
                <span className="sidebar-live-tag">Live</span>
              </button>

              <button
                className={`sidebar-nav-item ${currentPage === "contact" ? "active" : ""}`}
                onClick={() => {
                  onNavigate("contact");
                  onClose();
                }}
              >
                <PhoneCall size={18} />
                <span>Contact Us</span>
              </button>
            </nav>
          </div>

          {/* Key Humanitarian Focus */}
          <div className="sidebar-section mt-20">
            <span className="sidebar-section-title">Key Humanitarian Focus</span>
            <div className="sidebar-focus-list">
              <button
                className="sidebar-focus-item"
                onClick={() => {
                  if (onSelectCategory) onSelectCategory("Food");
                  onNavigate("campaigns");
                  onClose();
                }}
              >
                <Users size={16} className="text-amber" />
                <span>Helping Poor Families</span>
              </button>

              <button
                className="sidebar-focus-item"
                onClick={() => {
                  if (onSelectCategory) onSelectCategory("Social Welfare");
                  onNavigate("campaigns");
                  onClose();
                }}
              >
                <Gift size={16} className="text-rose" />
                <span>Marriage Support for Girls</span>
              </button>

              <button
                className="sidebar-focus-item"
                onClick={() => {
                  if (onSelectCategory) onSelectCategory("Education");
                  onNavigate("campaigns");
                  onClose();
                }}
              >
                <Sparkles size={16} className="text-blue" />
                <span>Child Education Support</span>
              </button>
            </div>
          </div>

          {/* Discreet Request Access Section (Requirement 2 & 4) */}
          <div className="sidebar-access-box mt-25">
            <div className="flex-row items-center gap-8 mb-6">
              <KeyRound size={16} className="text-emerald" />
              <strong className="sidebar-access-title">Partner & Coordinator</strong>
            </div>
            <p className="sidebar-access-desc">
              Request volunteer or field coordinator credentials to manage regional distributions.
            </p>
            <button
              className="btn-request-access-sidebar"
              onClick={() => {
                onClose();
                onRequestAccessClick();
              }}
            >
              Request Access →
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-drawer-footer">
          <div className="sidebar-trust-row">
            <ShieldCheck size={16} className="text-emerald" />
            <span>80G Tax Deductible • 100% Transparent</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
