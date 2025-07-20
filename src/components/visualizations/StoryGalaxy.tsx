'use client';

import React, { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import SecurityBadge from '@/components/trust/SecurityBadge';

interface StoryNode {
  id: string;
  theme: string;
  anonymousId: string;
  location: string;
  connections: number;
  impact: 'low' | 'medium' | 'high';
  category: string;
  x: number;
  y: number;
  z: number;
}

interface StoryGalaxyProps {
  className?: string;
  showControls?: boolean;
  autoRotate?: boolean;
}

// Mock data for story nodes (privacy-preserving)
const generateStoryNodes = (): StoryNode[] => {
  const themes = [
    'Mental Health Support', 'Healthcare Access', 'Education Barriers', 'Housing Security',
    'Employment Rights', 'Community Safety', 'Youth Advocacy', 'Elder Care',
    'Indigenous Rights', 'Climate Resilience', 'Digital Inclusion', 'Transport Equity'
  ];
  
  const locations = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT'];
  const categories = ['Individual', 'Community', 'Systemic', 'Policy'];
  
  return Array.from({ length: 150 }, (_, i) => ({
    id: `story-${i}`,
    theme: themes[Math.floor(Math.random() * themes.length)],
    anonymousId: `Anonymous-${Math.floor(Math.random() * 9999)}`,
    location: locations[Math.floor(Math.random() * locations.length)],
    connections: Math.floor(Math.random() * 50) + 1,
    impact: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
    category: categories[Math.floor(Math.random() * categories.length)],
    x: (Math.random() - 0.5) * 800,
    y: (Math.random() - 0.5) * 600,
    z: (Math.random() - 0.5) * 400
  }));
};

const StoryGalaxy: React.FC<StoryGalaxyProps> = ({
  className = '',
  showControls = true,
  autoRotate = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [storyNodes, setStoryNodes] = useState<StoryNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<StoryNode | null>(null);
  const [filterTheme, setFilterTheme] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    // Simulate loading story network data
    const loadStoryData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStoryNodes(generateStoryNodes());
      setIsLoading(false);
    };

    loadStoryData();
  }, []);

  useEffect(() => {
    if (!autoRotate) return;
    
    const interval = setInterval(() => {
      setRotation(prev => ({
        x: prev.x + 0.005,
        y: prev.y + 0.002
      }));
    }, 50);

    return () => clearInterval(interval);
  }, [autoRotate]);

  useEffect(() => {
    if (!canvasRef.current || storyNodes.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const centerX = canvas.width / 4;
    const centerY = canvas.height / 4;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width / 2, canvas.height / 2);

    // Filter nodes by theme
    const filteredNodes = filterTheme === 'all' 
      ? storyNodes 
      : storyNodes.filter(node => node.theme === filterTheme);

    // Draw connections (privacy-preserving - only show patterns, not individual links)
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.1)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < filteredNodes.length; i += 10) {
      const node1 = filteredNodes[i];
      const node2 = filteredNodes[i + 5];
      if (!node1 || !node2) continue;

      const x1 = centerX + (node1.x * Math.cos(rotation.y) - node1.z * Math.sin(rotation.y)) * zoom;
      const y1 = centerY + (node1.y * Math.cos(rotation.x) - node1.z * Math.sin(rotation.x)) * zoom;
      const x2 = centerX + (node2.x * Math.cos(rotation.y) - node2.z * Math.sin(rotation.y)) * zoom;
      const y2 = centerY + (node2.y * Math.cos(rotation.x) - node2.z * Math.sin(rotation.x)) * zoom;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Draw story nodes
    filteredNodes.forEach(node => {
      const x = centerX + (node.x * Math.cos(rotation.y) - node.z * Math.sin(rotation.y)) * zoom;
      const y = centerY + (node.y * Math.cos(rotation.x) - node.z * Math.sin(rotation.x)) * zoom;

      // Node size based on connections (privacy-preserving aggregation)
      const size = Math.max(2, Math.min(8, node.connections / 5));

      // Color based on impact level
      let color = '#64748b'; // gray for low impact
      if (node.impact === 'medium') color = '#f59e0b'; // amber
      if (node.impact === 'high') color = '#ef4444'; // red

      // Draw node
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();

      // Add glow effect for high impact stories
      if (node.impact === 'high') {
        ctx.fillStyle = `${color}40`;
        ctx.beginPath();
        ctx.arc(x, y, size * 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Draw selected node highlight
    if (selectedNode) {
      const x = centerX + (selectedNode.x * Math.cos(rotation.y) - selectedNode.z * Math.sin(rotation.y)) * zoom;
      const y = centerY + (selectedNode.y * Math.cos(rotation.x) - selectedNode.z * Math.sin(rotation.x)) * zoom;

      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, 2 * Math.PI);
      ctx.stroke();
    }

  }, [storyNodes, rotation, zoom, filterTheme, selectedNode]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find closest node to click (simplified)
    const centerX = canvas.offsetWidth / 2;
    const centerY = canvas.offsetHeight / 2;

    let closestNode: StoryNode | null = null;
    let minDistance = Infinity;

    storyNodes.forEach(node => {
      const nodeX = centerX + (node.x * Math.cos(rotation.y) - node.z * Math.sin(rotation.y)) * zoom;
      const nodeY = centerY + (node.y * Math.cos(rotation.x) - node.z * Math.sin(rotation.x)) * zoom;
      
      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
      
      if (distance < 20 && distance < minDistance) {
        minDistance = distance;
        closestNode = node;
      }
    });

    setSelectedNode(closestNode);
  };

  const themes = Array.from(new Set(storyNodes.map(node => node.theme)));

  if (isLoading) {
    return (
      <div className={`relative bg-slate-900 rounded-3xl overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Loading Story Galaxy</h3>
            <p className="text-cyan-200">Connecting 15,247 stories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-slate-900 rounded-3xl overflow-hidden ${className}`}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-96 cursor-pointer"
        onClick={handleCanvasClick}
      />

      {/* Controls */}
      {showControls && (
        <div className="absolute top-6 left-6 space-y-4">
          <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 text-white">
            <h4 className="font-semibold mb-3">Theme Filter</h4>
            <select
              value={filterTheme}
              onChange={(e) => setFilterTheme(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="all">All Themes</option>
              {themes.map(theme => (
                <option key={theme} value={theme} className="text-gray-900">
                  {theme}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 text-white">
            <h4 className="font-semibold mb-3">Zoom</h4>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Story Details Panel */}
      {selectedNode && (
        <div className="absolute top-6 right-6 bg-white rounded-2xl p-6 shadow-2xl max-w-sm">
          <div className="flex justify-between items-start mb-4">
            <h4 className="font-bold text-gray-900">Story Node</h4>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Theme</span>
              <p className="text-gray-900">{selectedNode.theme}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">ID</span>
              <p className="text-gray-900 font-mono text-sm">{selectedNode.anonymousId}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Location</span>
              <p className="text-gray-900">{selectedNode.location}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Connections</span>
              <p className="text-gray-900">{selectedNode.connections} related stories</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Impact Level</span>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                selectedNode.impact === 'high' ? 'bg-red-100 text-red-800' :
                selectedNode.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {selectedNode.impact.charAt(0).toUpperCase() + selectedNode.impact.slice(1)}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <SecurityBadge 
              variant="privacy" 
              text="Privacy Protected" 
              className="mb-2"
            />
            <p className="text-xs text-gray-600">
              Story content is encrypted. Only aggregated patterns are visible.
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-black/50 backdrop-blur-sm rounded-xl p-4 text-white">
        <h4 className="font-semibold mb-3">Impact Legend</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span>Low Impact</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Medium Impact</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>High Impact</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="absolute bottom-6 right-6 bg-black/50 backdrop-blur-sm rounded-xl p-4 text-white">
        <div className="text-center">
          <div className="text-2xl font-bold">{storyNodes.length.toLocaleString()}</div>
          <div className="text-sm text-cyan-200">Stories Connected</div>
        </div>
      </div>
    </div>
  );
};

export default StoryGalaxy;