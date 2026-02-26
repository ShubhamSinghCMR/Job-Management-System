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


@router.get("/check-email")
def check_email_availability(
    email: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns { \"available\": true } if email is not taken by another user, else { \"available\": false }. Current user's own email is considered available."""
    from app.users import crud
    if not email or not email.strip():
        return {"available": False}
    existing = crud.get_user_by_email(db, email.strip())
    if existing is None or existing.id == current_user.id:
        return {"available": True}
    return {"available": False}


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

    if error == "EMAIL_TAKEN":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already in use"
        )

    if error == "CURRENT_PASSWORD_REQUIRED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is required to change email or password"
        )

    if error == "INVALID_CURRENT_PASSWORD":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    return updated_user