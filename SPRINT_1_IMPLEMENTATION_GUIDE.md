# Sprint 1: Enhanced Profile System Foundation
## 3-Week Implementation Guide

*Critical foundation for Ben's case study and platform transformation*

---

## 🎯 Sprint 1 Overview

### Goal
Build the technical foundation for enhanced storyteller profiles with three-tier privacy system, service offerings, and revenue integration - everything needed for Ben's world-class profile.

### Success Criteria
- Ben can create complete enhanced profile with all features
- Three-tier privacy system (public/paywall/organizational) works flawlessly
- Payment processing enabled for profile subscriptions and services
- Mobile-responsive profile creation and viewing
- Foundation ready for other storytellers

---

## Week 1: Database Schema & Core Backend

### Day 1-2: Database Schema Implementation

#### Enhanced Storyteller Profiles
```sql
-- Run these migrations on your Supabase database

-- 1. Enhanced storyteller profiles
ALTER TABLE storytellers ADD COLUMN IF NOT EXISTS
  -- Professional Identity
  professional_summary TEXT,
  current_role TEXT,
  current_organization TEXT,
  professional_journey_narrative TEXT,
  professional_philosophy TEXT,
  
  -- Expertise & Skills
  expertise_areas TEXT[],
  industry_experience TEXT[],
  language_skills TEXT[],
  certifications TEXT[],
  lived_experience_categories TEXT[],
  
  -- Services & Availability
  speaking_topics TEXT[],
  consulting_services TEXT[],
  workshop_capabilities TEXT[],
  collaboration_preferences JSONB,
  
  -- Privacy & Monetization
  privacy_tier_settings JSONB DEFAULT '{
    "public": {
      "basic_identity": true,
      "professional_overview": true,
      "story_previews": true,
      "contact_options": true
    },
    "paywall": {
      "price_monthly": 0,
      "price_annual": 0,
      "one_time_price": 0
    },
    "organizational": {
      "available": false,
      "services": [],
      "partnership_preferences": {}
    }
  }'::jsonb,
  
  -- Professional Status
  seeking_opportunities BOOLEAN DEFAULT false,
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'limited', 'unavailable', 'by_inquiry')),
  response_time_hours INTEGER DEFAULT 48,
  
  -- Analytics & Tracking  
  profile_views INTEGER DEFAULT 0,
  connection_requests_received INTEGER DEFAULT 0,
  professional_inquiries INTEGER DEFAULT 0;

-- 2. Professional services
CREATE TABLE IF NOT EXISTS storyteller_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
  
  -- Service Details
  service_type TEXT NOT NULL CHECK (service_type IN ('speaking', 'consultation', 'workshop', 'story_creation', 'research_participation')),
  service_name TEXT NOT NULL,
  service_description TEXT,
  
  -- Pricing & Availability
  base_price DECIMAL(10,2),
  price_currency TEXT DEFAULT 'USD',
  duration_minutes INTEGER,
  availability_schedule JSONB,
  
  -- Service Specifications
  delivery_method TEXT CHECK (delivery_method IN ('in_person', 'virtual', 'hybrid', 'asynchronous')),
  max_participants INTEGER,
  special_requirements TEXT,
  preparation_materials TEXT,
  
  -- Booking Management
  advance_booking_days INTEGER DEFAULT 14,
  cancellation_policy TEXT,
  booking_instructions TEXT,
  
  -- Status & Visibility
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'connections_only', 'organizations_only', 'private')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Profile subscriptions for paywall tier
CREATE TABLE IF NOT EXISTS profile_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
  subscriber_user_id UUID REFERENCES profiles(id),
  subscriber_email TEXT NOT NULL,
  
  -- Subscription Details
  subscription_type TEXT NOT NULL CHECK (subscription_type IN ('monthly', 'annual', 'one_time')),
  access_level TEXT NOT NULL CHECK (access_level IN ('paywall', 'organizational')),
  
  -- Pricing & Payment
  amount_paid DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  
  -- Subscription Management
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended')),
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  auto_renewal BOOLEAN DEFAULT true,
  
  -- Usage Tracking
  last_accessed_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_storytellers_privacy_tier ON storytellers USING GIN (privacy_tier_settings);
CREATE INDEX IF NOT EXISTS idx_storyteller_services_type ON storyteller_services(service_type);
CREATE INDEX IF NOT EXISTS idx_profile_subscriptions_storyteller ON profile_subscriptions(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_profile_subscriptions_status ON profile_subscriptions(status);

-- 5. Update RLS policies
ALTER TABLE storyteller_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_subscriptions ENABLE ROW LEVEL SECURITY;

-- Services: Public read for active services, storyteller edit
CREATE POLICY "services_public_read" ON storyteller_services
    FOR SELECT USING (status = 'active' AND visibility = 'public');

CREATE POLICY "services_storyteller_manage" ON storyteller_services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM storytellers 
            WHERE id = storyteller_services.storyteller_id 
            AND id = auth.uid()
        )
    );

-- Subscriptions: Storyteller and subscriber can see their own
CREATE POLICY "subscriptions_access" ON profile_subscriptions
    FOR ALL USING (
        storyteller_id = auth.uid() OR 
        subscriber_user_id = auth.uid()
    );
```

