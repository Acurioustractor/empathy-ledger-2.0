'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface PaywallUpgradeProps {
  storyteller: {
    id: string;
    full_name: string;
    privacy_tier_settings: {
      paywall: {
        price_monthly: number;
        price_annual: number;
      };
    };
  };
  onClose: () => void;
  onUpgrade: (accessLevel: string) => void;
}

export default function PaywallUpgrade({ storyteller, onClose, onUpgrade }: PaywallUpgradeProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Unlock {storyteller.full_name}'s Full Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">What you'll get with premium access:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Complete Story Portfolio:</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>✓ "From Muswellbrook to Global Platform" (2,500 words)</li>
                <li>✓ "The Origin of A Curious Tractor"</li>
                <li>✓ "Aboriginal Communities and Global Platforms"</li>
                <li>✓ "Building Empathy Ledger: Vision to Platform"</li>
                <li>✓ "Community-Centered Technology Philosophy"</li>
                <li>✓ "The Future of Professional Networking"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Professional Resources:</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>✓ 10 Professional Insights series (methodology)</li>
                <li>✓ 30+ Professional quotes with context</li>
                <li>✓ Complete professional journey narrative</li>
                <li>✓ Direct contact information</li>
                <li>✓ Calendar booking access</li>
                <li>✓ Professional portfolio documentation</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Why This Matters</h4>
          <p className="text-blue-700 text-sm">
            Ben's profile demonstrates how authentic storytelling creates more meaningful professional relationships than traditional networking. 
            This is proof-of-concept for the storytelling-centered alternative to LinkedIn that honors community wisdom while creating sustainable income for professionals.
          </p>
        </div>

        <SubscriptionOptions
          storyteller={storyteller}
          onSuccess={onUpgrade}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}

function SubscriptionOptions({ storyteller, onSuccess, onCancel }: {
  storyteller: PaywallUpgradeProps['storyteller'];
  onSuccess: (accessLevel: string) => void;
  onCancel: () => void;
}) {
  const [subscriptionType, setSubscriptionType] = useState('monthly');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const pricing = storyteller.privacy_tier_settings?.paywall || { price_monthly: 25, price_annual: 250 };
  const currentPrice = subscriptionType === 'monthly' ? pricing.price_monthly : pricing.price_annual;
  const savings = subscriptionType === 'annual' ? Math.round((1 - pricing.price_annual / (pricing.price_monthly * 12)) * 100) : 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      // For demo purposes, simulate a successful subscription
      // In production, this would integrate with Stripe
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store subscription info locally for demo
      const subscriptionData = {
        storyteller_id: storyteller.id,
        subscriber_email: email,
        subscription_type: subscriptionType,
        amount_paid: currentPrice,
        access_level: 'paywall',
        created_at: new Date().toISOString()
      };
      
      localStorage.setItem(`subscription_${storyteller.id}`, JSON.stringify(subscriptionData));
      
      onSuccess('paywall');
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Pricing Options */}
      <div>
        <h4 className="font-medium mb-3">Choose your access plan:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className={`border rounded-lg p-4 cursor-pointer transition-colors ${
            subscriptionType === 'monthly' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="radio"
              value="monthly"
              checked={subscriptionType === 'monthly'}
              onChange={(e) => setSubscriptionType(e.target.value)}
              className="sr-only"
            />
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">${pricing.price_monthly}</div>
              <div className="text-sm text-gray-600">per month</div>
              <div className="text-xs text-gray-500 mt-1">Monthly billing</div>
            </div>
          </label>

          <label className={`border rounded-lg p-4 cursor-pointer transition-colors relative ${
            subscriptionType === 'annual' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="radio"
              value="annual"
              checked={subscriptionType === 'annual'}
              onChange={(e) => setSubscriptionType(e.target.value)}
              className="sr-only"
            />
            {savings > 0 && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Save {savings}%
              </div>
            )}
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">${pricing.price_annual}</div>
              <div className="text-sm text-gray-600">per year</div>
              <div className="text-xs text-gray-500 mt-1">
                ${Math.round(pricing.price_annual / 12)}/month equivalent
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Email Input */}
      <div>
        <label className="block text-sm font-medium mb-2">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="your@email.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          You'll receive access instructions and receipts at this email
        </p>
      </div>

      {/* Payment Method Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Payment Method</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Credit/Debit Card</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="paypal"
              checked={paymentMethod === 'paypal'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">PayPal</span>
          </label>
        </div>
      </div>

      {/* Demo Payment Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">Demo Mode</h4>
        <p className="text-yellow-700 text-sm">
          This is a demonstration of the subscription flow. No actual payment will be processed. 
          In production, this would integrate with Stripe for secure payment processing.
        </p>
      </div>

      {/* Revenue Sharing Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-800 mb-2">Community-Centered Revenue Sharing</h4>
        <p className="text-green-700 text-sm">
          70% of your subscription (${Math.round(currentPrice * 0.7)}) goes directly to {storyteller.full_name}. 
          30% supports platform development and community infrastructure. This ensures storytellers benefit financially from sharing their expertise.
        </p>
      </div>

      {/* Submit Buttons */}
      <div className="flex space-x-4">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!email || loading}
          className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            `Subscribe for $${currentPrice}`
          )}
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        By subscribing, you agree to our Terms of Service and Privacy Policy. 
        You can cancel anytime and retain access until the end of your billing period.
      </p>
    </form>
  );
}