"""Runs once on startup. If the colleges table is empty, imports
seed_applicants.json (the original 16 registrations), grouping
applicants into colleges by their cleaned-up `college` field —
same grouping the original Artifact used.
"""
import json
import os
from sqlalchemy.orm import Session

from . import models

SEED_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "seed_applicants.json")


def seed_if_empty(db: Session):
    if db.query(models.College).first() is not None:
        return  # already seeded (or user has real data) — never overwrite

    if not os.path.exists(SEED_PATH):
        return

    with open(SEED_PATH, encoding="utf-8") as f:
        people = json.load(f)

    groups: dict[str, list[dict]] = {}
    for p in people:
        groups.setdefault(p.get("college") or "Unknown College", []).append(p)

    created = 0
    for college_name, members in groups.items():
        primary = members[0]
        college = models.College(
            name=college_name,
            ca_name=primary.get("name", ""),
            ca_phone=primary.get("phone", ""),
            ca_email=primary.get("email", ""),
            status="Not Started",
        )
        db.add(college)
        db.flush()  # get college.id before attaching applicants
        created += 1

        for p in members:
            db.add(models.Applicant(
                college_id=college.id,
                name=p.get("name", ""),
                phone=p.get("phone", ""),
                email=p.get("email", ""),
                college_name=college_name,
                college_original=p.get("college_original", ""),
                year=str(p.get("year", "")),
                branch=p.get("branch", ""),
                city=p.get("city", ""),
                profile=p.get("profile", ""),
                experience=p.get("experience", ""),
                why=p.get("why", ""),
                comfortable=p.get("comfortable", ""),
                timestamp=p.get("timestamp", ""),
            ))

    db.commit()
    print(f"[seed] created {created} colleges from {len(people)} applicants")
