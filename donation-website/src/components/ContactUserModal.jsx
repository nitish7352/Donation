import React, { useState } from "react";
import { Mail, Send, X, User, ExternalLink, CheckCircle2, MessageSquare } from "lucide-react";

export default function ContactUserModal({ userTarget, onClose, onMessageSent }) {
  if (!userTarget) return null;

  const defaultEmail = userTarget.email || "";
  const defaultName = userTarget.donorName || userTarget.name || "Valued User";

  const templates = [
    {
      title: "Thank You Note",
      subject: `Heartfelt Thank You from HelpHands Foundation - ${defaultName}`,
      message: `Dear ${defaultName},\n\nWe wanted to personally thank you for your generous support towards our cause. Your kindness helps us bring meaningful change to those who need it most.\n\nWarm regards,\nThe HelpHands Team`
    },
    {
      title: "Campaign Impact Update",
      subject: `Update on the Campaign You Supported - HelpHands`,
      message: `Dear ${defaultName},\n\nWe are excited to share an update on the progress of the campaign you supported. Thanks to contributions like yours, we have made substantial strides towards our goal!\n\nBest regards,\nHelpHands Mission Team`
    },
    {
      title: "Receipt & Inquiry Reply",
      subject: `HelpHands: In Response to Your Recent Message`,
      message: `Hello ${defaultName},\n\nThank you for reaching out to us. We have received your query and are happy to assist you with any questions or tax receipt details.\n\nWarm regards,\nHelpHands Support Desk`
    }
  ];

  const [subject, setSubject] = useState(templates[0].subject);
  const [message, setMessage] = useState(templates[0].message);
  const [recipientEmail, setRecipientEmail] = useState(defaultEmail || "user@example.com");
  const [sentSuccess, setSentSuccess] = useState(false);
  const [sending, setSending] = useState(false);

  const applyTemplate = (t) => {
    setSubject(t.subject);
    setMessage(t.message);
  };

  const handleSend = (e) => {
    e.preventDefault();
    setSending(true);

    setTimeout(() => {
      setSending(false);
      setSentSuccess(true);
      if (onMessageSent) {
        onMessageSent({
          recipientName: defaultName,
          recipientEmail,
          subject,
          message,
          sentAt: new Date().toISOString()
        });
      }
    }, 600);
  };

  const mailtoLink = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="contact-user-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex-row items-center gap-10">
            <div className="icon-circle-emerald">
              <Mail size={18} />
            </div>
            <div>
              <h3>Contact Website User</h3>
              <p className="muted-xs">Reach out directly to {defaultName}</p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {sentSuccess ? (
          <div className="modal-success-state">
            <div className="success-icon-badge">
              <CheckCircle2 size={42} className="text-emerald" />
            </div>
            <h4>Message Sent to {defaultName}!</h4>
            <p className="muted">
              Your message was sent to <strong>{recipientEmail}</strong>. A copy has been logged in the communication history.
            </p>
            <div className="flex-row gap-10 justify-center mt-20">
              <a href={mailtoLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary-sm">
                <ExternalLink size={16} /> Open in Email App
              </a>
              <button className="btn btn-primary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="modal-body-form">
            <div className="template-picker">
              <span className="picker-label">Quick Templates:</span>
              <div className="template-chips">
                {templates.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    className="chip-btn"
                    onClick={() => applyTemplate(tpl)}
                  >
                    {tpl.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Recipient Name</label>
              <div className="input-with-icon">
                <User size={16} className="field-icon" />
                <input
                  type="text"
                  value={defaultName}
                  disabled
                  className="input-disabled"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Recipient Email Address</label>
              <div className="input-with-icon">
                <Mail size={16} className="field-icon" />
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Message Content</label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your note to the user..."
              />
            </div>

            <div className="modal-footer-actions">
              <a
                href={mailtoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                title="Launch default email software"
              >
                <ExternalLink size={16} /> Open via Mail App
              </a>
              <button type="submit" className="btn btn-primary" disabled={sending}>
                <Send size={16} /> {sending ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
