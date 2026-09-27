import React from "react";
import type { CollegeDetail } from "../types";

export default function InstitutionDetailsCard({ college }: { college: CollegeDetail }) {
  const rows: [string, string][] = [
    ["College", college.name],
    ["CA name", college.ca_name || "—"],
    ["Phone", college.ca_phone || "—"],
    ["Email", college.ca_email || "—"],
    ["Registered applicants", String(college.reg_count)],
    ["Publicity status", college.status],
  ];
  return (
    <div className="smallcard">
      <h3>Institution details</h3>
      <div>
        {rows.map(([k, v]) => (
          <div className="kv" key={k}>
            <span className="k">{k}</span>
            <span>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}