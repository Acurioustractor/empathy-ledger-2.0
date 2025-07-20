'use client';

import React, { useState, useEffect } from 'react';
import { 
  getUserProfile, 
  updateUserProfile, 
  type UserProfile, 
  type PrivacySettings 
} from '@/lib/supabase-auth';
import { 
  validatePrivacySettings, 
  recordConsent, 
  logPrivacyAction,
  exportUserData,
  anonymizeUserData
} from '@/lib/privacy-manager';

interface PrivacySettingsPanelProps {
  userId: string;
  onSettingsUpdate?: (settings: PrivacySettings) => void;
}

export default function PrivacySettingsPanel({ userId, onSettingsUpdate }: PrivacySettingsPanelProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDataExport, setShowDataExport] = useState(false);
  const [showDeletion, setShowDeletion] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      const { profile: userProfile } = await getUserProfile(userId);
      if (userProfile) {
        setProfile(userProfile);
        setSettings(userProfile.privacy_settings);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: keyof PrivacySettings, value: any) => {
    if (!settings) return;
    
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
  };

  const saveSettings = async () => {
    if (!settings || !profile) return;

    setIsSaving(true);
    try {
      const validation = validatePrivacySettings(profile.privacy_settings, settings);
      
      if (!validation.valid) {
        alert('Invalid privacy settings: ' + validation.errors.join(', '));
        return;
      }

      const { success, error } = await updateUserProfile(userId, {
        privacy_settings: validation.sanitized
      });

      if (error) throw error;

      // Log privacy setting change
      await logPrivacyAction(userId, 'privacy_settings_updated', 'profile', {
        changes: settings
      });

      // Record consent for data processing with new settings
      await recordConsent(userId, 'data_collection', true);

      setProfile(prev => prev ? { ...prev, privacy_settings: validation.sanitized } : null);
      onSettingsUpdate?.(validation.sanitized);
      
      alert('Privacy settings updated successfully');
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      alert('Failed to save privacy settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDataExport = async () => {
    try {
      const { data, error } = await exportUserData(userId);
      if (error) throw error;

      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `empathy-ledger-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      await logPrivacyAction(userId, 'data_exported', 'profile');
      
      setShowDataExport(false);
      alert('Data export downloaded successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    }
  };

  const handleAccountDeletion = async () => {
    if (!deletionReason.trim()) {
      alert('Please provide a reason for account deletion');
      return;
    }

    const confirmed = window.confirm(
      'Are you absolutely sure you want to delete your account? This action cannot be undone. Your stories will be anonymized but preserved for community value.'
    );

    if (!confirmed) return;

    try {
      const { success, error } = await anonymizeUserData(userId, deletionReason);
      if (error) throw error;

      await logPrivacyAction(userId, 'account_deleted', 'profile', {
        reason: deletionReason
      });

      alert('Account deletion initiated. You will be logged out shortly.');
      // Would redirect to logout
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!settings || !profile) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center">
        <h3 className="text-xl font-normal text-gray-900 mb-4">Privacy Settings Unavailable</h3>
        <p className="text-gray-600 font-light">Unable to load privacy settings. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Main Privacy Settings */}
      <div className="bg-white rounded-3xl p-8 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-normal text-gray-900">Privacy Settings</h3>
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="bg-gray-900 text-white px-6 py-2 rounded-full font-light hover:bg-gray-800 smooth-transition disabled:bg-gray-300"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="space-y-8">
          {/* Profile Visibility */}
          <div>
            <h4 className="text-lg font-normal text-gray-900 mb-4">Profile Visibility</h4>
            <p className="text-sm text-gray-600 font-light mb-4">
              Control who can see your profile information
            </p>
            <div className="space-y-3">
              {[
                { value: 'public', label: 'Public', description: 'Anyone can see your profile' },
                { value: 'community', label: 'Community Only', description: 'Only members of your communities' },
                { value: 'organization', label: 'Organization Only', description: 'Only your organization members' },
                { value: 'private', label: 'Private', description: 'Only you can see your profile' }
              ].map((option) => (
                <label key={option.value} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="show_profile"
                    value={option.value}
                    checked={settings.show_profile === option.value}
                    onChange={(e) => handleSettingChange('show_profile', e.target.value)}
                    className="mt-1 w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-500"
                  />
                  <div>
                    <div className="font-normal text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-600 font-light">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Story Visibility */}
          <div className="border-t border-gray-100 pt-8">
            <h4 className="text-lg font-normal text-gray-900 mb-4">Story Visibility</h4>
            <p className="text-sm text-gray-600 font-light mb-4">
              Control who can see your stories by default
            </p>
            <div className="space-y-3">
              {[
                { value: 'public', label: 'Public', description: 'Anyone can discover and read your stories' },
                { value: 'community', label: 'Community Only', description: 'Only your community members' },
                { value: 'organization', label: 'Organization Only', description: 'Only your organization' },
                { value: 'private', label: 'Private', description: 'Only you can see your stories' }
              ].map((option) => (
                <label key={option.value} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="show_stories"
                    value={option.value}
                    checked={settings.show_stories === option.value}
                    onChange={(e) => handleSettingChange('show_stories', e.target.value)}
                    className="mt-1 w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-500"
                  />
                  <div>
                    <div className="font-normal text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-600 font-light">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Personal Information */}
          <div className="border-t border-gray-100 pt-8">
            <h4 className="text-lg font-normal text-gray-900 mb-4">Personal Information Sharing</h4>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.show_location}
                  onChange={(e) => handleSettingChange('show_location', e.target.checked)}
                  className="mt-1 w-5 h-5 text-gray-900 border-gray-300 focus:ring-gray-500 rounded"
                />
                <div>
                  <div className="font-normal text-gray-900">Show Location</div>
                  <div className="text-sm text-gray-600 font-light">
                    Display your general location (e.g., "Melbourne, Australia")
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.show_age_range}
                  onChange={(e) => handleSettingChange('show_age_range', e.target.checked)}
                  className="mt-1 w-5 h-5 text-gray-900 border-gray-300 focus:ring-gray-500 rounded"
                />
                <div>
                  <div className="font-normal text-gray-900">Show Age Range</div>
                  <div className="text-sm text-gray-600 font-light">
                    Display your age range (e.g., "25-34")
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allow_contact}
                  onChange={(e) => handleSettingChange('allow_contact', e.target.checked)}
                  className="mt-1 w-5 h-5 text-gray-900 border-gray-300 focus:ring-gray-500 rounded"
                />
                <div>
                  <div className="font-normal text-gray-900">Allow Contact</div>
                  <div className="text-sm text-gray-600 font-light">
                    Let others send you messages through the platform
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Research & AI */}
          <div className="border-t border-gray-100 pt-8">
            <h4 className="text-lg font-normal text-gray-900 mb-4">Research & AI Participation</h4>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allow_research_participation}
                  onChange={(e) => handleSettingChange('allow_research_participation', e.target.checked)}
                  className="mt-1 w-5 h-5 text-gray-900 border-gray-300 focus:ring-gray-500 rounded"
                />
                <div>
                  <div className="font-normal text-gray-900">Research Participation</div>
                  <div className="text-sm text-gray-600 font-light">
                    Allow researchers to include your anonymized stories in studies (you'll be fairly compensated)
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Data Retention */}
          <div className="border-t border-gray-100 pt-8">
            <h4 className="text-lg font-normal text-gray-900 mb-4">Data Retention</h4>
            <p className="text-sm text-gray-600 font-light mb-4">
              Choose how long we keep your data
            </p>
            <div className="space-y-3">
              {[
                { value: 'minimal', label: 'Minimal (1 year)', description: 'Delete data after 1 year of inactivity' },
                { value: 'standard', label: 'Standard (5 years)', description: 'Keep for historical research value' },
                { value: 'extended', label: 'Extended (Indefinite)', description: 'Preserve for future generations' }
              ].map((option) => (
                <label key={option.value} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="data_retention_preference"
                    value={option.value}
                    checked={settings.data_retention_preference === option.value}
                    onChange={(e) => handleSettingChange('data_retention_preference', e.target.value)}
                    className="mt-1 w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-500"
                  />
                  <div>
                    <div className="font-normal text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-600 font-light">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Data Rights */}
      <div className="bg-white rounded-3xl p-8 border border-gray-200">
        <h3 className="text-2xl font-normal text-gray-900 mb-6">Your Data Rights</h3>
        
        <div className="space-y-6">
          {/* Data Export */}
          <div className="border border-gray-200 rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-lg font-normal text-gray-900 mb-2">Export Your Data</h4>
                <p className="text-sm text-gray-600 font-light mb-4">
                  Download a complete copy of all your data in JSON format. This includes your profile, stories, comments, and privacy settings.
                </p>
              </div>
              <button
                onClick={() => setShowDataExport(true)}
                className="ml-4 bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-full text-sm font-light smooth-transition"
              >
                Export Data
              </button>
            </div>

            {showDataExport && (
              <div className="mt-4 p-4 bg-blue-50 rounded-2xl">
                <p className="text-sm text-blue-700 font-light mb-3">
                  This will download a file containing all your personal data. The file will be saved to your downloads folder.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDataExport}
                    className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-light hover:bg-blue-700 smooth-transition"
                  >
                    Download Now
                  </button>
                  <button
                    onClick={() => setShowDataExport(false)}
                    className="text-gray-600 hover:text-gray-800 px-4 py-2 text-sm font-light smooth-transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Account Deletion */}
          <div className="border border-red-200 rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-lg font-normal text-gray-900 mb-2">Delete Your Account</h4>
                <p className="text-sm text-gray-600 font-light mb-4">
                  Permanently delete your account and anonymize your data. Your stories will be preserved anonymously for community value, but all personal identifying information will be removed.
                </p>
              </div>
              <button
                onClick={() => setShowDeletion(true)}
                className="ml-4 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-full text-sm font-light smooth-transition"
              >
                Delete Account
              </button>
            </div>

            {showDeletion && (
              <div className="mt-4 p-4 bg-red-50 rounded-2xl">
                <p className="text-sm text-red-700 font-light mb-3">
                  ⚠️ This action cannot be undone. Your account will be permanently deleted and your personal information will be anonymized.
                </p>
                <textarea
                  value={deletionReason}
                  onChange={(e) => setDeletionReason(e.target.value)}
                  placeholder="Please tell us why you're deleting your account (optional but helpful)"
                  className="w-full p-3 border border-red-200 rounded-xl text-sm mb-3 resize-none"
                  rows={3}
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleAccountDeletion}
                    className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-light hover:bg-red-700 smooth-transition"
                  >
                    Confirm Deletion
                  </button>
                  <button
                    onClick={() => setShowDeletion(false)}
                    className="text-gray-600 hover:text-gray-800 px-4 py-2 text-sm font-light smooth-transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Privacy Principles */}
      <div className="bg-gray-50 rounded-3xl p-8">
        <h3 className="text-2xl font-normal text-gray-900 mb-6">Our Privacy Principles</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-normal text-gray-900 mb-2">🛡️ Data Sovereignty</h4>
            <p className="text-sm text-gray-600 font-light">
              You own your stories and data completely. We're just the custodians.
            </p>
          </div>
          <div>
            <h4 className="font-normal text-gray-900 mb-2">🔒 Privacy by Design</h4>
            <p className="text-sm text-gray-600 font-light">
              Privacy controls are built into every feature from the ground up.
            </p>
          </div>
          <div>
            <h4 className="font-normal text-gray-900 mb-2">⚖️ Fair Value Exchange</h4>
            <p className="text-sm text-gray-600 font-light">
              If your stories create value, you share in that value fairly.
            </p>
          </div>
          <div>
            <h4 className="font-normal text-gray-900 mb-2">🌍 Cultural Respect</h4>
            <p className="text-sm text-gray-600 font-light">
              Indigenous data sovereignty principles guide our platform design.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}