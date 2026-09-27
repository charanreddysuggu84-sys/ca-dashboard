# Vijayawada Utsav 2026 — Campus Ambassador Command Center

An internal dashboard for tracking Campus Ambassador (CA) registrations,
per-college publicity status, and daily on-ground updates for Vijayawada
Utsav 2026.

Built as a solo-maintainer internal tool — no user logins, single admin
(the event's creative intern), updates entered manually from WhatsApp
messages received from CAs across colleges.

---

## Features

- **Applicant registry** — searchable, sortable, filterable table of all
  registered applicants, grouped by college, with CSV export
- **Per-college tracking** — publicity status (Not Started / In Progress /
  Completed), CA profile photo, registered applicant count
- **Photo gallery** — slideshow + grid view of every photo uploaded for a
  college's daily updates, newest first
- **Daily update log** — timestamped text + photo entries per college,
  editable and deletable
- **Description & Issues notes** — free-text notes per college for context
  and flagging problems
- **Duplicate college merge** — safely combine two college entries (e.g.
  from registration-form name typos) without losing data
- **Full delete support** — remove individual photos, updates, applicants,
  or entire colleges (with confirmation safeguards)
- **Local backup script** — one-command snapshot of the database and all
  uploaded photos

---

## Tech stack

| Layer     | Tech                                      |
|-----------|--------------------------------------------|
| Backend   | FastAPI, SQLAlchemy, SQLite                |
| Frontend  | React + Vite, TypeScript, React Router     |
| Styling   | Plain CSS + Tailwind CSS (v4)              |
| Storage   | Local disk (`backend/uploads/`) for photos |

No external services, cloud accounts, or paid dependencies required —
everything runs locally.

---

## Project structure

```
ca-dashboard/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entrypoint, CORS, startup seed
│   │   ├── models.py            # SQLAlchemy models: College, Applicant,
│   │   │                          DailyUpdate, UpdatePhoto
│   │   ├── schemas.py           # Pydantic request/response schemas
│   │   ├── crud.py              # Database operations
│   │   ├── serializers.py       # Model → API response mapping
│   │   ├── storage.py           # Local photo upload/delete helpers
│   │   ├── database.py          # SQLAlchemy engine/session setup
│   │   ├── seed_data.py         # First-run seeding from seed_applicants.json
│   │   ├── seed_applicants.json # Original 16-applicant registration data
│   │   └── routers/
│   │       ├── colleges.py      # College CRUD, photo upload, merge, issues,
│   │       │                      description endpoints
│   │       ├── applicants.py    # Applicant list/delete
│   │       └── updates.py       # Daily update + photo CRUD
│   ├── ca_dashboard.db          # SQLite database (not committed — see .gitignore)
│   ├── uploads/                 # Uploaded photos (not committed — see .gitignore)
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx              # App entrypoint, router setup
│   │   ├── App.tsx                # Route definitions
│   │   ├── api.ts                 # Backend API client
│   │   ├── types.ts               # Shared TypeScript types
│   │   ├── helpers.ts             # Formatting/display helpers
│   │   ├── CollegesContext.tsx    # Global colleges state
│   │   ├── styles/global.css      # App-wide styles (plain CSS + Tailwind)
│   │   └── components/
│   │       ├── Header.tsx
│   │       ├── TabBar.tsx
│   │       ├── OverviewPage.tsx           # Applicant table/cards + charts + CSV export
│   │       ├── CollegesPage.tsx           # College grid, search, add, merge
│   │       ├── CollegeDetailPage.tsx      # Full college page: gallery, log, applicants
│   │       ├── CollegeGallery.tsx         # Photo slideshow + grid
│   │       ├── IssuesCard.tsx
│   │       ├── DescriptionCard.tsx
│   │       ├── InstitutionDetailsCard.tsx
│   │       ├── AddUpdatePage.tsx
│   │       ├── AddCollegeModal.tsx
│   │       ├── MergeCollegesModal.tsx
│   │       └── ApplicantModal.tsx
│   ├── index.html
│   └── package.json
│
├── backup.bat                    # Daily backup script (db + uploads)
├── .gitignore
└── README.md
```

---

## Setup — running locally

### Prerequisites
- Python 3.10+ with `pip`
- Node.js (includes `npm`)

### Backend

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

On first run, the database is created and seeded automatically from
`seed_applicants.json`. You should see:
```
[seed] created 11 colleges from 16 applicants
```

Backend runs at **http://localhost:8000** (API docs at `/docs`).

### Frontend

In a **separate** terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**.

Both servers must stay running while you use the dashboard.

---

## Day-to-day usage

1. Start the backend (`uvicorn ...`) and frontend (`npm run dev`) in two
   separate terminals.
2. Open http://localhost:5173.
3. Enter daily WhatsApp updates via the **Add Daily Update** tab, or from
   a college's own detail page.
4. When done for the day, stop both servers with **Ctrl+C**, then run
   `backup.bat` from the project root to snapshot the database and photos.

---

## Backing up your data

Run from the project root:

```powershell
.\backup.bat
```

Stop the backend first — the script copies the live SQLite file, which
can fail silently if the server has it open. Each run creates a new
timestamped folder under `backups\`, so nothing is ever overwritten.

---

## Known limitations

- **No authentication** — this is a solo internal tool by design. If this
  is ever deployed to a public server, authentication must be added first.
- **No automated test suite** — all functionality has been manually
  verified.
- **CORS is locked to `localhost:5173`** in `backend/app/main.py`. Add
  your deployed frontend's origin there if hosting elsewhere.
- **SQLite + local file storage** — fine for a single-admin internal tool,
  not designed for concurrent multi-user access or cloud deployment
  without changes.

---

## Data privacy note

This project handles real personal data (names, phone numbers, emails,
photos) of event registrants. The database file and uploads folder are
excluded from version control via `.gitignore`. Do not remove that
exclusion on a public repository.