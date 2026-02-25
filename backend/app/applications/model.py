from sqlalchemy import Column, Integer, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), index=True)
    jobseeker_id = Column(Integer, ForeignKey("users.id"), index=True)
    status = Column(String(50), default="pending")
    applied_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("job_id", "jobseeker_id", name="unique_job_application"),
    )

    job = relationship("Job", back_populates="applications")
    jobseeker = relationship("User", back_populates="applications")