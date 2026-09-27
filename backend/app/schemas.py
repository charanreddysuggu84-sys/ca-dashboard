from datetime import datetime

from typing import Optional, List

from pydantic import BaseModel, ConfigDict


# ---------- Applicant ----------

class ApplicantOut(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    phone: str
    email: str
    college_name: str
    college_original: str
    year: str
    branch: str
    city: str
    profile: str
    experience: str
    why: str
    comfortable: str
    timestamp: str


# ---------- Photo ----------

class PhotoOut(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: str
    url: str


# ---------- Daily update ----------

class UpdateOut(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: str
    status: str
    text: str
    created_at: datetime
    photos: List[PhotoOut] = []


# ---------- College ----------

class CollegeOut(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    ca_name: str
    ca_phone: str
    ca_email: str
    status: str
    last_update_text: str
    last_update_at: Optional[datetime]
    profile_pic_url: Optional[str] = None
    reg_count: int
    issue_notes: str = ""
    description: str = ""


class CollegeDetailOut(CollegeOut):

    applicants: List[ApplicantOut] = []
    updates: List[UpdateOut] = []


class CollegeCreate(BaseModel):

    name: str
    ca_name: str = ""
    ca_phone: str = ""
    ca_email: str = ""


class UpdateCreate(BaseModel):

    status: str
    text: str = ""


# ---------- Issue notes ----------

class IssueNotesUpdate(BaseModel):

    issue_notes: str = ""


# ---------- College merge ----------

class MergeRequest(BaseModel):

    source_id: str
    target_id: str


# ---------- College description ----------

class DescriptionUpdate(BaseModel):

    description: str = ""