from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.constants import UserRole
from app.users.model import User
from app.admin.schema import OverviewStatsResponse, PeriodStatsResponse
from app.admin import service


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