import { type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showArrow?: boolean;
}

const sizeClasses = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
  xl: 'p-8',
};

export function BentoCard({
  children,
  className = '',
  onClick,
  href,
  size = 'md',
  showArrow = false,
}: BentoCardProps) {
  const baseClasses = `
    bento-card
    ${sizeClasses[size]}
    ${onClick || href ? 'cursor-pointer' : ''}
    ${className}
  `;

  const content = (
    <>
      {children}
      {showArrow && (onClick || href) && (
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)]" />
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} className={`${baseClasses} group block relative`}>
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={`${baseClasses} group relative text-left w-full`}>
        {content}
      </button>
    );
  }

  return <div className={baseClasses}>{children}</div>;
}

// Sub-components for consistent card layouts
interface CardHeaderProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function BentoCardHeader({ icon, title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-primary)]/10 flex items-center justify-center">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-sm font-medium text-[var(--color-text-muted)]">{title}</h3>
          {subtitle && (
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

interface CardValueProps {
  value: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  size?: 'sm' | 'md' | 'lg';
}

const valueSizeClasses = {
  sm: 'text-2xl',
  md: 'text-3xl',
  lg: 'text-4xl',
};

export function BentoCardValue({ value, trend, size = 'md' }: CardValueProps) {
  return (
    <div className="space-y-1">
      <p className={`font-bold text-[var(--color-text-heading)] ${valueSizeClasses[size]} tracking-tight`}>
        {value}
      </p>
      {trend && (
        <p className={`text-sm font-medium ${trend.isPositive ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
          {trend.isPositive ? '+' : ''}{trend.value}
        </p>
      )}
    </div>
  );
}
