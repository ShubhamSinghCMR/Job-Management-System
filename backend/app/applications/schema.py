from pydantic import BaseModel
from datetime import datetime


class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    jobseeker_id: int
    created_at: datetime

    class Config:
        from_attributes = True