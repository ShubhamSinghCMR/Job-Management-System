from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random

from app.users.model import User
from app.jobs.model import Job
from app.applications.model import Application
from app.core.security import hash_password
from app.core.constants import UserRole


def seed_database(db: Session):

    now = datetime.utcnow()

    # -------------------------
    # USERS
    # -------------------------

    users_data = [
        {"name": "Admin", "email": "admin@test.com", "role": UserRole.ADMIN.value},
        {"name": "Employer1", "email": "employer1@test.com", "role": UserRole.EMPLOYER.value},
        {"name": "Employer2", "email": "employer2@test.com", "role": UserRole.EMPLOYER.value},
        {"name": "Jobseeker1", "email": "job1@test.com", "role": UserRole.JOBSEEKER.value},
        {"name": "Jobseeker2", "email": "job2@test.com", "role": UserRole.JOBSEEKER.value},
        {"name": "Jobseeker3", "email": "job3@test.com", "role": UserRole.JOBSEEKER.value},
    ]

    for user_data in users_data:
        existing = db.query(User).filter(User.email == user_data["email"]).first()

        if not existing:
            days_ago = random.randint(0, 60)
            created_time = now - timedelta(days=days_ago)

            user = User(
                name=user_data["name"],
                email=user_data["email"],
                password_hash=hash_password("password123"),
                role=user_data["role"],
                created_at=created_time,
            )
            db.add(user)

    db.commit()

    # -------------------------
    # JOBS
    # -------------------------

    employers = db.query(User).filter(User.role == UserRole.EMPLOYER.value).all()

    sample_jobs = [
        {"title": "Backend Developer", "description": "FastAPI experience required", "location": "Remote"},
        {"title": "Frontend Developer", "description": "Bootstrap + JS required", "location": "Delhi"},
        {"title": "DevOps Engineer", "description": "CI/CD and Docker knowledge", "location": "Bangalore"},
    ]

    for employer in employers:
        for job_data in sample_jobs:

            existing_job = db.query(Job).filter(
                Job.title == job_data["title"],
                Job.employer_id == employer.id
            ).first()

            if not existing_job:
                days_ago = random.randint(0, 60)
                created_time = now - timedelta(days=days_ago)

                job = Job(
                    title=job_data["title"],
                    description=job_data["description"],
                    location=job_data["location"],
                    employer_id=employer.id,
                    created_at=created_time,
                )
                db.add(job)

    db.commit()

    # -------------------------
    # APPLICATIONS
    # -------------------------

    jobseekers = db.query(User).filter(User.role == UserRole.JOBSEEKER.value).all()
    jobs = db.query(Job).all()

    for jobseeker in jobseekers:
        for job in jobs:

            existing_application = db.query(Application).filter(
                Application.job_id == job.id,
                Application.jobseeker_id == jobseeker.id
            ).first()

            if not existing_application:
                days_ago = random.randint(0, 60)
                created_time = now - timedelta(days=days_ago)

                application = Application(
                    job_id=job.id,
                    jobseeker_id=jobseeker.id,
                    applied_at=created_time,
                )
                db.add(application)

    db.commit()

    return {"message": "Sample data loaded successfully"}