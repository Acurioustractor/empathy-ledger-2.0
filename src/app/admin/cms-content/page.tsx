'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface CMSPage {
  id: string;
  slug: string;
  title: string;
  page_type: string;
  status: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export default function CMSContentPage() {
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPage, setNewPage] = useState({
    title: '',
    slug: '',
    description: '',
    page_type: 'case-study',
    content: {}
  });

  useEffect(() => {
    fetchPages();
  }, [filter]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' 
        ? '/api/cms?type=pages' 
        : `/api/cms?type=pages&page_type=${filter}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.useFallback) {
        setError('CMS tables not yet created. Please set up CMS schema first.');
        setPages([]);
      } else {
        setPages(data.pages || []);
        setError(null);
      }
    } catch (err) {
      setError('Failed to fetch pages');
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/cms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'page',
          data: {
            ...newPage,
            status: 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setNewPage({
          title: '',
          slug: '',
          description: '',
          page_type: 'case-study',
          content: {}
        });
        fetchPages();
      } else {
        setError('Failed to create page');
      }
    } catch (err) {
      setError('Failed to create page');
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setNewPage(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  return (
    <div className="cms-content-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>CMS Content Management</h1>
            <p>Manage pages, case studies, and blog posts through Supabase</p>
          </div>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
            disabled={!!error}
          >
            + Create New Page
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="error-banner">
            <h3>⚠️ CMS Setup Required</h3>
            <p>{error}</p>
            <div className="setup-instructions">
              <h4>Quick Setup:</h4>
              <ol>
                <li>Go to your Supabase Dashboard → SQL Editor</li>
                <li>Run the SQL commands from <code>docs/supabase-cms-setup.md</code></li>
                <li>Refresh this page</li>
              </ol>
              <Link href="/docs/supabase-cms-setup.md" className="btn btn-outline">
                View Setup Instructions
              </Link>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {['all', 'case-study', 'blog-post', 'module', 'content'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`filter-tab ${filter === type ? 'active' : ''}`}
            >
              {type === 'all' ? 'All Pages' : type.replace('-', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        {/* Content List */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading content...</p>
          </div>
        ) : pages.length > 0 ? (
          <div className="content-grid">
            {pages.map((page) => (
              <div key={page.id} className="content-card">
                <div className="content-card-header">
                  <h3>{page.title}</h3>
                  <span className={`status-badge status-${page.status}`}>
                    {page.status}
                  </span>
                </div>
                <p className="content-description">
                  {page.description || 'No description available'}
                </p>
                <div className="content-meta">
                  <span className="page-type">{page.page_type}</span>
                  <span className="slug">/{page.slug}</span>
                </div>
                <div className="content-actions">
                  <Link 
                    href={`/case-studies/dynamic/${page.slug}`}
                    className="btn btn-outline btn-sm"
                  >
                    Preview
                  </Link>
                  <button className="btn btn-primary btn-sm">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No content found</h3>
            <p>Create your first page to get started with the CMS</p>
          </div>
        )}

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Create New Page</h2>
                <button 
                  onClick={() => setShowCreateForm(false)}
                  className="close-btn"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleCreatePage} className="create-form">
                <div className="form-group">
                  <label>Page Title</label>
                  <input
                    type="text"
                    value={newPage.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter page title..."
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>URL Slug</label>
                  <input
                    type="text"
                    value={newPage.slug}
                    onChange={(e) => setNewPage(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-slug"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Page Type</label>
                  <select
                    value={newPage.page_type}
                    onChange={(e) => setNewPage(prev => ({ ...prev, page_type: e.target.value }))}
                  >
                    <option value="case-study">Case Study</option>
                    <option value="blog-post">Blog Post</option>
                    <option value="module">Module Page</option>
                    <option value="content">Content Page</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newPage.description}
                    onChange={(e) => setNewPage(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the page..."
                    rows={3}
                  />
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    onClick={() => setShowCreateForm(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Page
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .cms-content-page {
          min-height: 100vh;
          background: var(--color-gray-lighter);
          padding: 2rem 0;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .page-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: var(--color-ink);
        }

        .page-header p {
          color: var(--color-ink-light);
          margin: 0;
        }

        .error-banner {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .error-banner h3 {
          color: #92400e;
          margin-bottom: 0.5rem;
        }

        .error-banner p {
          color: #78350f;
          margin-bottom: 1rem;
        }

        .setup-instructions {
          background: white;
          padding: 1rem;
          border-radius: 6px;
          margin-top: 1rem;
        }

        .setup-instructions h4 {
          margin-bottom: 0.5rem;
          color: #92400e;
        }

        .setup-instructions ol {
          margin-bottom: 1rem;
          color: #78350f;
        }

        .filter-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          background: white;
          padding: 1rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .filter-tab {
          padding: 0.5rem 1rem;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          color: var(--color-ink-light);
          transition: all 0.2s;
        }

        .filter-tab:hover {
          background: var(--color-gray-lighter);
        }

        .filter-tab.active {
          background: var(--color-brand-blue);
          color: white;
        }

        .loading-state, .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .content-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .content-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s;
        }

        .content-card:hover {
          transform: translateY(-2px);
        }

        .content-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .content-card h3 {
          font-size: 1.2rem;
          color: var(--color-ink);
          margin: 0;
          flex: 1;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-published {
          background: #dcfce7;
          color: #166534;
        }

        .status-draft {
          background: #fef3c7;
          color: #92400e;
        }

        .content-description {
          color: var(--color-ink-light);
          margin-bottom: 1rem;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .content-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          font-size: 0.8rem;
        }

        .page-type {
          background: var(--color-gray-lighter);
          padding: 2px 6px;
          border-radius: 4px;
          color: var(--color-ink-light);
          text-transform: uppercase;
          font-weight: 600;
        }

        .slug {
          color: var(--color-brand-blue);
          font-family: monospace;
        }

        .content-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .btn-primary {
          background: var(--color-brand-blue);
          color: white;
        }

        .btn-outline {
          border: 1px solid var(--color-gray);
          background: transparent;
          color: var(--color-ink);
        }

        .btn-sm {
          padding: 0.25rem 0.75rem;
          font-size: 0.875rem;
        }

        .btn:hover {
          transform: translateY(-1px);
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 12px;
          width: 90vw;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--color-gray-light);
        }

        .modal-header h2 {
          margin: 0;
          color: var(--color-ink);
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--color-ink-light);
        }

        .create-form {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: var(--color-ink);
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--color-gray-light);
          border-radius: 6px;
          font-size: 1rem;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--color-brand-blue);
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: 1rem;
          }

          .filter-tabs {
            flex-wrap: wrap;
          }

          .content-grid {
            grid-template-columns: 1fr;
          }

          .modal {
            width: 95vw;
            margin: 1rem;
          }
        }
      `}</style>
    </div>
  );
}