### Day 3-4: Stripe Payment Integration Setup

#### Stripe Configuration
```javascript
// Set up Stripe in your Next.js app
// /lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// /api/create-subscription.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { storyteller_id, subscription_type, customer_email } = req.body;
  const supabase = createClient();

  try {
    // Get storyteller's pricing
    const { data: storyteller } = await supabase
      .from('storytellers')
      .select('privacy_tier_settings')
      .eq('id', storyteller_id)
      .single();

    const pricing = storyteller.privacy_tier_settings.paywall;
    const amount = subscription_type === 'monthly' ? pricing.price_monthly : pricing.price_annual;

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: customer_email,
      metadata: {
        storyteller_id,
        subscription_type,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${storyteller.full_name} - Storyteller Profile Access`,
          },
          unit_amount: amount * 100, // Stripe uses cents
          recurring: {
            interval: subscription_type === 'monthly' ? 'month' : 'year',
          },
        },
      }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    // Store in database
    await supabase.from('profile_subscriptions').insert({
      storyteller_id,
      subscriber_email: customer_email,
      subscription_type,
      access_level: 'paywall',
      amount_paid: amount,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customer.id,
      status: 'active',
    });

    res.status(200).json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
}
```

### Day 5-7: API Routes & Backend Logic

#### Profile Management APIs
```javascript
// /api/storyteller/profile.ts - Get storyteller profile with privacy tiers
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { storyteller_id, access_level = 'public' } = req.query;
  const supabase = createClient();

  // Get base profile
  const { data: storyteller } = await supabase
    .from('storytellers')
    .select(`
      *,
      stories!inner(*),
      storyteller_services(*)
    `)
    .eq('id', storyteller_id)
    .single();

  // Apply privacy tier filtering
  const filteredProfile = applyPrivacyTier(storyteller, access_level);

  res.status(200).json(filteredProfile);
}

function applyPrivacyTier(storyteller, accessLevel) {
  const settings = storyteller.privacy_tier_settings;
  
  if (accessLevel === 'public') {
    return {
      id: storyteller.id,
      full_name: storyteller.full_name,
      professional_summary: storyteller.professional_summary?.substring(0, 200) + '...',
      current_role: storyteller.current_role,
      current_organization: storyteller.current_organization,
      expertise_areas: storyteller.expertise_areas?.slice(0, 3),
      story_previews: storyteller.stories?.map(story => ({
        id: story.id,
        title: story.title,
        summary: story.summary || story.content?.substring(0, 150) + '...',
        themes: story.themes?.slice(0, 3),
      })),
      services: storyteller.storyteller_services?.filter(s => s.visibility === 'public').map(s => ({
        service_type: s.service_type,
        service_name: s.service_name,
        base_price: s.base_price,
      })),
    };
  }
  
  if (accessLevel === 'paywall') {
    // Return full profile content
    return storyteller;
  }
  
  // Add organizational tier logic here
  return storyteller;
}
```

---

## Week 2: Frontend Components & UI

### Day 1-3: Enhanced Profile Components

#### Profile Creation Wizard
```typescript
// /components/storyteller/ProfileWizard.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
    expertise_areas: [],
    speaking_topics: [],
    consulting_services: [],
    privacy_tier_settings: {
      public: { basic_identity: true, professional_overview: true, story_previews: true, contact_options: true },
      paywall: { price_monthly: 25, price_annual: 250, one_time_price: 50 },
      organizational: { available: true, services: ['consultation', 'speaking'], partnership_preferences: {} }
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
function BasicIdentityStep({ data, onChange }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Basic Professional Identity</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Current Role</label>
          <Input
            value={data.current_role}
            onChange={(e) => onChange({...data, current_role: e.target.value})}
            placeholder="e.g., Founder & Platform Builder"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Organization</label>
          <Input
            value={data.current_organization}
            onChange={(e) => onChange({...data, current_organization: e.target.value})}
            placeholder="e.g., A Curious Tractor"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Professional Summary (2-3 sentences)</label>
        <Textarea
          value={data.professional_summary}
          onChange={(e) => onChange({...data, professional_summary: e.target.value})}
          placeholder="What makes your professional approach unique? What value do you bring?"
          rows={3}
        />
      </div>
    </div>
  );
}

