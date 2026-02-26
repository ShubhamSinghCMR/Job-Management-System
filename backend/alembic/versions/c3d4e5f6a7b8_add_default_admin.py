"""add default admin user if no admin exists

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-02-26

Creates default admin: admin@test.com / password123 (change after first login).
"""
from typing import Sequence, Union

from alembic import op
from sqlalchemy import text


revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, Sequence[str], None] = "b2c3d4e5f6a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    # Check if any admin exists
    result = conn.execute(text("SELECT COUNT(*) FROM users WHERE role = 'admin'"))
    if result.scalar() > 0:
        return
    # Create default admin (password: password123)
    from app.core.security import hash_password
    password_hash = hash_password("password123")
    conn.execute(
        text(
            "INSERT INTO users (name, email, password_hash, role, is_active) "
            "VALUES (:name, :email, :password_hash, :role, 1)"
        ),
        {
            "name": "Admin",
            "email": "admin@test.com",
            "password_hash": password_hash,
            "role": "admin",
        },
    )


def downgrade() -> None:
    op.execute(text("DELETE FROM users WHERE email = 'admin@test.com' AND role = 'admin'"))
