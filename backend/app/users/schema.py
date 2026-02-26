from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.core.constants import UserRole


class UserUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6, max_length=72)
    current_password: Optional[str] = None  # required when changing email or password
    skills: Optional[str] = Field(None, max_length=500)
    location: Optional[str] = Field(None, max_length=255)
    designation: Optional[str] = Field(None, max_length=100)
    company: Optional[str] = Field(None, max_length=200)
    about: Optional[str] = Field(None, max_length=1000)


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole
    skills: Optional[str] = None
    location: Optional[str] = None
    designation: Optional[str] = None
    company: Optional[str] = None
    about: Optional[str] = None
    is_active: Optional[bool] = True

    class Config:
        from_attributes = True