function PrivacyMonetizationStep({ data, onChange }) {
  const updatePricing = (tier, field, value) => {
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
              <Input
                type="number"
                value={data.privacy_tier_settings.paywall.price_monthly}
                onChange={(e) => updatePricing('paywall', 'price_monthly', e.target.value)}
                placeholder="25"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Annual Price ($)</label>
              <Input
                type="number"
                value={data.privacy_tier_settings.paywall.price_annual}
                onChange={(e) => updatePricing('paywall', 'price_annual', e.target.value)}
                placeholder="250"
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
```

### Day 4-5: Profile Display Components

#### Three-Tier Profile Display
```typescript
// /components/storyteller/ProfileDisplay.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import PaywallUpgrade from './PaywallUpgrade';
import ServiceBooking from './ServiceBooking';

interface ProfileDisplayProps {
  storytellerId: string;
  accessLevel: 'public' | 'paywall' | 'organizational';
}

export default function ProfileDisplay({ storytellerId, accessLevel }: ProfileDisplayProps) {
  const [profile, setProfile] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [storytellerId, accessLevel]);

  const fetchProfile = async () => {
    const response = await fetch(`/api/storyteller/profile?storyteller_id=${storytellerId}&access_level=${accessLevel}`);
    const data = await response.json();
    setProfile(data);
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg mb-8">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
            {profile.full_name?.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{profile.full_name}</h1>
            <p className="text-xl opacity-90">{profile.current_role}</p>
            <p className="text-lg opacity-75">{profile.current_organization}</p>
          </div>
          {accessLevel === 'public' && (
            <Button 
              onClick={() => setShowUpgradeModal(true)}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              View Full Profile
            </Button>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Professional Overview</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          {profile.professional_summary}
          {accessLevel === 'public' && profile.professional_summary?.length > 200 && (
            <span className="text-blue-600 cursor-pointer ml-2" onClick={() => setShowUpgradeModal(true)}>
              ... Read more
            </span>
          )}
        </p>
      </div>

      {/* Expertise Areas */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Expertise & Focus Areas</h2>
        <div className="flex flex-wrap gap-3">
          {profile.expertise_areas?.map((area, index) => (
            <span key={index} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
              {area}
            </span>
          ))}
          {accessLevel === 'public' && (
            <span 
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full cursor-pointer"
              onClick={() => setShowUpgradeModal(true)}
            >
              +{Math.max(0, (profile.total_expertise_areas || 5) - 3)} more
            </span>
          )}
        </div>
      </div>

      {/* Story Portfolio */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Story Portfolio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile.story_previews?.map((story) => (
            <div key={story.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2">{story.title}</h3>
              <p className="text-gray-600 mb-3">{story.summary}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {story.themes?.map((theme, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                    {theme}
                  </span>
                ))}
              </div>
              {accessLevel === 'public' ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowUpgradeModal(true)}
                >
                  Read Full Story
                </Button>
              ) : (
                <Button variant="outline" size="sm">
                  Read Story
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Professional Services */}
      {profile.services && profile.services.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Professional Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.services.map((service, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">{service.service_name}</h3>
                <p className="text-gray-600 text-sm mb-3">{service.service_type}</p>
                {service.base_price && (
                  <p className="font-semibold text-green-600">${service.base_price}</p>
                )}
                <Button size="sm" className="mt-2 w-full">
                  Book Service
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paywall Upgrade Modal */}
      {showUpgradeModal && (
        <PaywallUpgrade 
          storyteller={profile}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={(newAccessLevel) => {
            setShowUpgradeModal(false);
            // Refresh profile with new access level
            fetchProfile();
          }}
        />
      )}
    </div>
  );
}
```

### Day 6-7: Payment & Booking Components

#### Paywall Upgrade Component
```typescript
// /components/storyteller/PaywallUpgrade.tsx
'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PaywallUpgrade({ storyteller, onClose, onUpgrade }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Unlock Full Profile Access</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">What you'll get:</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✓ Complete story portfolio (6+ professional stories)</li>
            <li>✓ Full professional journey narrative</li>
            <li>✓ Professional insights and wisdom collection (50+ quotes)</li>
            <li>✓ Direct contact information and calendar booking</li>
            <li>✓ Professional portfolio and project documentation</li>
            <li>✓ Exclusive professional insights and methodology</li>
          </ul>
        </div>

        <Elements stripe={stripePromise}>
          <SubscriptionForm 
            storyteller={storyteller}
            onSuccess={onUpgrade}
            onCancel={onClose}
          />
        </Elements>
      </div>
    </div>
  );
}

function SubscriptionForm({ storyteller, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState('monthly');
  const [email, setEmail] = useState('');

  const pricing = storyteller.privacy_tier_settings?.paywall || { price_monthly: 25, price_annual: 250 };
  const currentPrice = subscriptionType === 'monthly' ? pricing.price_monthly : pricing.price_annual;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      // Create subscription
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyteller_id: storyteller.id,
          subscription_type: subscriptionType,
          customer_email: email,
        }),
      });

      const { clientSecret } = await response.json();

      // Confirm payment
      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: { email },
        },
      });

      if (error) {
        console.error('Payment failed:', error);
      } else {
        onSuccess('paywall');
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Pricing Options */}
      <div className="grid grid-cols-2 gap-4">
        <label className={`border rounded-lg p-4 cursor-pointer ${subscriptionType === 'monthly' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
          <input
            type="radio"
            value="monthly"
            checked={subscriptionType === 'monthly'}
            onChange={(e) => setSubscriptionType(e.target.value)}
            className="sr-only"
          />
          <div className="text-center">
            <div className="font-semibold">${pricing.price_monthly}/month</div>
            <div className="text-sm text-gray-600">Monthly Access</div>
          </div>
        </label>

        <label className={`border rounded-lg p-4 cursor-pointer ${subscriptionType === 'annual' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
          <input
            type="radio"
            value="annual"
            checked={subscriptionType === 'annual'}
            onChange={(e) => setSubscriptionType(e.target.value)}
            className="sr-only"
          />
          <div className="text-center">
            <div className="font-semibold">${pricing.price_annual}/year</div>
            <div className="text-sm text-gray-600">Save {Math.round((1 - pricing.price_annual / (pricing.price_monthly * 12)) * 100)}%</div>
          </div>
        </label>
      </div>

      {/* Email Input */}
      <div>
        <label className="block text-sm font-medium mb-2">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Card Element */}
      <div>
        <label className="block text-sm font-medium mb-2">Payment Information</label>
        <div className="border border-gray-300 rounded-md p-3">
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' },
              },
            },
          }} />
        </div>
      </div>

      {/* Submit */}
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : `Subscribe for $${currentPrice}`}
        </button>
      </div>
    </form>
  );
}
```

---

## Week 3: Testing, Optimization & Launch Preparation

### Day 1-2: Comprehensive Testing

#### Test Scenarios
```typescript
// /tests/profile-system.test.ts
import { test, expect } from '@playwright/test';

