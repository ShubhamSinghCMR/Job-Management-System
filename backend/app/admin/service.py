from sqlalchemy.orm import Session
from app.admin import crud


def get_overview(db: Session):
    return crud.get_overview_stats(db)


def get_job_stats(period: str, db: Session):

    results = crud.get_jobs_grouped_by_period(db, period)
    if results is None:
        return None, "INVALID_PERIOD"

    formatted = [
        {"period": row[0], "count": row[1]}
        for row in results
    ]

    return formatted, None


def get_user_stats(period: str, db: Session):

    results = crud.get_users_grouped_by_period(db, period)
    if results is None:
        return None, "INVALID_PERIOD"

    formatted = [
        {"period": row[0], "count": row[1]}
        for row in results
    ]

    return formatted, None

# ===============================
# USERS MANAGEMENT
# ===============================

def list_users(db: Session):
    return crud.get_all_users(db)


def toggle_user_active(user_id: int, db: Session):
    user = crud.get_user_by_id(db, user_id)

    if not user:
        return None, "USER_NOT_FOUND"

    user.is_active = not user.is_active
    user = crud.update_user(db, user)

    return user, None


def remove_user(user_id: int, db: Session):
    user = crud.get_user_by_id(db, user_id)

    if not user:
        return "USER_NOT_FOUND"

    crud.delete_user(db, user)
    return None


# ===============================
# JOBS MANAGEMENT
# ===============================

def list_jobs(db: Session):
    return crud.get_all_jobs(db)


def remove_job(job_id: int, db: Session):
    job = crud.get_job_by_id(db, job_id)

    if not job:
        return "JOB_NOT_FOUND"

    crud.delete_job(db, job)
    return None


# ===============================
# APPLICATIONS MANAGEMENT
# ===============================

def list_applications(db: Session):
    return crud.get_all_applications(db)