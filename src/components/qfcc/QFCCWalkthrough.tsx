'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Walkthrough steps showing the complete QFCC youth journey
const walkthroughSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Your Story Space',
    description: 'A safe place where you control everything about your story',
    content: {
      type: 'welcome',
      userType: 'Alex (16)',
      message: `Hi Alex! Welcome to your personal story space. This is where you can share your experiences with youth justice and child protection - but only what you want to share, when you want to share it. You're in complete control.`,
      features: [
        '🛡️ You control who sees what',
        '📝 Share your story at your own pace', 
        '🎯 Help improve the system for other young people',
        '💪 Build your voice as a youth advocate'
      ]
    }
  },
  {
    id: 'first-interview',
    title: 'Your First Interview Session',
    description: 'Getting started with a trained QFCC worker',
    content: {
      type: 'interview-setup',
      staffMember: 'Sarah (QFCC Youth Worker)',
      sessionType: 'Introduction Session',
      message: `Let's start with getting to know you and what you're comfortable sharing. Remember, you can pause, stop, or change your mind about anything at any time.`,
      controls: [
        'Start/Stop Recording',
        'Choose What Gets Transcribed',
        'Set Privacy Levels',
        'Take Breaks Anytime'
      ],
      currentSettings: {
        recording: 'Ready to start',
        privacy: 'Maximum Privacy (default)',
        analysis: 'None (you choose later)'
      }
    }
  },
  {
    id: 'story-creation',
    title: 'Building Your Story Over Time',
    description: 'Multiple sessions to create your complete narrative',
    content: {
      type: 'story-building',
      sessions: [
        {
          number: 1,
          title: 'Introduction & Background',
          status: 'completed',
          content: 'Basic story about family background and how I entered the system',
          privacy: 'QFCC Staff Only',
          themes: ['Family separation', 'System entry']
        },
        {
          number: 2,
          title: 'Court Experience',
          status: 'completed', 
          content: 'My experience going through youth court and what could be better',
          privacy: 'Research Use (Anonymous)',
          themes: ['Youth court', 'Support needs', 'System improvement ideas']
        },
        {
          number: 3,
          title: 'Future Vision',
          status: 'in-progress',
          content: 'What I want to see change and how I want to help other young people',
          privacy: 'To be decided',
          themes: ['Advocacy', 'Peer support', 'System reform']
        }
      ]
    }
  },
  {
    id: 'privacy-controls',
    title: 'Your Privacy Dashboard',
    description: 'Complete control over who sees what',
    content: {
      type: 'privacy-dashboard',
      contentSections: [
        {
          title: 'Foster Care Experience',
          content: 'Details about multiple placements and feeling unsafe...',
          currentSetting: 'Private (Only Me)',
          options: ['Private (Only Me)', 'QFCC Staff Only', 'Research (Anonymous)', 'Public (With My Name)'],
          analysis: 'No AI Analysis',
          reasoning: 'Too personal right now, maybe later'
        },
        {
          title: 'Youth Court Story',
          content: 'What it was like being in court and suggestions for improvement...',
          currentSetting: 'Research (Anonymous)',
          options: ['Private (Only Me)', 'QFCC Staff Only', 'Research (Anonymous)', 'Public (With My Name)'],
          analysis: 'Themes Only',
          reasoning: 'Want this to help improve the system but keep my identity private'
        },
        {
          title: 'Peer Support Ideas',
          content: 'How young people could better support each other in the system...',
          currentSetting: 'Public (With My Name)',
          options: ['Private (Only Me)', 'QFCC Staff Only', 'Research (Anonymous)', 'Public (With My Name)'],
          analysis: 'Full Analysis',
          reasoning: 'Proud of these ideas and want to advocate publicly'
        }
      ]
    }
  },
  {
    id: 'ai-analysis',
    title: 'AI Finds Your Themes',
    description: 'Discover patterns in your story that show your expertise',
    content: {
      type: 'ai-insights',
      analysisResults: {
        confidence: '91%',
        themes: [
          {
            theme: 'Peer Support Advocacy',
            strength: 'High',
            description: 'Strong passion for helping other young people navigate the system',
            opportunities: ['Youth mentoring', 'Policy consultation', 'Peer support training']
          },
          {
            theme: 'System Reform Vision',
            strength: 'High', 
            description: 'Clear ideas about how youth justice and child protection could improve',
            opportunities: ['Advisory committees', 'Conference speaking', 'Policy review participation']
          },
          {
            theme: 'Trauma-Informed Expertise',
            strength: 'Medium',
            description: 'Understanding of how trauma affects young people in the system',
            opportunities: ['Staff training input', 'Service design consultation']
          }
        ],
        culturalValidation: {
          status: 'Reviewed by QFCC Youth Advisory Council',
          notes: 'Analysis respectfully represents Alex\'s experiences and advocacy potential'
        }
      }
    }
  },
  {
    id: 'branded-dashboard',
    title: 'Your Personal Advocacy Hub',
    description: 'Customize your space and build your youth advocate profile',
    content: {
      type: 'personal-dashboard',
      profile: {
        name: 'Alex - Youth Advocate',
        tagline: 'Improving the system for young people like me',
        customization: {
          theme: 'Ocean Blue',
          backgroundImage: 'sunset-landscape.jpg',
          profileImage: 'alex-profile.jpg'
        },
        achievements: [
          '🎤 Spoke at QFCC Youth Forum',
          '📋 Consulted on new court support program',
          '🤝 Mentoring 2 younger participants',
          '📊 Story influenced 3 policy recommendations'
        ],
        currentProjects: [
          'Co-designing peer support training program',
          'Advisory committee for court reform',
          'Mentoring new youth participants'
        ]
      }
    }
  },
  {
    id: 'social-sharing',
    title: 'Share Your Impact',
    description: 'Get your message out while tracking where your story goes',
    content: {
      type: 'social-sharing',
      shareOptions: [
        {
          platform: 'Instagram',
          contentType: 'Story Quote',
          preview: '"Young people need to be heard when designing services for us. We know what works because we live it." - Alex, Youth Advocate',
          attribution: 'Links back to: stories.qfcc.gov.au/alex-advocate',
          settings: {
            trackShares: true,
            allowReposts: true,
            notifyOnUse: true
          }
        },
        {
          platform: 'TikTok',
          contentType: 'Advocacy Video',
          preview: 'Short video explaining why youth voice matters in child protection',
          attribution: 'Bio link: stories.qfcc.gov.au/alex-advocate',
          settings: {
            trackShares: true,
            allowReposts: true,
            notifyOnUse: true
          }
        }
      ],
      trackingActive: {
        totalShares: 247,
        platforms: ['Instagram: 156', 'TikTok: 91'],
        engagement: 'High - lots of positive comments from other young people'
      }
    }
  },
  {
    id: 'story-usage',
    title: 'See Your Story\'s Impact',
    description: 'Track how your story is making real change happen',
    content: {
      type: 'usage-tracking',
      usageInstances: [
        {
          date: '2024-02-15',
          usedBy: 'QFCC Commissioner',
          context: 'Queensland Parliament Inquiry into Youth Justice',
          quote: '"As one young person told us: Young people need to be heard when designing services..."',
          reach: 'Parliamentary Committee + Public Gallery (200+ people)',
          impact: 'Influenced Recommendation #3: Mandatory youth consultation',
          status: 'You were notified and approved this use'
        },
        {
          date: '2024-03-08',
          usedBy: 'QFCC Senior Policy Officer',
          context: 'Staff Training on Trauma-Informed Practice',
          quote: 'Youth perspective on how court experiences affect young people',
          reach: '150 QFCC staff members',
          impact: 'New court support protocols developed',
          status: 'You were notified and approved this use'
        },
        {
          date: '2024-03-22',
          usedBy: 'Youth Justice Conference Organizer',
          context: 'National Youth Justice Reform Conference',
          quote: 'Featured as example of effective youth engagement',
          reach: '500+ child protection and youth justice workers',
          impact: 'Other states interested in similar programs',
          status: 'You were consulted and chose to participate remotely'
        }
      ],
      impactSummary: {
        policiesInfluenced: 3,
        peopleReached: '850+',
        trainingPrograms: 2,
        otherStatesInterested: 4
      }
    }
  },
  {
    id: 'economic-opportunities',
    title: 'Your Growing Voice & Income',
    description: 'Turn your advocacy into real opportunities and income',
    content: {
      type: 'opportunities',
      currentOpportunities: [
        {
          type: 'Speaking Engagement',
          title: 'National Child Protection Conference 2024',
          description: 'Keynote on youth-led system reform',
          payment: '$750 + travel',
          status: 'Invited - Your Choice'
        },
        {
          type: 'Consultation',
          title: 'Department of Child Safety - Policy Review',
          description: '3-hour consultation on new support programs',
          payment: '$300',
          status: 'Invited - Your Choice'
        },
        {
          type: 'Training Development',
          title: 'Co-design Staff Training Module',
          description: 'Work with QFCC to develop youth voice training for staff',
          payment: '$1,200 over 3 months',
          status: 'In Discussion'
        }
      ],
      earningsToDate: '$2,250',
      impactMetrics: {
        peopleInfluenced: '1,200+',
        policiesChanged: 5,
        youthMentored: 3,
        staffTrained: 200
      }
    }
  },
  {
    id: 'community-connection',
    title: 'Building Your Network',
    description: 'Connect with other youth advocates and share knowledge',
    content: {
      type: 'community',
      connections: [
        {
          name: 'Jordan (17) - Foster Care Advocate',
          connection: 'Mentoring relationship',
          sharedThemes: ['Foster care reform', 'Youth empowerment'],
          collaboration: 'Co-designing peer support program'
        },
        {
          name: 'Sam (19) - Indigenous Rights Advocate', 
          connection: 'Collaboration partner',
          sharedThemes: ['Cultural safety', 'System reform'],
          collaboration: 'Joint presentation on cultural competency'
        },
        {
          name: 'Riley (15) - New to platform',
          connection: 'Mentee',
          sharedThemes: ['Court experience', 'Peer support'],
          collaboration: 'Providing guidance on privacy settings and story development'
        }
      ],
      communityImpact: {
        youthSupported: 8,
        collaborativeProjects: 3,
        peerNetworkSize: 25,
        crossOrganizationConnections: 4
      }
    }
  }
];

