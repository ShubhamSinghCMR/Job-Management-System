from sqlalchemy.orm import Session
from sqlalchemy import func
from app.jobs.model import Job
from app.applications.model import Application


def create_job(db: Session, job: Job) -> Job:
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def get_job_by_id(db: Session, job_id: int) -> Job | None:
    from sqlalchemy.orm import joinedload
    return (
        db.query(Job)
        .options(joinedload(Job.employer))
        .filter(Job.id == job_id)
        .first()
    )


def get_all_jobs(db: Session):
    from sqlalchemy.orm import joinedload
    return (
        db.query(Job)
        .options(joinedload(Job.employer))
        .order_by(Job.created_at.desc())
        .all()
    )


def get_jobs_by_employer(db: Session, employer_id: int):
    return db.query(Job).filter(Job.employer_id == employer_id).order_by(Job.created_at.desc()).all()


def get_jobs_by_employer_with_applicant_counts(db: Session, employer_id: int):
    """Returns list of (Job, applicant_count)."""
    count_subq = (
        db.query(Application.job_id, func.count(Application.id).label("applicant_count"))
        .group_by(Application.job_id)
        .subquery()
    )
    rows = (
        db.query(Job, func.coalesce(count_subq.c.applicant_count, 0).label("applicant_count"))
        .outerjoin(count_subq, Job.id == count_subq.c.job_id)
        .filter(Job.employer_id == employer_id)
        .order_by(Job.created_at.desc())
        .all()
    )
    return [(row[0], int(row[1])) for row in rows]


def update_job(db: Session, job: Job) -> Job:
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def delete_job(db: Session, job: Job):
    db.delete(job)
    db.commit()


def get_employer_stats(db: Session, employer_id: int):
    """Returns (total_jobs, total_applications, hot_jobs list of dicts)."""
    rows = (
        db.query(
            Job.id,
            Job.title,
            Job.location,
            Job.created_at,
            func.count(Application.id).label("applicant_count"),
        )
        .outerjoin(Application, Job.id == Application.job_id)
        .filter(Job.employer_id == employer_id)
        .group_by(Job.id, Job.title, Job.location, Job.created_at)
        .order_by(func.count(Application.id).desc())
        .all()
    )
    total_jobs = len(rows)
    total_applications = sum(r.applicant_count for r in rows)
    hot_jobs = [
        {
            "id": r.id,
            "title": r.title,
            "location": r.location,
            "applicant_count": r.applicant_count,
            "created_at": r.created_at,
        }
        for r in rows
    ]
    return total_jobs, total_applications, hot_jobs