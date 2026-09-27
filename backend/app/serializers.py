from . import models, schemas


def photo_to_out(photo: models.UpdatePhoto) -> schemas.PhotoOut:
    return schemas.PhotoOut(id=photo.id, url=f"/uploads/{photo.path}")


def update_to_out(update: models.DailyUpdate) -> schemas.UpdateOut:
    return schemas.UpdateOut(
        id=update.id,
        status=update.status,
        text=update.text,
        created_at=update.created_at,
        photos=[photo_to_out(p) for p in update.photos],
    )


def applicant_to_out(a: models.Applicant) -> schemas.ApplicantOut:
    return schemas.ApplicantOut(
        id=a.id, name=a.name, phone=a.phone, email=a.email,
        college_name=a.college_name, college_original=a.college_original,
        year=a.year, branch=a.branch, city=a.city, profile=a.profile,
        experience=a.experience, why=a.why, comfortable=a.comfortable,
        timestamp=a.timestamp,
    )


def college_to_out(c: models.College) -> schemas.CollegeOut:
    return schemas.CollegeOut(
        id=c.id, name=c.name, ca_name=c.ca_name, ca_phone=c.ca_phone,
        ca_email=c.ca_email, status=c.status,
        last_update_text=c.last_update_text, last_update_at=c.last_update_at,
        profile_pic_url=f"/uploads/{c.profile_pic_path}" if c.profile_pic_path else None,
        reg_count=c.reg_count,
        issue_notes=c.issue_notes or "",
    )


def college_to_detail_out(c: models.College) -> schemas.CollegeDetailOut:
    base = college_to_out(c)
    return schemas.CollegeDetailOut(
        **base.model_dump(),
        applicants=[applicant_to_out(a) for a in c.applicants],
        updates=[update_to_out(u) for u in c.updates],
    )
