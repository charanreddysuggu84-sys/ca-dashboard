import React from "react";
import { NavLink, useLocation } from "react-router-dom";

const TABS = [
  { to: "/", label: "Overview", match: (p: string) => p === "/" },
  { to: "/colleges", label: "Colleges", match: (p: string) => p.startsWith("/colleges") },
  { to: "/add-update", label: "Add Daily Update", match: (p: string) => p === "/add-update" },
];

export default function TabBar() {
  const { pathname } = useLocation();
  return (
    <nav className="tabbar">
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className={"tabbtn" + (t.match(pathname) ? " active" : "")}
        >
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}
