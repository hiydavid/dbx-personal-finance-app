"""User profile management endpoints.

All endpoints are scoped to the current authenticated user.
"""

import logging
from datetime import date
from typing import Optional

from fastapi import APIRouter, Request
from sqlalchemy import select

from server.db import UserProfileModel, session_scope
from server.models.profile import (
  ProfileApiResponse,
  UserProfileCreate,
  UserProfileResponse,
  UserProfileUpdate,
)
from server.services.user import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix='/profile', tags=['profile'])


def _calculate_age(dob: Optional[date]) -> Optional[int]:
  """Calculate age from date of birth."""
  if not dob:
    return None
  today = date.today()
  age = today.year - dob.year
  if (today.month, today.day) < (dob.month, dob.day):
    age -= 1
  return age


def _model_to_response(model: UserProfileModel) -> UserProfileResponse:
  """Convert SQLAlchemy model to Pydantic response."""
  return UserProfileResponse(
    userEmail=model.user_email,
    dateOfBirth=model.date_of_birth,
    age=_calculate_age(model.date_of_birth),
    maritalStatus=model.marital_status,
    numberOfDependents=model.number_of_dependents,
    employmentStatus=model.employment_status,
    employerName=model.employer_name,
    jobTitle=model.job_title,
    yearsEmployed=model.years_employed,
    annualIncome=model.annual_income,
    riskTolerance=model.risk_tolerance,
    taxFilingStatus=model.tax_filing_status,
    financialGoals=model.financial_goals,
    investmentExperienceYears=model.investment_experience_years,
    retirementAgeTarget=model.retirement_age_target,
    notes=model.notes,
    createdAt=model.created_at,
    updatedAt=model.updated_at,
  )


@router.get('', response_model=ProfileApiResponse)
async def get_profile(request: Request):
  """Get the current user's profile.

  Returns profile data if exists, or null data with success=True if no profile yet.
  """
  try:
    user_email = await get_current_user(request)
    logger.info(f'Fetching profile for user: {user_email}')

    async with session_scope() as session:
      result = await session.execute(
        select(UserProfileModel).where(UserProfileModel.user_email == user_email)
      )
      profile = result.scalar_one_or_none()

      if profile:
        return ProfileApiResponse(success=True, data=_model_to_response(profile))
      else:
        return ProfileApiResponse(success=True, data=None)

  except Exception as e:
    logger.error(f'Error fetching profile: {e}')
    return ProfileApiResponse(success=False, error=str(e))


@router.put('', response_model=ProfileApiResponse)
async def upsert_profile(request: Request, body: UserProfileCreate):
  """Create or replace the current user's profile (upsert).

  If profile exists, replaces all fields. If not, creates new profile.
  """
  try:
    user_email = await get_current_user(request)
    logger.info(f'Upserting profile for user: {user_email}')

    async with session_scope() as session:
      # Check if profile exists
      result = await session.execute(
        select(UserProfileModel).where(UserProfileModel.user_email == user_email)
      )
      profile = result.scalar_one_or_none()

      profile_data = body.model_dump(by_alias=False, exclude_unset=False)
      # Convert financial_goals to list of dicts for JSONB
      if profile_data.get('financial_goals'):
        profile_data['financial_goals'] = [
          goal.model_dump(by_alias=False) if hasattr(goal, 'model_dump') else goal
          for goal in profile_data['financial_goals']
        ]

      if profile:
        # Update existing
        for key, value in profile_data.items():
          setattr(profile, key, value)
        logger.info(f'Updated existing profile for: {user_email}')
      else:
        # Create new
        profile = UserProfileModel(user_email=user_email, **profile_data)
        session.add(profile)
        logger.info(f'Created new profile for: {user_email}')

      await session.flush()
      await session.refresh(profile)

      return ProfileApiResponse(success=True, data=_model_to_response(profile))

  except Exception as e:
    logger.error(f'Error upserting profile: {e}')
    return ProfileApiResponse(success=False, error=str(e))


@router.patch('', response_model=ProfileApiResponse)
async def update_profile(request: Request, body: UserProfileUpdate):
  """Partially update the current user's profile.

  Only updates fields that are explicitly provided (not null).
  Creates profile if it doesn't exist.
  """
  try:
    user_email = await get_current_user(request)
    logger.info(f'Patching profile for user: {user_email}')

    async with session_scope() as session:
      result = await session.execute(
        select(UserProfileModel).where(UserProfileModel.user_email == user_email)
      )
      profile = result.scalar_one_or_none()

      # Only include fields that were explicitly set
      update_data = body.model_dump(by_alias=False, exclude_unset=True)
      # Convert financial_goals to list of dicts for JSONB
      if update_data.get('financial_goals'):
        update_data['financial_goals'] = [
          goal.model_dump(by_alias=False) if hasattr(goal, 'model_dump') else goal
          for goal in update_data['financial_goals']
        ]

      if profile:
        for key, value in update_data.items():
          setattr(profile, key, value)
        logger.info(f'Patched profile for: {user_email}')
      else:
        # Create new profile with partial data
        profile = UserProfileModel(user_email=user_email, **update_data)
        session.add(profile)
        logger.info(f'Created new profile via patch for: {user_email}')

      await session.flush()
      await session.refresh(profile)

      return ProfileApiResponse(success=True, data=_model_to_response(profile))

  except Exception as e:
    logger.error(f'Error patching profile: {e}')
    return ProfileApiResponse(success=False, error=str(e))


@router.delete('', response_model=ProfileApiResponse)
async def delete_profile(request: Request):
  """Delete the current user's profile."""
  try:
    user_email = await get_current_user(request)
    logger.info(f'Deleting profile for user: {user_email}')

    async with session_scope() as session:
      result = await session.execute(
        select(UserProfileModel).where(UserProfileModel.user_email == user_email)
      )
      profile = result.scalar_one_or_none()

      if profile:
        await session.delete(profile)
        logger.info(f'Deleted profile for: {user_email}')
        return ProfileApiResponse(success=True, data=None)
      else:
        return ProfileApiResponse(success=False, error='Profile not found')

  except Exception as e:
    logger.error(f'Error deleting profile: {e}')
    return ProfileApiResponse(success=False, error=str(e))
