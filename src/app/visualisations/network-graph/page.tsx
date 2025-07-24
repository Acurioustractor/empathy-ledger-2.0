'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function NetworkGraphPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(true);
  const [layoutMode, setLayoutMode] = useState('force');
  const [filterType, setFilterType] = useState('all');

  // Real network data from Supabase
  const [networkData, setNetworkData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);

  // Fetch real network data
  useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/analytics?type=network-graph');
        const data = await response.json();
        
        if (data.nodes && data.links) {
          setNetworkData({ nodes: data.nodes, links: data.links });
        }
      } catch (error) {
        console.error('Failed to fetch network data:', error);
        // Fallback to sample data
        setNetworkData({
          nodes: [
            { id: 'comm-1', name: 'Community Network', type: 'community', x: 200, y: 200, size: 15, connections: 8, influence: 85 },
            { id: 'story-1', name: 'Community Stories', type: 'story', x: 150, y: 100, size: 8, connections: 4, influence: 65, theme: 'community' }
          ],
          links: [
            { source: 'comm-1', target: 'story-1', strength: 0.9, type: 'generated' }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkData();
  }, []);

  // Physics simulation variables
  const simulation = useRef<any>(null);
  const draggedNode = useRef<any>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize physics simulation
    const initSimulation = () => {
      const nodes = [...networkData.nodes];
      const links = networkData.links.map(link => ({
        ...link,
        source: nodes.find(n => n.id === link.source),
        target: nodes.find(n => n.id === link.target)
      }));

      // Simple force simulation
      simulation.current = {
        nodes,
        links,
        alpha: 1.0,
        alphaDecay: 0.02,
        velocityDecay: 0.4
      };
    };

    initSimulation();

    // Animation loop
    const animate = () => {
      if (!canvas || !ctx) return;
      
      ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);

      // Draw background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);

      const sim = simulation.current;
      if (!sim) return;

      // Apply forces if simulation is running
      if (isSimulating && sim.alpha > 0.005) {
        // Centering force
        const centerX = (canvas.offsetWidth) / 2;
        const centerY = (canvas.offsetHeight) / 2;
        
        sim.nodes.forEach((node: any) => {
          const dx = centerX - node.x;
          const dy = centerY - node.y;
          node.vx = (node.vx || 0) + dx * 0.001;
          node.vy = (node.vy || 0) + dy * 0.001;
        });

        // Link forces
        sim.links.forEach((link: any) => {
          const dx = link.target.x - link.source.x;
          const dy = link.target.y - link.source.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const targetDistance = 80 + (link.strength * 50);
          
          if (distance > 0) {
            const force = (distance - targetDistance) * link.strength * 0.1;
            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;
            
            link.source.vx = (link.source.vx || 0) + fx;
            link.source.vy = (link.source.vy || 0) + fy;
            link.target.vx = (link.target.vx || 0) - fx;
            link.target.vy = (link.target.vy || 0) - fy;
          }
        });

        // Repulsion force between nodes
        sim.nodes.forEach((nodeA: any, i: number) => {
          sim.nodes.forEach((nodeB: any, j: number) => {
            if (i !== j) {
              const dx = nodeB.x - nodeA.x;
              const dy = nodeB.y - nodeA.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance > 0 && distance < 100) {
                const force = (nodeA.size + nodeB.size) * 5 / (distance * distance);
                const fx = (dx / distance) * force;
                const fy = (dy / distance) * force;
                
                nodeA.vx = (nodeA.vx || 0) - fx;
                nodeA.vy = (nodeA.vy || 0) - fy;
              }
            }
          });
        });

        // Update positions
        sim.nodes.forEach((node: any) => {
          if (!node.fixed) {
            node.vx = (node.vx || 0) * sim.velocityDecay;
            node.vy = (node.vy || 0) * sim.velocityDecay;
            node.x += node.vx;
            node.y += node.vy;
          }
        });

        sim.alpha *= (1 - sim.alphaDecay);
      }

      // Draw links
      sim.links.forEach((link: any) => {
        if (filterType === 'all' || link.type === filterType || 
            (filterType === 'story' && (link.source.type === 'story' || link.target.type === 'story'))) {
          
          const colors = {
            generated: 'rgba(59, 130, 246, 0.6)',
            influenced: 'rgba(34, 197, 94, 0.6)', 
            implemented: 'rgba(245, 158, 11, 0.6)',
            funded: 'rgba(139, 92, 246, 0.6)',
            collaboration: 'rgba(239, 68, 68, 0.6)',
            thematic: 'rgba(6, 182, 212, 0.4)'
          };

          ctx.strokeStyle = colors[link.type as keyof typeof colors] || 'rgba(100, 100, 100, 0.3)';
          ctx.lineWidth = Math.max(1, link.strength * 4);
          ctx.beginPath();
          ctx.moveTo(link.source.x, link.source.y);
          ctx.lineTo(link.target.x, link.target.y);
          ctx.stroke();

          // Draw arrow for directed relationships
          if (['influenced', 'implemented', 'funded'].includes(link.type)) {
            const angle = Math.atan2(link.target.y - link.source.y, link.target.x - link.source.x);
            const arrowX = link.target.x - Math.cos(angle) * (link.target.size + 5);
            const arrowY = link.target.y - Math.sin(angle) * (link.target.size + 5);
            
            ctx.fillStyle = colors[link.type as keyof typeof colors] || 'rgba(100, 100, 100, 0.5)';
            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY);
            ctx.lineTo(arrowX - 8 * Math.cos(angle - 0.5), arrowY - 8 * Math.sin(angle - 0.5));
            ctx.lineTo(arrowX - 8 * Math.cos(angle + 0.5), arrowY - 8 * Math.sin(angle + 0.5));
            ctx.closePath();
            ctx.fill();
          }
        }
      });

      // Draw nodes
      sim.nodes.forEach((node: any) => {
        const colors = {
          community: '#22c55e',
          story: '#3b82f6', 
          outcome: '#f59e0b',
          stakeholder: '#ef4444'
        };

        const color = colors[node.type as keyof typeof colors] || '#6b7280';
        
        // Node glow effect
        const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.size + 8);
        glowGradient.addColorStop(0, color + '40');
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size + 8, 0, Math.PI * 2);
        ctx.fill();

        // Main node circle
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();

        // Node border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Highlight selected node
        if (selectedNode && selectedNode.id === node.id) {
          ctx.strokeStyle = '#1f2937';
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // Node labels
        ctx.fillStyle = '#1f2937';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        const label = node.name.length > 15 ? node.name.substring(0, 15) + '...' : node.name;
        ctx.fillText(label, node.x, node.y + node.size + 16);

        // Connection count indicator
        ctx.fillStyle = '#6b7280';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(`${node.connections}`, node.x, node.y + node.size + 28);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Mouse interaction
    const handleMouseClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Check if click is on a node
      const clickedNode = simulation.current.nodes.find((node: any) => {
        const distance = Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2));
        return distance <= node.size;
      });

      setSelectedNode(clickedNode || null);
    };

    const handleMouseDown = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Check if mouse is on a node for dragging
      const node = simulation.current.nodes.find((node: any) => {
        const distance = Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2));
        return distance <= node.size;
      });

      if (node) {
        draggedNode.current = node;
        node.fixed = true;
        canvas.style.cursor = 'grabbing';
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (draggedNode.current) {
        draggedNode.current.x = x;
        draggedNode.current.y = y;
        draggedNode.current.vx = 0;
        draggedNode.current.vy = 0;
      } else {
        // Check if hovering over a node
        const hoveredNode = simulation.current.nodes.find((node: any) => {
          const distance = Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2));
          return distance <= node.size;
        });

        canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
      }
    };

    const handleMouseUp = () => {
      if (draggedNode.current) {
        draggedNode.current.fixed = false;
        draggedNode.current = null;
        canvas.style.cursor = 'default';
      }
    };

    canvas.addEventListener('click', handleMouseClick);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('click', handleMouseClick);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSimulating, layoutMode, filterType, selectedNode, loading, networkData]);

  const connectionTypes = [
    { id: 'all', name: 'All Connections', color: '#6b7280' },
    { id: 'generated', name: 'Story Generated', color: '#3b82f6' },
    { id: 'influenced', name: 'Policy Influenced', color: '#22c55e' },
    { id: 'implemented', name: 'Implementation', color: '#f59e0b' },
    { id: 'funded', name: 'Funding', color: '#8b5cf6' },
    { id: 'collaboration', name: 'Collaboration', color: '#ef4444' },
    { id: 'thematic', name: 'Thematic Links', color: '#06b6d4' }
  ];

  const nodeTypes = [
    { type: 'community', name: 'Communities', color: '#22c55e', count: 3 },
    { type: 'story', name: 'Stories', color: '#3b82f6', count: 5 },
    { type: 'outcome', name: 'Outcomes', color: '#f59e0b', count: 3 },
    { type: 'stakeholder', name: 'Stakeholders', color: '#ef4444', count: 3 }
  ];

  return (
    <div>
      {/* Header */}
      <section className="viz-header">
        <div className="container">
          <Link href="/visualisations" className="back-link">
            ← Back to Visualisations
          </Link>
          
          <div className="viz-title-section">
            <div className="viz-icon-large">🕸️</div>
            <div>
              <h1>Relationship Network Graph</h1>
              <p>Interactive network showing connections between stories, communities, and outcomes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Visualisation */}
      <section className="viz-interactive">
        <div className="container">
          <div className="viz-container">
            <div className="viz-main">
              <div className="viz-controls-top">
                <div className="control-group">
                  <label>Connection Filter:</label>
                  <select 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value)}
                    className="control-select"
                  >
                    {connectionTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="control-group">
                  <label>Layout:</label>
                  <select 
                    value={layoutMode} 
                    onChange={(e) => setLayoutMode(e.target.value)}
                    className="control-select"
                  >
                    <option value="force">Force Layout</option>
                    <option value="circle">Circular Layout</option>
                    <option value="hierarchy">Hierarchical Layout</option>
                  </select>
                </div>

                <div className="control-group">
                  <label>Physics:</label>
                  <button 
                    onClick={() => setIsSimulating(!isSimulating)}
                    className={`control-btn ${isSimulating ? 'active' : ''}`}
                  >
                    {isSimulating ? '⏸️' : '▶️'} Simulation
                  </button>
                </div>
              </div>

              <div className="network-wrapper">
                <canvas
                  ref={canvasRef}
                  className="network-canvas"
                />
                
                {/* Network Legend */}
                <div className="network-legend">
                  <h4>Network Elements</h4>
                  <div className="legend-section">
                    <h5>Node Types</h5>
                    {nodeTypes.map(type => (
                      <div key={type.type} className="legend-item">
                        <div 
                          className="legend-color" 
                          style={{ backgroundColor: type.color }}
                        ></div>
                        <span className="legend-text">{type.name} ({type.count})</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="legend-section">
                    <h5>Connection Types</h5>
                    {connectionTypes.slice(1).map(type => (
                      <div key={type.id} className="legend-item">
                        <div 
                          className="legend-line" 
                          style={{ backgroundColor: type.color }}
                        ></div>
                        <span className="legend-text">{type.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Info Panel */}
            <div className="info-panel">
              {selectedNode ? (
                <div>
                  <div className="info-header">
                    <h3>{selectedNode.name}</h3>
                    <button onClick={() => setSelectedNode(null)} className="close-btn">×</button>
                  </div>
                  <div className="info-content">
                    <div className="node-type">
                      <span className="type-badge" style={{
                        backgroundColor: nodeTypes.find(t => t.type === selectedNode.type)?.color
                      }}>
                        {selectedNode.type}
                      </span>
                    </div>
                    
                    <div className="node-metrics">
                      <div className="metric-item">
                        <span className="metric-value">{selectedNode.connections}</span>
                        <span className="metric-label">Connections</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-value">{selectedNode.influence}</span>
                        <span className="metric-label">Influence Score</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-value">{selectedNode.size}</span>
                        <span className="metric-label">Network Size</span>
                      </div>
                    </div>

                    {selectedNode.theme && (
                      <div className="node-theme">
                        <h4>Theme</h4>
                        <span className="theme-tag">{selectedNode.theme}</span>
                      </div>
                    )}

                    <div className="node-connections">
                      <h4>Direct Connections:</h4>
                      <div className="connections-list">
                        {networkData.links
                          .filter(link => link.source === selectedNode.id || link.target === selectedNode.id)
                          .map((link, index) => {
                            const connectedNodeId = link.source === selectedNode.id ? link.target : link.source;
                            const connectedNode = networkData.nodes.find(n => n.id === connectedNodeId);
                            
                            return (
                              <div key={index} className="connection-item">
                                <div 
                                  className="connection-indicator"
                                  style={{ backgroundColor: connectionTypes.find(t => t.id === link.type)?.color }}
                                ></div>
                                <span className="connection-name">{connectedNode?.name}</span>
                                <span className="connection-type">{link.type}</span>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    <div className="node-actions">
                      <button className="btn btn-primary btn-sm">View Details</button>
                      <button className="btn btn-outline btn-sm">Export Data</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="info-placeholder">
                  <div className="placeholder-icon">🕸️</div>
                  <h3>Network Graph</h3>
                  <p>Click on any node to explore its connections and influence within the community network.</p>
                  
                  <div className="network-summary">
                    <div className="summary-stats">
                      <div className="summary-item">
                        <span className="summary-value">{loading ? '...' : networkData.nodes.length}</span>
                        <span className="summary-label">Total Nodes</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-value">{loading ? '...' : networkData.links.length}</span>
                        <span className="summary-label">Connections</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-value">{loading ? '...' : connectionTypes.length - 1}</span>
                        <span className="summary-label">Connection Types</span>
                      </div>
                    </div>

                    <div className="network-insights">
                      <h4>Key Insights</h4>
                      <ul>
                        <li>Central Heights has highest network influence (92)</li>
                        <li>Community Housing Fund shows strongest connections</li>
                        <li>Healthcare stories drive most policy outcomes</li>
                        <li>City Council bridges multiple community initiatives</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Network Analysis */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Understanding Network Relationships</h2>
            <p>How to interpret the connections and influence patterns in community networks</p>
          </div>

          <div className="analysis-grid">
            <div className="analysis-item">
              <div className="analysis-icon">🎯</div>
              <h4>Node Influence</h4>
              <p>Node size indicates influence score - larger nodes have greater impact on network outcomes</p>
            </div>
            <div className="analysis-item">
              <div className="analysis-icon">🔗</div>
              <h4>Connection Strength</h4>
              <p>Line thickness shows relationship strength - thicker lines indicate stronger collaborative ties</p>
            </div>
            <div className="analysis-item">
              <div className="analysis-icon">🌊</div>
              <h4>Information Flow</h4>
              <p>Arrows indicate directional relationships - how stories influence policies and outcomes</p>
            </div>
            <div className="analysis-item">
              <div className="analysis-icon">🎨</div>
              <h4>Relationship Types</h4>
              <p>Colors represent different connection types - from story generation to policy implementation</p>
            </div>
            <div className="analysis-item">
              <div className="analysis-icon">🔍</div>
              <h4>Network Clusters</h4>
              <p>Node groupings reveal natural communities and collaborative networks within the ecosystem</p>
            </div>
            <div className="analysis-item">
              <div className="analysis-icon">⚡</div>
              <h4>Dynamic Simulation</h4>
              <p>Physics-based layout shows natural network structure and helps identify key relationship patterns</p>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .viz-header {
          background: var(--color-gray-darker);
          color: var(--color-white);
          padding: var(--space-xl) 0;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          color: var(--color-white);
          text-decoration: none;
          font-size: 14px;
          margin-bottom: var(--space-lg);
          opacity: 0.8;
          transition: opacity 0.2s ease;
        }

        .back-link:hover {
          opacity: 1;
        }

        .viz-title-section {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
        }

        .viz-icon-large {
          font-size: 64px;
        }

        .viz-title-section h1 {
          font-size: 48px;
          margin-bottom: var(--space-sm);
        }

        .viz-title-section p {
          opacity: 0.8;
          margin: 0;
        }

        .viz-interactive {
          background: var(--color-gray-lighter);
          min-height: 80vh;
          padding: var(--space-xl) 0;
        }

        .viz-container {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: var(--space-xl);
          height: 80vh;
        }

        .viz-main {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .viz-controls-top {
          display: flex;
          gap: var(--space-lg);
          background: var(--color-white);
          padding: var(--space-lg);
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .control-group label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--color-ink);
          opacity: 0.8;
        }

        .control-select {
          background: var(--color-white);
          border: 2px solid var(--color-gray-light);
          border-radius: 6px;
          padding: 8px 12px;
          color: var(--color-ink);
          font-size: 14px;
          font-weight: 500;
          transition: border-color 0.2s ease;
        }

        .control-select:focus {
          outline: none;
          border-color: var(--color-brand-blue);
        }

        .control-btn {
          background: var(--color-brand-blue);
          border: none;
          border-radius: 6px;
          padding: 8px 12px;
          color: var(--color-white);
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .control-btn.active {
          background: var(--color-brand-green);
        }

        .network-wrapper {
          position: relative;
          background: var(--color-white);
          border-radius: 12px;
          padding: var(--space-xl);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          flex: 1;
        }

        .network-canvas {
          width: 100%;
          height: 100%;
          border-radius: 8px;
        }

        .network-legend {
          position: absolute;
          bottom: var(--space-lg);
          left: var(--space-lg);
          background: rgba(255, 255, 255, 0.95);
          padding: var(--space-lg);
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          max-width: 200px;
        }

        .network-legend h4 {
          font-size: 14px;
          margin-bottom: var(--space-md);
          color: var(--color-ink);
        }

        .legend-section {
          margin-bottom: var(--space-md);
        }

        .legend-section h5 {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-ink);
          text-transform: uppercase;
          margin-bottom: var(--space-sm);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-xs);
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .legend-line {
          width: 16px;
          height: 3px;
          border-radius: 2px;
        }

        .legend-text {
          font-size: 11px;
          color: var(--color-ink-light);
        }

        .info-panel {
          background: var(--color-white);
          border-radius: 12px;
          padding: var(--space-xl);
          height: fit-content;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .info-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-lg);
        }

        .info-header h3 {
          font-size: 20px;
          margin: 0;
          color: var(--color-ink);
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          color: var(--color-gray);
          cursor: pointer;
          padding: 0;
        }

        .node-type {
          margin-bottom: var(--space-lg);
        }

        .type-badge {
          color: var(--color-white);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .node-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }

        .metric-item {
          text-align: center;
          padding: var(--space-md);
          background: var(--color-gray-lighter);
          border-radius: 8px;
        }

        .metric-value {
          display: block;
          font-size: 20px;
          font-weight: 700;
          color: var(--color-brand-blue);
          margin-bottom: var(--space-xs);
        }

        .metric-label {
          font-size: 12px;
          color: var(--color-ink-light);
          text-transform: uppercase;
          font-weight: 600;
        }

        .node-theme {
          margin-bottom: var(--space-lg);
        }

        .node-theme h4 {
          font-size: 14px;
          margin-bottom: var(--space-sm);
          color: var(--color-ink);
        }

        .theme-tag {
          background: var(--color-brand-green);
          color: var(--color-white);
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
        }

        .node-connections {
          margin-bottom: var(--space-lg);
        }

        .node-connections h4 {
          font-size: 16px;
          margin-bottom: var(--space-md);
          color: var(--color-ink);
        }

        .connections-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          max-height: 200px;
          overflow-y: auto;
        }

        .connection-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm);
          background: var(--color-gray-lighter);
          border-radius: 6px;
        }

        .connection-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .connection-name {
          flex: 1;
          font-size: 13px;
          color: var(--color-ink);
        }

        .connection-type {
          font-size: 11px;
          color: var(--color-ink-light);
          text-transform: uppercase;
        }

        .node-actions {
          display: flex;
          gap: var(--space-sm);
        }

        .btn-sm {
          padding: 8px 16px;
          font-size: 14px;
        }

        .info-placeholder {
          text-align: center;
        }

        .placeholder-icon {
          font-size: 64px;
          margin-bottom: var(--space-lg);
        }

        .info-placeholder h3 {
          font-size: 24px;
          margin-bottom: var(--space-md);
          color: var(--color-ink);
        }

        .info-placeholder p {
          color: var(--color-ink-light);
          margin-bottom: var(--space-xl);
          line-height: 1.6;
        }

        .network-summary {
          text-align: left;
        }

        .summary-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-md);
          margin-bottom: var(--space-xl);
        }

        .summary-item {
          text-align: center;
          padding: var(--space-md);
          background: var(--color-gray-lighter);
          border-radius: 8px;
        }

        .summary-value {
          display: block;
          font-size: 20px;
          font-weight: 700;
          color: var(--color-brand-blue);
          margin-bottom: var(--space-xs);
        }

        .summary-label {
          font-size: 12px;
          color: var(--color-ink-light);
          text-transform: uppercase;
          font-weight: 600;
        }

        .network-insights h4 {
          font-size: 16px;
          margin-bottom: var(--space-md);
          color: var(--color-ink);
        }

        .network-insights ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .network-insights li {
          font-size: 14px;
          color: var(--color-ink-light);
          margin-bottom: var(--space-sm);
          padding-left: var(--space-md);
          position: relative;
        }

        .network-insights li::before {
          content: '→';
          position: absolute;
          left: 0;
          color: var(--color-brand-blue);
          font-weight: 600;
        }

        .analysis-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-xl);
        }

        .analysis-item {
          background: var(--color-white);
          border: 1px solid var(--color-gray-light);
          border-radius: 12px;
          padding: var(--space-xl);
          text-align: center;
        }

        .analysis-icon {
          font-size: 48px;
          margin-bottom: var(--space-lg);
        }

        .analysis-item h4 {
          font-size: 18px;
          margin-bottom: var(--space-md);
          color: var(--color-ink);
        }

        .analysis-item p {
          color: var(--color-ink-light);
          line-height: 1.6;
          margin: 0;
        }

        @media (max-width: 768px) {
          .viz-container {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr auto;
          }

          .viz-title-section {
            flex-direction: column;
            text-align: center;
          }

          .viz-controls-top {
            flex-direction: column;
            gap: var(--space-md);
          }

          .node-metrics, .summary-stats {
            grid-template-columns: 1fr;
          }

          .analysis-grid {
            grid-template-columns: 1fr;
          }

          .network-legend {
            position: relative;
            bottom: auto;
            left: auto;
            margin-top: var(--space-lg);
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
}