import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, assetUrl } from "../api";
import { avatarColor, formatDateTime, initials, statusClass } from "../helpers";
import type { Applicant, CollegeDetail } from "../types";
import ApplicantModal from "./ApplicantModal";
import CollegeGallery from "./CollegeGallery";
import IssuesCard from "./IssuesCard";
import DescriptionCard from "./DescriptionCard";
import InstitutionDetailsCard from "./InstitutionDetailsCard";

export default function CollegeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [college, setCollege] = useState<CollegeDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  const load = React.useCallback(() => {
    if (!id) return;
    api
      .getCollege(id)
      .then(setCollege)
      .catch((err) => setError(err?.message || "Could not load this college."));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  function handleIssueSaved(issue_notes: string) {
    setCollege((prev) => (prev ? { ...prev, issue_notes } : prev));
  }

  function handleDescriptionSaved(description: string) {
    setCollege((prev) => (prev ? { ...prev, description } : prev));
  }

  async function handlePic(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    try {
      await api.uploadProfilePhoto(id, file);
      load();
    } catch (err: any) {
      alert("Could not upload photo: " + (err?.message || err));
    }
  }

  async function handleDeletePhotoFromLog(updateId: string, photoId: string) {
    if (!id) return;
    if (!window.confirm("Delete this photo? This cannot be undone.")) return;
    try {
      await api.deletePhoto(id, updateId, photoId);
      setCollege((prev) =>
        prev
          ? {
              ...prev,
              updates: prev.updates.map((u) =>
                u.id === updateId ? { ...u, photos: u.photos.filter((p) => p.id !== photoId) } : u
              ),
            }
          : prev
      );
    } catch (err: any) {
      alert("Could not delete photo: " + (err?.message || err));
    }
  }

  async function handleDeletePhotoFromGallery(updateId: string, photoId: string) {
    if (!id) return;
    try {
      await api.deletePhoto(id, updateId, photoId);
      setCollege((prev) =>
        prev
          ? {
              ...prev,
              updates: prev.updates.map((u) =>
                u.id === updateId ? { ...u, photos: u.photos.filter((p) => p.id !== photoId) } : u
              ),
            }
          : prev
      );
    } catch (err: any) {
      alert("Could not delete photo: " + (err?.message || err));
    }
  }

  async function handleDeleteUpdate(updateId: string) {
    if (!id) return;
    if (!window.confirm("Delete this entire update and all its photos? This cannot be undone.")) return;
    try {
      await api.deleteUpdate(id, updateId);
      setCollege((prev) => (prev ? { ...prev, updates: prev.updates.filter((u) => u.id !== updateId) } : prev));
    } catch (err: any) {
      alert("Could not delete update: " + (err?.message || err));
    }
  }

  async function handleDeleteApplicant(applicantId: string) {
    if (!window.confirm("Remove this applicant from the list? This cannot be undone.")) return;
    try {
      await api.deleteApplicant(applicantId);
      setCollege((prev) =>
        prev ? { ...prev, applicants: prev.applicants.filter((a) => a.id !== applicantId), reg_count: prev.reg_count - 1 } : prev
      );
    } catch (err: any) {
      alert("Could not delete applicant: " + (err?.message || err));
    }
  }

  async function handleDeleteCollege() {
    if (!college) return;
    const typed = window.prompt(
      `Type the college name exactly to confirm:\n\n"${college.name}"\n\nThis permanently deletes the college, its daily updates, photos, and ${college.applicants.length} applicant record(s). This cannot be undone.`
    );
    if (typed === null) return;
    if (typed !== college.name) {
      alert("Name didn't match — nothing was deleted.");
      return;
    }
    try {
      await api.deleteCollege(college.id);
      navigate("/colleges");
    } catch (err: any) {
      alert("Could not delete college: " + (err?.message || err));
    }
  }

  if (error) return <div className="empty">{error}</div>;
  if (!college) return <div className="spin">Loading…</div>;

  return (
    <section>
      <button className="backlink" onClick={() => navigate("/colleges")}>← Back to colleges</button>

      <div className="detail-hero">
        <div className="hero-card">
          <div className="avatar" style={{ cursor: "pointer" }}>
            {college.profile_pic_url ? (
              <img src={assetUrl(college.profile_pic_url)} alt={college.ca_name} />
            ) : (
              <span style={{ background: avatarColor(college.name) }}>{initials(college.ca_name)}</span>
            )}
            <input type="file" accept="image/*" onChange={handlePic} title="Upload CA photo" />
          </div>
          <h2>{college.name}</h2>
          <div className="sub">{college.ca_name || "—"}</div>
          <span className={`pill ${statusClass(college.status)}`}>{college.status}</span>
          <button
            className="btn primary"
            onClick={() => navigate("/add-update", { state: { collegeId: college.id } })}
          >
            + Add update
          </button>
          <button
            onClick={handleDeleteCollege}
            className="text-xs text-red-600 hover:text-red-700 transition-colors font-semibold mt-2"
          >
            Delete this college
          </button>
        </div>

        <div className="detail-panel gallery-panel">
          <h3>Photo gallery</h3>
          <CollegeGallery college={college} onDeletePhoto={handleDeletePhotoFromGallery} />
        </div>
      </div>

      <div className="detail-stats">
        <div className="detail-stat"><b>{college.reg_count}</b><span>Registered applicants</span></div>
        <div className="detail-stat"><b>{college.updates.length}</b><span>Daily updates logged</span></div>
        <div className="detail-stat"><b>{college.updates.reduce((n, u) => n + u.photos.length, 0)}</b><span>Photos uploaded</span></div>
      </div>

      <div className="smallcards">
        <InstitutionDetailsCard college={college} />
        <DescriptionCard college={college} onSaved={handleDescriptionSaved} />
        <IssuesCard college={college} onSaved={handleIssueSaved} />
      </div>

      <div className="detail-cols">
        <div className="detail-panel">
          <h3>Daily log</h3>
          {college.updates.length === 0 ? (
            <div className="empty">No daily updates logged yet.</div>
          ) : (
            college.updates.map((u) => (
              <div className="logentry" key={u.id}>
                <div className="lhead">
                  <span className={`pill ${statusClass(u.status)}`}>{u.status}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {formatDateTime(u.created_at)}
                    <button
                      onClick={() => handleDeleteUpdate(u.id)}
                      className="text-xs text-red-600 hover:text-red-700 transition-colors font-semibold"
                    >
                      Delete
                    </button>
                  </span>
                </div>
                <div className="ltext">{u.text || "—"}</div>
                {u.photos.length > 0 && (
                  <div className="photostrip">
                    {u.photos.map((p) => (
                      <div key={p.id} style={{ position: "relative" }}>
                        <img src={assetUrl(p.url)} alt="" />
                        <button
                          onClick={() => handleDeletePhotoFromLog(u.id, p.id)}
                          title="Delete photo"
                          style={{
                            position: "absolute",
                            top: 2,
                            right: 2,
                            background: "rgba(168,58,47,.85)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "50%",
                            width: 20,
                            height: 20,
                            fontSize: 12,
                            lineHeight: "20px",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="detail-panel">
          <h3>Registered applicants ({college.applicants.length})</h3>
          {college.applicants.length === 0 ? (
            <div className="empty">No applicants registered from this college yet.</div>
          ) : (
            college.applicants.map((a) => (
              <div className="applicant-row" key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div onClick={() => setSelectedApplicant(a)} style={{ cursor: "pointer", flex: 1 }}>
                  <b>{a.name}</b>
                  <span>{a.branch} · Year {a.year}</span>
                </div>
                <button
                  onClick={() => handleDeleteApplicant(a.id)}
                  className="text-xs text-red-600 hover:text-red-700 transition-colors font-semibold"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedApplicant && (
        <ApplicantModal applicant={selectedApplicant} onClose={() => setSelectedApplicant(null)} />
      )}
    </section>
  );
}