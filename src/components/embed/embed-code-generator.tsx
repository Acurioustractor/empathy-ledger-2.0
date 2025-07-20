/**
 * Embed Code Generator Component
 *
 * Philosophy: Simple, copy-paste embedding that maintains
 * sovereignty and consent at every level.
 */

'use client';

import React, { useState } from 'react';

interface EmbedConfig {
  widgetType: string;
  theme: string;
  limit: number;
  storyId: string;
  customDomain: boolean;
  allowedDomains: string[];
}

interface EmbedCodeGeneratorProps {
  projectId: string;
  config: EmbedConfig;
  project: any;
}

export function EmbedCodeGenerator({
  projectId,
  config,
  project,
}: EmbedCodeGeneratorProps) {
  const [selectedFormat, setSelectedFormat] = useState<
    'html' | 'iframe' | 'json'
  >('html');
  const [copied, setCopied] = useState(false);

  const generateEmbedCode = () => {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || 'https://empathyledger.org';

    const params = new URLSearchParams({
      project_id: projectId,
      type: config.widgetType,
      theme: config.theme,
      limit: config.limit.toString(),
      format: selectedFormat,
    });

    if (config.storyId) {
      params.append('story_id', config.storyId);
    }

    switch (selectedFormat) {
      case 'html':
        return generateHTMLEmbed(baseUrl, params);
      case 'iframe':
        return generateIframeEmbed(baseUrl, params, projectId);
      case 'json':
        return generateJSONEmbed(baseUrl, params);
      default:
        return '';
    }
  };

  const generateHTMLEmbed = (baseUrl: string, params: URLSearchParams) => {
    return `<!-- Empathy Ledger Story Widget -->
<div id="empathy-widget-${projectId}" class="empathy-widget-container">
  <p style="text-align: center; color: #666; font-size: 14px;">Loading ${project?.name || 'community'} stories...</p>
</div>

<script>
(function() {
  // Load stories from Empathy Ledger API
  fetch('${baseUrl}/api/embed/stories?${params.toString()}')
    .then(response => response.text())
    .then(html => {
      const container = document.getElementById('empathy-widget-${projectId}');
      if (container) {
        container.innerHTML = html;
      }
    })
    .catch(error => {
      console.warn('Empathy Ledger widget failed to load:', error);
      const container = document.getElementById('empathy-widget-${projectId}');
      if (container) {
        container.innerHTML = '<p style="text-align: center; color: #999; font-size: 14px;">Stories temporarily unavailable</p>';
      }
    });
})();
</script>

<!-- 
  Widget Configuration:
  - Project: ${project?.name || 'Unknown'}
  - Type: ${config.widgetType}
  - Theme: ${config.theme}
  - Stories: ${config.limit}
  
  Sovereignty Notice:
  - Only stories with public sharing consent are displayed
  - All rights remain with individual storytellers
  - Community branding and attribution preserved
-->`;
  };

  const generateIframeEmbed = (
    baseUrl: string,
    params: URLSearchParams,
    projectId: string
  ) => {
    const iframeUrl = `${baseUrl}/embed/iframe?${params.toString()}`;
    const height = config.widgetType === 'featured_story' ? '500' : '400';

    return `<!-- Empathy Ledger Story Widget (Iframe) -->
<iframe 
  src="${iframeUrl}"
  width="100%" 
  height="${height}"
  frameborder="0"
  scrolling="auto"
  style="border: none; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
  title="${project?.name || 'Community'} Stories Widget"
  sandbox="allow-scripts allow-same-origin">
  <p>Your browser does not support iframes. 
     <a href="${baseUrl}/projects/${projectId}/stories" target="_blank">
       View ${project?.name || 'community'} stories directly
     </a>
  </p>
</iframe>

<!-- 
  Iframe Benefits:
  - Automatic updates when new stories are added
  - Secure sandbox environment
  - Maintains sovereignty and consent controls
  - Responsive design adapts to container width
-->`;
  };

  const generateJSONEmbed = (baseUrl: string, params: URLSearchParams) => {
    return `<!-- Custom Implementation using JSON API -->
<div id="empathy-widget-${projectId}" class="empathy-widget-container">
  <!-- Your custom HTML structure here -->
</div>

<script>
// Fetch story data and implement custom display
fetch('${baseUrl}/api/embed/stories?${params.toString()}')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('empathy-widget-${projectId}');
    if (!container) return;
    
    // Example implementation:
    const stories = data.stories || [];
    const project = data.project || {};
    
    let html = \`<h3>\${project.name} Stories</h3>\`;
    
    stories.forEach(story => {
      html += \`
        <div style="margin-bottom: 1rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px;">
          \${story.title ? \`<h4>\${story.title}</h4>\` : ''}
          <blockquote style="font-style: italic; margin: 0.5rem 0;">
            "\${story.excerpt}"
          </blockquote>
          <p style="font-size: 0.875rem; color: #666;">
            — \${story.storyteller.name}
          </p>
        </div>
      \`;
    });
    
    html += '<p style="font-size: 0.75rem; text-align: center; color: #999;">Stories shared with consent • Powered by Empathy Ledger</p>';
    
    container.innerHTML = html;
  })
  .catch(error => {
    console.warn('Failed to load stories:', error);
  });
</script>

/* 
  JSON Response Format:
  {
    "stories": [
      {
        "id": "story-uuid",
        "title": "Story Title",
        "excerpt": "Truncated story content...",
        "storyteller": {
          "name": "Storyteller Name",
          "community": "Community Affiliation"
        },
        "submitted_at": "2024-01-01T00:00:00Z",
        "tags": ["tag1", "tag2"]
      }
    ],
    "project": {
      "name": "Project Name",
      "organization": "Organization Name"
    },
    "sovereignty_notice": "Stories shared with explicit consent. Rights remain with storytellers.",
    "powered_by": "Empathy Ledger"
  }
*/`;
  };

  const copyToClipboard = async () => {
    try {
      const code = generateEmbedCode();
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Embed Code Generator
      </h3>

      {/* Format Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Embed Format
        </label>
        <div className="flex gap-2">
          {(['html', 'iframe', 'json'] as const).map(format => (
            <button
              key={format}
              onClick={() => setSelectedFormat(format)}
              className={`px-3 py-1 text-sm rounded border ${
                selectedFormat === format
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="mt-2 text-xs text-gray-500">
          {selectedFormat === 'html' &&
            'Self-contained HTML with inline JavaScript'}
          {selectedFormat === 'iframe' &&
            'Secure iframe with automatic updates'}
          {selectedFormat === 'json' &&
            'Raw JSON data for custom implementations'}
        </div>
      </div>

      {/* Generated Code */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Generated Embed Code
        </label>

        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto max-h-96 overflow-y-auto">
            <code>{generateEmbedCode()}</code>
          </pre>

          <button
            onClick={copyToClipboard}
            className={`absolute top-2 right-2 px-3 py-1 text-xs rounded transition-colors ${
              copied
                ? 'bg-green-600 text-white'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Implementation Notes */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Implementation Notes</h4>
        <div className="text-sm text-blue-800 space-y-2">
          {selectedFormat === 'html' && (
            <>
              <p>• Paste this code directly into any webpage HTML</p>
              <p>• Widget loads asynchronously and gracefully handles errors</p>
              <p>• No external dependencies required</p>
            </>
          )}

          {selectedFormat === 'iframe' && (
            <>
              <p>• Most secure option with automatic content updates</p>
              <p>• Responsive design adapts to container width</p>
              <p>• Fallback content for browsers without iframe support</p>
            </>
          )}

          {selectedFormat === 'json' && (
            <>
              <p>• Full control over styling and layout</p>
              <p>• Integrate with your existing design system</p>
              <p>• Handle errors and loading states as needed</p>
            </>
          )}

          <p>
            <strong>Sovereignty:</strong> All formats respect storyteller
            consent and community protocols
          </p>
        </div>
      </div>

      {/* Domain Restrictions Notice */}
      {config.allowedDomains.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">
            🔒 Domain Restrictions Active
          </h4>
          <p className="text-sm text-yellow-700">
            This widget will only work on the following domains:
          </p>
          <ul className="text-sm text-yellow-700 mt-1">
            {config.allowedDomains.map(domain => (
              <li key={domain} className="ml-4">
                • {domain}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
