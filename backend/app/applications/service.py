from sqlalchemy.orm import Session
from app.applications import crud
from app.applications.model import Application
from app.jobs.model import Job


def apply_to_job(job_id: int, user_id: int, db: Session):

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        return None, "JOB_NOT_FOUND"

    existing = crud.get_application_by_job_and_user(db, job_id, user_id)
    if existing:
        return None, "ALREADY_APPLIED"

    application = Application(
        job_id=job_id,
        jobseeker_id=user_id
    )

    application = crud.create_application(db, application)

    return application, None


def get_my_applications(user_id: int, db: Session):
    return crud.get_applications_by_user(db, user_id)


def get_job_applications(job_id: int, db: Session):
    return crud.get_applications_by_job(db, job_id)