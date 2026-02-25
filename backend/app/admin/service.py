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