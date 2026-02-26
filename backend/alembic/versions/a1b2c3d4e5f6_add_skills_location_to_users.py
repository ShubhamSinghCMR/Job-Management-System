"""add skills and location to users

Revision ID: a1b2c3d4e5f6
Revises: d7d857caed44
Create Date: 2026-02-26

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "d7d857caed44"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("skills", sa.String(length=500), nullable=True))
    op.add_column("users", sa.Column("location", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "location")
    op.drop_column("users", "skills")
