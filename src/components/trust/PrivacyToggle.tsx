'use client';

import React, { useState } from 'react';

interface PrivacyToggleProps {
  label: string;
  description?: string;
  defaultEnabled?: boolean;
  onChange?: (enabled: boolean) => void;
  sharingOptions?: {
    value: string;
    label: string;
    description?: string;
  }[];
}

const PrivacyToggle: React.FC<PrivacyToggleProps> = ({
  label,
  description,
  defaultEnabled = false,
  onChange,
  sharingOptions = [
    { value: 'private', label: 'Only me', description: 'Your story is completely private' },
    { value: 'community', label: 'My community', description: 'Share with verified community members' },
    { value: 'researchers', label: 'Researchers', description: 'Help create positive change through research' }
  ]
}) => {
  const [enabled, setEnabled] = useState(defaultEnabled);
  const [sharingLevel, setSharingLevel] = useState('private');
  const [showOptions, setShowOptions] = useState(false);

  const handleToggle = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    if (onChange) onChange(newEnabled);
    if (newEnabled) setShowOptions(true);
  };

  return (
    <div className="privacy-toggle flex-col">
      <div className="flex items-center justify-between w-full">
        <div className="flex-1">
          <label className="flex items-center cursor-pointer">
            <span className="text-base font-medium text-gray-900">{label}</span>
          </label>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={handleToggle}
          className={`
            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${enabled ? 'bg-teal-500' : 'bg-gray-300'}
          `}
        >
          <span
            aria-hidden="true"
            className={`
              pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
              transition duration-200 ease-in-out
              ${enabled ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
      </div>

      {enabled && showOptions && (
        <div className="mt-4 space-y-2 animate-slideUp">
          <p className="text-sm font-medium text-gray-700 mb-2">Who can see this?</p>
          <div className="space-y-2">
            {sharingOptions.map((option) => (
              <label
                key={option.value}
                className={`
                  flex items-start p-3 rounded-lg border cursor-pointer transition-all
                  ${sharingLevel === option.value 
                    ? 'border-teal-500 bg-teal-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <input
                  type="radio"
                  name="sharing-level"
                  value={option.value}
                  checked={sharingLevel === option.value}
                  onChange={(e) => setSharingLevel(e.target.value)}
                  className="mt-0.5 h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-gray-900">
                    {option.label}
                  </span>
                  {option.description && (
                    <span className="block text-sm text-gray-500 mt-0.5">
                      {option.description}
                    </span>
                  )}
                </div>
              </label>
            ))}
          </div>
          
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <div className="flex">
              <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="ml-2 text-sm text-blue-800">
                You can change these settings anytime. Your data remains under your control.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacyToggle;