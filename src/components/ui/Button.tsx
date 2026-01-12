'use client';

import React from 'react';
import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  variant?:
    | 'primary'
    | 'secondary'
    | 'cta'
    | 'ghost'
    | 'danger'
    | 'outline-white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  href,
  onClick,
  type = 'button',
  className = '',
  icon,
  iconPosition = 'left',
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none';

  const variantClasses = {
    primary:
      'bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 focus:ring-2 focus:ring-[var(--primary)]/50 focus:ring-offset-2',
    secondary:
      'bg-[var(--secondary)] text-white hover:bg-[var(--secondary)]/90 focus:ring-2 focus:ring-[var(--secondary)]/50 focus:ring-offset-2',
    cta: 'bg-[var(--accent)] text-[var(--foreground)] hover:bg-[var(--accent)]/90 focus:ring-2 focus:ring-[var(--accent)]/50 focus:ring-offset-2 hover:scale-105',
    ghost:
      'text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)] focus:ring-2 focus:ring-[var(--primary)]/50 focus:ring-offset-2',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-400 focus:ring-offset-2',
    'outline-white':
      'border border-white text-white hover:bg-white hover:text-[var(--foreground)] focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-[var(--radius-button)]',
    md: 'px-6 py-2.5 text-base rounded-[var(--radius-button)]',
    lg: 'px-8 py-3 text-lg rounded-[var(--radius-button)]',
    xl: 'px-10 py-4 text-xl rounded-[var(--radius-button)]',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass =
    disabled || loading ? 'opacity-50 cursor-not-allowed' : '';

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${widthClass}
    ${disabledClass}
    ${className}
  `.trim();

  const LoadingSpinner = () => (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const content = (
    <>
      {loading && <LoadingSpinner />}
      {icon && iconPosition === 'left' && !loading && (
        <span className="mr-2">{icon}</span>
      )}
      <span>{children}</span>
      {icon && iconPosition === 'right' && !loading && (
        <span className="ml-2">{icon}</span>
      )}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
    >
      {content}
    </button>
  );
};

export default Button;
