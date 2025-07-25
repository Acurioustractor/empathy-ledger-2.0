'use client';

import React from 'react';
import ThemeAnalytics from '@/components/analytics/ThemeAnalytics';

export default function AnalyticsPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-constellation">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <div className="hero-badge">COMMUNITY INSIGHTS</div>
            <h1 className="hero-title">
              Wisdom in the Data
            </h1>
            <p className="hero-description">
              Discover patterns, themes, and profound insights emerging from our community's 
              shared stories—analyzed with respect, presented with purpose.
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Ethical AI Analysis</h2>
            <p>Technology that honors human dignity and community wisdom</p>
          </div>

          <div className="grid-3" style={{marginBottom: 'var(--space-3xl)'}}>
            <div className="value-card">
              <div className="value-icon">🧠</div>
              <h3>Trauma-Informed</h3>
              <p>Every analysis respects the sensitive nature of personal narratives, applying trauma-informed principles throughout the process.</p>
            </div>
            
            <div className="value-card">
              <div className="value-icon">🔐</div>
              <h3>Privacy First</h3>
              <p>Individual stories remain private unless explicitly shared. All analytics protect storyteller identity and consent preferences.</p>
            </div>
            
            <div className="value-card">
              <div className="value-icon">🌍</div>
              <h3>Culturally Sensitive</h3>
              <p>Our AI models are trained to recognize and respect diverse cultural contexts, avoiding bias and honoring Indigenous ways of knowing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Analytics Content */}
      <section className="section">
        <div className="container">
          <ThemeAnalytics />
        </div>
      </section>

      {/* Methodology Section */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Approach</h2>
            <p>How we transform stories into insights while preserving dignity</p>
          </div>

          <div className="methodology-grid">
            <div className="method-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Consent-Based Collection</h3>
                <p>Every story enters our system only with explicit, informed consent from the storyteller, who maintains complete control over their narrative.</p>
                <ul className="step-features">
                  <li>• Granular privacy controls</li>
                  <li>• Withdrawal rights respected</li>
                  <li>• Cultural protocol compliance</li>
                </ul>
              </div>
            </div>

            <div className="method-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>AI-Powered Analysis</h3>
                <p>Advanced natural language processing identifies themes, emotions, and insights while maintaining cultural sensitivity and avoiding harmful biases.</p>
                <ul className="step-features">
                  <li>• Theme extraction and categorization</li>
                  <li>• Sentiment and emotion analysis</li>
                  <li>• Quality confidence scoring</li>
                </ul>
              </div>
            </div>

            <div className="method-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Community Insights</h3>
                <p>Aggregated patterns reveal community strengths, challenges, and wisdom without compromising individual privacy or violating consent.</p>
                <ul className="step-features">
                  <li>• Anonymized trend analysis</li>
                  <li>• Community health metrics</li>
                  <li>• Actionable insights for change</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact & Quality */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Quality & Impact</h2>
            <p>Ensuring our analysis serves the community with accuracy and respect</p>
          </div>

          <div className="quality-grid">
            <div className="quality-metric">
              <div className="metric-icon">📊</div>
              <div className="metric-value">95%</div>
              <div className="metric-label">Analysis Confidence</div>
              <p>High-quality theme identification with rigorous quality scoring</p>
            </div>

            <div className="quality-metric">
              <div className="metric-icon">🛡️</div>
              <div className="metric-value">100%</div> 
              <div className="metric-label">Privacy Compliance</div>
              <p>Zero breaches of storyteller consent or privacy preferences</p>
            </div>

            <div className="quality-metric">
              <div className="metric-icon">🎯</div>
              <div className="metric-value">4</div>
              <div className="metric-label">Core Themes</div>
              <p>Strength, Social, Wellbeing, and Life Events categories</p>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .methodology-grid {
          display: grid;
          gap: var(--space-2xl);
          margin-top: var(--space-2xl);
        }

        .method-step {
          display: flex;
          gap: var(--space-xl);
          align-items: flex-start;
        }

        .step-number {
          background: linear-gradient(135deg, var(--color-brand-blue), var(--color-brand-green));
          color: var(--color-white);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .step-content {
          flex: 1;
        }

        .step-content h3 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: var(--space-sm);
          color: var(--color-ink);
        }

        .step-content p {
          color: var(--color-gray);
          line-height: 1.6;
          margin-bottom: var(--space-md);
        }

        .step-features {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .step-features li {
          color: var(--color-ink-light);
          font-size: 14px;
          margin-bottom: var(--space-xs);
          padding-left: var(--space-md);
          position: relative;
        }

        .step-features li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: var(--color-brand-green);
          font-weight: 600;
        }

        .quality-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-xl);
          margin-top: var(--space-2xl);
        }

        .quality-metric {
          text-align: center;
          background: var(--color-white);
          padding: var(--space-2xl);
          border-radius: 16px;
          border: 2px solid var(--color-gray-light);
          transition: all 0.3s ease;
        }

        .quality-metric:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
          border-color: var(--color-brand-blue);
        }

        .metric-icon {
          font-size: 48px;
          margin-bottom: var(--space-md);
        }

        .metric-value {
          font-size: 48px;
          font-weight: 700;
          color: var(--color-brand-blue);
          margin-bottom: var(--space-xs);
        }

        .metric-label {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-ink);
          margin-bottom: var(--space-sm);
        }

        .quality-metric p {
          color: var(--color-gray);
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }

        @media (max-width: 768px) {
          .method-step {
            flex-direction: column;
            text-align: center;
          }
          
          .quality-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}