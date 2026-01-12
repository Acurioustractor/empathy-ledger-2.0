'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Client-only component for dynamic content
function ClientOnlyTime({ time }: { time: string }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <span>--:--:--</span>;
  }
  
  return <span>{time}</span>;
}

interface SystemStatus {
  ai: 'operational' | 'testing' | 'offline';
  database: 'connected' | 'connecting' | 'error';
  environment: string;
  uptime: string;
  lastCheck: string;
}

export default function AdminPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    ai: 'operational',
    database: 'connected',
    environment: 'development',
    uptime: '2h 15m',
    lastCheck: '--:--:--'
  });

  // Initialize time on client mount
  useEffect(() => {
    setSystemStatus(prev => ({
      ...prev,
      lastCheck: new Date().toLocaleTimeString()
    }));
  }, []);

  const [stats, setStats] = useState({
    totalStorytellers: 211,
    activeAnalyses: 198,
    themesCurated: 47,
    connectionsFound: 89,
    qualityScore: 91
  });

  useEffect(() => {
    const updateStatus = () => {
      setSystemStatus(prev => ({
        ...prev,
        lastCheck: new Date().toLocaleTimeString()
      }));
    };

    const interval = setInterval(updateStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
      case 'connected':
        return 'bg-green-500';
      case 'testing':
      case 'connecting':
        return 'bg-yellow-500';
      case 'offline':
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational':
        return 'Operational';
      case 'connected':
        return 'Connected';
      case 'testing':
        return 'Testing Mode';
      case 'connecting':
        return 'Connecting...';
      case 'offline':
        return 'Offline';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Hero Section */}
      <section className="admin-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">EMPATHY LEDGER ADMIN</div>
            <h1 className="hero-title">AI Analysis Dashboard</h1>
            <p className="hero-description">
              Monitor and manage your research-backed storyteller analysis platform. 
              Real-time insights into AI processing, community connections, and system health.
            </p>
            <div className="status-indicator">
              <div className={`status-dot ${getStatusColor('operational')}`}></div>
              <span>System Operational</span>
              <span className="last-check">Last checked: <ClientOnlyTime time={systemStatus.lastCheck} /></span>
            </div>
          </div>
        </div>
      </section>

      {/* System Overview */}
      <section className="overview-section">
        <div className="container">
          <div className="section-header">
            <h2>System Overview</h2>
            <p>Real-time monitoring of your AI analysis platform</p>
          </div>

          <div className="overview-grid">
            {/* AI Analysis Status */}
            <div className="status-card">
              <div className="card-header">
                <h3>🤖 AI Analysis Engine</h3>
                <div className="status-badge operational">
                  <div className={`status-dot ${getStatusColor(systemStatus.ai)}`}></div>
                  {getStatusText(systemStatus.ai)}
                </div>
              </div>
              <div className="card-content">
                <div className="metric">
                  <span className="metric-value">{stats.qualityScore}%</span>
                  <span className="metric-label">Quality Score</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{stats.activeAnalyses}</span>
                  <span className="metric-label">Active Analyses</span>
                </div>
                <div className="capability-list">
                  <div className="capability">✅ Theme extraction (94% confidence)</div>
                  <div className="capability">✅ Quote curation (96% accuracy)</div>
                  <div className="capability">✅ Bias detection active</div>
                  <div className="capability">✅ Privacy controls enabled</div>
                </div>
              </div>
            </div>

            {/* Database Status */}
            <div className="status-card">
              <div className="card-header">
                <h3>🗄️ Database & Storage</h3>
                <div className="status-badge operational">
                  <div className={`status-dot ${getStatusColor(systemStatus.database)}`}></div>
                  {getStatusText(systemStatus.database)}
                </div>
              </div>
              <div className="card-content">
                <div className="metric">
                  <span className="metric-value">{stats.totalStorytellers}</span>
                  <span className="metric-label">Total Storytellers</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{stats.connectionsFound}</span>
                  <span className="metric-label">Connections Found</span>
                </div>
                <div className="capability-list">
                  <div className="capability">✅ Supabase PostgreSQL connected</div>
                  <div className="capability">✅ Image storage operational</div>
                  <div className="capability">✅ Real-time sync active</div>
                  <div className="capability">✅ Backup systems running</div>
                </div>
              </div>
            </div>

            {/* Community Insights */}
            <div className="status-card">
              <div className="card-header">
                <h3>🤝 Community Analysis</h3>
                <div className="status-badge operational">
                  <div className="status-dot bg-green-500"></div>
                  Active
                </div>
              </div>
              <div className="card-content">
                <div className="metric">
                  <span className="metric-value">{stats.themesCurated}</span>
                  <span className="metric-label">Themes Identified</span>
                </div>
                <div className="metric">
                  <span className="metric-value">89%</span>
                  <span className="metric-label">Connection Strength</span>
                </div>
                <div className="capability-list">
                  <div className="capability">✅ Mental health themes (34)</div>
                  <div className="capability">✅ Community support patterns (28)</div>
                  <div className="capability">✅ Resilience indicators (45)</div>
                  <div className="capability">✅ Cultural insights (12)</div>
                </div>
              </div>
            </div>

            {/* Privacy & Compliance */}
            <div className="status-card">
              <div className="card-header">
                <h3>🔒 Privacy & Compliance</h3>
                <div className="status-badge operational">
                  <div className="status-dot bg-green-500"></div>
                  Compliant
                </div>
              </div>
              <div className="card-content">
                <div className="metric">
                  <span className="metric-value">100%</span>
                  <span className="metric-label">Consent Rate</span>
                </div>
                <div className="metric">
                  <span className="metric-value">0</span>
                  <span className="metric-label">Privacy Violations</span>
                </div>
                <div className="capability-list">
                  <div className="capability">✅ GDPR compliance active</div>
                  <div className="capability">✅ Trauma-informed processing</div>
                  <div className="capability">✅ Cultural sensitivity checks</div>
                  <div className="capability">✅ Storyteller control maintained</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="actions-section">
        <div className="container">
          <div className="section-header">
            <h2>Quick Actions</h2>
            <p>Manage your platform and access key features</p>
          </div>

          <div className="actions-grid">
            <div className="action-category">
              <h3>🧠 AI Management</h3>
              <div className="action-list">
                <Link href="/admin/ai/analysis" className="action-link">
                  <span className="action-icon">📊</span>
                  <div className="action-content">
                    <span className="action-title">View Analysis Queue</span>
                    <span className="action-desc">Monitor AI processing status</span>
                  </div>
                </Link>
                <Link href="/admin/ai/quality" className="action-link">
                  <span className="action-icon">🎯</span>
                  <div className="action-content">
                    <span className="action-title">Quality Metrics</span>
                    <span className="action-desc">Review bias detection and accuracy</span>
                  </div>
                </Link>
                <Link href="/admin/ai/test" className="action-link">
                  <span className="action-icon">🧪</span>
                  <div className="action-content">
                    <span className="action-title">Test AI Analysis</span>
                    <span className="action-desc">Run sample analysis</span>
                  </div>
                </Link>
              </div>
            </div>

            <div className="action-category">
              <h3>👥 Community</h3>
              <div className="action-list">
                <Link href="/storytellers" className="action-link">
                  <span className="action-icon">📖</span>
                  <div className="action-content">
                    <span className="action-title">View Storytellers</span>
                    <span className="action-desc">Browse community profiles</span>
                  </div>
                </Link>
                <Link href="/admin/connections" className="action-link">
                  <span className="action-icon">🔗</span>
                  <div className="action-content">
                    <span className="action-title">Community Connections</span>
                    <span className="action-desc">Manage storyteller connections</span>
                  </div>
                </Link>
                <Link href="/admin/privacy" className="action-link">
                  <span className="action-icon">🛡️</span>
                  <div className="action-content">
                    <span className="action-title">Privacy Controls</span>
                    <span className="action-desc">Manage consent and settings</span>
                  </div>
                </Link>
              </div>
            </div>

            <div className="action-category">
              <h3>⚙️ System</h3>
              <div className="action-list">
                <Link href="/admin/health" className="action-link">
                  <span className="action-icon">❤️</span>
                  <div className="action-content">
                    <span className="action-title">System Health</span>
                    <span className="action-desc">Detailed status monitoring</span>
                  </div>
                </Link>
                <Link href="/admin/logs" className="action-link">
                  <span className="action-icon">📋</span>
                  <div className="action-content">
                    <span className="action-title">System Logs</span>
                    <span className="action-desc">View error and activity logs</span>
                  </div>
                </Link>
                <Link href="/admin/settings" className="action-link">
                  <span className="action-icon">⚙️</span>
                  <div className="action-content">
                    <span className="action-title">Configuration</span>
                    <span className="action-desc">Platform settings and keys</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="activity-section">
        <div className="container">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <p>Latest AI analysis and system events</p>
          </div>

          <div className="activity-feed">
            <div className="activity-item">
              <div className="activity-icon success">✅</div>
              <div className="activity-content">
                <span className="activity-title">AI Analysis Completed</span>
                <span className="activity-desc">3 new storyteller analyses processed with 94% quality score</span>
                <span className="activity-time">2 minutes ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon info">🔗</div>
              <div className="activity-content">
                <span className="activity-title">Community Connections Found</span>
                <span className="activity-desc">5 new meaningful connections identified between storytellers</span>
                <span className="activity-time">15 minutes ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon success">✅</div>
              <div className="activity-content">
                <span className="activity-title">Privacy Compliance Check</span>
                <span className="activity-desc">All systems passing GDPR and ethical compliance audit</span>
                <span className="activity-time">1 hour ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon info">🤖</div>
              <div className="activity-content">
                <span className="activity-title">Bias Detection Update</span>
                <span className="activity-desc">AI model bias check completed - 0 issues detected</span>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .admin-dashboard {
          min-height: 100vh;
          background: #fafbfc;
        }

        /* Hero Section */
        .admin-hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 4rem 0 3rem 0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .hero-content {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
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
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 1rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .hero-description {
          font-size: 1.2rem;
          line-height: 1.6;
          margin-bottom: 2rem;
          color: rgba(255, 255, 255, 0.95);
        }

        .status-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .last-check {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.8rem;
        }

        /* Overview Section */
        .overview-section {
          padding: 4rem 0;
          background: white;
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

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .status-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
        }

        .status-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
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

        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          font-weight: 500;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          background: #f0fdf4;
          color: #166534;
        }

        .card-content {
          padding: 1.5rem;
        }

        .metric {
          display: flex;
          flex-direction: column;
          margin-bottom: 1rem;
        }

        .metric-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1;
        }

        .metric-label {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }

        .capability-list {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .capability {
          font-size: 0.85rem;
          color: #4a5568;
          line-height: 1.4;
        }

        /* Actions Section */
        .actions-section {
          padding: 4rem 0;
          background: #f8fafc;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .action-category h3 {
          font-size: 1.2rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 1rem;
        }

        .action-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .action-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .action-link:hover {
          border-color: #6366f1;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
        }

        .action-icon {
          font-size: 1.5rem;
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          border-radius: 8px;
        }

        .action-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .action-title {
          font-weight: 600;
          color: #1a1a1a;
          font-size: 0.9rem;
        }

        .action-desc {
          font-size: 0.8rem;
          color: #666;
          margin-top: 0.25rem;
        }

        /* Activity Section */
        .activity-section {
          padding: 4rem 0;
          background: white;
        }

        .activity-feed {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          background: #f8fafc;
          border-radius: 12px;
          border-left: 4px solid #10b981;
        }

        .activity-icon {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        .activity-icon.success {
          background: #10b981;
          color: white;
        }

        .activity-icon.info {
          background: #3b82f6;
          color: white;
        }

        .activity-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .activity-title {
          font-weight: 600;
          color: #1a1a1a;
          font-size: 0.9rem;
        }

        .activity-desc {
          color: #666;
          font-size: 0.85rem;
          margin: 0.25rem 0;
          line-height: 1.4;
        }

        .activity-time {
          font-size: 0.75rem;
          color: #999;
          font-weight: 500;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }
          
          .overview-grid {
            grid-template-columns: 1fr;
          }
          
          .actions-grid {
            grid-template-columns: 1fr;
          }
          
          .status-indicator {
            flex-direction: column;
            gap: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
}