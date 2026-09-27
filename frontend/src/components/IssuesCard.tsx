import React, { useState } from "react";
import { api } from "../api";
import type { CollegeDetail } from "../types";

export default function IssuesCard({
  college,
  onSaved,
}: {
  college: CollegeDetail;
  onSaved: (issue_notes: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(college.issue_notes || "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setErr(null);
    try {
      const updated = await api.updateIssueNotes(college.id, draft);
      onSaved(updated.issue_notes);
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
        CA issues / notes
        {!editing && (
          <button
            className="editbtn"
            onClick={() => {
              setDraft(college.issue_notes || "");
              setEditing(true);
            }}
          >
            {college.issue_notes ? "Edit" : "+ Add"}
          </button>
        )}
      </h3>

      {editing ? (
        <div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. CA hasn't responded in 2 days, poster printing delayed…"
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
        <p className={`body ${college.issue_notes ? "" : "muted"}`}>
          {college.issue_notes || "No issues reported."}
        </p>
      )}
    </div>
  );
}