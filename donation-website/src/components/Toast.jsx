import React from "react";
import { DollarSign, CheckCircle2, Heart, X, Sparkles } from "lucide-react";

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-portal-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-card toast-${toast.type || "success"}`}>
          <div className="toast-icon-wrap">
            {toast.type === "money" ? (
              <div className="toast-money-glow">
                <DollarSign size={20} />
              </div>
            ) : toast.type === "contact" ? (
              <Heart size={20} className="text-emerald" />
            ) : (
              <CheckCircle2 size={20} className="text-emerald" />
            )}
          </div>

          <div className="toast-content">
            <div className="toast-title-row">
              <span className="toast-title">{toast.title}</span>
              <span className="toast-badge">{toast.badge || "Live"}</span>
            </div>
            <p className="toast-text">{toast.message}</p>
            {toast.amount && (
              <div className="toast-amount-pill">
                Amount: +₹{Number(toast.amount).toLocaleString("en-IN")}
              </div>
            )}
          </div>

          <button
            className="toast-close-btn"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss toast"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
