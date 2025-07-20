'use client';

import React from 'react';
import Image from 'next/image';

interface Partner {
  name: string;
  logo: string;
  url?: string;
}

interface TrustBarProps {
  label?: string;
  partners?: Partner[];
  className?: string;
}

const TrustBar: React.FC<TrustBarProps> = ({
  label = 'Trusted by',
  partners = [
    { name: 'CSIRO', logo: '/partners/csiro.png', url: 'https://csiro.au' },
    { name: 'Beyond Blue', logo: '/partners/beyondblue.png', url: 'https://beyondblue.org.au' },
    { name: 'Red Cross', logo: '/partners/redcross.png', url: 'https://redcross.org.au' },
    { name: 'University of Queensland', logo: '/partners/uq.png', url: 'https://uq.edu.au' }
  ],
  className = ''
}) => {
  // Placeholder logos until real ones are added
  const PlaceholderLogo: React.FC<{ name: string }> = ({ name }) => (
    <div className="h-12 px-6 flex items-center justify-center bg-gray-200 rounded text-gray-600 font-medium text-sm">
      {name}
    </div>
  );

  return (
    <div className={`trust-bar ${className}`}>
      <span className="trust-bar__label">{label}</span>
      <div className="trust-bar__logos">
        {partners.map((partner) => (
          <div key={partner.name} className="partner-logo">
            {partner.url ? (
              <a 
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`Visit ${partner.name}`}
                className="block hover:opacity-100 transition-opacity"
              >
                {/* Use placeholder for now - replace with actual logos */}
                <PlaceholderLogo name={partner.name} />
              </a>
            ) : (
              <PlaceholderLogo name={partner.name} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Additional component for trust metrics
export const TrustMetrics: React.FC = () => {
  const metrics = [
    { value: '10,000+', label: 'Stories Protected' },
    { value: '99.9%', label: 'Uptime' },
    { value: '256-bit', label: 'Encryption' },
    { value: '100%', label: 'Australian Owned' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
      {metrics.map((metric) => (
        <div key={metric.label} className="text-center">
          <div className="text-2xl md:text-3xl font-bold text-primary-700">
            {metric.value}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {metric.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrustBar;