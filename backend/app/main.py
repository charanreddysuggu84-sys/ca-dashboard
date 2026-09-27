import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import Base, engine, SessionLocal
from .routers import colleges, applicants, updates
from .seed_data import seed_if_empty
from .storage import UPLOAD_ROOT

app = FastAPI(title="Vijayawada Utsav — CA Command Center API")

# CORS: locked to the Vite dev server. Add your deployed frontend's
# origin here too if you ever host this somewhere other than localhost.
import os

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
extra_origin = os.environ.get("FRONTEND_ORIGIN")
if extra_origin:
    ALLOWED_ORIGINS.append(extra_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(UPLOAD_ROOT, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_ROOT), name="uploads")

app.include_router(colleges.router)
app.include_router(applicants.router)
app.include_router(updates.router)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()


@app.get("/api/health")
def health():
    return {"ok": True}
