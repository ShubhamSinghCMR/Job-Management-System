from sqlalchemy.orm import Session
from app.jobs import crud
from app.jobs.model import Job
from app.jobs.schema import JobCreateRequest, JobUpdateRequest


def create_job(
    employer_id: int,
    data: JobCreateRequest,
    db: Session,
):
    job = Job(
        title=data.title,
        description=data.description,
        location=data.location,
        employer_id=employer_id,
    )

    return crud.create_job(db, job)


def get_all_jobs(db: Session):
    return crud.get_all_jobs(db)


def get_job_by_id(db: Session, job_id: int):
    return crud.get_job_by_id(db, job_id)


def get_employer_jobs(employer_id: int, db: Session):
    return crud.get_jobs_by_employer(db, employer_id)


def get_employer_jobs_with_applicant_counts(employer_id: int, db: Session):
    return crud.get_jobs_by_employer_with_applicant_counts(db, employer_id)


def get_employer_stats(employer_id: int, db: Session):
    return crud.get_employer_stats(db, employer_id)


def update_job(
    job_id: int,
    employer_id: int,
    data: JobUpdateRequest,
    db: Session,
):
    job = crud.get_job_by_id(db, job_id)

    if not job:
        return None, "JOB_NOT_FOUND"

    if job.employer_id != employer_id:
        return None, "NOT_OWNER"

    if data.title is not None:
        job.title = data.title

    if data.description is not None:
        job.description = data.description

    if data.location is not None:
        job.location = data.location

    job = crud.update_job(db, job)

    return job, None


def delete_job(job_id: int, employer_id: int, db: Session):
    job = crud.get_job_by_id(db, job_id)

    if not job:
        return "JOB_NOT_FOUND"

    if job.employer_id != employer_id:
        return "NOT_OWNER"

    crud.delete_job(db, job)

    return None