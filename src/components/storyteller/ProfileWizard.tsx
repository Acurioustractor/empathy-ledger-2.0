'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ProfileWizardProps {
  storytellerId: string;
  onComplete: () => void;
}

export default function ProfileWizard({ storytellerId, onComplete }: ProfileWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({
    professional_summary: '',
    current_role: '',
    current_organization: '',
    professional_journey_narrative: '',
    expertise_areas: [] as string[],
    speaking_topics: [] as string[],
    consulting_services: [] as string[],
    privacy_tier_settings: {
      public: { 
        basic_identity: true, 
        professional_overview: true, 
        story_previews: true, 
        contact_options: true 
      },
      paywall: { 
        price_monthly: 25, 
        price_annual: 250, 
        one_time_price: 50 
      },
      organizational: { 
        available: true, 
        services: ['consultation', 'speaking'], 
        partnership_preferences: {} 
      }
    }
  });

  const steps = [
    { title: 'Basic Identity', component: BasicIdentityStep },
    { title: 'Professional Story', component: ProfessionalStoryStep },
    { title: 'Expertise & Services', component: ExpertiseServicesStep },
    { title: 'Privacy & Monetization', component: PrivacyMonetizationStep },
    { title: 'Review & Publish', component: ReviewPublishStep },
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save profile and complete
      saveProfile();
    }
  };

  const saveProfile = async () => {
    try {
      const response = await fetch(`/api/storyteller/${storytellerId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      
      if (response.ok) {
        onComplete();
      }
    } catch (error) {
      console.error('Profile save error:', error);
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index + 1 <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <span className="ml-2 text-sm font-medium">{step.title}</span>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  index + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current step content */}
      <CurrentStepComponent 
        data={profileData} 
        onChange={setProfileData} 
      />

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <Button onClick={handleNext}>
          {currentStep === steps.length ? 'Publish Profile' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

// Step components
function BasicIdentityStep({ data, onChange }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Basic Professional Identity</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Current Role</label>
          <input
            type="text"
            value={data.current_role}
            onChange={(e) => onChange({...data, current_role: e.target.value})}
            placeholder="e.g., Founder & Platform Builder"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Organization</label>
          <input
            type="text"
            value={data.current_organization}
            onChange={(e) => onChange({...data, current_organization: e.target.value})}
            placeholder="e.g., A Curious Tractor"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Professional Summary (2-3 sentences)</label>
        <textarea
          value={data.professional_summary}
          onChange={(e) => onChange({...data, professional_summary: e.target.value})}
          placeholder="What makes your professional approach unique? What value do you bring?"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
    </div>
  );
}

function ProfessionalStoryStep({ data, onChange }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Professional Story & Journey</h2>
      
      <div>
        <label className="block text-sm font-medium mb-2">Professional Journey Narrative</label>
        <textarea
          value={data.professional_journey_narrative}
          onChange={(e) => onChange({...data, professional_journey_narrative: e.target.value})}
          placeholder="Tell the story of your professional evolution. What key experiences shaped your approach? How did you get to where you are today?"
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <p className="text-sm text-gray-500 mt-1">This will be visible in your premium tier. Share key moments, challenges, and growth experiences.</p>
      </div>
    </div>
  );
}

function ExpertiseServicesStep({ data, onChange }: any) {
  const [newExpertise, setNewExpertise] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newService, setNewService] = useState('');

  const addExpertise = () => {
    if (newExpertise.trim()) {
      onChange({
        ...data,
        expertise_areas: [...data.expertise_areas, newExpertise.trim()]
      });
      setNewExpertise('');
    }
  };

  const addTopic = () => {
    if (newTopic.trim()) {
      onChange({
        ...data,
        speaking_topics: [...data.speaking_topics, newTopic.trim()]
      });
      setNewTopic('');
    }
  };

  const addService = () => {
    if (newService.trim()) {
      onChange({
        ...data,
        consulting_services: [...data.consulting_services, newService.trim()]
      });
      setNewService('');
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Expertise & Services</h2>
      
      {/* Expertise Areas */}
      <div>
        <label className="block text-sm font-medium mb-2">Expertise Areas</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newExpertise}
            onChange={(e) => setNewExpertise(e.target.value)}
            placeholder="e.g., Community-Centered Platform Development"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            onKeyPress={(e) => e.key === 'Enter' && addExpertise()}
          />
          <Button onClick={addExpertise}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.expertise_areas.map((area: string, index: number) => (
            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {area}
              <button
                onClick={() => onChange({
                  ...data,
                  expertise_areas: data.expertise_areas.filter((_: any, i: number) => i !== index)
                })}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Speaking Topics */}
      <div>
        <label className="block text-sm font-medium mb-2">Speaking Topics</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="e.g., The Future of Professional Networking"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            onKeyPress={(e) => e.key === 'Enter' && addTopic()}
          />
          <Button onClick={addTopic}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.speaking_topics.map((topic: string, index: number) => (
            <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {topic}
              <button
                onClick={() => onChange({
                  ...data,
                  speaking_topics: data.speaking_topics.filter((_: any, i: number) => i !== index)
                })}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Consulting Services */}
      <div>
        <label className="block text-sm font-medium mb-2">Consulting Services</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            placeholder="e.g., Platform Development Strategy"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            onKeyPress={(e) => e.key === 'Enter' && addService()}
          />
          <Button onClick={addService}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.consulting_services.map((service: string, index: number) => (
            <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              {service}
              <button
                onClick={() => onChange({
                  ...data,
                  consulting_services: data.consulting_services.filter((_: any, i: number) => i !== index)
                })}
                className="ml-2 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PrivacyMonetizationStep({ data, onChange }: any) {
  const updatePricing = (tier: string, field: string, value: string) => {
    const newSettings = {
      ...data.privacy_tier_settings,
      [tier]: {
        ...data.privacy_tier_settings[tier],
        [field]: parseFloat(value) || 0
      }
    };
    onChange({...data, privacy_tier_settings: newSettings});
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Privacy Tiers & Monetization</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Public Tier */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-green-600 mb-3">Public Tier (Free)</h3>
          <p className="text-sm text-gray-600 mb-4">What visitors see for free</p>
          <ul className="space-y-2 text-sm">
            <li>✓ Basic professional identity</li>
            <li>✓ Story previews and summaries</li>
            <li>✓ Expertise areas (top 3)</li>
            <li>✓ Contact options</li>
          </ul>
        </div>

        {/* Paywall Tier */}
        <div className="border rounded-lg p-4 border-blue-500">
          <h3 className="font-semibold text-blue-600 mb-3">Paywall Tier</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1">Monthly Price ($)</label>
              <input
                type="number"
                value={data.privacy_tier_settings.paywall.price_monthly}
                onChange={(e) => updatePricing('paywall', 'price_monthly', e.target.value)}
                placeholder="25"
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Annual Price ($)</label>
              <input
                type="number"
                value={data.privacy_tier_settings.paywall.price_annual}
                onChange={(e) => updatePricing('paywall', 'price_annual', e.target.value)}
                placeholder="250"
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
          <ul className="space-y-1 text-xs mt-3">
            <li>✓ Complete story portfolio</li>
            <li>✓ Professional insights</li>
            <li>✓ Direct contact info</li>
            <li>✓ Quote library</li>
          </ul>
        </div>

        {/* Organizational Tier */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-purple-600 mb-3">Organizational Tier</h3>
          <p className="text-sm text-gray-600 mb-4">Custom partnerships & services</p>
          <ul className="space-y-2 text-sm">
            <li>✓ Speaking engagements</li>
            <li>✓ Consultation services</li>
            <li>✓ Custom content creation</li>
            <li>✓ Advisory partnerships</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function ReviewPublishStep({ data }: any) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Review & Publish</h2>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Profile Summary</h3>
        
        <div className="space-y-4">
          <div>
            <span className="font-medium">Role:</span> {data.current_role} at {data.current_organization}
          </div>
          
          <div>
            <span className="font-medium">Summary:</span> {data.professional_summary}
          </div>
          
          <div>
            <span className="font-medium">Expertise Areas ({data.expertise_areas.length}):</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {data.expertise_areas.map((area: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {area}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <span className="font-medium">Pricing:</span> 
            ${data.privacy_tier_settings.paywall.price_monthly}/month, ${data.privacy_tier_settings.paywall.price_annual}/year
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Ready to Publish?</h4>
        <p className="text-blue-700 text-sm">
          Your profile will be live and discoverable once published. You can edit all settings after publishing.
        </p>
      </div>
    </div>
  );
}