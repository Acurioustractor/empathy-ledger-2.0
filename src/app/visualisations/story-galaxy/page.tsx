'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import * as THREE from 'three';

export default function StoryGalaxyPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [currentView, setCurrentView] = useState('overview');

  // Demo data for story points
  const storyData = [
    { id: 1, theme: 'Healthcare', x: 5, y: 2, z: -3, size: 0.8, color: '#3b82f6', title: 'Mental Health Journey', excerpt: 'Finding support through community connections...' },
    { id: 2, theme: 'Education', x: -2, y: 4, z: 1, size: 1.2, color: '#ef4444', title: 'School Access Challenges', excerpt: 'Overcoming barriers to quality education...' },
    { id: 3, theme: 'Housing', x: 0, y: -3, z: 4, size: 0.9, color: '#22c55e', title: 'Community Housing Initiative', excerpt: 'Building affordable homes together...' },
    { id: 4, theme: 'Employment', x: -4, y: 1, z: -2, size: 1.1, color: '#f59e0b', title: 'Skills Development Program', excerpt: 'Creating pathways to meaningful work...' },
    { id: 5, theme: 'Healthcare', x: 3, y: -1, z: 3, size: 0.7, color: '#3b82f6', title: 'Preventive Health Campaign', excerpt: 'Community-led wellness initiatives...' },
    { id: 6, theme: 'Youth', x: -1, y: 3, z: -4, size: 1.0, color: '#8b5cf6', title: 'Youth Leadership Program', excerpt: 'Empowering young community leaders...' },
    { id: 7, theme: 'Elderly', x: 2, y: -2, z: 0, size: 0.9, color: '#ec4899', title: 'Elder Care Network', excerpt: 'Supporting our community elders...' },
    { id: 8, theme: 'Environment', x: -3, y: 0, z: 2, size: 1.3, color: '#10b981', title: 'Sustainable Community Garden', excerpt: 'Growing food and connections...' }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 10);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Create star background
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1000;
    const starPositions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 200;
      starPositions[i + 1] = (Math.random() - 0.5) * 200;
      starPositions[i + 2] = (Math.random() - 0.5) * 200;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Create story points
    const storyPoints: THREE.Mesh[] = [];
    storyData.forEach((story) => {
      const geometry = new THREE.SphereGeometry(story.size, 16, 16);
      const material = new THREE.MeshBasicMaterial({ 
        color: story.color,
        transparent: true,
        opacity: 0.8
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(story.x, story.y, story.z);
      mesh.userData = story;
      
      // Add glow effect
      const glowGeometry = new THREE.SphereGeometry(story.size * 1.5, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: story.color,
        transparent: true,
        opacity: 0.1
      });
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      glowMesh.position.copy(mesh.position);
      
      scene.add(mesh);
      scene.add(glowMesh);
      storyPoints.push(mesh);
    });

    // Create connections between related stories
    const connectionMaterial = new THREE.LineBasicMaterial({ 
      color: 0x4a90e2, 
      transparent: true, 
      opacity: 0.3 
    });
    
    // Connect stories of the same theme
    const connections = new THREE.Group();
    storyData.forEach((story1, i) => {
      storyData.forEach((story2, j) => {
        if (i < j && story1.theme === story2.theme) {
          const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(story1.x, story1.y, story1.z),
            new THREE.Vector3(story2.x, story2.y, story2.z)
          ]);
          const line = new THREE.Line(geometry, connectionMaterial);
          connections.add(line);
        }
      });
    });
    scene.add(connections);

    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(storyPoints);

      if (intersects.length > 0) {
        const selectedObject = intersects[0].object;
        setSelectedStory(selectedObject.userData);
      } else {
        setSelectedStory(null);
      }
    };

    renderer.domElement.addEventListener('click', handleMouseClick);

    // Store refs
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      if (isRotating) {
        scene.rotation.y += 0.005;
      }
      
      // Animate story points
      storyPoints.forEach((point, index) => {
        point.rotation.x += 0.01;
        point.rotation.y += 0.01;
        
        // Pulsing effect
        const scale = 1 + Math.sin(Date.now() * 0.005 + index) * 0.1;
        point.scale.setScalar(scale);
      });
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleMouseClick);
      cancelAnimationFrame(animationId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isRotating]);

  const themes = ['All', 'Healthcare', 'Education', 'Housing', 'Employment', 'Youth', 'Elderly', 'Environment'];

  return (
    <div>
      {/* Header */}
      <section className="viz-header">
        <div className="container">
          <Link href="/visualisations" className="back-link">
            ← Back to Visualisations
          </Link>
          
          <div className="viz-title-section">
            <div className="viz-icon-large">🌌</div>
            <div>
              <h1>Story Galaxy</h1>
              <p>Interactive 3D exploration of community stories and their connections</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Visualisation */}
      <section className="viz-interactive">
        <div className="container">
          <div className="viz-container">
            <div className="viz-canvas-wrapper">
              <div ref={mountRef} className="viz-canvas" />
              
              {/* Controls */}
              <div className="viz-controls">
                <div className="control-group">
                  <label>View:</label>
                  <select 
                    value={currentView} 
                    onChange={(e) => setCurrentView(e.target.value)}
                    className="control-select"
                  >
                    <option value="overview">Overview</option>
                    <option value="themes">By Theme</option>
                    <option value="connections">Connections</option>
                    <option value="impact">Impact Size</option>
                  </select>
                </div>
                
                <div className="control-group">
                  <label>Filter:</label>
                  <select className="control-select">
                    {themes.map(theme => (
                      <option key={theme} value={theme}>{theme}</option>
                    ))}
                  </select>
                </div>
                
                <button 
                  onClick={() => setIsRotating(!isRotating)}
                  className={`control-btn ${isRotating ? 'active' : ''}`}
                >
                  {isRotating ? '⏸️' : '▶️'} Rotation
                </button>
              </div>

              {/* Legend */}
              <div className="viz-legend">
                <h4>Story Themes</h4>
                <div className="legend-items">
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#3b82f6' }}></div>
                    <span>Healthcare</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#ef4444' }}></div>
                    <span>Education</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#22c55e' }}></div>
                    <span>Housing</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
                    <span>Employment</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#8b5cf6' }}></div>
                    <span>Youth</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#ec4899' }}></div>
                    <span>Elderly</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#10b981' }}></div>
                    <span>Environment</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Story Detail Panel */}
            {selectedStory && (
              <div className="story-panel">
                <div className="story-panel-header">
                  <h3>{selectedStory.title}</h3>
                  <button 
                    onClick={() => setSelectedStory(null)}
                    className="close-btn"
                  >
                    ×
                  </button>
                </div>
                <div className="story-panel-content">
                  <div className="story-theme">
                    <span className="theme-tag" style={{ backgroundColor: selectedStory.color }}>
                      {selectedStory.theme}
                    </span>
                  </div>
                  <p>{selectedStory.excerpt}</p>
                  <div className="story-actions">
                    <button className="btn btn-primary btn-sm">Read Full Story</button>
                    <button className="btn btn-outline btn-sm">View Related</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Instructions */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>How to Navigate</h2>
            <p>Interactive controls for exploring the Story Galaxy</p>
          </div>

          <div className="instructions-grid">
            <div className="instruction-item">
              <div className="instruction-icon">🖱️</div>
              <h4>Click to Explore</h4>
              <p>Click on any story sphere to view details and connections</p>
            </div>
            <div className="instruction-item">
              <div className="instruction-icon">🎛️</div>
              <h4>Filter by Theme</h4>
              <p>Use the dropdown to focus on specific story categories</p>
            </div>
            <div className="instruction-item">
              <div className="instruction-icon">🔄</div>
              <h4>Rotate View</h4>
              <p>Toggle automatic rotation or manually explore different angles</p>
            </div>
            <div className="instruction-item">
              <div className="instruction-icon">🔍</div>
              <h4>Zoom Controls</h4>
              <p>Scroll to zoom in and out for detailed or overview perspectives</p>
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
          grid-template-columns: 1fr 300px;
          gap: var(--space-xl);
          height: 80vh;
        }

        .viz-canvas-wrapper {
          position: relative;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
        }

        .viz-canvas {
          width: 100%;
          height: 100%;
        }

        .viz-controls {
          position: absolute;
          top: var(--space-lg);
          left: var(--space-lg);
          background: rgba(0, 0, 0, 0.8);
          padding: var(--space-md);
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

        .control-select {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          padding: 4px 8px;
          color: var(--color-white);
          font-size: 14px;
        }

        .control-btn {
          background: var(--color-brand-blue);
          border: none;
          border-radius: 4px;
          padding: 6px 12px;
          color: var(--color-white);
          font-size: 12px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .control-btn.active {
          background: var(--color-brand-green);
        }

        .viz-legend {
          position: absolute;
          bottom: var(--space-lg);
          left: var(--space-lg);
          background: rgba(0, 0, 0, 0.8);
          padding: var(--space-md);
          border-radius: 8px;
          color: var(--color-white);
        }

        .viz-legend h4 {
          font-size: 14px;
          margin-bottom: var(--space-sm);
          font-weight: 600;
        }

        .legend-items {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .legend-item span {
          font-size: 12px;
        }

        .story-panel {
          background: var(--color-white);
          border-radius: 12px;
          padding: var(--space-xl);
          height: fit-content;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .story-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-lg);
        }

        .story-panel-header h3 {
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
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .story-theme {
          margin-bottom: var(--space-md);
        }

        .theme-tag {
          color: var(--color-white);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .story-panel-content p {
          color: var(--color-ink-light);
          line-height: 1.6;
          margin-bottom: var(--space-lg);
        }

        .story-actions {
          display: flex;
          gap: var(--space-sm);
        }

        .btn-sm {
          padding: 8px 16px;
          font-size: 14px;
        }

        .instructions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-xl);
        }

        .instruction-item {
          background: var(--color-white);
          border: 1px solid var(--color-gray-light);
          border-radius: 12px;
          padding: var(--space-xl);
          text-align: center;
        }

        .instruction-icon {
          font-size: 48px;
          margin-bottom: var(--space-lg);
        }

        .instruction-item h4 {
          font-size: 18px;
          margin-bottom: var(--space-md);
          color: var(--color-ink);
        }

        .instruction-item p {
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

          .viz-controls {
            position: relative;
            top: auto;
            left: auto;
            background: var(--color-white);
            color: var(--color-ink);
            margin-top: var(--space-lg);
          }

          .viz-legend {
            position: relative;
            bottom: auto;
            left: auto;
            background: var(--color-white);
            color: var(--color-ink);
            margin-top: var(--space-md);
          }
        }
      `}</style>
    </div>
  );
}