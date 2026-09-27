from datetime import datetime

import uuid

from sqlalchemy import (
    Column, String, Integer, DateTime, ForeignKey, Text
)

from sqlalchemy.orm import relationship

from .database import Base


def gen_id() -> str:
    return uuid.uuid4().hex[:12]


class College(Base):
    __tablename__ = "colleges"

    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String, unique=True, nullable=False, index=True)
    ca_name = Column(String, default="")
    ca_phone = Column(String, default="")
    ca_email = Column(String, default="")
    status = Column(String, default="Not Started")
    last_update_text = Column(Text, default="")
    last_update_at = Column(DateTime, nullable=True)
    issue_notes = Column(Text, default="")
    description = Column(Text, default="")
    profile_pic_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    applicants = relationship(
        "Applicant",
        back_populates="college",
        cascade="all, delete-orphan"
    )

    updates = relationship(
        "DailyUpdate",
        back_populates="college",
        cascade="all, delete-orphan",
        order_by="desc(DailyUpdate.created_at)",
    )

    @property
    def reg_count(self) -> int:
        return len(self.applicants)


class Applicant(Base):
    __tablename__ = "applicants"

    id = Column(String, primary_key=True, default=gen_id)
    college_id = Column(String, ForeignKey("colleges.id"), nullable=False)
    name = Column(String, default="")
    phone = Column(String, default="")
    email = Column(String, default="")
    college_name = Column(String, default="")
    college_original = Column(String, default="")
    year = Column(String, default="")
    branch = Column(String, default="")
    city = Column(String, default="")
    profile = Column(String, default="")
    experience = Column(String, default="")
    why = Column(Text, default="")
    comfortable = Column(String, default="")
    timestamp = Column(String, default="")

    college = relationship("College", back_populates="applicants")


class DailyUpdate(Base):
    __tablename__ = "daily_updates"

    id = Column(String, primary_key=True, default=gen_id)
    college_id = Column(String, ForeignKey("colleges.id"), nullable=False)
    status = Column(String, default="Not Started")
    text = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    college = relationship("College", back_populates="updates")

    photos = relationship(
        "UpdatePhoto",
        back_populates="update",
        cascade="all, delete-orphan"
    )


class UpdatePhoto(Base):
    __tablename__ = "update_photos"

    id = Column(String, primary_key=True, default=gen_id)
    update_id = Column(String, ForeignKey("daily_updates.id"), nullable=False)
    path = Column(String, nullable=False)

    update = relationship("DailyUpdate", back_populates="photos")