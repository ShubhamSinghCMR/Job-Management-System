from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.rate_limiter import rate_limit
from app.core.logging_config import get_logger
from app.auth.schema import (
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.auth import service

logger = get_logger(__name__)


router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit("auth_register", limit=5, window_seconds=60))],
)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    user, error = service.register_user(data, db)

    if error == "EMAIL_ALREADY_EXISTS":
        logger.warning("Register failed: email already registered email=%s", data.email)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    if error:
        logger.warning("Register failed: %s email=%s", error, data.email)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error,
        )

    logger.info("User registered id=%s role=%s email=%s", user.id, user.role, user.email)
    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    dependencies=[Depends(rate_limit("auth_login", limit=10, window_seconds=60))],
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    token, error = service.login_user(
        form_data.username,  # username field will contain email
        form_data.password,
        db,
    )

    if error == "INVALID_CREDENTIALS":
        logger.warning("Login failed: invalid credentials email=%s", form_data.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if error == "INACTIVE_USER":
        logger.warning("Login failed: inactive user email=%s", form_data.username)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is inactive",
        )

    logger.info("User logged in email=%s", form_data.username)
    return {
        "access_token": token,
        "token_type": "bearer",
    }