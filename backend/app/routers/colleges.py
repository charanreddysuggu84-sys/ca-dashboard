from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from sqlalchemy.orm import Session

from .. import crud, schemas, storage

from ..database import get_db

from ..serializers import college_to_out, college_to_detail_out


router = APIRouter(prefix="/api/colleges", tags=["colleges"])


@router.get("", response_model=List[schemas.CollegeOut])
def list_colleges(db: Session = Depends(get_db)):
    return [college_to_out(c) for c in crud.list_colleges(db)]


@router.post("", response_model=schemas.CollegeOut, status_code=201)
def create_college(
    payload: schemas.CollegeCreate,
    db: Session = Depends(get_db)
):
    name = payload.name.strip()

    if not name:
        raise HTTPException(400, "College name is required.")

    if crud.get_college_by_name(db, name):
        raise HTTPException(409, f'"{name}" is already on the list.')

    college = crud.create_college(
        db,
        name=name,
        ca_name=payload.ca_name,
        ca_phone=payload.ca_phone,
        ca_email=payload.ca_email
    )

    return college_to_out(college)


@router.post("/merge", response_model=schemas.CollegeOut)
def merge_colleges_route(
    payload: schemas.MergeRequest,
    db: Session = Depends(get_db)
):
    try:
        target = crud.merge_colleges(
            db,
            payload.source_id,
            payload.target_id
        )
    except ValueError as e:
        raise HTTPException(400, str(e))

    return college_to_out(target)


@router.get("/{college_id}", response_model=schemas.CollegeDetailOut)
def get_college(
    college_id: str,
    db: Session = Depends(get_db)
):
    college = crud.get_college(db, college_id)

    if not college:
        raise HTTPException(404, "College not found.")

    return college_to_detail_out(college)


@router.post("/{college_id}/photo", response_model=schemas.CollegeOut)
def upload_profile_photo(
    college_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    college = crud.get_college(db, college_id)

    if not college:
        raise HTTPException(404, "College not found.")

    if college.profile_pic_path:
        storage.delete_upload(college.profile_pic_path)

    relative_path = storage.save_upload(file, "profiles")

    college = crud.set_profile_pic(
        db,
        college,
        relative_path
    )

    return college_to_out(college)


@router.patch("/{college_id}/issues", response_model=schemas.CollegeOut)
def update_issue_notes(
    college_id: str,
    payload: schemas.IssueNotesUpdate,
    db: Session = Depends(get_db)
):
    college = crud.get_college(db, college_id)

    if not college:
        raise HTTPException(404, "College not found.")

    college = crud.set_issue_notes(
        db,
        college,
        payload.issue_notes
    )

    return college_to_out(college)


@router.patch(
    "/{college_id}/description",
    response_model=schemas.CollegeOut
)
def update_description(
    college_id: str,
    payload: schemas.DescriptionUpdate,
    db: Session = Depends(get_db)
):
    college = crud.get_college(db, college_id)

    if not college:
        raise HTTPException(404, "College not found.")

    college = crud.set_description(
        db,
        college,
        payload.description
    )

    return college_to_out(college)


@router.delete("/{college_id}", status_code=204)
def delete_college_route(
    college_id: str,
    db: Session = Depends(get_db)
):
    college = crud.get_college(db, college_id)

    if not college:
        raise HTTPException(404, "College not found.")

    crud.delete_college(db, college)