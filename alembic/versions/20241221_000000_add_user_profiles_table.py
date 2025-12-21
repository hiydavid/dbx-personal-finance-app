"""Add user profiles table.

Revision ID: 002_user_profiles
Revises: 001_initial
Create Date: 2024-12-21 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '002_user_profiles'
down_revision: Union[str, None] = '001_initial'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
  # Create enum types
  marital_status_enum = postgresql.ENUM(
    'single', 'married', 'divorced', 'widowed', 'separated',
    name='marital_status_enum',
    create_type=False,
  )
  employment_status_enum = postgresql.ENUM(
    'employed_full_time', 'employed_part_time', 'self_employed',
    'unemployed', 'retired', 'student',
    name='employment_status_enum',
    create_type=False,
  )
  risk_tolerance_enum = postgresql.ENUM(
    'conservative', 'moderately_conservative', 'moderate',
    'moderately_aggressive', 'aggressive',
    name='risk_tolerance_enum',
    create_type=False,
  )
  tax_filing_status_enum = postgresql.ENUM(
    'single', 'married_filing_jointly', 'married_filing_separately',
    'head_of_household', 'qualifying_widow',
    name='tax_filing_status_enum',
    create_type=False,
  )

  # Create enums in database
  marital_status_enum.create(op.get_bind(), checkfirst=True)
  employment_status_enum.create(op.get_bind(), checkfirst=True)
  risk_tolerance_enum.create(op.get_bind(), checkfirst=True)
  tax_filing_status_enum.create(op.get_bind(), checkfirst=True)

  # Create user_profiles table
  op.create_table(
    'user_profiles',
    sa.Column('user_email', sa.String(255), primary_key=True),
    # Demographics
    sa.Column('date_of_birth', sa.Date, nullable=True),
    sa.Column('marital_status', marital_status_enum, nullable=True),
    sa.Column('number_of_dependents', sa.Integer, server_default='0'),
    # Employment
    sa.Column('employment_status', employment_status_enum, nullable=True),
    sa.Column('employer_name', sa.String(255), nullable=True),
    sa.Column('job_title', sa.String(255), nullable=True),
    sa.Column('years_employed', sa.Integer, nullable=True),
    # Financial
    sa.Column('annual_income', sa.Float, nullable=True),
    sa.Column('risk_tolerance', risk_tolerance_enum, nullable=True),
    sa.Column('tax_filing_status', tax_filing_status_enum, nullable=True),
    # Goals
    sa.Column('financial_goals', postgresql.JSONB, nullable=True),
    sa.Column('investment_experience_years', sa.Integer, nullable=True),
    sa.Column('retirement_age_target', sa.Integer, nullable=True),
    sa.Column('notes', sa.Text, nullable=True),
    # Timestamps
    sa.Column(
      'created_at',
      sa.DateTime(timezone=True),
      server_default=sa.func.now(),
      nullable=False,
    ),
    sa.Column(
      'updated_at',
      sa.DateTime(timezone=True),
      server_default=sa.func.now(),
      nullable=False,
    ),
  )


def downgrade() -> None:
  op.drop_table('user_profiles')

  # Drop enum types
  postgresql.ENUM(name='tax_filing_status_enum').drop(op.get_bind(), checkfirst=True)
  postgresql.ENUM(name='risk_tolerance_enum').drop(op.get_bind(), checkfirst=True)
  postgresql.ENUM(name='employment_status_enum').drop(op.get_bind(), checkfirst=True)
  postgresql.ENUM(name='marital_status_enum').drop(op.get_bind(), checkfirst=True)
