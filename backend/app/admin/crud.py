from sqlalchemy.orm import Session
from sqlalchemy import func
from app.users.model import User
from app.jobs.model import Job
from app.applications.model import Application


def get_overview_stats(db: Session):

    total_users = db.query(User).count()
    total_employers = db.query(User).filter(User.role == "employer").count()
    total_jobseekers = db.query(User).filter(User.role == "jobseeker").count()
    total_jobs = db.query(Job).count()
    total_applications = db.query(Application).count()

    return {
        "total_users": total_users,
        "total_employers": total_employers,
        "total_jobseekers": total_jobseekers,
        "total_jobs": total_jobs,
        "total_applications": total_applications,
    }


def get_jobs_grouped_by_period(db: Session, period: str):

    if period == "daily":
        group_format = "%Y-%m-%d"
    elif period == "weekly":
        group_format = "%Y-%W"
    elif period == "monthly":
        group_format = "%Y-%m"
    elif period == "yearly":
        group_format = "%Y"
    else:
        return None

    results = (
        db.query(
            func.strftime(group_format, Job.created_at).label("period"),
            func.count(Job.id)
        )
        .group_by("period")
        .order_by("period")
        .all()
    )

    return results


def get_users_grouped_by_period(db: Session, period: str):

    if period == "daily":
        group_format = "%Y-%m-%d"
    elif period == "weekly":
        group_format = "%Y-%W"
    elif period == "monthly":
        group_format = "%Y-%m"
    elif period == "yearly":
        group_format = "%Y"
    else:
        return None

    results = (
        db.query(
            func.strftime(group_format, User.created_at).label("period"),
            func.count(User.id)
        )
        .group_by("period")
        .order_by("period")
        .all()
    )

    return results

# ===============================
# USERS MANAGEMENT
# ===============================

def get_all_users(db: Session):
    return db.query(User).all()


def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def update_user(db: Session, user: User):
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user: User):
    db.delete(user)
    db.commit()


# ===============================
# JOBS MANAGEMENT
# ===============================

def get_all_jobs(db: Session):
    return db.query(Job).all()


def get_job_by_id(db: Session, job_id: int):
    return db.query(Job).filter(Job.id == job_id).first()


def delete_job(db: Session, job: Job):
    db.delete(job)
    db.commit()


# ===============================
# APPLICATIONS MANAGEMENT
# ===============================

def get_all_applications(db: Session):
    return db.query(Application).all()