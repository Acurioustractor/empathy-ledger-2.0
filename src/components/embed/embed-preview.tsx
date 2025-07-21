/**
 * Embed Preview Component
 */

'use client';

import React from 'react';

interface EmbedPreviewProps {
  projectId: string;
  embedCode?: string;
}

export function EmbedPreview({ projectId, embedCode }: EmbedPreviewProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Embed Preview
      </h3>
      <div className="border rounded-lg p-4 bg-gray-50">
        <p className="text-sm text-gray-600 mb-2">Project: {projectId}</p>
        {embedCode ? (
          <div className="bg-gray-800 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
            {embedCode}
          </div>
        ) : (
          <p className="text-gray-500 italic">No embed code generated yet</p>
        )}
      </div>
    </div>
  );
}
