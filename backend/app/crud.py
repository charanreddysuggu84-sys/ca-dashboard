from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy import func

from . import models, storage


# ---------- colleges ----------

def list_colleges(db: Session):
    return db.query(models.College).order_by(models.College.name.asc()).all()


def get_college(
    db: Session,
    college_id: str
) -> Optional[models.College]:
    return (
        db.query(models.College)
        .filter(models.College.id == college_id)
        .first()
    )


def get_college_by_name(
    db: Session,
    name: str
) -> Optional[models.College]:
    return (
        db.query(models.College)
        .filter(func.lower(models.College.name) == func.lower(name))
        .first()
    )


def create_college(
    db: Session,
    name: str,
    ca_name="",
    ca_phone="",
    ca_email=""
) -> models.College:
    college = models.College(
        name=name.strip(),
        ca_name=ca_name.strip(),
        ca_phone=ca_phone.strip(),
        ca_email=ca_email.strip(),
        status="Not Started",
    )
    db.add(college)
    db.commit()
    db.refresh(college)
    return college


def set_profile_pic(
    db: Session,
    college: models.College,
    relative_path: str
):
    college.profile_pic_path = relative_path
    db.commit()
    db.refresh(college)
    return college


def set_issue_notes(
    db: Session,
    college: models.College,
    issue_notes: str
):
    college.issue_notes = issue_notes.strip()
    db.commit()
    db.refresh(college)
    return college


def set_description(
    db: Session,
    college: models.College,
    description: str
):
    college.description = description.strip()
    db.commit()
    db.refresh(college)
    return college


def merge_colleges(
    db: Session,
    source_id: str,
    target_id: str
) -> models.College:
    if source_id == target_id:
        raise ValueError("Cannot merge a college into itself.")

    source = get_college(db, source_id)
    target = get_college(db, target_id)

    if not source or not target:
        raise ValueError("Both colleges must exist.")

    # Move applicants from source → target
    for a in list(source.applicants):
        source.applicants.remove(a)
        a.college_id = target.id
        a.college_name = target.name
        target.applicants.append(a)

    # Move daily updates from source → target
    for u in list(source.updates):
        source.updates.remove(u)
        u.college_id = target.id
        target.updates.append(u)

    # Keep the most recent update information
    if source.last_update_at and (
        not target.last_update_at
        or source.last_update_at > target.last_update_at
    ):
        target.last_update_text = source.last_update_text
        target.last_update_at = source.last_update_at
        target.status = source.status

    # Preserve issue notes if target doesn't already have them
    if source.issue_notes and not target.issue_notes:
        target.issue_notes = source.issue_notes

    # Preserve description if target doesn't already have one
    if source.description and not target.description:
        target.description = source.description

    # Preserve profile photo
    if not target.profile_pic_path and source.profile_pic_path:
        target.profile_pic_path = source.profile_pic_path
    elif source.profile_pic_path:
        storage.delete_upload(source.profile_pic_path)

    # Delete duplicate college
    db.delete(source)
    db.commit()
    db.refresh(target)
    return target


# ---------- daily updates ----------

def add_update(
    db: Session,
    college: models.College,
    status: str,
    text: str
) -> models.DailyUpdate:
    update = models.DailyUpdate(
        college_id=college.id,
        status=status,
        text=text.strip()
    )
    db.add(update)
    college.status = status
    college.last_update_text = text.strip()
    college.last_update_at = datetime.utcnow()
    db.commit()
    db.refresh(update)
    return update


def add_update_photo(
    db: Session,
    update: models.DailyUpdate,
    relative_path: str
):
    photo = models.UpdatePhoto(
        update_id=update.id,
        path=relative_path
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo


# ---------- delete/get operations ----------

def get_update(db: Session, update_id: str):
    return (
        db.query(models.DailyUpdate)
        .filter(models.DailyUpdate.id == update_id)
        .first()
    )


def get_photo(db: Session, photo_id: str):
    return (
        db.query(models.UpdatePhoto)
        .filter(models.UpdatePhoto.id == photo_id)
        .first()
    )


def delete_photo(db: Session, photo: models.UpdatePhoto):
    storage.delete_upload(photo.path)
    db.delete(photo)
    db.commit()


def delete_update(db: Session, update: models.DailyUpdate):
    for p in update.photos:
        storage.delete_upload(p.path)

    db.delete(update)
    db.commit()


def delete_college(db: Session, college: models.College):
    if college.profile_pic_path:
        storage.delete_upload(college.profile_pic_path)

    for u in college.updates:
        for p in u.photos:
            storage.delete_upload(p.path)

    db.delete(college)
    db.commit()


# ---------- applicants ----------

def list_applicants(db: Session):
    return db.query(models.Applicant).all()


def get_applicant(db: Session, applicant_id: str):
    return (
        db.query(models.Applicant)
        .filter(models.Applicant.id == applicant_id)
        .first()
    )


def delete_applicant(db: Session, applicant: models.Applicant):
    db.delete(applicant)
    db.commit()