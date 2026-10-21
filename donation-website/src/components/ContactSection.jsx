import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  Users,
  ExternalLink
} from "lucide-react";

export default function ContactSection({ onContactSubmitted, onOpenContactUserModal, recentDonors }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      if (onContactSubmitted) {
        onContactSubmitted({
          ...formData,
          createdAt: new Date().toISOString()
        });
      }
    }, 500);
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "General Inquiry",
      message: ""
    });
    setSubmitted(false);
  };

  const faqs = [
    {
      q: "How soon do I receive my 80G Tax Exemption Receipt?",
      a: "Official 80G Tax deduction receipts are generated immediately upon donation completion. You can download or print your receipt directly from the Money Received History page anytime."
    },
    {
      q: "Can I contact a donor or campaign organizer directly?",
      a: "Yes! Use the 'Contact Donor' action in the Received History ledger or the user contact form below to reach out directly to organizers or past supporters."
    },
    {
      q: "Are donations safe and transparent?",
      a: "Yes, 100% of donations are logged publicly on our live ledger with cryptographic Razorpay order verification and bank settlement confirmation."
    },
    {
      q: "What payment methods are supported?",
      a: "We support UPI (Google Pay, PhonePe, Paytm), Credit/Debit cards (Visa, MasterCard, RuPay), Net Banking across 50+ banks, and instant simulated demo transactions for testing."
    }
  ];

  return (
    <div className="contact-page-wrapper">
      {/* Header */}
      <div className="contact-hero-banner">
        <span className="eyebrow">Direct Assistance & Inquiries</span>
        <h2>Contact Us & Community Helpdesk</h2>
        <p className="muted">
          Have questions about campaigns, need tax receipt support, or want to connect with campaign organizers?
          We are here for you 24/7.
        </p>
      </div>

      <div className="contact-layout-grid">
        {/* Left Side: Contact Form */}
        <div className="contact-form-card">
          <div className="form-card-header">
            <div className="icon-circle-emerald">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3>Send Us a Message</h3>
              <p className="muted-xs">Our team typically responds in under 2 hours.</p>
            </div>
          </div>

          {submitted ? (
            <div className="contact-success-box">
              <CheckCircle2 size={48} className="text-emerald" />
              <h4>Message Received Successfully!</h4>
              <p className="muted">
                Thank you, <strong>{formData.name}</strong>. A confirmation email and notification have been logged. Our coordinator will contact you at <strong>{formData.email}</strong> shortly.
              </p>
              <button className="btn btn-secondary-sm mt-15" onClick={handleReset}>
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-inner-form">
              <div className="form-two-col">
                <div className="form-group">
                  <label htmlFor="cnt-name">Your Full Name *</label>
                  <input
                    id="cnt-name"
                    type="text"
                    required
                    placeholder="e.g. Nitish Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cnt-email">Email Address *</label>
                  <input
                    id="cnt-email"
                    type="email"
                    required
                    placeholder="e.g. nitish@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-two-col">
                <div className="form-group">
                  <label htmlFor="cnt-phone">Phone Number</label>
                  <input
                    id="cnt-phone"
                    type="tel"
                    placeholder="+91 7352097919"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cnt-subject">Inquiry Subject</label>
                  <select
                    id="cnt-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="80G Tax Exemption Receipt">80G Tax Exemption Receipt</option>
                    <option value="Start a Campaign">Start a Fundraiser / Campaign</option>
                    <option value="Volunteer with HelpHands">Volunteer with HelpHands</option>
                    <option value="Direct Donor Assistance">Contact a Donor or Organizer</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="cnt-message">Your Message *</label>
                <textarea
                  id="cnt-message"
                  rows={4}
                  required
                  placeholder="How can we assist you today? Let us know the details..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                <Send size={16} /> {loading ? "Sending..." : "Submit Inquiry"}
              </button>
            </form>
          )}
        </div>

        {/* Right Side: Contact Information & Quick Connect */}
        <div className="contact-info-column">
          <div className="info-card-block">
            <h4>HelpHands Foundation Secretariat</h4>
            <p className="muted-sm">
              Registered Non-Profit NGO under Indian Trusts Act, 1882.
            </p>

            <div className="contact-details-list">
              <div className="contact-detail-item">
                <Phone size={18} className="text-emerald" />
                <div>
                  <strong>Helpline / WhatsApp</strong>
                  <p>+91 (011) 4920-8800 / +91 7352097919</p>
                </div>
              </div>

              <div className="contact-detail-item">
                <Mail size={18} className="text-emerald" />
                <div>
                  <strong>Support & Inquiries</strong>
                  <p>aky952372@gmail.com</p>
                </div>
              </div>

              <div className="contact-detail-item">
                <MapPin size={18} className="text-emerald" />
                <div>
                  <strong>Registered Office</strong>
                  <p>Pandit Pur , Chhapra, Bihar 841224</p>
                </div>
              </div>

              <div className="contact-detail-item">
                <Clock size={18} className="text-emerald" />
                <div>
                  <strong>Operating Hours</strong>
                  <p>Monday – Saturday: 9:00 AM – 7:30 PM IST</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Connect with Website Donors / Users */}
          {recentDonors && recentDonors.length > 0 && (
            <div className="community-connect-card">
              <div className="flex-row items-center gap-8 mb-10">
                <Users size={18} className="text-emerald" />
                <h5>Connect with Recent Supporters</h5>
              </div>
              <p className="muted-xs">
                Reach out or send appreciation to active supporters in our community.
              </p>
              <div className="supporter-quick-list">
                {recentDonors.slice(0, 3).map((donor) => (
                  <div key={donor._id} className="supporter-row">
                    <div>
                      <span className="supporter-name">{donor.donorName}</span>
                      <span className="supporter-camp">{donor.campaignTitle || "Supporter"}</span>
                    </div>
                    <button
                      className="btn-pill-xs"
                      onClick={() => onOpenContactUserModal && onOpenContactUserModal(donor)}
                    >
                      <Mail size={12} /> Message
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="contact-faq-section">
        <div className="faq-heading">
          <HelpCircle size={22} className="text-emerald" />
          <h3>Frequently Asked Questions</h3>
        </div>
        <div className="faq-grid">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`faq-card ${activeFaq === idx ? "expanded" : ""}`}
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
            >
              <div className="faq-question-row">
                <h4>{faq.q}</h4>
                <span className="faq-toggle-icon">{activeFaq === idx ? "−" : "+"}</span>
              </div>
              {activeFaq === idx && <p className="faq-answer">{faq.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
