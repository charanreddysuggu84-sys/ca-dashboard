import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useColleges } from "../CollegesContext";
import { api } from "../api";
import type { Status } from "../types";

export default function AddUpdatePage() {
  const { colleges, refresh } = useColleges();
  const location = useLocation() as { state?: { collegeId?: string } };

  const [collegeId, setCollegeId] = useState<string>("");
  const [status, setStatus] = useState<Status>("Not Started");
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // preselect a college: from navigation state (came from a college's own
  // page), else the first college once the list loads, else keep as-is
  useEffect(() => {
    if (location.state?.collegeId) {
      setCollegeId(location.state.collegeId);
    } else if (!collegeId && colleges.length) {
      setCollegeId(colleges[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.collegeId, colleges]);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    setPhotos(Array.from(e.target.files || []));
  }

  async function handleSave() {
    setMsg(null);
    if (!collegeId) {
      setMsg({ text: "Pick a college first.", ok: false });
      return;
    }
    setSaving(true);
    try {
      await api.addUpdate(collegeId, status, text.trim(), photos);
      await refresh();
      setMsg({ text: "Saved ✓", ok: true });
      setText("");
      setPhotos([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setMsg({ text: "Could not save: " + (err?.message || err), ok: false });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <div className="section-title">
        <h2>Add daily update</h2>
        <span className="n">one entry per college per day</span>
      </div>
      <div className="formcard">
        <div className="field">
          <label>College</label>
          <select value={collegeId} onChange={(e) => setCollegeId(e.target.value)}>
            {colleges.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Publicity status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as Status)}>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div className="field">
          <label>What happened today</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Posters put up in canteen, 12 new sign-ups collected, reel posted on Instagram…"
          />
        </div>
        <div className="field">
          <label>Photos</label>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFiles} />
          {photos.length > 0 && (
            <div className="thumbrow">
              {photos.map((f, i) => (
                <img key={i} src={URL.createObjectURL(f)} alt="" />
              ))}
            </div>
          )}
        </div>
        <button className="btn primary" disabled={saving} onClick={handleSave}>
          {saving ? "Saving…" : "Save update"}
        </button>
        {msg && <div className={`savemsg ${msg.ok ? "ok" : "err"}`}>{msg.text}</div>}
      </div>
    </section>
  );
}
