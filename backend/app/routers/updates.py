from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form

from sqlalchemy.orm import Session

from .. import crud, schemas, storage

from ..database import get_db

from ..serializers import update_to_out


router = APIRouter(prefix="/api/colleges", tags=["updates"])

VALID_STATUSES = {"Not Started", "In Progress", "Completed"}


@router.post(
    "/{college_id}/updates",
    response_model=schemas.UpdateOut,
    status_code=201
)
async def add_update(
    college_id: str,
    status: str = Form(...),
    text: str = Form(""),
    photos: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db),
):
    college = crud.get_college(db, college_id)

    if not college:
        raise HTTPException(404, "College not found.")

    if status not in VALID_STATUSES:
        raise HTTPException(
            400,
            f"Status must be one of {sorted(VALID_STATUSES)}."
        )

    update = crud.add_update(
        db,
        college,
        status=status,
        text=text
    )

    for photo in photos or []:
        if not photo.filename:
            continue

        relative_path = storage.save_upload(photo, "updates")
        crud.add_update_photo(db, update, relative_path)

    db.refresh(update)

    return update_to_out(update)


@router.delete(
    "/{college_id}/updates/{update_id}",
    status_code=204
)
def delete_update_route(
    college_id: str,
    update_id: str,
    db: Session = Depends(get_db)
):
    update = crud.get_update(db, update_id)

    if not update or update.college_id != college_id:
        raise HTTPException(404, "Update not found.")

    crud.delete_update(db, update)


@router.delete(
    "/{college_id}/updates/{update_id}/photos/{photo_id}",
    status_code=204
)
def delete_photo_route(
    college_id: str,
    update_id: str,
    photo_id: str,
    db: Session = Depends(get_db)
):
    photo = crud.get_photo(db, photo_id)

    if not photo or photo.update_id != update_id:
        raise HTTPException(404, "Photo not found.")

    crud.delete_photo(db, photo)