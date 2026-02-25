from pydantic import BaseModel, Field
from typing import Optional


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

    class Config:
        from_attributes = True