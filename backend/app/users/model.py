from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), index=True, nullable=False)
    is_active = Column(Boolean, default=True)
    failed_login_attempts = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    skills = Column(String(500), nullable=True)
    location = Column(String(255), nullable=True)
    designation = Column(String(100), nullable=True)
    company = Column(String(200), nullable=True)
    about = Column(String(1000), nullable=True)

    jobs = relationship("Job", back_populates="employer", cascade="all, delete")
    applications = relationship("Application", back_populates="jobseeker")