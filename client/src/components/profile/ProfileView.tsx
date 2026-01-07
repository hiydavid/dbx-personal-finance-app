import { useState, useEffect } from 'react';
import { User, Briefcase, DollarSign, Target, Calendar, Users, Building2, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/components/finance';
import { fetchWithAuth } from '@/contexts/UserContext';
import {
  MARITAL_STATUS_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  RISK_TOLERANCE_OPTIONS,
  TAX_FILING_STATUS_OPTIONS,
} from '@/lib/profile-types';
import type { UserProfile } from '@/lib/profile-types';

function getLabel(options: { value: string; label: string }[], value: string | null | undefined): string {
  if (!value) return '—';
  const option = options.find(opt => opt.value === value);
  return option?.label || value;
}

interface ProfileFieldProps {
  label: string;
  value: string | number | null | undefined;
  icon?: React.ReactNode;
}

function ProfileField({ label, value, icon }: ProfileFieldProps) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-[var(--color-muted-foreground)] mb-1">{label}</span>
      <span className="flex items-center gap-2 text-base font-medium">
        {icon}
        {value ?? '—'}
      </span>
    </div>
  );
}

export function ProfileView() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const response = await fetchWithAuth('/api/profile');
        const result = await response.json();

        if (result.success) {
          setProfile(result.data);
        } else {
          setError(result.error || 'Failed to load profile');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent-primary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center">
        <p className="text-[var(--color-muted-foreground)]">No profile data found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-[var(--color-muted-foreground)]">
          Your personal and financial information for advisor recommendations
        </p>
      </header>

      {/* Personal Information Section */}
      <section className="bg-card rounded-lg border shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-5 w-5 text-[var(--color-accent-primary)]" />
          <h2 className="text-lg font-semibold">Personal Information</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <ProfileField
            label="Age"
            value={profile.age ? `${profile.age} years` : null}
            icon={<Calendar className="h-4 w-4 text-[var(--color-muted-foreground)]" />}
          />
          <ProfileField
            label="Date of Birth"
            value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : null}
          />
          <ProfileField
            label="Marital Status"
            value={getLabel(MARITAL_STATUS_OPTIONS, profile.maritalStatus)}
          />
          <ProfileField
            label="Dependents"
            value={profile.numberOfDependents}
            icon={<Users className="h-4 w-4 text-[var(--color-muted-foreground)]" />}
          />
          <ProfileField
            label="Tax Filing Status"
            value={getLabel(TAX_FILING_STATUS_OPTIONS, profile.taxFilingStatus)}
          />
        </div>
      </section>

      {/* Employment Section */}
      <section className="bg-card rounded-lg border shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Briefcase className="h-5 w-5 text-[var(--color-accent-primary)]" />
          <h2 className="text-lg font-semibold">Employment</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <ProfileField
            label="Status"
            value={getLabel(EMPLOYMENT_STATUS_OPTIONS, profile.employmentStatus)}
          />
          <ProfileField
            label="Employer"
            value={profile.employerName}
            icon={<Building2 className="h-4 w-4 text-[var(--color-muted-foreground)]" />}
          />
          <ProfileField
            label="Job Title"
            value={profile.jobTitle}
          />
          <ProfileField
            label="Years at Company"
            value={profile.yearsEmployed ? `${profile.yearsEmployed} years` : null}
          />
        </div>
      </section>

      {/* Financial Section */}
      <section className="bg-card rounded-lg border shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <DollarSign className="h-5 w-5 text-[var(--color-accent-primary)]" />
          <h2 className="text-lg font-semibold">Financial Information</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <ProfileField
            label="Annual Income"
            value={profile.annualIncome ? formatCurrency(profile.annualIncome) : null}
          />
          <ProfileField
            label="Risk Tolerance"
            value={getLabel(RISK_TOLERANCE_OPTIONS, profile.riskTolerance)}
          />
          <ProfileField
            label="Investment Experience"
            value={profile.investmentExperienceYears ? `${profile.investmentExperienceYears} years` : null}
          />
        </div>
      </section>

      {/* Goals Section */}
      <section className="bg-card rounded-lg border shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Target className="h-5 w-5 text-[var(--color-accent-primary)]" />
          <h2 className="text-lg font-semibold">Goals</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <ProfileField
            label="Target Retirement Age"
            value={profile.retirementAgeTarget}
          />
        </div>
        {profile.notes && (
          <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
            <span className="text-sm text-[var(--color-muted-foreground)] block mb-2">Notes for Advisor</span>
            <p className="text-base">{profile.notes}</p>
          </div>
        )}
      </section>

      {/* Last Updated */}
      {profile.updatedAt && (
        <p className="text-sm text-[var(--color-muted-foreground)] text-right">
          Last updated: {new Date(profile.updatedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}
