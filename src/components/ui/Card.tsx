'use client';

import React from 'react';
import Link from 'next/link';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'trust' | 'empathy' | 'warmth' | 'story';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  href,
  onClick,
  className = ''
}) => {
  const baseClasses = 'card bg-white border border-gray-200 rounded-xl transition-all duration-normal';
  
  const variantClasses = {
    default: '',
    trust: 'card--trust border-t-4 border-t-primary-500',
    empathy: 'card--empathy border-t-4 border-t-teal-500',
    warmth: 'card--warmth border-t-4 border-t-coral-500',
    story: 'border-l-4 border-l-teal-500'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const hoverClass = hover || href || onClick 
    ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' 
    : '';

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${paddingClasses[padding]}
    ${hoverClass}
    ${className}
  `.trim();

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  if (onClick) {
    return (
      <div onClick={onClick} className={classes} role="button" tabIndex={0}>
        {children}
      </div>
    );
  }

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

// Story Card Component
interface StoryCardProps {
  name?: string;
  location?: string;
  preview: string;
  avatar?: string;
  isAnonymous?: boolean;
  href: string;
  timestamp?: string;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  name,
  location,
  preview,
  avatar,
  isAnonymous = false,
  href,
  timestamp
}) => {
  const displayName = isAnonymous ? 'Community Member' : name;
  
  return (
    <Card variant="story" hover href={href}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {avatar ? (
            <img 
              src={avatar} 
              alt={displayName} 
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
              <span className="text-teal-700 font-semibold text-lg">
                {displayName?.charAt(0) || 'A'}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">
              {displayName}
            </p>
            {timestamp && (
              <p className="text-xs text-gray-500">
                {timestamp}
              </p>
            )}
          </div>
          
          {location && (
            <p className="text-sm text-gray-500 flex items-center mt-0.5">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {location}
            </p>
          )}
          
          <p className="text-gray-700 mt-2 line-clamp-3">
            {preview}
          </p>
          
          <p className="text-teal-600 text-sm font-medium mt-3 flex items-center">
            Read Story
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 5l7 7-7 7" />
            </svg>
          </p>
        </div>
      </div>
    </Card>
  );
};

// Impact Metric Card
interface MetricCardProps {
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'trust' | 'empathy' | 'warmth';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  value,
  label,
  trend,
  trendValue,
  icon,
  variant = 'default'
}) => {
  const trendIcons = {
    up: (
      <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    ),
    down: (
      <svg className="w-5 h-5 text-error" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    ),
    stable: (
      <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    )
  };

  return (
    <Card variant={variant}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-3xl font-bold text-gray-900">
            {value}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {label}
          </p>
          {trend && (
            <div className="flex items-center mt-2">
              {trendIcons[trend]}
              {trendValue && (
                <span className={`text-sm ml-1 ${
                  trend === 'up' ? 'text-success' : 
                  trend === 'down' ? 'text-error' : 
                  'text-gray-500'
                }`}>
                  {trendValue}
                </span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default Card;