from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class JobCreateRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: str = Field(..., min_length=10)
    location: str = Field(..., min_length=2, max_length=200)


class JobUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=200)
    description: Optional[str] = Field(None, min_length=10)
    location: Optional[str] = Field(None, min_length=2, max_length=200)


class JobResponse(BaseModel):
    id: int
    title: str
    description: str
    location: str
    employer_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class JobDetailResponse(JobResponse):
    """Job with employer company name for detail view."""
    company: Optional[str] = None


class HotJobEntry(BaseModel):
    id: int
    title: str
    location: str
    applicant_count: int
    created_at: Optional[datetime] = None


class EmployerStatsResponse(BaseModel):
    total_jobs: int
    total_applications: int
    hot_jobs: list[HotJobEntry]