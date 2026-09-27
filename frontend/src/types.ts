export type Status = "Not Started" | "In Progress" | "Completed";

export interface Applicant {
  id: string;
  name: string;
  phone: string;
  email: string;
  college_name: string;
  college_original: string;
  year: string;
  branch: string;
  city: string;
  profile: string;
  experience: string;
  why: string;
  comfortable: string;
  timestamp: string;
}

export interface Photo {
  id: string;
  url: string;
}

export interface DailyUpdate {
  id: string;
  status: Status;
  text: string;
  created_at: string;
  photos: Photo[];
}

export interface College {
  id: string;
  name: string;
  ca_name: string;
  ca_phone: string;
  ca_email: string;
  status: Status;
  last_update_text: string;
  last_update_at: string | null;
  profile_pic_url: string | null;
  reg_count: number;
  issue_notes: string;
  description: string;
}

export interface CollegeDetail extends College {
  applicants: Applicant[];
  updates: DailyUpdate[];
}