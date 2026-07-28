"use client";

import { useState } from "react";

interface Props {
  onClose: () => void;
}

export default function EnquiryModal({ onClose }: Props) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", medium: "", size: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/enquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send");
        return;
      }
      if (data.mailto) {
        window.location.href = data.mailto;
      }
      setSent(true);
    } catch {
      setError("Network error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div id="commission-modal" className="open">
      <div className="cm-overlay" onClick={onClose} />
      <div className="cm-content">
        {sent ? (
          <>
            <h2>Enquiry Sent</h2>
            <p className="cm-sub" style={{ marginTop: "0.5rem" }}>
              Thank you! Nancy will respond shortly.
            </p>
            <div className="cm-actions" style={{ marginTop: "1rem" }}>
              <button className="primary" onClick={onClose}>Close</button>
            </div>
          </>
        ) : (
          <>
            <h2>Enquire About a Painting</h2>
            <p className="cm-sub">Fill in your details and Nancy will get back to you.</p>

            <form className="cm-form" onSubmit={handleSubmit}>
              <div className="cm-row">
                <div>
                  <label>Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label>Email *</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="cm-row">
                <div>
                  <label>Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <label>Medium</label>
                  <input value={form.medium} onChange={(e) => setForm({ ...form, medium: e.target.value })} placeholder="Oil, watercolour..." />
                </div>
              </div>
              <div className="cm-row full">
                <div>
                  <label>Size / Dimensions</label>
                  <input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="e.g. 40 x 50 cm" />
                </div>
              </div>
              <div className="cm-row full">
                <div>
                  <label>Message *</label>
                  <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} />
                </div>
              </div>
              {error && <p style={{ color: "#dc2626", fontSize: "0.8rem" }}>{error}</p>}
              <div className="cm-actions">
                <button type="submit" className="primary" disabled={sending}>{sending ? "Sending..." : "Send Enquiry"}</button>
                <button type="button" className="secondary" onClick={onClose}>Cancel</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}