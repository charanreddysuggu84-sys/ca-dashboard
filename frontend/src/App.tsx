import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { CollegesProvider, useColleges } from "./CollegesContext";
import { api } from "./api";
import type { Applicant } from "./types";
import Header from "./components/Header";
import TabBar from "./components/TabBar";
import OverviewPage from "./components/OverviewPage";
import CollegesPage from "./components/CollegesPage";
import CollegeDetailPage from "./components/CollegeDetailPage";
import AddUpdatePage from "./components/AddUpdatePage";

function Shell() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [applicantsError, setApplicantsError] = useState<string | null>(null);
  const { colleges } = useColleges();

  useEffect(() => {
    api
      .listApplicants()
      .then(setApplicants)
      .catch((err) =>
        setApplicantsError(
          err?.message?.includes("fetch")
            ? "Can't reach the backend at localhost:8000 — is uvicorn running?"
            : err?.message
        )
      );
  }, []);

  return (
    <>
      <Header applicants={applicants} colleges={colleges} />
      <TabBar />
      <main className="wrap">
        {applicantsError && (
          <div className="empty" style={{ marginBottom: 16 }}>
            {applicantsError}
          </div>
        )}
        <Routes>
          <Route path="/" element={<OverviewPage applicants={applicants} />} />
          <Route path="/colleges" element={<CollegesPage />} />
          <Route path="/colleges/:id" element={<CollegeDetailPage />} />
          <Route path="/add-update" element={<AddUpdatePage />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <CollegesProvider>
      <Shell />
    </CollegesProvider>
  );
}
