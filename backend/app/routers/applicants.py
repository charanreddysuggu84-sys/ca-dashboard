from typing import List

from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from .. import crud, schemas

from ..database import get_db

from ..serializers import applicant_to_out


router = APIRouter(prefix="/api/applicants", tags=["applicants"])


@router.get("", response_model=List[schemas.ApplicantOut])
def list_applicants(db: Session = Depends(get_db)):
    return [
        applicant_to_out(a)
        for a in crud.list_applicants(db)
    ]


@router.delete("/{applicant_id}", status_code=204)
def delete_applicant_route(
    applicant_id: str,
    db: Session = Depends(get_db)
):
    applicant = crud.get_applicant(db, applicant_id)

    if not applicant:
        raise HTTPException(404, "Applicant not found.")

    crud.delete_applicant(db, applicant)