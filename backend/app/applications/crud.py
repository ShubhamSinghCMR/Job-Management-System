from sqlalchemy.orm import Session
from app.applications.model import Application


def create_application(db: Session, application: Application):
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


def get_application_by_job_and_user(db: Session, job_id: int, user_id: int):
    return db.query(Application).filter(
        Application.job_id == job_id,
        Application.jobseeker_id == user_id
    ).first()


def get_applications_by_user(db: Session, user_id: int):
    return db.query(Application).filter(
        Application.jobseeker_id == user_id
    ).all()


def get_applications_by_job(db: Session, job_id: int):
    return db.query(Application).filter(
        Application.job_id == job_id
    ).all()