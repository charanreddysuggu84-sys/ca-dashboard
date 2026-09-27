import React, { useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import { useColleges } from "../CollegesContext";

import { api, assetUrl } from "../api";

import { avatarColor, initials, statusClass } from "../helpers";

import type { College } from "../types";

import AddCollegeModal from "./AddCollegeModal";

import MergeCollegesModal from "./MergeCollegesModal";


export default function CollegesPage() {
  const { colleges, loading, error, refresh } = useColleges();

  const [showAdd, setShowAdd] = useState(false);

  const [showMerge, setShowMerge] = useState(false);

  const [q, setQ] = useState("");

  const navigate = useNavigate();


  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    if (!query) return colleges;

    return colleges.filter((c) =>
      [c.name, c.ca_name, c.ca_phone, c.ca_email]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [colleges, q]);


  return (
    <section>

      <div className="section-title">
        <h2>College tracker</h2>

        <span className="n">
          {colleges.length} colleges tracked — publicity status, photos and daily updates
        </span>
      </div>


      <div className="flex flex-wrap items-center gap-2 mb-4">

        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search colleges or CA name…"
          className="flex-1 min-w-[200px] text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />

        <button
          onClick={() => setShowMerge(true)}
          className="text-sm px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 whitespace-nowrap"
        >
          Merge duplicates
        </button>

      </div>


      {error && (
        <div className="empty" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}


      {loading && (
        <div className="spin">
          Loading colleges…
        </div>
      )}


      {!loading && filtered.length === 0 && (
        <div className="empty">
          No colleges match "{q}".
        </div>
      )}


      {!loading && filtered.length > 0 && (
        <div className="cagrid">

          {filtered.map((c) => (
            <CollegeCard
              key={c.id}
              college={c}
              onOpen={() => navigate(`/colleges/${c.id}`)}
              onRefresh={refresh}
            />
          ))}


          {!q && (
            <div
              className="addcard"
              onClick={() => setShowAdd(true)}
            >
              <div className="plus">+</div>
              <div>Add a new CA</div>
            </div>
          )}

        </div>
      )}


      {showAdd && (
        <AddCollegeModal
          onClose={() => setShowAdd(false)}
          onCreated={async () => {
            setShowAdd(false);
            await refresh();
          }}
        />
      )}


      {showMerge && (
        <MergeCollegesModal
          onClose={() => setShowMerge(false)}
          onMerged={async () => {
            setShowMerge(false);
            await refresh();
          }}
        />
      )}

    </section>
  );
}


function CollegeCard({
  college,
  onOpen,
  onRefresh,
}: {
  college: College;
  onOpen: () => void;
  onRefresh: () => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);


  async function handlePic(e: React.ChangeEvent<HTMLInputElement>) {
    e.stopPropagation();

    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);

    try {
      await api.uploadProfilePhoto(college.id, file);
      await onRefresh();
    } catch (err: any) {
      alert("Could not upload photo: " + (err?.message || err));
    } finally {
      setUploading(false);
    }
  }


  const lu = college.last_update_at
    ? `Last update: ${new Date(college.last_update_at).toLocaleDateString()} — ${(college.last_update_text || "").slice(0, 90)}${(college.last_update_text || "").length > 90 ? "…" : ""}`
    : "No updates yet";


  return (
    <div className="cacard">

      <div className="cahead">

        <div
          className="avatar"
          style={{ cursor: "pointer" }}
          onClick={(e) => e.stopPropagation()}
        >

          {college.profile_pic_url ? (
            <img
              src={assetUrl(college.profile_pic_url)}
              alt={college.ca_name}
            />
          ) : (
            <span
              style={{
                background: avatarColor(college.name),
              }}
            >
              {initials(college.ca_name)}
            </span>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handlePic}
            title={uploading ? "Uploading…" : "Upload CA photo"}
          />

        </div>


        <div>
          <div className="nm">
            {college.ca_name || "—"}
          </div>

          <div className="cl">
            {college.name}
          </div>
        </div>

      </div>


      <div className="cabody">

        <span className={`pill ${statusClass(college.status)}`}>
          {college.status}
        </span>

        <span
          style={{
            color: "var(--muted)",
            fontSize: 12,
            marginLeft: 8,
          }}
        >
          {college.reg_count} registered
        </span>

        <div className="lu">
          {lu}
        </div>

      </div>


      <div className="cafoot">

        <button
          className="btn small"
          onClick={onOpen}
        >
          View daily log
        </button>

      </div>

    </div>
  );
}