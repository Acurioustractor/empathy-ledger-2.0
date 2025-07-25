'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Content data structure for the wiki
const wikiContent = {
  'platform-overview': {
    title: 'Platform Overview',
    content: `
      # Platform Overview
      
      Welcome to the Empathy Ledger documentation. This community-centered storytelling platform prioritizes storyteller sovereignty and cultural protocols.
      
      ## Core Principles
      - **Community Ownership**: Stories and data remain with their creators
      - **Cultural Sovereignty**: Aboriginal protocols guide AI development
      - **Ethical Technology**: Transparent algorithms with community oversight
      
      ## Platform Stats
      - **40+ Database Tables**: Supporting complex storytelling relationships
      - **80+ Components**: Modern React architecture
      - **11 Migrations**: Continuous platform evolution
      - **100% RLS Enabled**: Data security at the database level
    `
  },
  'architecture': {
    title: 'Architecture Principles',
    content: `
      # Architecture Principles
      
      The Empathy Ledger platform is built on principles of community sovereignty and technical excellence.
      
      ## Technical Stack
      - **Frontend**: Next.js 15.4.1 with TypeScript
      - **Database**: Supabase with Row Level Security
      - **AI**: Community-controlled analytics with cultural oversight
      - **Mobile**: React Native for cross-platform access
      
      ## Design Philosophy
      Our architecture prioritizes community control over technical convenience, ensuring that all technical decisions serve the storytelling communities first.
    `
  },
  'community-design': {
    title: 'Community-Centered Design',
    content: `
      # Community-Centered Design
      
      Every design decision is made with community needs at the center.
      
      ## Design Process
      1. **Community Consultation**: All major features discussed with Aboriginal advisors
      2. **Cultural Protocol Integration**: AI features include cultural competency validation
      3. **Accessibility First**: Platform designed for diverse users and contexts
      
      ## User Experience Principles
      - Storyteller autonomy over their content
      - Transparent data usage and AI processing
      - Community control over collaboration features
    `
  },
  'sprint-3': {
    title: 'Sprint 3 Completion Summary',
    content: `
      # Sprint 3 Completion Summary
      
      ## ✅ All Objectives Achieved
      
      Sprint 3 delivered comprehensive platform enhancements across 4 focused weeks:
      
      ### Week 1: AI-Powered Analytics
      - Advanced Analytics Database Schema with AI insights tables
      - Professional Theme Analyzer with Aboriginal advisor oversight
      - AI Insights Dashboard with cultural protocol integration
      
      ### Week 2: Community Features
      - Storyteller Collaboration Hub with mentorship programs
      - Cross-Pollination System with revenue sharing frameworks
      - Aboriginal Advisory Integration with cultural review processes
      
      ### Week 3: Platform Scaling
      - Multi-Tenant Architecture supporting 100+ storytellers
      - Organization Management Dashboard with cultural competency tracking
      - Performance Monitoring System with scaling readiness assessment
      
      ### Week 4: Mobile App Foundation
      - React Native Architecture with cross-platform story reading
      - Mobile Story Reader optimized for touch interface
      - Audio/video integration with offline access capabilities
      
      ## Impact Achievement
      Sprint 3 transforms Empathy Ledger from a working storytelling platform into a comprehensive, AI-powered, community-centered ecosystem capable of scaling to 100+ storytellers while maintaining Aboriginal protocols.
    `
  },
  'database-schema': {
    title: 'Database Schema',
    content: `
      # Database Schema Overview
      
      Comprehensive database architecture supporting community-centered storytelling, AI-powered analytics, and multi-tenant organizational features.
      
      ## Core Tables (16 tables)
      
      ### storytellers
      - **Purpose**: Storyteller profiles and metadata
      - **Key Columns**: id, full_name, bio, profile_image_url, location_id, organization_id
      - **Relationships**: → organizations, → locations, ← stories, ← transcripts
      
      ### stories
      - **Purpose**: Story content with beautification and multimedia
      - **Key Columns**: id, storyteller_id, title, content, beautified_content, multimedia_elements
      - **Relationships**: → storytellers, ← story_analysis, ← story_engagement
      
      ### themes
      - **Purpose**: Story themes and categorization
      - **Key Columns**: id, name, description, status, parent_theme_id
      - **Relationships**: ← story_themes, ← theme_diversity_metrics
      
      ## AI & Analytics (8 tables)
      
      ### storyteller_ai_insights
      - **Purpose**: AI-powered storyteller analysis and recommendations
      - **Key Columns**: id, storyteller_id, analysis_type, analysis_data, confidence_score
      - **Cultural Oversight**: All AI insights reviewed by Aboriginal advisors
      
      ### professional_impact_metrics
      - **Purpose**: Professional impact tracking and prediction
      - **Key Columns**: id, storyteller_id, impact_type, actual_count, predicted_count
      - **Community Control**: Storytellers control visibility of their metrics
      
      ## Community Features (8 tables)
      
      ### community_collaborations
      - **Purpose**: Collaborative projects and cross-pollination
      - **Key Columns**: id, project_name, project_type, status, cultural_protocols_followed
      - **Revenue Sharing**: Built-in frameworks for equitable collaboration
      
      ### mentorship_relationships
      - **Purpose**: Mentor-mentee connections and programs
      - **Key Columns**: id, mentor_id, mentee_id, relationship_status, cultural_competency_validated
      - **Cultural Competency**: Mentors must pass cultural competency assessment
      
      ## Organizations (8 tables)
      
      ### organizations
      - **Purpose**: Organization profiles and multi-tenant data
      - **Key Columns**: id, name, organization_type, cultural_competency_score, subscription_tier
      - **Multi-Tenant**: Supports 100+ storytellers across multiple organizations
      
      ### cultural_competency_assessments
      - **Purpose**: Cultural competency tracking for organizations
      - **Key Columns**: id, organization_id, assessment_score, areas_for_improvement, certification_status
      - **Requirement**: Organizations must maintain cultural competency certification
      
      ## Migration History
      - **010**: Platform Scaling System (Multi-tenant architecture, mobile app support)
      - **009**: Community Collaboration System (Cross-pollination, mentorship, collective projects)
      - **008**: AI Analytics System (AI insights, professional impact tracking, theme analysis)
      - **007**: Enhanced Story Schema (Story beautification, multimedia support, engagement tracking)
      
      All tables implement Row Level Security (RLS) for data sovereignty.
    `
  },
  'theme-analysis': {
    title: 'AI Theme Analysis System',
    content: `
      # AI Theme Analysis System
      
      Our AI-powered theme analysis system operates under strict cultural protocols and community oversight.
      
      ## Cultural Oversight Framework
      
      ### Aboriginal Advisory Integration
      - All AI models reviewed by Aboriginal advisors before deployment
      - Cultural protocol validation for every analysis result
      - Community veto power over AI recommendations
      
      ### Ethical AI Principles
      - **Transparency**: All algorithms open to community review
      - **Consent**: Storytellers control AI analysis of their content
      - **Accuracy**: 73% average confidence with human verification required
      
      ## Technical Implementation
      
      ### Theme Analysis Pipeline
      1. **Content Processing**: Storyteller consents to AI analysis
      2. **Cultural Validation**: Aboriginal advisor reviews analysis parameters
      3. **AI Analysis**: Automated theme identification with confidence scoring
      4. **Community Review**: Results shared with storyteller for approval
      5. **Publication**: Only approved insights made available to platform
      
      ### Database Tables
      - **story_analysis**: Individual story theme analysis results
      - **theme_diversity_metrics**: Platform-wide theme diversity tracking
      - **storyteller_ai_insights**: Personalized insights with cultural oversight
      
      ### Professional Impact Tracking
      Our AI system predicts professional impact opportunities while maintaining storyteller autonomy:
      - **Speaking Opportunities**: AI identifies potential matches with cultural events
      - **Collaboration Matches**: Cross-pollination suggestions based on complementary skills
      - **Mentorship Opportunities**: Mentor-mentee matching with cultural competency validation
      
      ## Community Benefits
      
      ### For Storytellers
      - Enhanced visibility for their expertise areas
      - Professional development opportunities
      - Revenue sharing from AI-enabled collaborations
      
      ### For Organizations
      - Cultural competency-validated storyteller matching
      - Value alignment scoring for authentic partnerships
      - Community-approved diversity metrics
      
      ## Privacy & Sovereignty
      - Storytellers own all AI insights about their content
      - Organizations cannot access storyteller data without explicit consent
      - Cultural data remains under community control
      - AI models regularly audited for bias and cultural sensitivity
    `
  }
};

