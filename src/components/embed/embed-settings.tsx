/**
 * Embed Settings Component
 */

'use client';

import React from 'react';

interface EmbedSettingsProps {
  projectId: string;
  onSettingsChange?: (settings: any) => void;
}

export function EmbedSettings({ projectId, onSettingsChange }: EmbedSettingsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Embed Settings</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Width
          </label>
          <input
            type="text"
            defaultValue="100%"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            onChange={(e) => onSettingsChange?.({ width: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Height
          </label>
          <input
            type="text"
            defaultValue="400px"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            onChange={(e) => onSettingsChange?.({ height: e.target.value })}
          />
        </div>
        <div>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm text-gray-700">Show project branding</span>
          </label>
        </div>
      </div>
    </div>
  );
}