"""Saves uploaded photos to local disk under backend/uploads/.

This is the one file you'd touch to move photo storage to S3 or
another cloud bucket later — everything else just calls save_upload()
and stores the relative path it returns.
"""
import os
import uuid
from fastapi import UploadFile

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_ROOT = os.path.join(BASE_DIR, "uploads")


def _ext(filename: str) -> str:
    _, ext = os.path.splitext(filename or "")
    ext = ext.lower()
    return ext if ext in (".jpg", ".jpeg", ".png", ".gif", ".webp") else ".jpg"


def save_upload(file: UploadFile, subfolder: str) -> str:
    """Writes the uploaded file to uploads/<subfolder>/<uuid><ext> and
    returns the relative path (e.g. 'profiles/ab12cd.jpg')."""
    folder = os.path.join(UPLOAD_ROOT, subfolder)
    os.makedirs(folder, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{_ext(file.filename)}"
    dest = os.path.join(folder, filename)
    with open(dest, "wb") as out:
        out.write(file.file.read())
    return f"{subfolder}/{filename}"


def delete_upload(relative_path: str) -> None:
    if not relative_path:
        return
    full = os.path.join(UPLOAD_ROOT, relative_path)
    if os.path.exists(full):
        try:
            os.remove(full)
        except OSError:
            pass
