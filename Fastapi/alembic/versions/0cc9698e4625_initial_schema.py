"""initial schema

Revision ID: 0cc9698e4625
Revises: 
Create Date: 2026-11-20 21:44:15.665334

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = '0cc9698e4625'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None
def upgrade() -> None:
    pass


def downgrade() -> None:
    pass