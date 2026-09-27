export const isUrl = (s: string | null | undefined) => /^https?:\/\//i.test(s || "");

export function normExp(v: string | null | undefined): string {
  const s = (v || "").toLowerCase();
  if (s.startsWith("yes")) return "Yes";
  if (s.startsWith("no")) return "No";
  if (s.startsWith("maybe")) return "Maybe";
  return v ? v[0].toUpperCase() + v.slice(1) : "—";
}

export function pillClass(v: string | null | undefined): string {
  const s = (v || "").toLowerCase();
  if (s.startsWith("yes")) return "yes";
  if (s.startsWith("no")) return "no";
  return "maybe";
}

export function statusClass(v: string | null | undefined): string {
  if (v === "Completed") return "completed";
  if (v === "In Progress") return "inprogress";
  return "notstarted";
}

export function uniqSorted(arr: (string | null | undefined)[]): string[] {
  return Array.from(new Set(arr.filter(Boolean) as string[])).sort();
}

const AVATAR_COLORS = ["#0f6b62", "#e2932e", "#12857a", "#a83a2f", "#7fb8ae", "#b96f16"];

export function avatarColor(name: string | null | undefined): string {
  let h = 0;
  for (const c of name || "") h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function initials(name: string | null | undefined): string {
  return (name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString();
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString();
}
