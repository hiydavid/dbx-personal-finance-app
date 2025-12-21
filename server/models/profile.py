"""Pydantic models for user profile API."""

from datetime import date, datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class MaritalStatus(str, Enum):
  """Marital status options."""
  single = 'single'
  married = 'married'
  divorced = 'divorced'
  widowed = 'widowed'
  separated = 'separated'


class EmploymentStatus(str, Enum):
  """Employment status options."""
  employed_full_time = 'employed_full_time'
  employed_part_time = 'employed_part_time'
  self_employed = 'self_employed'
  unemployed = 'unemployed'
  retired = 'retired'
  student = 'student'


class RiskTolerance(str, Enum):
  """Investment risk tolerance levels."""
  conservative = 'conservative'
  moderately_conservative = 'moderately_conservative'
  moderate = 'moderate'
  moderately_aggressive = 'moderately_aggressive'
  aggressive = 'aggressive'


class TaxFilingStatus(str, Enum):
  """IRS tax filing status options."""
  single = 'single'
  married_filing_jointly = 'married_filing_jointly'
  married_filing_separately = 'married_filing_separately'
  head_of_household = 'head_of_household'
  qualifying_widow = 'qualifying_widow'


class FinancialGoal(BaseModel):
  """A single financial goal."""
  name: str
  target_amount: Optional[float] = Field(default=None, alias='targetAmount')
  target_date: Optional[date] = Field(default=None, alias='targetDate')
  priority: Optional[int] = Field(default=None, ge=1, le=5)

  model_config = {'populate_by_name': True}


class UserProfileBase(BaseModel):
  """Base fields for user profile (shared between request/response)."""
  date_of_birth: Optional[date] = Field(default=None, alias='dateOfBirth')
  marital_status: Optional[MaritalStatus] = Field(default=None, alias='maritalStatus')
  number_of_dependents: int = Field(default=0, ge=0, alias='numberOfDependents')

  employment_status: Optional[EmploymentStatus] = Field(default=None, alias='employmentStatus')
  employer_name: Optional[str] = Field(default=None, max_length=255, alias='employerName')
  job_title: Optional[str] = Field(default=None, max_length=255, alias='jobTitle')
  years_employed: Optional[int] = Field(default=None, ge=0, alias='yearsEmployed')

  annual_income: Optional[float] = Field(default=None, ge=0, alias='annualIncome')
  risk_tolerance: Optional[RiskTolerance] = Field(default=None, alias='riskTolerance')
  tax_filing_status: Optional[TaxFilingStatus] = Field(default=None, alias='taxFilingStatus')

  financial_goals: Optional[list[FinancialGoal]] = Field(default=None, alias='financialGoals')
  investment_experience_years: Optional[int] = Field(
    default=None, ge=0, alias='investmentExperienceYears'
  )
  retirement_age_target: Optional[int] = Field(
    default=None, ge=18, le=100, alias='retirementAgeTarget'
  )
  notes: Optional[str] = None

  model_config = {'populate_by_name': True}


class UserProfileCreate(UserProfileBase):
  """Request model for creating/updating a profile (upsert)."""
  pass


class UserProfileUpdate(BaseModel):
  """Request model for partial updates (PATCH).

  All fields are optional to support partial updates.
  """
  date_of_birth: Optional[date] = Field(default=None, alias='dateOfBirth')
  marital_status: Optional[MaritalStatus] = Field(default=None, alias='maritalStatus')
  number_of_dependents: Optional[int] = Field(default=None, ge=0, alias='numberOfDependents')

  employment_status: Optional[EmploymentStatus] = Field(default=None, alias='employmentStatus')
  employer_name: Optional[str] = Field(default=None, max_length=255, alias='employerName')
  job_title: Optional[str] = Field(default=None, max_length=255, alias='jobTitle')
  years_employed: Optional[int] = Field(default=None, ge=0, alias='yearsEmployed')

  annual_income: Optional[float] = Field(default=None, ge=0, alias='annualIncome')
  risk_tolerance: Optional[RiskTolerance] = Field(default=None, alias='riskTolerance')
  tax_filing_status: Optional[TaxFilingStatus] = Field(default=None, alias='taxFilingStatus')

  financial_goals: Optional[list[FinancialGoal]] = Field(default=None, alias='financialGoals')
  investment_experience_years: Optional[int] = Field(
    default=None, ge=0, alias='investmentExperienceYears'
  )
  retirement_age_target: Optional[int] = Field(
    default=None, ge=18, le=100, alias='retirementAgeTarget'
  )
  notes: Optional[str] = None

  model_config = {'populate_by_name': True}


class UserProfileResponse(UserProfileBase):
  """Response model including user email and computed fields."""
  user_email: str = Field(alias='userEmail')
  age: Optional[int] = None
  created_at: datetime = Field(alias='createdAt')
  updated_at: datetime = Field(alias='updatedAt')


class ProfileApiResponse(BaseModel):
  """Standard API response wrapper."""
  success: bool
  data: Optional[UserProfileResponse] = None
  error: Optional[str] = None
