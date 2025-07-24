'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { getStorytellers, searchStorytellers, getStorytellerStats } from '@/lib/supabase-storytellers'
import StorytellerProfile from '@/components/storytellers/StorytellerProfile'
import type { StorytellerWithStories } from '@/lib/supabase-storytellers'

export default function CMSStorytellers() {
  const [storytellers, setStorytellers] = useState<StorytellerWithStories[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    total_storytellers: 0,
    active_storytellers: 0,
    engagement_rate: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      
      // Load storytellers and stats in parallel
      const [storytellersData, statsData] = await Promise.all([
        getStorytellers({ limit: 50 }),
        getStorytellerStats()
      ])

      setStorytellers(storytellersData.storytellers)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load storytellers:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchTerm.trim()) {
      loadData()
      return
    }

    setLoading(true)
    try {
      const results = await searchStorytellers(searchTerm)
      setStorytellers(results as StorytellerWithStories[])
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <StorytellersDashboardSkeleton />
  }

  return (
    <div className="cms-storytellers">
      {/* Header */}
      <div className="cms-header">
        <div className="cms-header-content">
          <div>
            <h1>Storyteller Management</h1>
            <p>Manage storyteller profiles and their contributions</p>
          </div>
          
          <div className="cms-header-actions">
            <Link href="/admin/cms/storytellers/invite" className="btn btn-primary">
              <span className="icon">✉️</span>
              Invite Storyteller
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="cms-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_storytellers}</div>
            <div className="stat-label">Total Storytellers</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✨</div>
          <div className="stat-content">
            <div className="stat-value">{stats.active_storytellers}</div>
            <div className="stat-label">Active This Month</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-value">{stats.engagement_rate.toFixed(1)}%</div>
            <div className="stat-label">Engagement Rate</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="cms-section">
        <div className="section-header">
          <h2>All Storytellers</h2>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="search"
            placeholder="Search by name, location, or expertise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                loadData()
              }}
              className="btn btn-outline"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Storytellers List */}
      <div className="cms-section">
        {storytellers.length === 0 ? (
          <div className="empty-state">
            <p>No storytellers found</p>
          </div>
        ) : (
          <div className="storytellers-list">
            {storytellers.map(storyteller => (
              <div key={storyteller.id} className="storyteller-card">
                <div className="storyteller-header">
                  <StorytellerProfile
                    storyteller={{
                      id: storyteller.id,
                      full_name: storyteller.preferred_name || storyteller.full_name || 'Community Member',
                      profile_image_url: storyteller.profile_image_url || undefined,
                      community_affiliation: storyteller.community_affiliation || undefined,
                      bio: storyteller.bio || undefined,
                      public_story_count: storyteller.story_count
                    }}
                    size="medium"
                    showBio={false}
                    showStoryCount={true}
                  />
                </div>

                <div className="storyteller-details">
                  {storyteller.location && (
                    <div className="detail-item">
                      <span className="detail-label">Location:</span>
                      <span>{storyteller.location}</span>
                    </div>
                  )}
                  
                  {storyteller.expertise_areas && storyteller.expertise_areas.length > 0 && (
                    <div className="detail-item">
                      <span className="detail-label">Expertise:</span>
                      <span>{storyteller.expertise_areas.join(', ')}</span>
                    </div>
                  )}

                  {storyteller.primary_themes && storyteller.primary_themes.length > 0 && (
                    <div className="detail-item">
                      <span className="detail-label">Themes:</span>
                      <div className="themes-list">
                        {storyteller.primary_themes.map(theme => (
                          <span key={theme} className="theme-badge">{theme}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="storyteller-actions">
                  <Link 
                    href={`/admin/cms/storytellers/${storyteller.id}`}
                    className="btn btn-outline btn-sm"
                  >
                    View Profile
                  </Link>
                  <Link 
                    href={`/admin/cms/storytellers/${storyteller.id}/stories`}
                    className="btn btn-outline btn-sm"
                  >
                    View Stories
                  </Link>
                  <Link 
                    href={`/admin/cms/storytellers/${storyteller.id}/edit`}
                    className="btn btn-outline btn-sm"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .cms-storytellers {
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
          margin-bottom: var(--space-xl);
        }

        .section-header h2 {
          font-size: 24px;
          font-weight: 600;
          color: var(--color-ink);
          margin: 0;
        }

        .search-form {
          display: flex;
          gap: var(--space-md);
          margin-bottom: var(--space-xl);
        }

        .search-input {
          flex: 1;
          padding: var(--space-md);
          border: 1px solid var(--color-gray-light);
          border-radius: 8px;
          font-size: 16px;
        }

        .storytellers-list {
          display: grid;
          gap: var(--space-lg);
        }

        .storyteller-card {
          border: 1px solid var(--color-gray-light);
          border-radius: 12px;
          padding: var(--space-lg);
          background: var(--color-gray-lighter);
        }

        .storyteller-header {
          margin-bottom: var(--space-md);
        }

        .storyteller-details {
          margin-bottom: var(--space-lg);
          padding-left: 60px;
        }

        .detail-item {
          display: flex;
          align-items: flex-start;
          gap: var(--space-sm);
          margin-bottom: var(--space-sm);
          font-size: 14px;
        }

        .detail-label {
          font-weight: 500;
          color: var(--color-ink-light);
          min-width: 80px;
        }

        .themes-list {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-xs);
        }

        .theme-badge {
          padding: 2px 8px;
          background: var(--color-primary-100);
          color: var(--color-primary-700);
          border-radius: 4px;
          font-size: 12px;
        }

        .storyteller-actions {
          display: flex;
          gap: var(--space-sm);
          padding-left: 60px;
        }

        .btn {
          padding: var(--space-sm) var(--space-md);
          border-radius: 6px;
          font-weight: 500;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: var(--space-xs);
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
        }

        .btn-primary {
          background: var(--color-primary-500);
          color: white;
        }

        .btn-primary:hover {
          background: var(--color-primary-600);
        }

        .btn-outline {
          background: transparent;
          color: var(--color-primary-600);
          border: 1px solid var(--color-primary-200);
        }

        .btn-outline:hover {
          background: var(--color-primary-50);
        }

        .btn-sm {
          padding: var(--space-xs) var(--space-sm);
          font-size: 14px;
        }

        .empty-state {
          text-align: center;
          padding: var(--space-xl) 0;
          color: var(--color-ink-light);
        }

        @media (max-width: 768px) {
          .cms-header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-lg);
          }

          .search-form {
            flex-direction: column;
          }

          .storyteller-details,
          .storyteller-actions {
            padding-left: 0;
          }
        }
      `}</style>
    </div>
  )
}

function StorytellersDashboardSkeleton() {
  return (
    <div className="cms-storytellers">
      <div className="cms-header">
        <div className="skeleton-header"></div>
      </div>
      
      <div className="cms-stats-grid">
        {[1, 2, 3].map(i => (
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