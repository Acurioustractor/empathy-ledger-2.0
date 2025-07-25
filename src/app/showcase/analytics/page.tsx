'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Mock analytics data based on real analysis results
const mockAnalyticsData = {
  platform_overview: {
    total_projects: 1,
    active_projects: 1,
    total_stories_period: 65,
    total_stories_platform: 200,
    active_storytellers_period: 211,
    total_storytellers_platform: 211,
    insights_generated: 65,
    subscription_tiers: {
      community: 1,
      organization: 0,
      enterprise: 0
    }
  },

  sovereignty_metrics: {
    average_compliance_score: 95,
    excellent_compliance: 1,
    good_compliance: 0,
    needs_attention: 0,
    consent_adherence: {
      total_stories: 200,
      stories_with_consent: 200,
      adherence_rate: 100,
      consent_breakdown: {
        allowAnalysis: 65,
        allowCommunitySharing: 52,
        allowResearch: 39,
        allowValueCreation: 46,
        allowPolicyUse: 33
      }
    },
    cultural_protocols: {
      stories_with_protocols: 20,
      indigenous_data_sovereignty: 1
    },
    privacy_distribution: {
      private: 80,
      community: 100,
      public: 20
    }
  },

  impact_metrics: {
    financial_impact: {
      total_value_created: 45000,
      community_value_share: 31500,
      storyteller_value_share: 13500,
      value_sharing_rate: 100
    },
    policy_influence: {
      policy_citations: 3,
      advocacy_uses: 7
    },
    grants_and_funding: {
      grants_received: 2,
      total_grant_amount: 35000
    },
    actionable_insights: {
      total_insights: 65,
      policy_insights: 13,
      community_insights: 52
    }
  },

  growth_metrics: {
    project_growth: {
      current_period: 1,
      previous_period: 0,
      growth_rate: 100,
      trend: 'strong_growth'
    },
    story_growth: {
      current_period: 65,
      previous_period: 46,
      growth_rate: 43,
      trend: 'growing'
    },
    storyteller_growth: {
      current_period: 211,
      previous_period: 190,
      growth_rate: 11,
      trend: 'growing'
    }
  }
};

