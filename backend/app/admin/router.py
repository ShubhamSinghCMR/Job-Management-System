from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.constants import UserRole
from app.users.model import User
from app.admin.schema import OverviewStatsResponse, PeriodStatsResponse
from app.admin import service
from app.users.schema import UserResponse
from app.jobs.schema import JobResponse
from app.applications.schema import ApplicationResponse


router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])


def admin_required(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


@router.get("/stats/overview", response_model=OverviewStatsResponse)
def overview(
    db: Session = Depends(get_db),
    _: User = Depends(admin_required),
):
    return service.get_overview(db)


@router.get("/stats/jobs", response_model=PeriodStatsResponse)
def job_stats(
    period: str,
    db: Session = Depends(get_db),
    _: User = Depends(admin_required),
):
    data, error = service.get_job_stats(period, db)

    if error == "INVALID_PERIOD":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid period. Use daily, weekly, monthly, yearly"
        )

    return {"data": data}


@router.get("/stats/users", response_model=PeriodStatsResponse)
def user_stats(
    period: str,
    db: Session = Depends(get_db),
    _: User = Depends(admin_required),
):
    data, error = service.get_user_stats(period, db)

    if error == "INVALID_PERIOD":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid period. Use daily, weekly, monthly, yearly"
        )

    return {"data": data}

# ===============================
# USERS MANAGEMENT
# ===============================

@router.get("/users", response_model=list[UserResponse])
def admin_list_users(
    db: Session = Depends(get_db),
    _: User = Depends(admin_required),
):
    return service.list_users(db)


@router.patch("/users/{user_id}/toggle")
def admin_toggle_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(admin_required),
):
    user, error = service.toggle_user_active(user_id, db)

    if error == "USER_NOT_FOUND":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return {"message": "User status updated"}


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(admin_required),
):
    error = service.remove_user(user_id, db)

    if error == "USER_NOT_FOUND":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return None


# ===============================
# JOBS MANAGEMENT
# ===============================

@router.get("/jobs", response_model=list[JobResponse])
def admin_list_jobs(
    db: Session = Depends(get_db),
    _: User = Depends(admin_required),
):
    return service.list_jobs(db)


@router.delete("/jobs/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(admin_required),
):
    error = service.remove_job(job_id, db)

    if error == "JOB_NOT_FOUND":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    return None


# ===============================
# APPLICATIONS MANAGEMENT
# ===============================

@router.get("/applications", response_model=list[ApplicationResponse])
def admin_list_applications(
    db: Session = Depends(get_db),
    _: User = Depends(admin_required),
):
    return service.list_applications(db)