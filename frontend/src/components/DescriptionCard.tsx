import React, { useState } from "react";
import { api } from "../api";
import type { CollegeDetail } from "../types";

export default function DescriptionCard({
  college,
  onSaved,
}: {
  college: CollegeDetail;
  onSaved: (description: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(college.description || "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setErr(null);
    try {
      const updated = await api.updateDescription(college.id, draft);
      onSaved(updated.description);
      setEditing(false);
    } catch (e: any) {
      setErr(e?.message || "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="smallcard">
      <h3>
        Description
        {!editing && (
          <button
            className="editbtn"
            onClick={() => {
              setDraft(college.description || "");
              setEditing(true);
            }}
          >
            {college.description ? "Edit" : "+ Add"}
          </button>
        )}
      </h3>

      {editing ? (
        <div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Short notes about this college — reach, campus size, key contacts, anything worth remembering…"
          />
          {err && <div className="errtext">{err}</div>}
          <div className="actions">
            <button className="btn small primary" disabled={saving} onClick={save}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button className="btn small" disabled={saving} onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className={`body ${college.description ? "" : "muted"}`}>
          {college.description || "No description added yet."}
        </p>
      )}
    </div>
  );
}