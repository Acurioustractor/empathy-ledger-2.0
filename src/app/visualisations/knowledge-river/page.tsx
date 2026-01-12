'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function KnowledgeRiverPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [timeScale, setTimeScale] = useState(1);
  const [viewMode, setViewMode] = useState('flow');

  // Real knowledge flow data from Supabase
  const [knowledgeData, setKnowledgeData] = useState({ nodes: [], flows: [] });
  const [loading, setLoading] = useState(true);

  // Fetch knowledge flow data
  useEffect(() => {
    const fetchKnowledgeData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/analytics?type=knowledge-flow');
        const data = await response.json();
        
        if (data.nodes && data.flows) {
          setKnowledgeData({ nodes: data.nodes, flows: data.flows });
        }
      } catch (error) {
        console.error('Failed to fetch knowledge flow data:', error);
        // Fallback to sample data
        setKnowledgeData({
          nodes: [
            { id: 'community-1', name: 'Community Network', x: 200, y: 200, type: 'community', knowledge: 85 },
            { id: 'research-1', name: 'Research Centre', x: 400, y: 100, type: 'expert', knowledge: 92 }
          ],
          flows: [
            { from: 'community-1', to: 'research-1', strength: 0.8, type: 'story-sharing', active: true }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchKnowledgeData();
  }, []);

  // Animation particles for flow visualization
  const particles = useRef<any[]>([]);

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

    // Initialize particles
    const initParticles = () => {
      particles.current = [];
      knowledgeData.flows.forEach((flow, index) => {
        if (!flow.active) return;
        
        const fromNode = knowledgeData.nodes.find(n => n.id === flow.from);
        const toNode = knowledgeData.nodes.find(n => n.id === flow.to);
        
        if (fromNode && toNode) {
          for (let i = 0; i < Math.floor(flow.strength * 10); i++) {
            particles.current.push({
              id: `${flow.from}-${flow.to}-${i}`,
              startX: fromNode.x,
              startY: fromNode.y,
              endX: toNode.x,
              endY: toNode.y,
              currentX: fromNode.x,
              currentY: fromNode.y,
              progress: Math.random(),
              speed: 0.01 * timeScale,
              type: flow.type,
              opacity: 0.8,
              size: 2 + Math.random() * 3
            });
          }
        }
      });
    };

    initParticles();

    // Animation loop
    const animate = () => {
      if (!isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);

      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
      gradient.addColorStop(0, '#0f0f23');
      gradient.addColorStop(1, '#1a1a2e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);

      // Draw flow connections
      knowledgeData.flows.forEach(flow => {
        const fromNode = knowledgeData.nodes.find(n => n.id === flow.from);
        const toNode = knowledgeData.nodes.find(n => n.id === flow.to);
        
        if (fromNode && toNode) {
          ctx.strokeStyle = flow.active ? 'rgba(74, 144, 226, 0.3)' : 'rgba(100, 100, 100, 0.1)';
          ctx.lineWidth = flow.strength * 3;
          ctx.beginPath();
          ctx.moveTo(fromNode.x, fromNode.y);
          
          // Create curved path
          const midX = (fromNode.x + toNode.x) / 2;
          const midY = (fromNode.y + toNode.y) / 2 - 50;
          ctx.quadraticCurveTo(midX, midY, toNode.x, toNode.y);
          ctx.stroke();
        }
      });

      // Update and draw particles
      particles.current.forEach(particle => {
        // Update position along curve
        particle.progress += particle.speed;
        
        if (particle.progress >= 1) {
          particle.progress = 0;
          particle.currentX = particle.startX;
          particle.currentY = particle.startY;
        }

        // Calculate position along quadratic curve
        const t = particle.progress;
        const midX = (particle.startX + particle.endX) / 2;
        const midY = (particle.startY + particle.endY) / 2 - 50;
        
        particle.currentX = Math.pow(1-t, 2) * particle.startX + 2*(1-t)*t * midX + Math.pow(t, 2) * particle.endX;
        particle.currentY = Math.pow(1-t, 2) * particle.startY + 2*(1-t)*t * midY + Math.pow(t, 2) * particle.endY;

        // Draw particle
        const colors = {
          'story-sharing': '#3b82f6',
          'evidence': '#22c55e', 
          'policy-feedback': '#f59e0b',
          'peer-learning': '#8b5cf6',
          'amplification': '#ef4444',
          'awareness': '#06b6d4'
        };

        ctx.fillStyle = colors[particle.type as keyof typeof colors] || '#ffffff';
        ctx.globalAlpha = particle.opacity * (1 - particle.progress * 0.3);
        ctx.beginPath();
        ctx.arc(particle.currentX, particle.currentY, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Draw nodes
      knowledgeData.nodes.forEach(node => {
        const colors = {
          community: '#22c55e',
          expert: '#3b82f6',
          policy: '#f59e0b',
          media: '#ef4444'
        };

        // Node glow
        const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 25);
        glowGradient.addColorStop(0, colors[node.type as keyof typeof colors] + '40');
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 25, 0, Math.PI * 2);
        ctx.fill();

        // Node circle
        ctx.fillStyle = colors[node.type as keyof typeof colors];
        ctx.beginPath();
        ctx.arc(node.x, node.y, 15, 0, Math.PI * 2);
        ctx.fill();

        // Node label
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y + 35);
        
        // Knowledge level indicator
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(`${node.knowledge}%`, node.x, node.y - 25);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle canvas clicks
    const handleCanvasClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Check if click is on a node
      const clickedNode = knowledgeData.nodes.find(node => {
        const distance = Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2));
        return distance <= 20;
      });

      setSelectedNode(clickedNode || null);
    };

    canvas.addEventListener('click', handleCanvasClick);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('click', handleCanvasClick);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, timeScale, viewMode, loading, knowledgeData]);

  const flowTypes = [
    { id: 'story-sharing', name: 'Story Sharing', color: '#3b82f6', description: 'Communities sharing experiences with experts' },
    { id: 'evidence', name: 'Evidence', color: '#22c55e', description: 'Research insights flowing to policymakers' },
    { id: 'policy-feedback', name: 'Policy Feedback', color: '#f59e0b', description: 'Policy changes reaching communities' },
    { id: 'peer-learning', name: 'Peer Learning', color: '#8b5cf6', description: 'Communities learning from each other' },
    { id: 'amplification', name: 'Amplification', color: '#ef4444', description: 'Stories being amplified through media' },
    { id: 'awareness', name: 'Awareness', color: '#06b6d4', description: 'Increased community awareness and engagement' }
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
            <div className="viz-icon-large">🌊</div>
            <div>
              <h1>Knowledge River Flow</h1>
              <p>Visualise how insights and wisdom flow through community networks over time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Visualisation */}
      <section className="viz-interactive">
        <div className="container">
          <div className="viz-container">
            <div className="viz-canvas-wrapper">
              <canvas ref={canvasRef} className="viz-canvas" />
              
              {/* Controls */}
              <div className="viz-controls">
                <div className="control-group">
                  <label>Playback:</label>
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`control-btn ${isPlaying ? 'active' : ''}`}
                  >
                    {isPlaying ? '⏸️' : '▶️'}
                  </button>
                </div>
                
                <div className="control-group">
                  <label>Speed:</label>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="3" 
                    step="0.1"
                    value={timeScale}
                    onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                    className="control-slider"
                  />
                  <span className="control-value">{timeScale}x</span>
                </div>
                
                <div className="control-group">
                  <label>View Mode:</label>
                  <select 
                    value={viewMode} 
                    onChange={(e) => setViewMode(e.target.value)}
                    className="control-select"
                  >
                    <option value="flow">Flow View</option>
                    <option value="network">Network View</option>
                    <option value="temporal">Temporal View</option>
                  </select>
                </div>
              </div>

              {/* Flow Legend */}
              <div className="flow-legend">
                <h4>Knowledge Flow Types</h4>
                <div className="legend-items">
                  {flowTypes.map(type => (
                    <div key={type.id} className="legend-item">
                      <div 
                        className="legend-color" 
                        style={{ backgroundColor: type.color }}
                      ></div>
                      <div className="legend-text">
                        <span className="legend-name">{type.name}</span>
                        <span className="legend-desc">{type.description}</span>
                      </div>
                    </div>
                  ))}
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
                      <span className="type-badge">{selectedNode.type}</span>
                    </div>
                    <div className="knowledge-meter">
                      <label>Knowledge Level:</label>
                      <div className="meter-bar">
                        <div 
                          className="meter-fill" 
                          style={{ width: `${selectedNode.knowledge}%` }}
                        ></div>
                      </div>
                      <span className="meter-value">{selectedNode.knowledge}%</span>
                    </div>
                    <div className="node-connections">
                      <h4>Connected Flows:</h4>
                      <ul>
                        {knowledgeData.flows
                          .filter(flow => flow.from === selectedNode.id || flow.to === selectedNode.id)
                          .map((flow, index) => (
                            <li key={index}>
                              <span className="flow-direction">
                                {flow.from === selectedNode.id ? '→' : '←'}
                              </span>
                              <span className="flow-type">{flow.type}</span>
                              <span className="flow-strength">({Math.round(flow.strength * 100)}%)</span>
                            </li>
                          ))
                        }
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="info-placeholder">
                  <div className="placeholder-icon">🌊</div>
                  <h3>Knowledge River Flow</h3>
                  <p>Click on any node to explore knowledge connections and flow patterns.</p>
                  <div className="flow-stats">
                    <div className="stat">
                      <span className="stat-value">{loading ? '...' : knowledgeData.nodes.length}</span>
                      <span className="stat-label">Network Nodes</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{loading ? '...' : knowledgeData.flows.filter((f: any) => f.active).length}</span>
                      <span className="stat-label">Active Flows</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{loading ? '...' : particles.current.length}</span>
                      <span className="stat-label">Knowledge Particles</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Explanation */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Understanding Knowledge Flow</h2>
            <p>How information and insights move through community networks</p>
          </div>

          <div className="explanation-grid">
            <div className="explanation-item">
              <div className="explanation-icon">🏘️</div>
              <h4>Community Nodes</h4>
              <p>Represent different communities sharing their stories and experiences</p>
            </div>
            <div className="explanation-item">
              <div className="explanation-icon">🎓</div>
              <h4>Expert Nodes</h4>
              <p>Research centres and experts who analyse community stories for insights</p>
            </div>
            <div className="explanation-item">
              <div className="explanation-icon">🏛️</div>
              <h4>Policy Nodes</h4>
              <p>Government bodies and policymakers who can act on evidence-based insights</p>
            </div>
            <div className="explanation-item">
              <div className="explanation-icon">📢</div>
              <h4>Media Nodes</h4>
              <p>Media outlets that amplify stories and raise awareness about issues</p>
            </div>
            <div className="explanation-item">
              <div className="explanation-icon">⚡</div>
              <h4>Flow Particles</h4>
              <p>Represent knowledge, insights, and information moving between nodes</p>
            </div>
            <div className="explanation-item">
              <div className="explanation-icon">🔄</div>
              <h4>Feedback Loops</h4>
              <p>Show how policy changes and interventions flow back to communities</p>
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
          background: var(--color-gray-darker);
          min-height: 80vh;
        }

        .viz-container {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: var(--space-xl);
          height: 80vh;
        }

        .viz-canvas-wrapper {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          background: #0f0f23;
        }

        .viz-canvas {
          width: 100%;
          height: 100%;
          cursor: pointer;
        }

        .viz-controls {
          position: absolute;
          top: var(--space-lg);
          left: var(--space-lg);
          background: rgba(0, 0, 0, 0.8);
          padding: var(--space-lg);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          color: var(--color-white);
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
          opacity: 0.8;
        }

        .control-btn {
          background: var(--color-brand-blue);
          border: none;
          border-radius: 4px;
          padding: 8px 12px;
          color: var(--color-white);
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .control-btn.active {
          background: var(--color-brand-green);
        }

        .control-slider {
          width: 100px;
        }

        .control-value {
          font-size: 12px;
          opacity: 0.8;
        }

        .control-select {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          padding: 4px 8px;
          color: var(--color-white);
          font-size: 14px;
        }

        .flow-legend {
          position: absolute;
          bottom: var(--space-lg);
          left: var(--space-lg);
          background: rgba(0, 0, 0, 0.8);
          padding: var(--space-lg);
          border-radius: 8px;
          color: var(--color-white);
          max-width: 300px;
        }

        .flow-legend h4 {
          font-size: 14px;
          margin-bottom: var(--space-md);
          font-weight: 600;
        }

        .legend-items {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .legend-item {
          display: flex;
          align-items: flex-start;
          gap: var(--space-sm);
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .legend-text {
          display: flex;
          flex-direction: column;
        }

        .legend-name {
          font-size: 12px;
          font-weight: 600;
        }

        .legend-desc {
          font-size: 11px;
          opacity: 0.7;
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
        }

        .node-type {
          margin-bottom: var(--space-lg);
        }

        .type-badge {
          background: var(--color-brand-blue);
          color: var(--color-white);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .knowledge-meter {
          margin-bottom: var(--space-lg);
        }

        .knowledge-meter label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: var(--space-sm);
          color: var(--color-ink);
        }

        .meter-bar {
          background: var(--color-gray-lighter);
          border-radius: 10px;
          height: 8px;
          overflow: hidden;
          margin-bottom: var(--space-xs);
        }

        .meter-fill {
          background: var(--color-brand-green);
          height: 100%;
          border-radius: 10px;
          transition: width 0.3s ease;
        }

        .meter-value {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-ink-light);
        }

        .node-connections h4 {
          font-size: 16px;
          margin-bottom: var(--space-md);
          color: var(--color-ink);
        }

        .node-connections ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .node-connections li {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-sm);
          font-size: 14px;
        }

        .flow-direction {
          font-weight: bold;
          color: var(--color-brand-blue);
        }

        .flow-type {
          color: var(--color-ink);
          flex: 1;
        }

        .flow-strength {
          color: var(--color-ink-light);
          font-size: 12px;
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

        .flow-stats {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: var(--space-md);
          margin-top: var(--space-xl);
        }

        .stat {
          text-align: center;
          padding: var(--space-md);
          background: var(--color-gray-lighter);
          border-radius: 8px;
        }

        .stat-value {
          display: block;
          font-size: 24px;
          font-weight: 700;
          color: var(--color-brand-blue);
          margin-bottom: var(--space-xs);
        }

        .stat-label {
          font-size: 12px;
          color: var(--color-ink-light);
          text-transform: uppercase;
          font-weight: 600;
        }

        .explanation-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-xl);
        }

        .explanation-item {
          background: var(--color-white);
          border: 1px solid var(--color-gray-light);
          border-radius: 12px;
          padding: var(--space-xl);
          text-align: center;
        }

        .explanation-icon {
          font-size: 48px;
          margin-bottom: var(--space-lg);
        }

        .explanation-item h4 {
          font-size: 18px;
          margin-bottom: var(--space-md);
          color: var(--color-ink);
        }

        .explanation-item p {
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

          .viz-controls, .flow-legend {
            position: relative;
            top: auto;
            left: auto;
            bottom: auto;
            background: var(--color-white);
            color: var(--color-ink);
            margin-top: var(--space-lg);
          }

          .flow-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}