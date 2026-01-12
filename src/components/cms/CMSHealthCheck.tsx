'use client';

import React from 'react';
import { useCMSHealth } from '@/hooks/useCMS';

interface CMSHealthCheckProps {
  showDetails?: boolean;
  compact?: boolean;
}

export default function CMSHealthCheck({ 
  showDetails = false, 
  compact = false 
}: CMSHealthCheckProps) {
  const { data: health, loading, error, refresh } = useCMSHealth();

  if (compact) {
    return (
      <div style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        fontSize: '0.875rem',
        padding: '0.25rem 0.5rem',
        backgroundColor: health?.healthy ? '#dcfce7' : '#fef2f2',
        color: health?.healthy ? '#166534' : '#dc2626',
        borderRadius: '4px',
        border: `1px solid ${health?.healthy ? '#bbf7d0' : '#fecaca'}`,
      }}>
        <span>{health?.healthy ? '✅' : '❌'}</span>
        <span>CMS {loading ? 'checking...' : health?.healthy ? 'OK' : 'Error'}</span>
        {!loading && (
          <button 
            onClick={refresh}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              fontSize: '0.75rem',
              opacity: 0.7,
            }}
          >
            🔄
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{
      padding: '1rem',
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      margin: '1rem 0',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: showDetails ? '1rem' : 0,
      }}>
        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
          🏥 CMS Health Status
        </h3>
        <button
          onClick={refresh}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Checking...' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
          Checking CMS connection...
        </div>
      ) : error ? (
        <div style={{ 
          color: '#dc2626', 
          backgroundColor: '#fef2f2',
          padding: '1rem',
          borderRadius: '4px',
          border: '1px solid #fecaca',
        }}>
          <strong>Error:</strong> {error}
        </div>
      ) : health ? (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: showDetails ? '1rem' : 0,
            fontSize: '1.125rem',
            fontWeight: 500,
          }}>
            <span>{health.healthy ? '✅' : '❌'}</span>
            <span>{health.healthy ? 'CMS is healthy' : 'CMS has issues'}</span>
          </div>

          {showDetails && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div style={{
                padding: '1rem',
                backgroundColor: 'white',
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>
                  {health.storytellers}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  👥 Storytellers
                </div>
              </div>

              <div style={{
                padding: '1rem',
                backgroundColor: 'white',
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#059669' }}>
                  {health.projects}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  📊 Projects
                </div>
              </div>

              <div style={{
                padding: '1rem',
                backgroundColor: 'white',
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc2626' }}>
                  {health.quotes}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  💬 Quotes
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}