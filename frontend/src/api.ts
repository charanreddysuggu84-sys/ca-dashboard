import type { Applicant, College, CollegeDetail } from "./types";

const BASE = "http://localhost:8000";


async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;

    try {
      const body = await res.json();
      message = body.detail || message;
    } catch {
      // ignore
    }

    throw new Error(message);
  }

  return res.json();
}


export const api = {
  listColleges: (): Promise<College[]> =>
    fetch(`${BASE}/api/colleges`).then((r) => handle(r)),


  getCollege: (id: string): Promise<CollegeDetail> =>
    fetch(`${BASE}/api/colleges/${id}`).then((r) => handle(r)),


  createCollege: (payload: {
    name: string;
    ca_name?: string;
    ca_phone?: string;
    ca_email?: string;
  }): Promise<College> =>
    fetch(`${BASE}/api/colleges`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handle(r)),


  updateIssueNotes: (
    collegeId: string,
    issue_notes: string
  ): Promise<College> =>
    fetch(`${BASE}/api/colleges/${collegeId}/issues`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issue_notes }),
    }).then((r) => handle(r)),


  updateDescription: (
    collegeId: string,
    description: string
  ): Promise<College> =>
    fetch(`${BASE}/api/colleges/${collegeId}/description`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    }).then((r) => handle(r)),


  mergeColleges: (
    sourceId: string,
    targetId: string
  ): Promise<College> =>
    fetch(`${BASE}/api/colleges/merge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_id: sourceId,
        target_id: targetId,
      }),
    }).then((r) => handle(r)),


  addUpdate: (
    collegeId: string,
    status: string,
    text: string,
    photos: File[]
  ) => {
    const form = new FormData();

    form.append("status", status);
    form.append("text", text);

    photos.forEach((f) => form.append("photos", f));

    return fetch(`${BASE}/api/colleges/${collegeId}/updates`, {
      method: "POST",
      body: form,
    }).then((r) => handle(r));
  },


  listApplicants: (): Promise<Applicant[]> =>
    fetch(`${BASE}/api/applicants`).then((r) => handle(r)),


  // ---------- delete operations ----------

  deleteCollege: (collegeId: string): Promise<void> =>
    fetch(`${BASE}/api/colleges/${collegeId}`, {
      method: "DELETE",
    }).then((r) => {
      if (!r.ok) {
        throw new Error(`Request failed (${r.status})`);
      }
    }),


  deleteUpdate: (
    collegeId: string,
    updateId: string
  ): Promise<void> =>
    fetch(`${BASE}/api/colleges/${collegeId}/updates/${updateId}`, {
      method: "DELETE",
    }).then((r) => {
      if (!r.ok) {
        throw new Error(`Request failed (${r.status})`);
      }
    }),


  deletePhoto: (
    collegeId: string,
    updateId: string,
    photoId: string
  ): Promise<void> =>
    fetch(
      `${BASE}/api/colleges/${collegeId}/updates/${updateId}/photos/${photoId}`,
      {
        method: "DELETE",
      }
    ).then((r) => {
      if (!r.ok) {
        throw new Error(`Request failed (${r.status})`);
      }
    }),


  deleteApplicant: (applicantId: string): Promise<void> =>
    fetch(`${BASE}/api/applicants/${applicantId}`, {
      method: "DELETE",
    }).then((r) => {
      if (!r.ok) {
        throw new Error(`Request failed (${r.status})`);
      }
    }),
};


export function assetUrl(path: string | null | undefined): string {
  if (!path) return "";

  return path.startsWith("http") ? path : `${BASE}${path}`;
}