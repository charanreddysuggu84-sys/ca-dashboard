import React from "react";
import type { Applicant, College } from "../types";
import { uniqSorted } from "../helpers";

export default function Header({
  applicants,
  colleges,
}: {
  applicants: Applicant[];
  colleges: College[];
}) {
  const kpiTotal = applicants.length;
  const kpiColleges =
    colleges.length || uniqSorted(applicants.map((a) => a.college_name)).length;
  const todayStr = new Date().toDateString();
  const kpiActive = colleges.filter(
    (c) => c.last_update_at && new Date(c.last_update_at).toDateString() === todayStr
  ).length;
  const kpiDone = colleges.filter((c) => c.status === "Completed").length;

  return (
    <header className="hero">
      <div className="wrap">
        <div className="hero-top">
          <div>
            <div className="eyebrow">Vijayawada Utsav 2026</div>
            <h1>
              Campus Ambassador
              <br />
              Command Center
            </h1>
            <p className="sub">
              Applications, per-college publicity tracking and daily on-ground
              updates — one place.
            </p>
          </div>
        </div>
        <div className="kpis">
          <div className="kpi">
            <b>{kpiTotal}</b>
            <span>Applicants</span>
          </div>
          <div className="kpi">
            <b>{kpiColleges}</b>
            <span>Colleges represented</span>
          </div>
          <div className="kpi">
            <b>{kpiActive}</b>
            <span>Colleges updated today</span>
          </div>
          <div className="kpi">
            <b>{kpiDone}</b>
            <span>Colleges marked completed</span>
          </div>
        </div>
      </div>
    </header>
  );
}
