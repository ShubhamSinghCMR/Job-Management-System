from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.users.model import User
from app.users.schema import UserUpdateRequest, UserResponse
from app.users import service


router = APIRouter(prefix="/api/v1/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_current_logged_in_user(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.put("/me", response_model=UserResponse)
def update_current_logged_in_user(
    data: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated_user, error = service.update_current_user(
        current_user.id,
        data,
        db,
    )

    if error == "USER_NOT_FOUND":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return updated_user