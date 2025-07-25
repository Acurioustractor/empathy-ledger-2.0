'use client';

import React, { useState } from 'react';
import styles from './PrivacyDashboard.module.css';

interface PrivacyDashboardProps {
  storyteller: any;
  privacySettings: {
    profile_public: boolean;
    story_public: boolean;
    quotes_shareable: boolean;
    consent_date: string;
    data_export_available: boolean;
  };
  consentDate: string;
}

export default function PrivacyDashboard({ 
  storyteller, 
  privacySettings, 
  consentDate 
}: PrivacyDashboardProps) {
  const [showExportOptions, setShowExportOptions] = useState(false);

  const privacyItems = [
    {
      label: 'Public Profile',
      description: 'Profile information visible to community',
      status: privacySettings.profile_public,
      icon: '👤'
    },
    {
      label: 'Story Sharing',
      description: 'Story content accessible to visitors',
      status: privacySettings.story_public,
      icon: '📖'
    },
    {
      label: 'Quote Sharing',
      description: 'Quotes can be shared on social media',
      status: privacySettings.quotes_shareable,
      icon: '💬'
    },
    {
      label: 'Data Export',
      description: 'Personal data available for download',
      status: privacySettings.data_export_available,
      icon: '📥'
    }
  ];

  const exportOptions = [
    { format: 'JSON', description: 'Complete data in structured format' },
    { format: 'PDF', description: 'Story and analysis summary' },
    { format: 'TXT', description: 'Plain text transcript only' }
  ];

  return (
    <section className={styles.privacySection}>
      <div className={styles.container}>
        <div className={styles.privacyHeader}>
          <div className={styles.headerIcon}>🔒</div>
          <div>
            <h2>Privacy & Data Control</h2>
            <p>Complete transparency and control over personal narrative data</p>
          </div>
        </div>

        <div className={styles.privacyGrid}>
          <div className={styles.privacyCard}>
            <h3>Data Sovereignty Status</h3>
            <div className={styles.sovereigntyStatus}>
              <div className={styles.statusIcon}>✅</div>
              <div>
                <h4>Indigenous Data Sovereignty Respected</h4>
                <p>This profile follows Indigenous data sovereignty principles, ensuring {storyteller.full_name} maintains complete control over their narrative and personal information.</p>
              </div>
            </div>
            
            <div className={styles.consentInfo}>
              <div className={styles.consentIcon}>📋</div>
              <div>
                <h4>Informed Consent Given</h4>
                <p>Consent provided on {new Date(consentDate).toLocaleDateString()}</p>
                <span className={styles.consentBadge}>VERIFIED</span>
              </div>
            </div>
          </div>

          <div className={styles.privacyCard}>
            <h3>Privacy Settings</h3>
            <div className={styles.privacyItems}>
              {privacyItems.map((item, index) => (
                <div key={index} className={styles.privacyItem}>
                  <div className={styles.itemIcon}>{item.icon}</div>
                  <div className={styles.itemContent}>
                    <h4>{item.label}</h4>
                    <p>{item.description}</p>
                  </div>
                  <div className={`${styles.itemStatus} ${item.status ? styles.enabled : styles.disabled}`}>
                    {item.status ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.privacyCard}>
            <h3>Data Rights</h3>
            <div className={styles.dataRights}>
              <div className={styles.rightItem}>
                <h4>🔍 Access Right</h4>
                <p>View all personal data we have collected</p>
              </div>
              <div className={styles.rightItem}>
                <h4>✏️ Correction Right</h4>
                <p>Request corrections to inaccurate information</p>
              </div>
              <div className={styles.rightItem}>
                <h4>🗑️ Deletion Right</h4>
                <p>Request removal of personal data</p>
              </div>
              <div className={styles.rightItem}>
                <h4>📤 Portability Right</h4>
                <p>Export personal data in machine-readable format</p>
              </div>
            </div>
            
            {privacySettings.data_export_available && (
              <div className={styles.exportSection}>
                <button
                  className={styles.exportButton}
                  onClick={() => setShowExportOptions(!showExportOptions)}
                >
                  📥 Export My Data
                </button>
                
                {showExportOptions && (
                  <div className={styles.exportOptions}>
                    <h4>Choose Export Format</h4>
                    {exportOptions.map((option, index) => (
                      <button key={index} className={styles.exportOption}>
                        <strong>{option.format}</strong>
                        <span>{option.description}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={styles.privacyFooter}>
          <div className={styles.footerContent}>
            <h3>Data Protection Commitment</h3>
            <p>
              We are committed to protecting and respecting your privacy rights. 
              All data processing follows Indigenous data sovereignty principles and 
              international privacy standards including GDPR and PIPEDA.
            </p>
            <div className={styles.contactInfo}>
              <span>Questions about your data?</span>
              <a href="mailto:privacy@empathyledger.org">Contact our Privacy Team</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}