test.describe('Enhanced Profile System', () => {
  test('Profile creation wizard completes successfully', async ({ page }) => {
    await page.goto('/storyteller/profile/create');
    
    // Step 1: Basic Identity
    await page.fill('[data-testid="current-role"]', 'Founder & Platform Builder');
    await page.fill('[data-testid="current-organization"]', 'A Curious Tractor');
    await page.fill('[data-testid="professional-summary"]', 'Building community-centered technology...');
    await page.click('[data-testid="next-button"]');
    
    // Continue through all steps...
    
    // Final step: Publish
    await page.click('[data-testid="publish-button"]');
    await expect(page).toHaveURL(/\/storyteller\/profile\/[^\/]+$/);
  });

  test('Public tier displays correctly without sensitive info', async ({ page }) => {
    await page.goto('/storyteller/profile/test-id');
    
    // Should see public elements
    await expect(page.locator('[data-testid="storyteller-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="professional-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="story-previews"]')).toBeVisible();
    
    // Should not see paywall content
    await expect(page.locator('[data-testid="full-story-content"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="direct-contact"]')).not.toBeVisible();
  });

  test('Paywall upgrade flow works end-to-end', async ({ page }) => {
    await page.goto('/storyteller/profile/test-id');
    await page.click('[data-testid="upgrade-button"]');
    
    // Fill upgrade form
    await page.click('[data-testid="monthly-option"]');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    
    // Test mode Stripe card
    await page.fill('[data-testid="card-number"]', '4242424242424242');
    await page.fill('[data-testid="card-expiry"]', '12/34');
    await page.fill('[data-testid="card-cvc"]', '123');
    
    await page.click('[data-testid="subscribe-button"]');
    
    // Should redirect to upgraded profile
    await expect(page.locator('[data-testid="full-story-content"]')).toBeVisible();
  });
});
```

### Day 3-4: Performance Optimization

#### Performance Checklist
- **Database Query Optimization**: Add proper indexes, optimize N+1 queries
- **Image Optimization**: Implement Next.js Image component with proper sizing
- **Caching Strategy**: Add Redis for profile caching, CDN for static assets
- **Mobile Responsiveness**: Test on all device sizes and optimize layout
- **Loading States**: Implement proper loading states and skeleton screens

### Day 5-7: Ben's Profile Setup & Final Testing

#### Ben's Profile Implementation
```javascript
// Setup Ben's enhanced profile for testing
const benProfileSetup = {
  current_role: 'Founder & Platform Builder',
  current_organization: 'A Curious Tractor',
  professional_summary: 'Building community-centered technology that empowers storytellers and honors community wisdom. Creator of Empathy Ledger, the storytelling-centered alternative to LinkedIn.',
  expertise_areas: [
    'Community-Centered Platform Development',
    'Ethical Technology & Social Impact', 
    'Strategic Vision & World-Class Execution',
    'Professional Networking & Relationship Building',
    'Storytelling for Professional Development'
  ],
  speaking_topics: [
    'The Future of Professional Networking: From Resumes to Stories',
    'Building Ethical Technology That Empowers Communities',
    'Community-Centered Platform Development: Principles and Practices'
  ],
  consulting_services: [
    'Platform Development Strategy Consultation',
    'Community Engagement & Relationship Building Advisory',
    'Ethical Technology & Social Impact Guidance'
  ],
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
      services: ['consultation', 'speaking', 'advisory'],
      partnership_preferences: {
        financial: 0.6,
        community_benefit: 0.4
      }
    }
  }
};
```

---

## 🎯 Sprint 1 Success Criteria

### Technical Completion
- [ ] Database schema implemented and tested
- [ ] Stripe payment integration working
- [ ] Three-tier privacy system functional
- [ ] Profile creation wizard complete
- [ ] Profile display with proper access controls
- [ ] Mobile-responsive design
- [ ] Performance optimized (<2s load times)

### Ben's Profile Ready
- [ ] Ben can create complete enhanced profile
- [ ] All three privacy tiers display correctly
- [ ] Payment processing works for subscriptions
- [ ] Service offerings and booking functional
- [ ] Ready for story content integration

### Platform Validation
- [ ] All enhanced profile features demonstrated
- [ ] User experience tested and optimized
- [ ] Security and privacy controls verified
- [ ] Foundation ready for other storytellers

**This Sprint 1 implementation creates the technical foundation needed for Ben's world-class storyteller profile while proving that Empathy Ledger can deliver on its vision of storytelling-centered professional networking.**

Next up: Sprint 2 focuses on content management and story integration, building on this solid foundation.