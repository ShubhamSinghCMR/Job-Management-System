from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ApplicationResponse(BaseModel):
    id: int
    job_id: Optional[int] = None
    jobseeker_id: int
    status: str
    applied_at: datetime

    class Config:
        from_attributes = True


class ApplicationStatusUpdate(BaseModel):
    status: str


class ApplicationWithJobseekerResponse(BaseModel):
    id: int
    job_id: int
    jobseeker_id: int
    status: str
    applied_at: datetime
    jobseeker_name: str
    jobseeker_email: str
    jobseeker_skills: Optional[str] = None
    jobseeker_location: Optional[str] = None

    class Config:
        from_attributes = True