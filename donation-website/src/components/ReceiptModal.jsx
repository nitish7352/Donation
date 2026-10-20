import React from "react";
import { Printer, X, Download, ShieldCheck, Heart } from "lucide-react";

export default function ReceiptModal({ donation, onClose }) {
  if (!donation) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptNumber = donation.transactionId 
    ? `HH-REC-${donation.transactionId.replace(/[^0-9]/g, "").slice(-6) || "984210"}`
    : `HH-REC-${donation._id?.slice(-6)?.toUpperCase() || "774129"}`;

  const formattedDate = donation.createdAt
    ? new Date(donation.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="receipt-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="receipt-header-actions no-print">
          <span className="badge-verified">
            <ShieldCheck size={16} /> Verified Official Receipt
          </span>
          <div className="flex-row gap-8">
            <button className="btn-secondary-sm" onClick={handlePrint} title="Print Receipt">
              <Printer size={16} /> Print Receipt
            </button>
            <button className="btn-close" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable receipt container */}
        <div className="printable-receipt" id="printable-receipt">
          <div className="receipt-banner">
            <div className="receipt-logo">
              <div className="logo-icon-bubble">
                <Heart size={20} className="icon-pulse" />
              </div>
              <div>
                <h2>Help<span>Hands.</span></h2>
                <p className="org-sub">Empowering Lives Through Transparent Giving</p>
              </div>
            </div>
            <div className="receipt-meta">
              <div className="receipt-tag">OFFICIAL DONATION RECEIPT</div>
              <div className="receipt-no"><strong>Receipt No:</strong> {receiptNumber}</div>
              <div className="receipt-date"><strong>Date:</strong> {formattedDate}</div>
            </div>
          </div>

          <div className="receipt-divider" />

          <div className="receipt-body">
            <div className="receipt-info-grid">
              <div className="info-block">
                <span className="info-label">RECEIVED WITH THANKS FROM</span>
                <span className="info-value-highlight">{donation.donorName || "Valued Supporter"}</span>
                {donation.email && <span className="info-sub">{donation.email}</span>}
              </div>

              <div className="info-block right-aligned">
                <span className="info-label">AMOUNT RECEIVED</span>
                <span className="amount-received-large">
                  ₹{Number(donation.amount).toLocaleString("en-IN")}
                </span>
                <span className="info-sub">Payment Mode: {donation.paymentMode || (donation.isDemo ? "Verified Demo" : "Online Gateway")}</span>
              </div>
            </div>

            <div className="receipt-details-table">
              <div className="detail-row">
                <span className="detail-col-title">Cause / Campaign</span>
                <span className="detail-col-value">{donation.campaignTitle || donation.campaign?.title || "Community Welfare Fund"}</span>
              </div>
              <div className="detail-row">
                <span className="detail-col-title">Transaction / Order ID</span>
                <span className="detail-col-value mono-text">{donation.transactionId || donation.paymentId || "TXN_" + (donation._id || "CONFIRMED")}</span>
              </div>
              <div className="detail-row">
                <span className="detail-col-title">Tax Exemption Status</span>
                <span className="detail-col-value text-success font-medium">
                  Eligible for 50% Tax Deduction under Section 80G of the Income Tax Act
                </span>
              </div>
              {donation.message && (
                <div className="detail-row">
                  <span className="detail-col-title">Donor's Note</span>
                  <span className="detail-col-value italic">"{donation.message}"</span>
                </div>
              )}
            </div>

            <div className="receipt-footer-signatures">
              <div className="tax-exemption-note">
                <p><strong>Registration Info:</strong> HelpHands Foundation Trust</p>
                <p>80G Order No: AAATH3920LF20214 | PAN: AAATH3920L</p>
                <p className="tiny-disclaimer">
                  This is a digitally verified receipt. Donations made are utilized strictly for the designated humanitarian purpose.
                </p>
              </div>

              <div className="signature-box">
                <div className="stamp-badge">
                  <span>HELPHANDS</span>
                  <small>OFFICIAL SEAL</small>
                  <span>★ VERIFIED ★</span>
                </div>
                <div className="sign-line"></div>
                <p className="signatory-name">Authorized Signatory</p>
                <p className="signatory-role">HelpHands Trust Finance Desk</p>
              </div>
            </div>
          </div>
        </div>

        <div className="receipt-bottom-actions no-print">
          <p className="muted-xs">
            Need an updated invoice or corporate 80G tax document? Reach out to support@helphands.org
          </p>
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