export default function QFCCWalkthrough() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const nextStep = () => {
    if (currentStep < walkthroughSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const currentStepData = walkthroughSteps[currentStep];

  const renderStepContent = () => {
    const { content } = currentStepData;
    
    switch (content.type) {
      case 'welcome':
        return (
          <div className="welcome-screen">
            <div className="user-greeting">
              <div className="avatar">👤</div>
              <h3>Welcome {content.userType}!</h3>
            </div>
            <div className="welcome-message">
              <p>{content.message}</p>
            </div>
            <div className="feature-list">
              {content.features.map((feature, index) => (
                <div key={index} className="feature-item">
                  {feature}
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'interview-setup':
        return (
          <div className="interview-screen">
            <div className="staff-intro">
              <div className="staff-avatar">👩‍💼</div>
              <div className="staff-info">
                <h4>{content.staffMember}</h4>
                <p>{content.sessionType}</p>
              </div>
            </div>
            <div className="interview-message">
              <p>{content.message}</p>
            </div>
            <div className="interview-controls">
              <h4>Your Controls:</h4>
              {content.controls.map((control, index) => (
                <div key={index} className="control-item">
                  <button className="control-btn">🎛️</button>
                  <span>{control}</span>
                </div>
              ))}
            </div>
            <div className="current-settings">
              <h4>Current Settings:</h4>
              <div className="setting">📹 Recording: {content.currentSettings.recording}</div>
              <div className="setting">🔒 Privacy: {content.currentSettings.privacy}</div>
              <div className="setting">🤖 AI Analysis: {content.currentSettings.analysis}</div>
            </div>
          </div>
        );
        
      case 'story-building':
        return (
          <div className="story-building">
            <h4>Your Story Journey</h4>
            <div className="sessions-timeline">
              {content.sessions.map((session, index) => (
                <div key={index} className={`session-card ${session.status}`}>
                  <div className="session-header">
                    <span className="session-number">Session {session.number}</span>
                    <span className={`status-badge ${session.status}`}>
                      {session.status === 'completed' ? '✅' : session.status === 'in-progress' ? '🔄' : '⏳'}
                      {session.status}
                    </span>
                  </div>
                  <h5>{session.title}</h5>
                  <p>{session.content}</p>
                  <div className="session-settings">
                    <div className="privacy-setting">🔒 Privacy: {session.privacy}</div>
                    <div className="themes">🏷️ Themes: {session.themes.join(', ')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'privacy-dashboard':
        return (
          <div className="privacy-dashboard">
            <h4>Your Privacy Controls</h4>
            <p>Choose what happens with each part of your story:</p>
            <div className="content-sections">
              {content.contentSections.map((section, index) => (
                <div key={index} className="content-section">
                  <h5>{section.title}</h5>
                  <div className="content-preview">{section.content}</div>
                  <div className="privacy-controls">
                    <label>Who can see this:</label>
                    <select value={section.currentSetting}>
                      {section.options.map((option, optIndex) => (
                        <option key={optIndex} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div className="analysis-setting">
                    <label>AI Analysis:</label>
                    <span className="analysis-level">{section.analysis}</span>
                  </div>
                  <div className="reasoning">
                    <em>Your note: "{section.reasoning}"</em>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'ai-insights':
        return (
          <div className="ai-insights">
            <div className="analysis-header">
              <h4>Your Story Themes</h4>
              <div className="confidence-score">
                <span>AI Confidence: {content.analysisResults.confidence}</span>
                <div className="confidence-bar">
                  <div className="confidence-fill" style={{width: content.analysisResults.confidence}}></div>
                </div>
              </div>
            </div>
            <div className="themes-grid">
              {content.analysisResults.themes.map((theme, index) => (
                <div key={index} className="theme-card">
                  <div className="theme-header">
                    <h5>{theme.theme}</h5>
                    <span className={`strength-badge ${theme.strength.toLowerCase()}`}>
                      {theme.strength} Strength
                    </span>
                  </div>
                  <p>{theme.description}</p>
                  <div className="opportunities">
                    <h6>Opportunities for you:</h6>
                    <ul>
                      {theme.opportunities.map((opp, oppIndex) => (
                        <li key={oppIndex}>{opp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            <div className="cultural-validation">
              <h6>Cultural Validation</h6>
              <p>✅ {content.analysisResults.culturalValidation.status}</p>
              <p><em>{content.analysisResults.culturalValidation.notes}</em></p>
            </div>
          </div>
        );
        
      case 'personal-dashboard':
        return (
          <div className="personal-dashboard">
            <div className="profile-header" style={{background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)'}}>
              <div className="profile-image">👤</div>
              <div className="profile-info">
                <h3>{content.profile.name}</h3>
                <p>{content.profile.tagline}</p>
              </div>
              <div className="customization-note">
                <small>🎨 Customized with {content.profile.customization.theme} theme</small>
              </div>
            </div>
            <div className="dashboard-content">
              <div className="achievements-section">
                <h4>Your Achievements</h4>
                <div className="achievements-grid">
                  {content.profile.achievements.map((achievement, index) => (
                    <div key={index} className="achievement-badge">
                      {achievement}
                    </div>
                  ))}
                </div>
              </div>
              <div className="current-projects">
                <h4>What You're Working On</h4>
                <ul>
                  {content.profile.currentProjects.map((project, index) => (
                    <li key={index} className="project-item">
                      🚀 {project}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
        
      case 'social-sharing':
        return (
          <div className="social-sharing">
            <h4>Share Your Message</h4>
            <div className="sharing-options">
              {content.shareOptions.map((option, index) => (
                <div key={index} className="share-option">
                  <div className="platform-header">
                    <h5>📱 {option.platform} - {option.contentType}</h5>
                  </div>
                  <div className="share-preview">
                    <div className="preview-content">"{option.preview}"</div>
                    <div className="attribution">↗️ {option.attribution}</div>
                  </div>
                  <div className="share-settings">
                    <label><input type="checkbox" checked={option.settings.trackShares} readOnly /> Track shares</label>
                    <label><input type="checkbox" checked={option.settings.allowReposts} readOnly /> Allow reposts</label>
                    <label><input type="checkbox" checked={option.settings.notifyOnUse} readOnly /> Notify me when used</label>
                  </div>
                  <button className="share-btn">Share Now</button>
                </div>
              ))}
            </div>
            <div className="tracking-stats">
              <h5>Your Reach So Far</h5>
              <div className="stats-grid">
                <div className="stat">
                  <strong>{content.trackingActive.totalShares}</strong>
                  <span>Total Shares</span>
                </div>
                <div className="platforms-list">
                  {content.trackingActive.platforms.map((platform, index) => (
                    <div key={index} className="platform-stat">{platform}</div>
                  ))}
                </div>
              </div>
              <p className="engagement-note">📈 {content.trackingActive.engagement}</p>
            </div>
          </div>
        );
        
      case 'usage-tracking':
        return (
          <div className="usage-tracking">
            <h4>How Your Story Is Making Change</h4>
            <div className="usage-timeline">
              {content.usageInstances.map((usage, index) => (
                <div key={index} className="usage-card">
                  <div className="usage-header">
                    <div className="usage-date">{usage.date}</div>
                    <div className="usage-status">✅ {usage.status}</div>
                  </div>
                  <div className="usage-details">
                    <h5>{usage.context}</h5>
                    <p><strong>Used by:</strong> {usage.usedBy}</p>
                    <div className="usage-quote">
                      <em>"{usage.quote}"</em>
                    </div>
                    <div className="usage-impact">
                      <p><strong>Reach:</strong> {usage.reach}</p>
                      <p><strong>Impact:</strong> {usage.impact}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="impact-summary">
              <h5>Your Total Impact</h5>
              <div className="impact-stats">
                <div className="impact-stat">
                  <strong>{content.impactSummary.policiesInfluenced}</strong>
                  <span>Policies Influenced</span>
                </div>
                <div className="impact-stat">
                  <strong>{content.impactSummary.peopleReached}</strong>
                  <span>People Reached</span>
                </div>
                <div className="impact-stat">
                  <strong>{content.impactSummary.trainingPrograms}</strong>
                  <span>Training Programs</span>
                </div>
                <div className="impact-stat">
                  <strong>{content.impactSummary.otherStatesInterested}</strong>
                  <span>States Interested</span>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'opportunities':
        return (
          <div className="opportunities">
            <h4>Your Growing Voice & Income</h4>
            <div className="current-earnings">
              <div className="earnings-display">
                <span className="earnings-amount">${content.earningsToDate}</span>
                <span className="earnings-label">Earned Through Your Advocacy</span>
              </div>
            </div>
            <div className="opportunities-list">
              <h5>Current Opportunities</h5>
              {content.currentOpportunities.map((opp, index) => (
                <div key={index} className="opportunity-card">
                  <div className="opp-header">
                    <h6>{opp.title}</h6>
                    <span className="opp-type">{opp.type}</span>
                  </div>
                  <p>{opp.description}</p>
                  <div className="opp-details">
                    <div className="opp-payment">💰 {opp.payment}</div>
                    <div className={`opp-status ${opp.status.toLowerCase().replace(' ', '-')}`}>
                      {opp.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="impact-metrics">
              <h5>Your Influence</h5>
              <div className="metrics-grid">
                <div className="metric">
                  <strong>{content.impactMetrics.peopleInfluenced}</strong>
                  <span>People Influenced</span>
                </div>
                <div className="metric">
                  <strong>{content.impactMetrics.policiesChanged}</strong>
                  <span>Policies Changed</span>
                </div>
                <div className="metric">
                  <strong>{content.impactMetrics.youthMentored}</strong>
                  <span>Youth Mentored</span>
                </div>
                <div className="metric">
                  <strong>{content.impactMetrics.staffTrained}</strong>
                  <span>Staff Trained</span>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'community':
        return (
          <div className="community">
            <h4>Your Youth Advocate Network</h4>
            <div className="connections-list">
              {content.connections.map((connection, index) => (
                <div key={index} className="connection-card">
                  <div className="connection-header">
                    <div className="connection-avatar">👤</div>
                    <div className="connection-info">
                      <h5>{connection.name}</h5>
                      <span className="connection-type">{connection.connection}</span>
                    </div>
                  </div>
                  <div className="shared-themes">
                    <strong>Shared themes:</strong> {connection.sharedThemes.join(', ')}
                  </div>
                  <div className="collaboration">
                    <strong>Working together:</strong> {connection.collaboration}
                  </div>
                </div>
              ))}
            </div>
            <div className="community-impact">
              <h5>Your Community Impact</h5>
              <div className="community-stats">
                <div className="community-stat">
                  <strong>{content.communityImpact.youthSupported}</strong>
                  <span>Youth Supported</span>
                </div>
                <div className="community-stat">
                  <strong>{content.communityImpact.collaborativeProjects}</strong>
                  <span>Collaborative Projects</span>
                </div>
                <div className="community-stat">
                  <strong>{content.communityImpact.peerNetworkSize}</strong>
                  <span>Peer Network Size</span>
                </div>
                <div className="community-stat">
                  <strong>{content.communityImpact.crossOrganizationConnections}</strong>
                  <span>Cross-Org Connections</span>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return <div>Content type not found</div>;
    }
  };

  return (
    <div className="qfcc-walkthrough">
      {/* Header */}
      <div className="walkthrough-header">
        <div className="header-content">
          <div className="qfcc-branding">
            <h1>🏛️ QFCC Youth Stories</h1>
            <p>Queensland Family and Child Commission</p>
          </div>
          <Link href="/" className="back-link">← Back to Platform</Link>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-track">
          <div 
            className="progress-fill" 
            style={{width: `${((currentStep + 1) / walkthroughSteps.length) * 100}%`}}
          ></div>
        </div>
        <div className="progress-text">
          Step {currentStep + 1} of {walkthroughSteps.length}
        </div>
      </div>

      {/* Step Navigation */}
      <div className="step-navigation">
        {walkthroughSteps.map((step, index) => (
          <button
            key={step.id}
            className={`step-nav-btn ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            onClick={() => goToStep(index)}
          >
            <span className="step-number">{index + 1}</span>
            <span className="step-title">{step.title}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="walkthrough-content">
        <div className="step-header">
          <h2>{currentStepData.title}</h2>
          <p>{currentStepData.description}</p>
        </div>
        
        <div className="step-content">
          {renderStepContent()}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="walkthrough-controls">
        <button 
          className="nav-btn prev" 
          onClick={prevStep} 
          disabled={currentStep === 0}
        >
          ← Previous
        </button>
        
        <div className="step-indicator">
          {currentStep + 1} / {walkthroughSteps.length}
        </div>
        
        <button 
          className="nav-btn next" 
          onClick={nextStep} 
          disabled={currentStep === walkthroughSteps.length - 1}
        >
          Next →
        </button>
      </div>

      {/* Styling */}
      <style jsx>{`
        .qfcc-walkthrough {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .walkthrough-header {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: white;
          padding: 20px 0;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .qfcc-branding h1 {
          margin: 0;
          font-size: 1.8rem;
          font-weight: 700;
        }

        .qfcc-branding p {
          margin: 4px 0 0 0;
          opacity: 0.9;
          font-size: 0.9rem;
        }

        .back-link {
          color: white;
          text-decoration: none;
          padding: 8px 16px;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .back-link:hover {
          background: rgba(255,255,255,0.1);
        }

        .progress-bar {
          background: white;
          padding: 16px 20px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 16px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .progress-track {
          flex: 1;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
          transition: width 0.3s ease;
          border-radius: 4px;
        }

        .progress-text {
          font-size: 0.9rem;
          font-weight: 500;
          color: #64748b;
        }

        .step-navigation {
          background: white;
          padding: 16px 20px;
          border-bottom: 1px solid #e2e8f0;
          overflow-x: auto;
          max-width: 1200px;
          margin: 0 auto;
        }

        .step-navigation {
          display: flex;
          gap: 12px;
        }

        .step-nav-btn {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 12px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          min-width: 120px;
        }

        .step-nav-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .step-nav-btn.active {
          background: #dbeafe;
          border-color: #3b82f6;
          color: #1e40af;
        }

        .step-nav-btn.completed {
          background: #dcfce7;
          border-color: #16a34a;
          color: #15803d;
        }

        .step-number {
          font-weight: 600;
          font-size: 0.8rem;
        }

        .step-title {
          font-size: 0.7rem;
          text-align: center;
          line-height: 1.2;
        }

        .walkthrough-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .step-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .step-header h2 {
          font-size: 2.2rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 12px 0;
        }

        .step-header p {
          font-size: 1.1rem;
          color: #64748b;
          margin: 0;
        }

        .step-content {
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 40px;
        }

        /* Welcome Screen Styles */
        .welcome-screen {
          text-align: center;
        }

        .user-greeting {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .avatar {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: white;
        }

        .user-greeting h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .welcome-message {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .welcome-message p {
          margin: 0;
          font-size: 1.1rem;
          line-height: 1.6;
          color: #475569;
        }

        .feature-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .feature-item {
          background: #f0f9ff;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid #0ea5e9;
          font-weight: 500;
          color: #0c4a6e;
        }

        /* Interview Screen Styles */
        .interview-screen {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .staff-intro {
          display: flex;
          align-items: center;
          gap: 16px;
          background: #fef3c7;
          padding: 20px;
          border-radius: 8px;
        }

        .staff-avatar {
          width: 50px;
          height: 50px;
          background: #f59e0b;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
        }

        .staff-info h4 {
          margin: 0 0 4px 0;
          color: #92400e;
        }

        .staff-info p {
          margin: 0;
          color: #b45309;
          font-size: 0.9rem;
        }

        .interview-message {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
        }

        .interview-controls {
          background: #f0fdf4;
          padding: 20px;
          border-radius: 8px;
        }

        .interview-controls h4 {
          margin: 0 0 16px 0;
          color: #166534;
        }

        .control-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .control-btn {
          background: #10b981;
          color: white;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
        }

        .current-settings {
          background: #fef2f2;
          padding: 20px;
          border-radius: 8px;
        }

        .current-settings h4 {
          margin: 0 0 16px 0;
          color: #991b1b;
        }

        .setting {
          margin-bottom: 8px;
          font-weight: 500;
          color: #7f1d1d;
        }

        /* Story Building Styles */
        .story-building h4 {
          margin: 0 0 24px 0;
          color: #1e293b;
        }

        .sessions-timeline {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .session-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          transition: all 0.2s ease;
        }

        .session-card.completed {
          background: #f0fdf4;
          border-color: #16a34a;
        }

        .session-card.in-progress {
          background: #fefce8;
          border-color: #eab308;
        }

        .session-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .session-number {
          font-weight: 600;
          color: #475569;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .status-badge.completed {
          background: #dcfce7;
          color: #166534;
        }

        .status-badge.in-progress {
          background: #fef3c7;
          color: #92400e;
        }

        .session-card h5 {
          margin: 0 0 12px 0;
          color: #1e293b;
        }

        .session-card p {
          margin: 0 0 16px 0;
          color: #64748b;
          line-height: 1.5;
        }

        .session-settings {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 0.9rem;
        }

        .privacy-setting {
          color: #7c3aed;
          font-weight: 500;
        }

        .themes {
          color: #0ea5e9;
          font-weight: 500;
        }

        /* Privacy Dashboard Styles */
        .privacy-dashboard h4 {
          margin: 0 0 8px 0;
          color: #1e293b;
        }

        .privacy-dashboard > p {
          margin: 0 0 24px 0;
          color: #64748b;
        }

        .content-sections {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .content-section {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          background: #fafafa;
        }

        .content-section h5 {
          margin: 0 0 12px 0;
          color: #1e293b;
        }

        .content-preview {
          background: white;
          padding: 16px;
          border-radius: 6px;
          margin-bottom: 16px;
          color: #475569;
          font-style: italic;
          border-left: 3px solid #e2e8f0;
        }

        .privacy-controls {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }

        .privacy-controls label {
          font-weight: 500;
          color: #374151;
        }

        .privacy-controls select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          font-size: 0.9rem;
        }

        .analysis-setting {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .analysis-setting label {
          font-weight: 500;
          color: #374151;
        }

        .analysis-level {
          padding: 4px 8px;
          background: #ddd6fe;
          color: #5b21b6;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .reasoning {
          background: #f8fafc;
          padding: 12px;
          border-radius: 6px;
          color: #64748b;
        }

        /* AI Insights Styles */
        .ai-insights {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .analysis-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .analysis-header h4 {
          margin: 0;
          color: #1e293b;
        }

        .confidence-score {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .confidence-score span {
          font-size: 0.9rem;
          font-weight: 500;
          color: #059669;
        }

        .confidence-bar {
          width: 120px;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .confidence-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
          border-radius: 4px;
        }

        .themes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .theme-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          background: white;
        }

        .theme-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .theme-header h5 {
          margin: 0;
          color: #1e293b;
          flex: 1;
        }

        .strength-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .strength-badge.high {
          background: #dcfce7;
          color: #166534;
        }

        .strength-badge.medium {
          background: #fef3c7;
          color: #92400e;
        }

        .theme-card p {
          margin: 0 0 16px 0;
          color: #64748b;
          line-height: 1.5;
        }

        .opportunities h6 {
          margin: 0 0 8px 0;
          color: #1e293b;
          font-size: 0.9rem;
        }

        .opportunities ul {
          margin: 0;
          padding-left: 20px;
        }

        .opportunities li {
          color: #475569;
          margin-bottom: 4px;
          font-size: 0.9rem;
        }

        .cultural-validation {
          background: #f0fdf4;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid #16a34a;
        }

        .cultural-validation h6 {
          margin: 0 0 8px 0;
          color: #166534;
        }

        .cultural-validation p {
          margin: 0;
          color: #15803d;
          font-size: 0.9rem;
        }

        /* Personal Dashboard Styles */
        .personal-dashboard {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .profile-header {
          border-radius: 12px;
          padding: 24px;
          color: white;
          position: relative;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .profile-image {
          width: 80px;
          height: 80px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }

        .profile-info h3 {
          margin: 0 0 8px 0;
          font-size: 1.8rem;
          font-weight: 700;
        }

        .profile-info p {
          margin: 0;
          opacity: 0.9;
          font-size: 1.1rem;
        }

        .customization-note {
          position: absolute;
          top: 16px;
          right: 16px;
          opacity: 0.8;
        }

        .dashboard-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .achievements-section h4,
        .current-projects h4 {
          margin: 0 0 16px 0;
          color: #1e293b;
        }

        .achievements-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .achievement-badge {
          background: #dbeafe;
          color: #1e40af;
          padding: 12px 16px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .current-projects ul {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .project-item {
          padding: 12px 0;
          border-bottom: 1px solid #e2e8f0;
          color: #475569;
        }

        .project-item:last-child {
          border-bottom: none;
        }

        /* Social Sharing Styles */
        .social-sharing {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .social-sharing h4 {
          margin: 0;
          color: #1e293b;
        }

        .sharing-options {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .share-option {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          background: white;
        }

        .platform-header h5 {
          margin: 0 0 16px 0;
          color: #1e293b;
        }

        .share-preview {
          background: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .preview-content {
          font-style: italic;
          color: #475569;
          margin-bottom: 8px;
        }

        .attribution {
          font-size: 0.9rem;
          color: #0ea5e9;
          font-weight: 500;
        }

        .share-settings {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .share-settings label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: #475569;
        }

        .share-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .share-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .tracking-stats {
          background: #f0f9ff;
          padding: 20px;
          border-radius: 8px;
        }

        .tracking-stats h5 {
          margin: 0 0 16px 0;
          color: #0c4a6e;
        }

        .stats-grid {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 12px;
        }

        .stat {
          text-align: center;
        }

        .stat strong {
          display: block;
          font-size: 1.5rem;
          color: #0ea5e9;
        }

        .stat span {
          font-size: 0.9rem;
          color: #0c4a6e;
        }

        .platforms-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .platform-stat {
          font-size: 0.9rem;
          color: #0369a1;
          font-weight: 500;
        }

        .engagement-note {
          margin: 0;
          color: #059669;
          font-weight: 500;
        }

        /* Usage Tracking Styles */
        .usage-tracking {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .usage-tracking h4 {
          margin: 0;
          color: #1e293b;
        }

        .usage-timeline {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .usage-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          background: white;
        }

        .usage-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .usage-date {
          font-weight: 500;
          color: #475569;
        }

        .usage-status {
          background: #dcfce7;
          color: #166534;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .usage-details h5 {
          margin: 0 0 12px 0;
          color: #1e293b;
        }

        .usage-details p {
          margin: 0 0 8px 0;
          color: #64748b;
        }

        .usage-quote {
          background: #f8fafc;
          padding: 12px;
          border-radius: 6px;
          margin: 12px 0;
          border-left: 3px solid #0ea5e9;
        }

        .usage-quote em {
          color: #475569;
        }

        .usage-impact p {
          margin: 8px 0;
          color: #475569;
        }

        .impact-summary {
          background: #f0f9ff;
          padding: 20px;
          border-radius: 8px;
        }

        .impact-summary h5 {
          margin: 0 0 16px 0;
          color: #0c4a6e;
        }

        .impact-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
        }

        .impact-stat {
          text-align: center;
        }

        .impact-stat strong {
          display: block;
          font-size: 1.5rem;
          color: #0ea5e9;
        }

        .impact-stat span {
          font-size: 0.9rem;
          color: #0c4a6e;
        }

        /* Opportunities Styles */
        .opportunities {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .opportunities h4 {
          margin: 0;
          color: #1e293b;
        }

        .current-earnings {
          text-align: center;
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          color: white;
          padding: 24px;
          border-radius: 12px;
        }

        .earnings-amount {
          display: block;
          font-size: 2.5rem;
          font-weight: 700;
        }

        .earnings-label {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .opportunities-list h5 {
          margin: 0 0 16px 0;
          color: #1e293b;
        }

        .opportunity-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          background: white;
          margin-bottom: 16px;
        }

        .opp-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .opp-header h6 {
          margin: 0;
          color: #1e293b;
          flex: 1;
        }

        .opp-type {
          background: #dbeafe;
          color: #1e40af;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .opportunity-card p {
          margin: 0 0 16px 0;
          color: #64748b;
          line-height: 1.5;
        }

        .opp-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .opp-payment {
          font-weight: 600;
          color: #059669;
        }

        .opp-status {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .opp-status.invited---your-choice {
          background: #fef3c7;
          color: #92400e;
        }

        .opp-status.in-discussion {
          background: #dbeafe;
          color: #1e40af;
        }

        .impact-metrics h5 {
          margin: 0 0 16px 0;
          color: #1e293b;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
        }

        .metric {
          text-align: center;
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
        }

        .metric strong {
          display: block;
          font-size: 1.5rem;
          color: #1e40af;
        }

        .metric span {
          font-size: 0.9rem;
          color: #64748b;
        }

        /* Community Styles */
        .community {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .community h4 {
          margin: 0;
          color: #1e293b;
        }

        .connections-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .connection-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          background: white;
        }

        .connection-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .connection-avatar {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
        }

        .connection-info h5 {
          margin: 0 0 4px 0;
          color: #1e293b;
        }

        .connection-type {
          background: #e0e7ff;
          color: #5b21b6;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .shared-themes,
        .collaboration {
          margin-bottom: 12px;
          color: #64748b;
          font-size: 0.9rem;
        }

        .shared-themes strong,
        .collaboration strong {
          color: #374151;
        }

        .community-impact h5 {
          margin: 0 0 16px 0;
          color: #1e293b;
        }

        .community-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
        }

        .community-stat {
          text-align: center;
          padding: 16px;
          background: #f5f3ff;
          border-radius: 8px;
        }

        .community-stat strong {
          display: block;
          font-size: 1.5rem;
          color: #7c3aed;
        }

        .community-stat span {
          font-size: 0.9rem;
          color: #5b21b6;
        }

        /* Walkthrough Controls */
        .walkthrough-controls {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          border-top: 1px solid #e2e8f0;
        }

        .nav-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .nav-btn:disabled {
          background: #e2e8f0;
          color: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .step-indicator {
          font-weight: 500;
          color: #64748b;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .progress-bar {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }

          .step-navigation {
            flex-wrap: wrap;
          }

          .step-nav-btn {
            min-width: 100px;
          }

          .walkthrough-content {
            padding: 20px 16px;
          }

          .step-content {
            padding: 20px;
          }

          .dashboard-content {
            grid-template-columns: 1fr;
          }

          .themes-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid,
          .impact-stats,
          .metrics-grid,
          .community-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .share-settings {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}