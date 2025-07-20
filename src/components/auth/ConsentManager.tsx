'use client';

import React, { useState } from 'react';
import { recordConsent, type ConsentRecord } from '@/lib/privacy-manager';

interface ConsentItem {
  type: ConsentRecord['consent_type'];
  title: string;
  description: string;
  required: boolean;
  defaultValue: boolean;
}

interface ConsentManagerProps {
  userId: string;
  onConsentComplete: (consents: Record<string, boolean>) => void;
  showTitle?: boolean;
}

const CONSENT_ITEMS: ConsentItem[] = [
  {
    type: 'data_collection',
    title: 'Data Collection & Processing',
    description: 'Allow us to collect and process your profile information and stories for platform functionality.',
    required: true,
    defaultValue: true
  },
  {
    type: 'ai_analysis',
    title: 'AI-Powered Insights',
    description: 'Enable AI analysis of your stories to generate community insights and help organizations understand impact. All analysis is privacy-preserving.',
    required: false,
    defaultValue: true
  },
  {
    type: 'research_participation',
    title: 'Research Participation',
    description: 'Allow researchers to include your anonymized stories in academic studies. You will be fairly compensated for any value created.',
    required: false,
    defaultValue: false
  },
  {
    type: 'sharing',
    title: 'Story Sharing',
    description: 'Allow your stories to be shared by others (with proper attribution) to amplify community voices and create awareness.',
    required: false,
    defaultValue: true
  },
  {
    type: 'marketing',
    title: 'Platform Updates',
    description: 'Receive occasional updates about new features, community highlights, and platform improvements.',
    required: false,
    defaultValue: false
  }
];

export default function ConsentManager({ userId, onConsentComplete, showTitle = true }: ConsentManagerProps) {
  const [consents, setConsents] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    CONSENT_ITEMS.forEach(item => {
      initial[item.type] = item.required ? true : item.defaultValue;
    });
    return initial;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConsentChange = (type: string, value: boolean) => {
    setConsents(prev => ({ ...prev, [type]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Record each consent
      await Promise.all(
        Object.entries(consents).map(([type, given]) =>
          recordConsent(userId, type as ConsentRecord['consent_type'], given, {
            ip_address: '127.0.0.1', // Would get real IP in production
            user_agent: navigator.userAgent
          })
        )
      );

      onConsentComplete(consents);
    } catch (error) {
      console.error('Error recording consents:', error);
      alert('Failed to save consent preferences. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {showTitle && (
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extralight text-gray-900 mb-4">
            Privacy Preferences
          </h2>
          <p className="text-gray-600 font-light">
            Help us understand how you'd like your data to be used. You can change these preferences anytime.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {CONSENT_ITEMS.map((item) => (
          <div key={item.type} className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-normal text-gray-900">{item.title}</h3>
                  {item.required && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-light">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 font-light leading-relaxed">
                  {item.description}
                </p>
              </div>
              
              <div className="flex-shrink-0">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consents[item.type]}
                    onChange={(e) => handleConsentChange(item.type, e.target.checked)}
                    disabled={item.required}
                    className="sr-only peer"
                  />
                  <div className={`
                    relative w-11 h-6 rounded-full peer 
                    peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300
                    ${item.required ? 'bg-gray-400' : 'bg-gray-200'}
                    peer-checked:after:translate-x-full peer-checked:after:border-white 
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                    after:bg-white after:border-gray-300 after:border after:rounded-full 
                    after:h-5 after:w-5 after:transition-all
                    ${consents[item.type] ? 'peer-checked:bg-blue-600' : ''}
                  `}></div>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Indigenous Data Sovereignty Notice */}
      <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
        <h3 className="font-normal text-amber-900 mb-2">🌱 Indigenous Data Sovereignty</h3>
        <p className="text-sm text-amber-800 font-light leading-relaxed">
          Our platform operates on Indigenous data sovereignty principles. Your stories are living entities that belong to you. 
          We act as custodians, not owners, ensuring cultural protocols are respected and community value is preserved.
        </p>
      </div>

      {/* Legal Notice */}
      <div className="mt-6 p-6 bg-gray-50 rounded-2xl">
        <h3 className="font-normal text-gray-900 mb-2">📋 Your Rights</h3>
        <div className="text-sm text-gray-600 font-light space-y-1">
          <p>• You can withdraw consent at any time from your privacy settings</p>
          <p>• You can export all your data in a portable format</p>
          <p>• You can request complete account deletion</p>
          <p>• You maintain ownership of all your stories and content</p>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-gray-900 text-white px-8 py-3 rounded-full font-light hover:bg-gray-800 smooth-transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving Preferences...' : 'Save Preferences'}
        </button>
      </div>

      {/* Footer Note */}
      <p className="text-xs text-center text-gray-500 font-light mt-6">
        By using Empathy Ledger, you agree to our{' '}
        <a href="/privacy" className="text-blue-600 hover:text-blue-800 no-underline">Privacy Policy</a>{' '}
        and{' '}
        <a href="/terms" className="text-blue-600 hover:text-blue-800 no-underline">Terms of Service</a>.
      </p>
    </div>
  );
}