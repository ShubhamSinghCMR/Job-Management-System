from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.auth.schema import UserResponse
from app.users.model import User


router = APIRouter(prefix="/api/v1/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_current_logged_in_user(
    current_user: User = Depends(get_current_user)
):
    return current_user