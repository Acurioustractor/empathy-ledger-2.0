'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { cmsService } from '@/lib/cms'
import { CMSPage, CMSPagesListResponse } from '@/lib/cms/types'

export default function CMSDashboard() {
  const [pages, setPages] = useState<CMSPage[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_pages: 0,
    published_pages: 0,
    draft_pages: 0,
    pending_review: 0
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      setLoading(true)

      // Load recent pages
      const pagesResponse = await cmsService.getPages({
        limit: 10,
        include_author: true,
        order_by: 'updated_at',
        order_direction: 'desc'
      })

      setPages(pagesResponse.pages)

      // Load stats
      const [published, drafts, reviews] = await Promise.all([
        cmsService.getPages({ status: 'published', limit: 1 }),
        cmsService.getPages({ status: 'draft', limit: 1 }),
        cmsService.getPages({ status: 'review', limit: 1 })
      ])

      setStats({
        total_pages: pagesResponse.total,
        published_pages: published.total,
        draft_pages: drafts.total,
        pending_review: reviews.total
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <CMSDashboardSkeleton />
  }

  return (
    <div className="cms-dashboard">
      {/* Header */}
      <div className="cms-header">
        <div className="cms-header-content">
          <div>
            <h1>Content Management</h1>
            <p>Manage your website content with sovereignty and cultural protocols</p>
          </div>
          
          <div className="cms-header-actions">
            <Link href="/admin/cms/pages/new" className="btn btn-primary">
              <span className="icon">✏️</span>
              Create New Page
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="cms-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_pages}</div>
            <div className="stat-label">Total Pages</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌐</div>
          <div className="stat-content">
            <div className="stat-value">{stats.published_pages}</div>
            <div className="stat-label">Published</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✏️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.draft_pages}</div>
            <div className="stat-label">Drafts</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👀</div>
          <div className="stat-content">
            <div className="stat-value">{stats.pending_review}</div>
            <div className="stat-label">Pending Review</div>
          </div>
        </div>
      </div>

      {/* Recent Pages */}
      <div className="cms-section">
        <div className="section-header">
          <h2>Recent Pages</h2>
          <Link href="/admin/cms/pages" className="btn btn-outline">
            View All Pages
          </Link>
        </div>

        <div className="pages-table">
          <div className="table-header">
            <div className="table-cell">Title</div>
            <div className="table-cell">Status</div>
            <div className="table-cell">Author</div>
            <div className="table-cell">Updated</div>
            <div className="table-cell">Actions</div>
          </div>

          {pages.map(page => (
            <div key={page.id} className="table-row">
              <div className="table-cell">
                <div className="page-title">
                  <Link href={`/admin/cms/pages/${page.id}/edit`}>
                    {page.title}
                  </Link>
                  <div className="page-slug">/{page.slug}</div>
                </div>
              </div>

              <div className="table-cell">
                <StatusBadge status={page.status} />
              </div>

              <div className="table-cell">
                <div className="author-info">
                  {page.author?.display_name || 'Unknown'}
                </div>
              </div>

              <div className="table-cell">
                <div className="date-info">
                  {new Date(page.updated_at).toLocaleDateString()}
                </div>
              </div>

              <div className="table-cell">
                <div className="action-buttons">
                  <Link 
                    href={`/admin/cms/pages/${page.id}/edit`}
                    className="btn-icon"
                    title="Edit"
                  >
                    ✏️
                  </Link>
                  <Link 
                    href={`/${page.slug}`}
                    className="btn-icon"
                    title="View"
                    target="_blank"
                  >
                    👁️
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="cms-section">
        <div className="section-header">
          <h2>Quick Actions</h2>
        </div>

        <div className="quick-actions-grid">
          <Link href="/admin/cms/pages/new" className="quick-action-card">
            <div className="action-icon">📄</div>
            <div className="action-content">
              <h3>Create Page</h3>
              <p>Start building a new page with content blocks</p>
            </div>
          </Link>

          <Link href="/admin/cms/media" className="quick-action-card">
            <div className="action-icon">🖼️</div>
            <div className="action-content">
              <h3>Media Library</h3>
              <p>Upload and manage images, videos, and documents</p>
            </div>
          </Link>

          <Link href="/admin/cms/storytellers" className="quick-action-card">
            <div className="action-icon">👥</div>
            <div className="action-content">
              <h3>Storytellers</h3>
              <p>Manage storyteller profiles and contributions</p>
            </div>
          </Link>

          <Link href="/admin/cms/navigation" className="quick-action-card">
            <div className="action-icon">🧭</div>
            <div className="action-content">
              <h3>Navigation</h3>
              <p>Manage site navigation and menu structure</p>
            </div>
          </Link>

          <Link href="/admin/cms/settings" className="quick-action-card">
            <div className="action-icon">⚙️</div>
            <div className="action-content">
              <h3>CMS Settings</h3>
              <p>Configure content workflows and permissions</p>
            </div>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .cms-dashboard {
          min-height: 100vh;
          background: var(--color-gray-lighter);
          padding: var(--space-xl);
        }

        .cms-header {
          background: var(--color-white);
          border-radius: 16px;
          padding: var(--space-xl);
          margin-bottom: var(--space-xl);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .cms-header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cms-header h1 {
          font-size: 32px;
          font-weight: 700;
          color: var(--color-ink);
          margin-bottom: var(--space-xs);
        }

        .cms-header p {
          color: var(--color-ink-light);
          margin: 0;
        }

        .cms-header-actions {
          display: flex;
          gap: var(--space-md);
        }

        .cms-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-xl);
          margin-bottom: var(--space-xl);
        }

        .stat-card {
          background: var(--color-white);
          border-radius: 12px;
          padding: var(--space-xl);
          display: flex;
          align-items: center;
          gap: var(--space-lg);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
        }

        .stat-icon {
          font-size: 32px;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-gray-lighter);
          border-radius: 12px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--color-ink);
        }

        .stat-label {
          font-size: 14px;
          color: var(--color-ink-light);
          font-weight: 500;
        }

        .cms-section {
          background: var(--color-white);
          border-radius: 16px;
          padding: var(--space-xl);
          margin-bottom: var(--space-xl);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-xl);
        }

        .section-header h2 {
          font-size: 24px;
          font-weight: 600;
          color: var(--color-ink);
          margin: 0;
        }

        .pages-table {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: var(--color-gray-light);
          border-radius: 8px;
          overflow: hidden;
        }

        .table-header,
        .table-row {
          display: grid;
          grid-template-columns: 2fr 120px 150px 120px 100px;
          gap: var(--space-md);
          padding: var(--space-md) var(--space-lg);
          background: var(--color-white);
          align-items: center;
        }

        .table-header {
          font-weight: 600;
          color: var(--color-ink);
          background: var(--color-gray-lighter);
        }

        .table-row:hover {
          background: var(--color-gray-lighter);
        }

        .page-title a {
          color: var(--color-brand-blue);
          text-decoration: none;
          font-weight: 500;
        }

        .page-title a:hover {
          text-decoration: underline;
        }

        .page-slug {
          font-size: 12px;
          color: var(--color-ink-light);
          margin-top: 2px;
        }

        .action-buttons {
          display: flex;
          gap: var(--space-xs);
        }

        .btn-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-gray-lighter);
          border-radius: 6px;
          text-decoration: none;
          transition: background-color 0.2s ease;
        }

        .btn-icon:hover {
          background: var(--color-gray-light);
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-xl);
        }

        .quick-action-card {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
          padding: var(--space-xl);
          background: var(--color-gray-lighter);
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .quick-action-card:hover {
          background: var(--color-gray-light);
          transform: translateY(-2px);
        }

        .action-icon {
          font-size: 24px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-white);
          border-radius: 8px;
        }

        .action-content h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-ink);
          margin: 0 0 var(--space-xs) 0;
        }

        .action-content p {
          font-size: 14px;
          color: var(--color-ink-light);
          margin: 0;
        }

        @media (max-width: 768px) {
          .cms-header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-lg);
          }

          .cms-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .table-header,
          .table-row {
            grid-template-columns: 1fr;
            gap: var(--space-xs);
            padding: var(--space-md);
          }

          .quick-actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    draft: { color: 'gray', label: 'Draft' },
    review: { color: 'yellow', label: 'Review' },
    published: { color: 'green', label: 'Published' },
    archived: { color: 'red', label: 'Archived' }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft

  return (
    <span className={`status-badge status-${config.color}`}>
      {config.label}
      
      <style jsx>{`
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-gray {
          background: var(--color-gray-light);
          color: var(--color-ink-light);
        }

        .status-yellow {
          background: #fef3c7;
          color: #92400e;
        }

        .status-green {
          background: #d1fae5;
          color: #065f46;
        }

        .status-red {
          background: #fee2e2;
          color: #991b1b;
        }
      `}</style>
    </span>
  )
}

function CMSDashboardSkeleton() {
  return (
    <div className="cms-dashboard">
      <div className="cms-header">
        <div className="skeleton-header"></div>
      </div>
      
      <div className="cms-stats-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton-stat-card"></div>
        ))}
      </div>

      <style jsx>{`
        .skeleton-header {
          height: 80px;
          background: var(--color-gray-light);
          border-radius: 8px;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .skeleton-stat-card {
          height: 100px;
          background: var(--color-gray-light);
          border-radius: 12px;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}