// Navigation structure
const navigationStructure = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: '🚀',
    items: [
      { id: 'platform-overview', title: 'Platform Overview' },
      { id: 'architecture', title: 'Architecture Principles' },
      { id: 'community-design', title: 'Community-Centered Design' }
    ]
  },
  {
    id: 'recent-updates', 
    title: 'Recent Updates',
    icon: '📝',
    items: [
      { id: 'sprint-3', title: 'Sprint 3 Completion' }
    ]
  },
  {
    id: 'backend-api',
    title: 'Backend & API',
    icon: '⚙️',
    items: [
      { id: 'database-schema', title: 'Database Schema' }
    ]
  },
  {
    id: 'ai-analytics',
    title: 'AI & Analytics',
    icon: '🤖',
    items: [
      { id: 'theme-analysis', title: 'Theme Analysis System' }
    ]
  }
];

interface WikiLayoutProps {
  children?: React.ReactNode;
}

export default function WikiLayout({ children }: WikiLayoutProps) {
  const [currentContent, setCurrentContent] = useState('platform-overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['getting-started', 'recent-updates']));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const selectContent = (contentId: string) => {
    setCurrentContent(contentId);
    setMobileMenuOpen(false);
  };

  const currentContentData = wikiContent[currentContent as keyof typeof wikiContent];

  // Find breadcrumb path
  const findBreadcrumbs = (contentId: string) => {
    for (const section of navigationStructure) {
      const item = section.items.find(item => item.id === contentId);
      if (item) {
        return [
          { title: 'Wiki', id: 'platform-overview' },
          { title: section.title, id: section.id },
          { title: item.title, id: item.id }
        ];
      }
    }
    return [{ title: 'Wiki', id: 'platform-overview' }];
  };

  const breadcrumbs = findBreadcrumbs(currentContent);

  return (
    <div className="wiki-layout">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button 
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className="mobile-title">📚 Wiki</div>
        <Link href="/" className="back-link">← Platform</Link>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link href="/" className="wiki-logo">
            <span className="logo-icon">📚</span>
            <span className="logo-text">Empathy Ledger Wiki</span>
          </Link>
          <Link href="/" className="back-link">← Back to Platform</Link>
        </div>

        <nav className="sidebar-nav">
          {navigationStructure.map((section) => {
            const isExpanded = expandedSections.has(section.id);
            
            return (
              <div key={section.id} className="nav-section">
                <button 
                  className="section-header"
                  onClick={() => toggleSection(section.id)}
                >
                  <span className="section-icon">{section.icon}</span>
                  <span className="section-title">{section.title}</span>
                  <svg 
                    className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
                    width="12" 
                    height="12" 
                    viewBox="0 0 12 12"
                  >
                    <path d="M4 3L8 6L4 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                <div className={`section-items ${isExpanded ? 'expanded' : ''}`}>
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      className={`nav-item ${currentContent === item.id ? 'active' : ''}`}
                      onClick={() => selectContent(item.id)}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={`breadcrumb-${index}-${crumb.id}`}>
              <button 
                className={`breadcrumb ${index === breadcrumbs.length - 1 ? 'current' : ''}`}
                onClick={() => index < breadcrumbs.length - 1 ? selectContent(crumb.id) : undefined}
                disabled={index === breadcrumbs.length - 1}
              >
                {crumb.title}
              </button>
              {index < breadcrumbs.length - 1 && (
                <span className="breadcrumb-separator">→</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Content Area */}
        <div className="content-area">
          <h1>{currentContentData.title}</h1>
          <div className="content-body">
            {currentContentData.content.split('\n').map((line, index) => {
              if (line.trim().startsWith('# ')) {
                return <h1 key={index}>{line.replace('# ', '')}</h1>;
              } else if (line.trim().startsWith('## ')) {
                return <h2 key={index}>{line.replace('## ', '')}</h2>;
              } else if (line.trim().startsWith('### ')) {
                return <h3 key={index}>{line.replace('### ', '')}</h3>;
              } else if (line.trim().startsWith('- **') || line.trim().startsWith('- ')) {
                return <li key={index}>{line.replace(/^- /, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>;
              } else if (line.trim() === '') {
                return <br key={index} />;
              } else {
                return <p key={index} dangerouslySetInnerHTML={{__html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}} />;
              }
            })}
          </div>
        </div>
      </main>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <style jsx>{`
        .wiki-layout {
          display: flex;
          min-height: 100vh;
          background: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        /* Mobile Header */
        .mobile-header {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 56px;
          background: white;
          border-bottom: 1px solid #e1e5e9;
          z-index: 1001;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
        }

        .mobile-menu-button {
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .mobile-menu-button span {
          width: 18px;
          height: 2px;
          background: #374151;
          border-radius: 1px;
          transition: all 0.2s;
        }

        .mobile-title {
          font-weight: 600;
          color: #374151;
        }

        .back-link {
          color: #0969da;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        /* Sidebar */
        .sidebar {
          width: 280px;
          background: #f8f9fa;
          border-right: 1px solid #e1e5e9;
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          overflow-y: auto;
          z-index: 1000;
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          padding: 16px 20px;
          border-bottom: 1px solid #e1e5e9;
          background: white;
        }

        .wiki-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: #1f2328;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .logo-icon {
          font-size: 18px;
        }

        .logo-text {
          font-size: 15px;
          font-weight: 600;
        }

        .sidebar-header .back-link {
          color: #656d76;
          text-decoration: none;
          font-size: 13px;
          opacity: 0.8;
        }

        .sidebar-header .back-link:hover {
          opacity: 1;
          color: #0969da;
        }

        /* Navigation */
        .sidebar-nav {
          flex: 1;
          padding: 4px 0;
        }

        .nav-section {
          margin-bottom: 2px;
        }

        .section-header {
          width: 100%;
          background: none;
          border: none;
          padding: 8px 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: #656d76;
          font-size: 13px;
          font-weight: 600;
          text-align: left;
          transition: all 0.15s ease;
          border-left: 3px solid transparent;
        }

        .section-header:hover {
          background: rgba(9, 105, 218, 0.08);
          color: #0969da;
        }

        .section-icon {
          font-size: 14px;
          width: 14px;
          text-align: center;
          opacity: 0.8;
        }

        .section-title {
          flex: 1;
          font-size: 13px;
          letter-spacing: 0.02em;
        }

        .expand-icon {
          transition: transform 0.15s ease;
          color: #656d76;
          opacity: 0.6;
        }

        .expand-icon.expanded {
          transform: rotate(90deg);
        }

        .section-items {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.2s ease-out;
          background: transparent;
        }

        .section-items.expanded {
          max-height: 400px;
        }

        .nav-item {
          width: 100%;
          background: none;
          border: none;
          padding: 6px 20px 6px 42px;
          color: #656d76;
          text-decoration: none;
          font-size: 13px;
          transition: all 0.15s ease;
          text-align: left;
          cursor: pointer;
          display: block;
          margin: 1px 0;
          border-left: 3px solid transparent;
          position: relative;
        }

        .nav-item:hover {
          background: rgba(9, 105, 218, 0.06);
          color: #0969da;
        }

        .nav-item.active {
          background: rgba(9, 105, 218, 0.1);
          color: #0969da;
          font-weight: 500;
          border-left-color: #0969da;
        }

        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: #0969da;
        }

        /* Main Content */
        .main-content {
          flex: 1;
          margin-left: 280px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: white;
        }

        .breadcrumbs {
          background: #f8f9fa;
          padding: 12px 40px;
          border-bottom: 1px solid #e1e5e9;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          min-height: 48px;
        }

        .breadcrumb {
          background: none;
          border: none;
          color: #656d76;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.15s ease;
          font-size: 13px;
        }

        .breadcrumb:hover:not(.current) {
          background: rgba(9, 105, 218, 0.08);
          color: #0969da;
        }

        .breadcrumb.current {
          color: #1f2328;
          font-weight: 500;
          cursor: default;
        }

        .breadcrumb-separator {
          color: #656d76;
          margin: 0 2px;
          opacity: 0.6;
        }

        .content-area {
          flex: 1;
          padding: 40px 48px;
          max-width: 900px;
          line-height: 1.6;
        }

        .content-area h1 {
          font-size: 2.25rem;
          font-weight: 700;
          color: #1f2328;
          margin-bottom: 24px;
          line-height: 1.25;
          border-bottom: 1px solid #e1e5e9;
          padding-bottom: 16px;
        }

        .content-body h1 {
          font-size: 1.875rem;
          font-weight: 600;
          color: #1f2328;
          margin: 40px 0 20px 0;
          line-height: 1.3;
          border-bottom: 1px solid #e1e5e9;
          padding-bottom: 12px;
        }

        .content-body h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2328;
          margin: 32px 0 16px 0;
          line-height: 1.4;
        }

        .content-body h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2328;
          margin: 24px 0 12px 0;
          line-height: 1.4;
        }

        .content-body p {
          color: #656d76;
          margin-bottom: 16px;
          line-height: 1.6;
        }

        .content-body li {
          color: #656d76;
          margin-bottom: 6px;
          list-style: none;
          padding-left: 0;
          line-height: 1.5;
        }

        .content-body li::before {
          content: "•";
          color: #0969da;
          font-weight: 600;
          margin-right: 10px;
        }

        .mobile-overlay {
          display: none;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .mobile-header {
            display: flex;
          }

          .sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }

          .sidebar.open {
            transform: translateX(0);
          }

          .main-content {
            margin-left: 0;
            padding-top: 56px;
          }

          .content-area {
            padding: 24px;
          }

          .content-area h1 {
            font-size: 2rem;
          }

          .mobile-overlay {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
          }
        }

        /* Scrollbar */
        .sidebar::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}