from sqlalchemy.orm import Session
from app.users.model import User
from app.users import crud
from app.users.schema import UserUpdateRequest
from app.core.security import hash_password


def update_current_user(
    user_id: int,
    data: UserUpdateRequest,
    db: Session,
) -> tuple[User | None, str | None]:

    user = crud.get_user_by_id(db, user_id)

    if not user:
        return None, "USER_NOT_FOUND"

    if data.name is not None:
        user.name = data.name

    if data.password is not None:
        user.password_hash = hash_password(data.password)

    user = crud.update_user(db, user)

    return user, None