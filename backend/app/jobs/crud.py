from sqlalchemy.orm import Session
from app.jobs.model import Job


def create_job(db: Session, job: Job) -> Job:
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def get_job_by_id(db: Session, job_id: int) -> Job | None:
    return db.query(Job).filter(Job.id == job_id).first()


def get_all_jobs(db: Session):
    return db.query(Job).all()


def get_jobs_by_employer(db: Session, employer_id: int):
    return db.query(Job).filter(Job.employer_id == employer_id).all()


def update_job(db: Session, job: Job) -> Job:
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def delete_job(db: Session, job: Job):
    db.delete(job)
    db.commit()