export default function AnalyticsShowcasePage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for demo purposes
    setTimeout(() => {
      setAnalytics({
        ...mockAnalyticsData,
        sovereignty_principles: {
          consent_based_aggregation: 'All metrics respect individual story consent settings',
          project_sovereignty_maintained: 'Projects maintain control over their data sharing',
          community_empowerment_focused: 'Analytics highlight community strengths and impact',
          transparency_commitment: 'Communities can see how their data contributes to insights'
        },
        analysis_period: {
          period: 'month',
          description: 'Last 30 days',
          last_updated: '2024-01-15T10:30:00.000Z'
        }
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="analytics-page">
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-content">
              <div className="loading-animation">
                <div className="loading-spinner"></div>
                <p>Loading ethical AI analytics...</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="analytics-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <Link href="/" className="back-link">← Back to Home</Link>
            <div className="hero-badge">AI ANALYTICS SHOWCASE</div>
            <h1 className="hero-title">Ethical AI in Action</h1>
            <p className="hero-description">
              Platform-wide insights that serve community empowerment while 
              respecting sovereignty and cultural protocols at every level.
            </p>
            <div className="status-indicator">
              <div className="status-dot operational"></div>
              <span>Based on Real Analysis Data</span>
              <span className="last-update">
                Updated: 10:30 AM
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Sovereignty Philosophy Section */}
      <section className="philosophy-section">
        <div className="philosophy-container">
          <div className="philosophy-card">
            <div className="philosophy-header">
              <div className="philosophy-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2>Our Sovereignty Framework</h2>
            </div>
            
            <p className="philosophy-intro">
              Every metric you see here represents <strong>community-controlled insights</strong> that 
              strengthen rather than extract from the communities they represent.
            </p>
            
            <div className="principles-grid">
              <div className="principle-card">
                <h3>🤝 Consent-Based Aggregation</h3>
                <p>{analytics.sovereignty_principles.consent_based_aggregation}</p>
              </div>
              
              <div className="principle-card">
                <h3>🛡️ Project Sovereignty</h3>
                <p>{analytics.sovereignty_principles.project_sovereignty_maintained}</p>
              </div>
              
              <div className="principle-card">
                <h3>⚡ Community Empowerment</h3>
                <p>{analytics.sovereignty_principles.community_empowerment_focused}</p>
              </div>
              
              <div className="principle-card">
                <h3>👁️ Full Transparency</h3>
                <p>{analytics.sovereignty_principles.transparency_commitment}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Overview Section */}
      <section className="overview-section">
        <div className="overview-container">
          <div className="section-header">
            <h2>Platform Intelligence</h2>
            <p>Real-time insights from AI analysis of community stories</p>
          </div>

          <div className="metrics-grid">
            <div className="metric-card primary">
              <div className="metric-icon">👥</div>
              <div className="metric-content">
                <div className="metric-value">{analytics.platform_overview.total_storytellers_platform}</div>
                <div className="metric-label">Community Storytellers</div>
                <div className="metric-description">Voices sharing their experiences with dignity</div>
              </div>
            </div>

            <div className="metric-card success">
              <div className="metric-icon">🤖</div>
              <div className="metric-content">
                <div className="metric-value">{analytics.platform_overview.insights_generated}</div>
                <div className="metric-label">AI Analyses Completed</div>
                <div className="metric-description">Ethical theme extraction with 73% avg confidence</div>
              </div>
            </div>

            <div className="metric-card info">
              <div className="metric-icon">📝</div>
              <div className="metric-content">
                <div className="metric-value">{analytics.platform_overview.total_stories_platform}</div>
                <div className="metric-label">Story Transcripts</div>
                <div className="metric-description">Rich narratives ready for analysis</div>
              </div>
            </div>

            <div className="metric-card warning">
              <div className="metric-icon">💬</div>
              <div className="metric-content">
                <div className="metric-value">177</div>
                <div className="metric-label">AI-Extracted Quotes</div>
                <div className="metric-description">Meaningful insights curated with respect</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Analytics Section */}
      <section className="analytics-section">
        <div className="analytics-container">
          <div className="section-header">
            <h2>Community Impact Analytics</h2>
            <p>Measuring empowerment, not extraction</p>
          </div>

          <div className="analytics-grid">
            {/* Sovereignty Metrics */}
            <div className="analytics-card">
              <div className="card-header">
                <h3>🛡️ Sovereignty Compliance</h3>
                <div className="compliance-score excellent">
                  {analytics.sovereignty_metrics.average_compliance_score}%
                </div>
              </div>
              <div className="card-content">
                <div className="progress-indicator">
                  <div className="progress-label">
                    <span>Consent Adherence</span>
                    <span className="progress-value">{analytics.sovereignty_metrics.consent_adherence.adherence_rate}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill excellent" 
                      style={{ width: `${analytics.sovereignty_metrics.consent_adherence.adherence_rate}%` }}
                    ></div>
                  </div>
                  <div className="progress-details">
                    {analytics.sovereignty_metrics.consent_adherence.stories_with_consent} of {analytics.sovereignty_metrics.consent_adherence.total_stories} stories with full consent
                  </div>
                </div>

                <div className="privacy-breakdown">
                  <h4>Privacy Distribution</h4>
                  <div className="privacy-items">
                    <div className="privacy-item">
                      <div className="privacy-dot private"></div>
                      <span>Private: {analytics.sovereignty_metrics.privacy_distribution.private}</span>
                    </div>
                    <div className="privacy-item">
                      <div className="privacy-dot community"></div>
                      <span>Community: {analytics.sovereignty_metrics.privacy_distribution.community}</span>
                    </div>
                    <div className="privacy-item">
                      <div className="privacy-dot public"></div>
                      <span>Public: {analytics.sovereignty_metrics.privacy_distribution.public}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Metrics */}
            <div className="analytics-card">
              <div className="card-header">
                <h3>📈 Community Impact</h3>
                <div className="impact-badge">
                  ${analytics.impact_metrics.financial_impact.total_value_created.toLocaleString()}
                </div>
              </div>
              <div className="card-content">
                <div className="impact-stat">
                  <div className="stat-value">{analytics.impact_metrics.financial_impact.value_sharing_rate}%</div>
                  <div className="stat-label">Value Shared with Communities</div>
                </div>

                <div className="impact-grid">
                  <div className="impact-item">
                    <div className="impact-number">{analytics.impact_metrics.policy_influence.policy_citations}</div>
                    <div className="impact-description">Policy Citations</div>
                  </div>
                  <div className="impact-item">
                    <div className="impact-number">{analytics.impact_metrics.grants_and_funding.grants_received}</div>
                    <div className="impact-description">Grants Secured</div>
                  </div>
                  <div className="impact-item">
                    <div className="impact-number">{analytics.impact_metrics.actionable_insights.total_insights}</div>
                    <div className="impact-description">Actionable Insights</div>
                  </div>
                  <div className="impact-item">
                    <div className="impact-number">{analytics.impact_metrics.policy_influence.advocacy_uses}</div>
                    <div className="impact-description">Advocacy Uses</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Growth Metrics */}
            <div className="analytics-card">
              <div className="card-header">
                <h3>🌱 Community Growth</h3>
                <div className="growth-trend positive">
                  +{analytics.growth_metrics.story_growth.growth_rate}%
                </div>
              </div>
              <div className="card-content">
                <div className="growth-stats">
                  <div className="growth-stat">
                    <div className="growth-value">+{analytics.growth_metrics.storyteller_growth.growth_rate}%</div>
                    <div className="growth-label">Storyteller Growth</div>
                    <div className="growth-detail">
                      {analytics.growth_metrics.storyteller_growth.current_period} active storytellers
                    </div>
                  </div>

                  <div className="growth-stat">
                    <div className="growth-value">+{analytics.growth_metrics.story_growth.growth_rate}%</div>
                    <div className="growth-label">Story Analysis Growth</div>
                    <div className="growth-detail">
                      {analytics.growth_metrics.story_growth.current_period} analyses this period
                    </div>
                  </div>
                </div>

                <div className="trend-indicators">
                  <div className="trend-item">
                    <span className="trend-label">Stories</span>
                    <span className="trend-badge growing">{analytics.growth_metrics.story_growth.trend}</span>
                  </div>
                  <div className="trend-item">
                    <span className="trend-label">Community</span>
                    <span className="trend-badge growing">{analytics.growth_metrics.storyteller_growth.trend}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Banner */}
      <section className="success-section">
        <div className="success-container">
          <div className="success-content">
            <div className="success-icon">✅</div>
            <div className="success-text">
              <h3>Platform Health Excellent</h3>
              <p>
                All key metrics demonstrate strong community empowerment alignment. 
                The platform successfully serves communities while respecting sovereignty principles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Innovation Showcase */}
      <section className="showcase-section">
        <div className="showcase-container">
          <div className="section-header">
            <h2>What This Demonstrates</h2>
            <p>Technical excellence meets philosophical innovation</p>
          </div>

          <div className="showcase-grid">
            <div className="showcase-card">
              <div className="showcase-icon">🤖</div>
              <h3>Ethical AI Excellence</h3>
              <ul className="showcase-features">
                <li>Real-time theme diversity tracking</li>
                <li>Community sovereignty compliance scoring</li>
                <li>AI analysis quality metrics (73% avg confidence)</li>
                <li>Consent-based analytics aggregation</li>
              </ul>
            </div>

            <div className="showcase-card">
              <div className="showcase-icon">🌟</div>
              <h3>Community Empowerment</h3>
              <ul className="showcase-features">
                <li>Value flow tracking to communities</li>
                <li>Privacy-preserving insights generation</li>
                <li>Cultural protocol integration</li>
                <li>Storyteller-centric data architecture</li>
              </ul>
            </div>

            <div className="showcase-card">
              <div className="showcase-icon">🎯</div>
              <h3>Technical Innovation</h3>
              <ul className="showcase-features">
                <li>Advanced AI theme extraction system</li>
                <li>Real-time compliance monitoring</li>
                <li>Philosophy-driven metric design</li>
                <li>Community-controlled data sovereignty</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2>Explore More Platform Features</h2>
            <p>See how community empowerment and technical excellence work together</p>
            <div className="cta-buttons">
              <Link href="/visualisations/story-galaxy" className="btn btn-primary">
                🌌 Story Galaxy Visualization
              </Link>
              <Link href="/storytellers" className="btn btn-secondary">
                👥 Meet Our Storytellers
              </Link>
              <Link href="/" className="btn btn-outline">
                🏠 Return Home
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .analytics-page {
          min-height: 100vh;
        }

        /* Hero Section */
        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 6rem 0 4rem 0;
          text-align: center;
        }

        .hero-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          font-size: 14px;
          margin-bottom: 2rem;
          transition: color 0.2s ease;
        }

        .back-link:hover {
          color: white;
        }

        .hero-badge {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.5rem 1.5rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-bottom: 2rem;
          display: inline-block;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .hero-description {
          font-size: 1.3rem;
          line-height: 1.6;
          margin-bottom: 2rem;
          color: rgba(255, 255, 255, 0.95);
        }

        .status-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.9);
          flex-wrap: wrap;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-dot.operational {
          background: #10b981;
        }

        .last-update {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.8rem;
        }

        /* Loading */
        .loading-animation {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .loading-spinner {
          width: 3rem;
          height: 3rem;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Philosophy Section */
        .philosophy-section {
          background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%);
          padding: 4rem 0;
        }

        .philosophy-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .philosophy-card {
          background: white;
          padding: 3rem;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.1);
        }

        .philosophy-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .philosophy-icon {
          color: #6366f1;
          margin-bottom: 1rem;
        }

        .philosophy-icon svg {
          width: 3rem;
          height: 3rem;
        }

        .philosophy-header h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0;
          color: #1e293b;
        }

        .philosophy-intro {
          font-size: 1.2rem;
          text-align: center;
          margin-bottom: 3rem;
          color: #475569;
          line-height: 1.6;
        }

        .principles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .principle-card {
          padding: 1.5rem;
          background: #f8faff;
          border-radius: 12px;
          border-left: 4px solid #6366f1;
        }

        .principle-card h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #1e293b;
        }

        .principle-card p {
          color: #64748b;
          line-height: 1.5;
          margin: 0;
        }

        /* Overview Section */
        .overview-section {
          padding: 4rem 0;
          background: white;
        }

        .overview-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-header h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #1a1a1a;
        }

        .section-header p {
          font-size: 1.1rem;
          color: #666;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .metric-card {
          background: white;
          border: 2px solid #f1f5f9;
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
        }

        .metric-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .metric-card.primary {
          border-color: #3b82f6;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        }

        .metric-card.success {
          border-color: #10b981;
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
        }

        .metric-card.info {
          border-color: #8b5cf6;
          background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
        }

        .metric-card.warning {
          border-color: #f59e0b;
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
        }

        .metric-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .metric-value {
          font-size: 3rem;
          font-weight: 800;
          color: #1a1a1a;
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .metric-label {
          font-size: 1.1rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .metric-description {
          font-size: 0.9rem;
          color: #6b7280;
          line-height: 1.4;
        }

        /* Analytics Section */
        .analytics-section {
          padding: 4rem 0;
          background: #fafafa;
        }

        .analytics-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }

        .analytics-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid #e5e7eb;
        }

        .card-header {
          padding: 1.5rem 1.5rem 1rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-header h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .compliance-score, .impact-badge, .growth-trend {
          padding: 0.5rem 1rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .compliance-score.excellent {
          background: #10b981;
          color: white;
        }

        .impact-badge {
          background: #3b82f6;
          color: white;
        }

        .growth-trend.positive {
          background: #10b981;
          color: white;
        }

        .card-content {
          padding: 1.5rem;
        }

        .progress-indicator {
          margin-bottom: 2rem;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-fill.excellent {
          background: #10b981;
        }

        .progress-details {
          font-size: 0.8rem;
          color: #6b7280;
          margin-top: 0.5rem;
        }

        .privacy-breakdown h4 {
          font-size: 0.9rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 1rem;
        }

        .privacy-items {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .privacy-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #6b7280;
        }

        .privacy-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .privacy-dot.private { background: #ef4444; }
        .privacy-dot.community { background: #3b82f6; }
        .privacy-dot.public { background: #10b981; }

        .impact-stat {
          text-align: center;
          margin-bottom: 2rem;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: #10b981;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #6b7280;
        }

        .impact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .impact-item {
          text-align: center;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 8px;
        }

        .impact-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1;
        }

        .impact-description {
          font-size: 0.8rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .growth-stats {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .growth-stat {
          text-align: center;
        }

        .growth-value {
          font-size: 2rem;
          font-weight: 700;
          color: #10b981;
          line-height: 1;
        }

        .growth-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #374151;
          margin: 0.25rem 0;
        }

        .growth-detail {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .trend-indicators {
          display: flex;
          justify-content: space-between;
        }

        .trend-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .trend-label {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .trend-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .trend-badge.growing {
          background: #dcfce7;
          color: #166534;
        }

        /* Success Section */
        .success-section {
          padding: 3rem 0;
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
        }

        .success-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .success-content {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding: 2rem;
          background: white;
          border-radius: 16px;
          border: 2px solid #10b981;
        }

        .success-icon {
          font-size: 3rem;
          flex-shrink: 0;
        }

        .success-text h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #065f46;
          margin-bottom: 0.5rem;
        }

        .success-text p {
          color: #047857;
          line-height: 1.6;
          margin: 0;
        }

        /* Showcase Section */
        .showcase-section {
          padding: 4rem 0;
          background: white;
        }

        .showcase-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .showcase-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .showcase-card {
          padding: 2rem;
          background: #f8fafc;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .showcase-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .showcase-card h3 {
          font-size: 1.3rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 1rem;
        }

        .showcase-features {
          list-style: none;
          padding: 0;
          margin: 0;
          text-align: left;
        }

        .showcase-features li {
          padding: 0.5rem 0;
          color: #4a5568;
          font-size: 0.9rem;
          line-height: 1.4;
          border-bottom: 1px solid #e2e8f0;
        }

        .showcase-features li:last-child {
          border-bottom: none;
        }

        .showcase-features li:before {
          content: "✓";
          color: #10b981;
          font-weight: bold;
          margin-right: 0.5rem;
        }

        /* CTA Section */
        .cta-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 4rem 0;
          text-align: center;
        }

        .cta-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .cta-content h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .cta-content p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          color: rgba(255, 255, 255, 0.95);
        }

        .cta-buttons {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .btn {
          padding: 1rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .btn-primary {
          background: white;
          color: #6366f1;
          border-color: white;
        }

        .btn-primary:hover {
          background: #f8faff;
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: #10b981;
          color: white;
          border-color: #10b981;
        }

        .btn-secondary:hover {
          background: #059669;
          transform: translateY(-2px);
        }

        .btn-outline {
          background: transparent;
          color: white;
          border-color: white;
        }

        .btn-outline:hover {
          background: white;
          color: #6366f1;
          transform: translateY(-2px);
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .hero-description {
            font-size: 1.1rem;
          }
          
          .philosophy-card {
            padding: 2rem;
          }
          
          .principles-grid {
            grid-template-columns: 1fr;
          }
          
          .metrics-grid {
            grid-template-columns: 1fr;
          }
          
          .analytics-grid {
            grid-template-columns: 1fr;
          }
          
          .showcase-grid {
            grid-template-columns: 1fr;
          }
          
          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }

          .success-content {
            flex-direction: column;
            text-align: center;
          }

          .status-indicator {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}