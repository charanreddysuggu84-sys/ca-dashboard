import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { College } from "./types";
import { api } from "./api";

interface CollegesContextValue {
  colleges: College[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const CollegesContext = createContext<CollegesContextValue | null>(null);

export function CollegesProvider({ children }: { children: React.ReactNode }) {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await api.listColleges();
      setColleges(data);
      setError(null);
    } catch (err: any) {
      setError(
        err?.message?.includes("fetch")
          ? "Can't reach the backend at localhost:8000 — is uvicorn running?"
          : err?.message || "Something went wrong loading colleges."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <CollegesContext.Provider value={{ colleges, loading, error, refresh }}>
      {children}
    </CollegesContext.Provider>
  );
}

export function useColleges() {
  const ctx = useContext(CollegesContext);
  if (!ctx) throw new Error("useColleges must be used inside <CollegesProvider>");
  return ctx;
}
