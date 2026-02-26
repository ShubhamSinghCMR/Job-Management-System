from sqlalchemy.orm import Session
from app.users.model import User
from app.users import crud
from app.users.schema import UserUpdateRequest
from app.core.security import hash_password, verify_password


def update_current_user(
    user_id: int,
    data: UserUpdateRequest,
    db: Session,
) -> tuple[User | None, str | None]:

    user = crud.get_user_by_id(db, user_id)

    if not user:
        return None, "USER_NOT_FOUND"

    # When changing email or password, require current password for confirmation
    if data.email is not None or data.password is not None:
        if not data.current_password or not data.current_password.strip():
            return None, "CURRENT_PASSWORD_REQUIRED"
        if not verify_password(data.current_password, user.password_hash):
            return None, "INVALID_CURRENT_PASSWORD"

    if data.name is not None:
        user.name = data.name

    if data.email is not None:
        existing = crud.get_user_by_email(db, data.email)
        if existing and existing.id != user_id:
            return None, "EMAIL_TAKEN"
        user.email = data.email

    if data.password is not None:
        user.password_hash = hash_password(data.password)

    if data.skills is not None:
        user.skills = data.skills

    if data.location is not None:
        user.location = data.location

    if data.designation is not None:
        user.designation = data.designation

    if data.company is not None:
        user.company = data.company

    if data.about is not None:
        user.about = data.about

    user = crud.update_user(db, user)

    return user, None