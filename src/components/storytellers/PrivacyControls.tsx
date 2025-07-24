'use client';

import React, { useState } from 'react';

interface PrivacyPreferences {
  public_display: boolean;
  show_photo: boolean;
  show_location: boolean;
  show_organisation: boolean;
  show_story_themes: boolean;
  show_story_quotes: boolean;
}

interface PrivacyControlsProps {
  storytellerId: string;
  currentPreferences: PrivacyPreferences;
  onSave: (preferences: PrivacyPreferences) => Promise<void>;
}

export default function PrivacyControls({ 
  storytellerId, 
  currentPreferences, 
  onSave 
}: PrivacyControlsProps) {
  const [preferences, setPreferences] = useState<PrivacyPreferences>(currentPreferences);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof PrivacyPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(preferences);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save privacy preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(preferences) !== JSON.stringify(currentPreferences);

  return (
    <div className="privacy-controls">
      <div className="privacy-header">
        <h2>Your Privacy Settings</h2>
        <p>You have complete control over what information appears on your public profile.</p>
      </div>

      <div className="privacy-sections">
        {/* Public Display */}
        <div className="privacy-section">
          <div className="section-header">
            <h3>🌐 Public Visibility</h3>
            <p>Control whether your profile appears publicly at all</p>
          </div>
          
          <div className="privacy-control">
            <div className="control-info">
              <strong>Show my profile publicly</strong>
              <p>When enabled, your profile will appear in the community gallery and storytellers page</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={preferences.public_display}
                onChange={() => handleToggle('public_display')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Personal Information */}
        <div className="privacy-section">
          <div className="section-header">
            <h3>👤 Personal Information</h3>
            <p>Choose what personal details to share</p>
          </div>
          
          <div className="privacy-control">
            <div className="control-info">
              <strong>Show my photo</strong>
              <p>Display your profile image, or show an initial-based placeholder instead</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={preferences.show_photo}
                onChange={() => handleToggle('show_photo')}
                disabled={!preferences.public_display}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="privacy-control">
            <div className="control-info">
              <strong>Show my location</strong>
              <p>Display your city/region on your profile</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={preferences.show_location}
                onChange={() => handleToggle('show_location')}
                disabled={!preferences.public_display}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="privacy-control">
            <div className="control-info">
              <strong>Show my organization</strong>
              <p>Display your workplace, community group, or affiliation</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={preferences.show_organisation}
                onChange={() => handleToggle('show_organisation')}
                disabled={!preferences.public_display}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Story Content */}
        <div className="privacy-section">
          <div className="section-header">
            <h3>📖 Story Content</h3>
            <p>Control how your story content is displayed</p>
          </div>
          
          <div className="privacy-control">
            <div className="control-info">
              <strong>Show story themes</strong>
              <p>Display key themes extracted from your story</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={preferences.show_story_themes}
                onChange={() => handleToggle('show_story_themes')}
                disabled={!preferences.public_display}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="privacy-control">
            <div className="control-info">
              <strong>Show story quotes</strong>
              <p>Display featured quotes from your story on your profile card</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={preferences.show_story_quotes}
                onChange={() => handleToggle('show_story_quotes')}
                disabled={!preferences.public_display}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Save Section */}
      <div className="save-section">
        <div className="save-info">
          <div className="info-icon">ℹ️</div>
          <div>
            <p><strong>Changes take effect immediately</strong></p>
            <p>Your updated privacy settings will be reflected across the website as soon as you save.</p>
          </div>
        </div>
        
        <button 
          className={`save-button ${hasChanges ? 'has-changes' : ''} ${saved ? 'saved' : ''}`}
          onClick={handleSave}
          disabled={!hasChanges || saving}
        >
          {saving ? (
            <>
              <span className="spinner"></span>
              Saving...
            </>
          ) : saved ? (
            <>
              ✅ Saved
            </>
          ) : hasChanges ? (
            'Save Privacy Settings'
          ) : (
            'No Changes'
          )}
        </button>
      </div>

      <style jsx>{`
        .privacy-controls {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }

        .privacy-header {
          text-align: center;
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 2px solid #f1f5f9;
        }

        .privacy-header h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #1e293b;
        }

        .privacy-header p {
          color: #64748b;
          font-size: 1.1rem;
          margin: 0;
        }

        .privacy-sections {
          space-y: 2rem;
        }

        .privacy-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .section-header {
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .section-header h3 {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #334155;
        }

        .section-header p {
          color: #64748b;
          margin: 0;
          font-size: 0.95rem;
        }

        .privacy-control {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .privacy-control:last-child {
          margin-bottom: 0;
        }

        .control-info {
          flex: 1;
        }

        .control-info strong {
          display: block;
          color: #1e293b;
          margin-bottom: 0.25rem;
          font-weight: 600;
        }

        .control-info p {
          color: #64748b;
          font-size: 0.9rem;
          margin: 0;
          line-height: 1.4;
        }

        .toggle {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
          flex-shrink: 0;
          margin-top: 0.25rem;
        }

        .toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #cbd5e1;
          transition: 0.3s;
          border-radius: 24px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .toggle input:checked + .toggle-slider {
          background-color: #10b981;
        }

        .toggle input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }

        .toggle input:disabled + .toggle-slider {
          background-color: #f1f5f9;
          cursor: not-allowed;
        }

        .toggle input:disabled + .toggle-slider:before {
          background-color: #e2e8f0;
        }

        .save-section {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 2px solid #f1f5f9;
        }

        .save-info {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 2rem;
          padding: 1rem;
          background: #eff6ff;
          border-radius: 8px;
          border: 1px solid #bfdbfe;
        }

        .info-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
          margin-top: 0.25rem;
        }

        .save-info p {
          margin: 0 0 0.25rem 0;
          color: #1e40af;
        }

        .save-info strong {
          font-weight: 600;
        }

        .save-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 1rem 2rem;
          font-size: 1.1rem;
          font-weight: 600;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
          color: #64748b;
          cursor: not-allowed;
          transition: all 0.3s ease;
        }

        .save-button.has-changes {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
          cursor: pointer;
        }

        .save-button.has-changes:hover {
          background: #2563eb;
          border-color: #2563eb;
          transform: translateY(-1px);
        }

        .save-button.saved {
          background: #10b981;
          border-color: #10b981;
          color: white;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .privacy-controls {
            padding: 1rem;
          }
          
          .privacy-control {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }
          
          .save-info {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}