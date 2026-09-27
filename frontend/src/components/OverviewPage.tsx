import React, { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import type { Applicant } from "../types";
import { normExp, pillClass, uniqSorted } from "../helpers";
import ApplicantModal from "./ApplicantModal";

type SortKey = "name" | "college" | "year" | "branch" | "city" | "experience" | "comfortable";

const PALETTE = [
  "#0f6b62", "#e2932e", "#12857a", "#c9701a", "#1f7a4d",
  "#a83a2f", "#6d766f", "#7fb8ae", "#f0b15e", "#0a4a44", "#d9a441",
];

function countBy<T>(arr: T[], fn: (x: T) => string): Record<string, number> {
  const m: Record<string, number> = {};
  arr.forEach((x) => {
    const k = fn(x) || "Unspecified";
    m[k] = (m[k] || 0) + 1;
  });
  return m;
}

export default function OverviewPage({ applicants }: { applicants: Applicant[] }) {
  const [q, setQ] = useState("");
  const [fCollege, setFCollege] = useState("");
  const [fYear, setFYear] = useState("");
  const [fExp, setFExp] = useState("");
  const [view, setView] = useState<"table" | "cards">("table");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [selected, setSelected] = useState<Applicant | null>(null);

  const collegesOptions = useMemo(() => uniqSorted(applicants.map((a) => a.college_name)), [applicants]);
  const yearsOptions = useMemo(() => uniqSorted(applicants.map((a) => a.year)), [applicants]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let list = applicants.filter((p) => {
      if (fCollege && p.college_name !== fCollege) return false;
      if (fYear && String(p.year) !== fYear) return false;
      if (fExp && normExp(p.experience) !== fExp) return false;
      if (query) {
        const hay = [p.name, p.college_name, p.branch, p.city, p.email, p.college_original]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      let va: any = sortKey === "college" ? a.college_name : (a as any)[sortKey] ?? "";
      let vb: any = sortKey === "college" ? b.college_name : (b as any)[sortKey] ?? "";
      if (sortKey === "year") {
        va = Number(va) || 0;
        vb = Number(vb) || 0;
        return (va - vb) * sortDir;
      }
      va = String(va).toLowerCase();
      vb = String(vb).toLowerCase();
      return va.localeCompare(vb) * sortDir;
    });
    return list;
  }, [applicants, q, fCollege, fYear, fExp, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1));
    else {
      setSortKey(key);
      setSortDir(1);
    }
  }

  function exportCsv() {
    const cols: (keyof Applicant)[] = [
      "name", "college_name", "college_original", "year", "branch",
      "city", "phone", "email", "experience", "comfortable",
    ];
    const rows = [cols.join(",")].concat(
      filtered.map((p) => cols.map((c) => `"${String(p[c] ?? "").replace(/"/g, '""')}"`).join(","))
    );
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "campus_ambassadors.csv";
    a.click();
  }

  const arrow = (key: SortKey) => (sortKey === key ? (sortDir === 1 ? "▲" : "▼") : "");

  return (
    <section>
      <div className="section-title">
        <h2>At a glance</h2>
        <span className="n">breakdowns across every application</span>
      </div>

      <ChartsRow applicants={applicants} />

      <div className="toolbar">
        <div className="tools">
          <div className="search">
            <input
              type="text"
              placeholder="Search name, college, branch, city, email…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select value={fCollege} onChange={(e) => setFCollege(e.target.value)}>
            <option value="">All colleges</option>
            {collegesOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select value={fYear} onChange={(e) => setFYear(e.target.value)}>
            <option value="">All years</option>
            {yearsOptions.map((y) => (
              <option key={y} value={y}>Year {y}</option>
            ))}
          </select>
          <select value={fExp} onChange={(e) => setFExp(e.target.value)}>
            <option value="">Any experience</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="Maybe">Maybe</option>
          </select>
          <div className="viewtoggle">
            <button className={view === "table" ? "active" : ""} onClick={() => setView("table")}>Table</button>
            <button className={view === "cards" ? "active" : ""} onClick={() => setView("cards")}>Cards</button>
          </div>
          <button className="btn primary" onClick={exportCsv}>Export CSV</button>
        </div>
      </div>
      <div className="result-count">
        Showing {filtered.length} of {applicants.length} applicants
      </div>

      {filtered.length === 0 && (
        <div className="empty">No applicants match your search or filters.</div>
      )}

      {filtered.length > 0 && view === "table" && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th onClick={() => toggleSort("name")}>Name <span className="arrow">{arrow("name")}</span></th>
                <th onClick={() => toggleSort("college")}>College <span className="arrow">{arrow("college")}</span></th>
                <th onClick={() => toggleSort("year")}>Year <span className="arrow">{arrow("year")}</span></th>
                <th onClick={() => toggleSort("branch")}>Branch <span className="arrow">{arrow("branch")}</span></th>
                <th onClick={() => toggleSort("city")}>City <span className="arrow">{arrow("city")}</span></th>
                <th onClick={() => toggleSort("experience")}>Experience <span className="arrow">{arrow("experience")}</span></th>
                <th onClick={() => toggleSort("comfortable")}>Ready? <span className="arrow">{arrow("comfortable")}</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} onClick={() => setSelected(p)}>
                  <td className="name-cell"><b>{p.name}</b><span>{p.email}</span></td>
                  <td>{p.college_name}</td>
                  <td>{p.year}</td>
                  <td>{p.branch}</td>
                  <td>{p.city}</td>
                  <td><span className={`pill ${pillClass(p.experience)}`}>{normExp(p.experience)}</span></td>
                  <td><span className={`pill ${pillClass(p.comfortable)}`}>{normExp(p.comfortable)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 && view === "cards" && <CardsView list={filtered} onSelect={setSelected} />}

      {selected && <ApplicantModal applicant={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

function CardsView({ list, onSelect }: { list: Applicant[]; onSelect: (p: Applicant) => void }) {
  const groups: Record<string, Applicant[]> = {};
  list.forEach((p) => {
    (groups[p.college_name] ??= []).push(p);
  });
  const collegesOrdered = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);
  return (
    <div>
      {collegesOrdered.map((c) => (
        <div className="college" key={c}>
          <div className="college-head">
            <h3>{c}</h3>
            <span className="count">{groups[c].length} applicant{groups[c].length > 1 ? "s" : ""}</span>
          </div>
          <div className="grid">
            {groups[c].map((p) => (
              <div className="card" key={p.id} onClick={() => onSelect(p)}>
                <div className="top">
                  <div>
                    <div className="name">{p.name}</div>
                    <div className="meta">{p.branch} · Year {p.year}</div>
                  </div>
                  <span className={`pill ${pillClass(p.experience)}`}>{normExp(p.experience)}</span>
                </div>
                <div className="info">
                  <div><div className="label">City</div>{p.city}</div>
                  <div><div className="label">Ready?</div>{normExp(p.comfortable)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ChartsRow({ applicants }: { applicants: Applicant[] }) {
  const collegesRef = useRef<HTMLCanvasElement>(null);
  const timelineRef = useRef<HTMLCanvasElement>(null);
  const yearRef = useRef<HTMLCanvasElement>(null);
  const expRef = useRef<HTMLCanvasElement>(null);
  const comfortRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!applicants.length) return;
    Chart.defaults.font.family = "Inter, sans-serif";
    Chart.defaults.color = "#6d766f";

    const charts: Chart[] = [];

    const collegeCounts = countBy(applicants, (p) => p.college_name);
    const collegeEntries = Object.entries(collegeCounts).sort((a, b) => b[1] - a[1]);
    if (collegesRef.current) {
      charts.push(new Chart(collegesRef.current, {
        type: "bar",
        data: { labels: collegeEntries.map((e) => e[0]), datasets: [{ data: collegeEntries.map((e) => e[1]), backgroundColor: "#0f6b62", borderRadius: 6, maxBarThickness: 26 }] },
        options: { indexAxis: "y", plugins: { legend: { display: false } }, scales: { x: { ticks: { precision: 0 }, grid: { color: "#eee6d4" } }, y: { grid: { display: false } } }, maintainAspectRatio: false },
      }));
    }

    const dayCounts = countBy(applicants, (p) => (p.timestamp || "").split(" ")[0].split("/").slice(1).join("/") || "Unknown");
    const dayEntries = Object.entries(dayCounts).sort((a, b) => a[0].localeCompare(b[0]));
    let running = 0;
    const cumulative = dayEntries.map((e) => (running += e[1]));
    if (timelineRef.current) {
      charts.push(new Chart(timelineRef.current, {
        type: "line",
        data: { labels: dayEntries.map((e) => e[0]), datasets: [{ data: cumulative, borderColor: "#e2932e", backgroundColor: "rgba(226,147,46,.18)", fill: true, tension: 0.35, pointBackgroundColor: "#e2932e" }] },
        options: { plugins: { legend: { display: false } }, scales: { y: { ticks: { precision: 0 }, grid: { color: "#eee6d4" } }, x: { grid: { display: false } } }, maintainAspectRatio: false },
      }));
    }

    const yearCounts = countBy(applicants, (p) => "Year " + (p.year || "?"));
    if (yearRef.current) {
      charts.push(new Chart(yearRef.current, {
        type: "doughnut",
        data: { labels: Object.keys(yearCounts), datasets: [{ data: Object.values(yearCounts), backgroundColor: PALETTE, borderWidth: 2, borderColor: "#fff" }] },
        options: { plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 11 } } } }, maintainAspectRatio: false, cutout: "62%" },
      }));
    }

    const expCounts = countBy(applicants, (p) => normExp(p.experience));
    if (expRef.current) {
      charts.push(new Chart(expRef.current, {
        type: "doughnut",
        data: { labels: Object.keys(expCounts), datasets: [{ data: Object.values(expCounts), backgroundColor: ["#1f7a4d", "#a83a2f", "#e2932e", "#6d766f"], borderWidth: 2, borderColor: "#fff" }] },
        options: { plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 11 } } } }, maintainAspectRatio: false, cutout: "62%" },
      }));
    }

    const comfortCounts = countBy(applicants, (p) => normExp(p.comfortable));
    if (comfortRef.current) {
      charts.push(new Chart(comfortRef.current, {
        type: "doughnut",
        data: { labels: Object.keys(comfortCounts), datasets: [{ data: Object.values(comfortCounts), backgroundColor: ["#1f7a4d", "#a83a2f", "#e2932e"], borderWidth: 2, borderColor: "#fff" }] },
        options: { plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 11 } } } }, maintainAspectRatio: false, cutout: "62%" },
      }));
    }

    return () => charts.forEach((c) => c.destroy());
  }, [applicants]);

  return (
    <div className="charts">
      <div className="chart-card chart-wide"><h3>Applicants by college</h3><div className="wrap-canvas"><canvas ref={collegesRef} /></div></div>
      <div className="chart-card"><h3>Registrations by day</h3><div className="wrap-canvas"><canvas ref={timelineRef} /></div></div>
      <div className="chart-card"><h3>Year of study</h3><div className="wrap-canvas"><canvas ref={yearRef} /></div></div>
      <div className="chart-card"><h3>Prior event experience</h3><div className="wrap-canvas"><canvas ref={expRef} /></div></div>
      <div className="chart-card"><h3>Comfortable with role</h3><div className="wrap-canvas"><canvas ref={comfortRef} /></div></div>
    </div>
  );
}
