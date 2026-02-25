from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.constants import UserRole
from app.users.model import User
from app.seed import service


router = APIRouter(prefix="/api/v1/seed", tags=["Sample Data"])


@router.post("/")
def seed_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can load sample data"
        )

    return service.seed_database(db)