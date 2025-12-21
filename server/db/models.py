"""SQLAlchemy models for chat storage and user profiles.

This module defines the database schema for persistent chat storage
and user profile data.
"""

from datetime import date, datetime
from enum import Enum as PyEnum
from typing import Optional

from sqlalchemy import Date, DateTime, Enum, Float, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class MaritalStatus(str, PyEnum):
  """Marital status options."""
  single = 'single'
  married = 'married'
  divorced = 'divorced'
  widowed = 'widowed'
  separated = 'separated'


class EmploymentStatus(str, PyEnum):
  """Employment status options."""
  employed_full_time = 'employed_full_time'
  employed_part_time = 'employed_part_time'
  self_employed = 'self_employed'
  unemployed = 'unemployed'
  retired = 'retired'
  student = 'student'


class RiskTolerance(str, PyEnum):
  """Investment risk tolerance levels."""
  conservative = 'conservative'
  moderately_conservative = 'moderately_conservative'
  moderate = 'moderate'
  moderately_aggressive = 'moderately_aggressive'
  aggressive = 'aggressive'


class TaxFilingStatus(str, PyEnum):
  """IRS tax filing status options."""
  single = 'single'
  married_filing_jointly = 'married_filing_jointly'
  married_filing_separately = 'married_filing_separately'
  head_of_household = 'head_of_household'
  qualifying_widow = 'qualifying_widow'


class Base(DeclarativeBase):
  """Base class for all SQLAlchemy models."""

  pass


class ChatModel(Base):
  """SQLAlchemy model for chat sessions."""

  __tablename__ = 'chats'

  id: Mapped[str] = mapped_column(String(50), primary_key=True)
  user_email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
  title: Mapped[str] = mapped_column(String(255), default='New Chat')
  agent_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
  created_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True), default=func.now(), nullable=False
  )
  updated_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False
  )

  # Relationship to messages
  messages: Mapped[list['MessageModel']] = relationship(
    'MessageModel',
    back_populates='chat',
    cascade='all, delete-orphan',
    order_by='MessageModel.timestamp',
  )

  __table_args__ = (
    Index('ix_chats_user_updated', 'user_email', 'updated_at'),
  )

  def to_dict(self) -> dict:
    """Convert to dictionary for JSON serialization."""
    return {
      'id': self.id,
      'user_email': self.user_email,
      'title': self.title,
      'agent_id': self.agent_id,
      'created_at': self.created_at.isoformat() if self.created_at else None,
      'updated_at': self.updated_at.isoformat() if self.updated_at else None,
      'messages': [msg.to_dict() for msg in self.messages] if self.messages else [],
    }


class MessageModel(Base):
  """SQLAlchemy model for chat messages."""

  __tablename__ = 'messages'

  id: Mapped[str] = mapped_column(String(50), primary_key=True)
  chat_id: Mapped[str] = mapped_column(
    String(50), ForeignKey('chats.id', ondelete='CASCADE'), nullable=False, index=True
  )
  role: Mapped[str] = mapped_column(String(20), nullable=False)
  content: Mapped[str] = mapped_column(Text, nullable=False)
  timestamp: Mapped[datetime] = mapped_column(
    DateTime(timezone=True), default=func.now(), nullable=False
  )
  trace_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
  trace_summary: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

  # Relationship back to chat
  chat: Mapped['ChatModel'] = relationship('ChatModel', back_populates='messages')

  __table_args__ = (
    Index('ix_messages_chat_timestamp', 'chat_id', 'timestamp'),
  )

  def to_dict(self) -> dict:
    """Convert to dictionary for JSON serialization."""
    return {
      'id': self.id,
      'chat_id': self.chat_id,
      'role': self.role,
      'content': self.content,
      'timestamp': self.timestamp.isoformat() if self.timestamp else None,
      'trace_id': self.trace_id,
      'trace_summary': self.trace_summary,
    }


class UserProfileModel(Base):
  """SQLAlchemy model for user profile data.

  Stores demographic and personal information for financial advisor recommendations.
  One profile per user, keyed by user_email.
  """

  __tablename__ = 'user_profiles'

  # Primary key is user_email (one profile per user)
  user_email: Mapped[str] = mapped_column(String(255), primary_key=True)

  # Demographic info
  date_of_birth: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
  marital_status: Mapped[Optional[str]] = mapped_column(
    Enum(MaritalStatus, name='marital_status_enum', create_type=True),
    nullable=True
  )
  number_of_dependents: Mapped[int] = mapped_column(Integer, default=0)

  # Employment info
  employment_status: Mapped[Optional[str]] = mapped_column(
    Enum(EmploymentStatus, name='employment_status_enum', create_type=True),
    nullable=True
  )
  employer_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
  job_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
  years_employed: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

  # Financial info
  annual_income: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
  risk_tolerance: Mapped[Optional[str]] = mapped_column(
    Enum(RiskTolerance, name='risk_tolerance_enum', create_type=True),
    nullable=True
  )
  tax_filing_status: Mapped[Optional[str]] = mapped_column(
    Enum(TaxFilingStatus, name='tax_filing_status_enum', create_type=True),
    nullable=True
  )

  # Goals and notes
  financial_goals: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
  investment_experience_years: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
  retirement_age_target: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
  notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

  # Timestamps
  created_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True), default=func.now(), nullable=False
  )
  updated_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False
  )

  def to_dict(self) -> dict:
    """Convert to dictionary for JSON serialization."""
    return {
      'user_email': self.user_email,
      'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
      'marital_status': self.marital_status,
      'number_of_dependents': self.number_of_dependents,
      'employment_status': self.employment_status,
      'employer_name': self.employer_name,
      'job_title': self.job_title,
      'years_employed': self.years_employed,
      'annual_income': self.annual_income,
      'risk_tolerance': self.risk_tolerance,
      'tax_filing_status': self.tax_filing_status,
      'financial_goals': self.financial_goals,
      'investment_experience_years': self.investment_experience_years,
      'retirement_age_target': self.retirement_age_target,
      'notes': self.notes,
      'created_at': self.created_at.isoformat() if self.created_at else None,
      'updated_at': self.updated_at.isoformat() if self.updated_at else None,
    }
