import React, { useState } from "react";
import { api } from "../api";

export default function AddCollegeModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [caName, setCaName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!name.trim()) {
      setError("College name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.createCollege({
        name: name.trim(),
        ca_name: caName.trim(),
        ca_phone: phone.trim(),
        ca_email: email.trim(),
      });
      onCreated();
    } catch (err: any) {
      setError(err?.message || "Could not add this college.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-head">
          <h2>Add a new CA</h2>
          <button className="x" onClick={onClose}>✕</button>
        </div>
        <div className="field">
          <label>College name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Vignan's Institute of Engineering"
            style={{ width: "100%", border: "1px solid var(--line)", background: "var(--cream)", borderRadius: 11, padding: "10px 12px", fontSize: 14 }}
          />
        </div>
        <div className="field">
          <label>CA name</label>
          <input
            type="text"
            value={caName}
            onChange={(e) => setCaName(e.target.value)}
            style={{ width: "100%", border: "1px solid var(--line)", background: "var(--cream)", borderRadius: 11, padding: "10px 12px", fontSize: 14 }}
          />
        </div>
        <div className="field">
          <label>Phone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ width: "100%", border: "1px solid var(--line)", background: "var(--cream)", borderRadius: 11, padding: "10px 12px", fontSize: 14 }}
          />
        </div>
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", border: "1px solid var(--line)", background: "var(--cream)", borderRadius: 11, padding: "10px 12px", fontSize: 14 }}
          />
        </div>
        {error && <div className="savemsg err">{error}</div>}
        <button className="btn primary" disabled={saving} onClick={handleSave} style={{ marginTop: 6 }}>
          {saving ? "Adding…" : "Add CA"}
        </button>
      </div>
    </div>
  );
}
