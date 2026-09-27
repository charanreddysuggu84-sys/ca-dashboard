import React from "react";
import type { Applicant } from "../types";
import { isUrl, normExp } from "../helpers";

export default function ApplicantModal({
  applicant,
  onClose,
}: {
  applicant: Applicant;
  onClose: () => void;
}) {
  const p = applicant;
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <h2>{p.name}</h2>
            <div className="sub">{p.college_name} · Year {p.year} · {p.branch}</div>
          </div>
          <button className="x" onClick={onClose}>✕</button>
        </div>
        <div className="mgrid">
          <div className="item"><div className="label">Phone</div><div className="value"><a href={`tel:${p.phone}`}>{p.phone}</a></div></div>
          <div className="item"><div className="label">Email</div><div className="value"><a href={`mailto:${p.email}`}>{p.email}</a></div></div>
          <div className="item"><div className="label">City</div><div className="value">{p.city || "—"}</div></div>
          <div className="item">
            <div className="label">Social / profile</div>
            <div className="value">
              {isUrl(p.profile) ? (
                <a href={p.profile} target="_blank" rel="noopener noreferrer">{p.profile}</a>
              ) : (p.profile || "—")}
            </div>
          </div>
          <div className="item"><div className="label">Prior experience</div><div className="value">{normExp(p.experience)}</div></div>
          <div className="item"><div className="label">Comfortable with role</div><div className="value">{normExp(p.comfortable)}</div></div>
        </div>
        <div className="q">Why do they want to be an ambassador?</div>
        <div className="ans">{p.why || "—"}</div>
        <div className="q">Submitted</div>
        <div className="ans">{p.timestamp || "—"}</div>
      </div>
    </div>
  );
}
