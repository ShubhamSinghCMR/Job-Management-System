"""add designation and company to users

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-02-26

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, Sequence[str], None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("designation", sa.String(length=100), nullable=True))
    op.add_column("users", sa.Column("company", sa.String(length=200), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "company")
    op.drop_column("users", "designation")
