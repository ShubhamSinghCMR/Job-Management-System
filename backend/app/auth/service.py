from sqlalchemy.orm import Session

from app.auth import crud
from app.auth.schema import RegisterRequest
from app.users.model import User
from app.core.security import hash_password, verify_password, create_access_token


def _password_strength_error(password: str) -> str | None:
    """
    Basic strength check:
    - At least 8 characters (also enforced by schema)
    - At least one letter
    - At least one digit
    """
    has_letter = any(c.isalpha() for c in password)
    has_digit = any(c.isdigit() for c in password)

    if not has_letter or not has_digit:
        return "Password must contain at least one letter and one number."

    return None


def register_user(data: RegisterRequest, db: Session) -> tuple[User | None, str | None]:
    existing_user = crud.get_user_by_email(db, data.email)
    if existing_user:
        return None, "EMAIL_ALREADY_EXISTS"

    pw_error = _password_strength_error(data.password)
    if pw_error:
        return None, pw_error

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role.value,
    )

    user = crud.create_user(db, user)
    return user, None


def login_user(email: str, password: str, db: Session) -> tuple[str | None, str | None]:
    user = crud.get_user_by_email(db, email)

    if not user:
        return None, "INVALID_CREDENTIALS"

    if not verify_password(password, user.password_hash):
        return None, "INVALID_CREDENTIALS"

    if not user.is_active:
        return None, "INACTIVE_USER"

    token = create_access_token(data={"sub": str(user.id)})

    return token, None