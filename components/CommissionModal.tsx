"use client";

import { useState } from "react";

export default function CommissionModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [medium, setMedium] = useState("Acrylic");
  const [size, setSize] = useState("");
  const [desc, setDesc] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !desc) return;

    const body =
      `Commission Enquiry\n\n` +
      `Name: ${name}\nEmail: ${email}\n` +
      (phone ? `Phone: ${phone}\n` : "") +
      `Preferred medium: ${medium}\n` +
      (size ? `Desired size: ${size}\n` : "") +
      `\nDescription:\n${desc}`;

    window.location.href =
      `mailto:nancyberrykdy@gmail.com?subject=${encodeURIComponent("Commission enquiry from " + name)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <div id="commission-modal" className="open">
      <div className="cm-overlay" onClick={onClose} />
      <div className="cm-content">
        <h2>Would you like to have your party painted?</h2>
        <p className="cm-sub">A good photo is all that&rsquo;s needed</p>
        <p className="cm-mediums">
          Any size&hellip; choose from: <strong>Acrylic</strong> &middot; <strong>Oil</strong> &middot;{" "}
          <strong>Watercolour</strong> &middot; <strong>Pencil</strong>
        </p>
        <form className="cm-form" onSubmit={submit}>
          <div className="cm-row">
            <div>
              <label>Your name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jane Smith" required />
            </div>
            <div>
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" required />
            </div>
          </div>
          <div className="cm-row">
            <div>
              <label>Phone (optional)</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07700 900000" />
            </div>
            <div>
              <label>Preferred medium</label>
              <select value={medium} onChange={(e) => setMedium(e.target.value)}>
                <option>Acrylic</option>
                <option>Oil</option>
                <option>Watercolour</option>
                <option>Pencil</option>
                <option>Not sure / Discuss</option>
              </select>
            </div>
          </div>
          <div className="cm-row full">
            <label>Desired size</label>
            <input value={size} onChange={(e) => setSize(e.target.value)} placeholder="e.g. 40 x 50 cm" />
          </div>
          <div className="cm-row full">
            <label>Tell me about what you&rsquo;d like painted</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Describe the scene, people, pets, style you have in mind&hellip;" required />
          </div>
          <div className="cm-actions">
            <button type="submit" className="primary">Send Enquiry</button>
            <button type="button" className="secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
