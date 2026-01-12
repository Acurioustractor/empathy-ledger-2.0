'use client';

import React, { useEffect, useRef } from 'react';

interface Node {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  label?: string;
}

interface Connection {
  from: number;
  to: number;
}

export default function StoryConstellation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const nodesRef = useRef<Node[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

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

    // Initialize nodes
    const nodeCount = 15;
    const nodes: Node[] = [];
    const connections: Connection[] = [];

    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 120 + Math.random() * 80;
      const x = canvas.offsetWidth / 2 + Math.cos(angle) * radius;
      const y = canvas.offsetHeight / 2 + Math.sin(angle) * radius;
      
      nodes.push({
        id: i,
        x,
        y,
        size: Math.random() * 4 + 3,
        color: ['#dc2626', '#2563eb', '#16a34a'][Math.floor(Math.random() * 3)]
      });
    }

    // Create connections
    for (let i = 0; i < nodeCount; i++) {
      const connectTo = Math.floor(Math.random() * nodeCount);
      if (connectTo !== i && Math.random() > 0.5) {
        connections.push({ from: i, to: connectTo });
      }
    }

    nodesRef.current = nodes;
    connectionsRef.current = connections;

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    let time = 0;
    const animate = () => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Update node positions (gentle floating)
      nodes.forEach((node, i) => {
        node.x += Math.sin(time * 0.001 + i) * 0.2;
        node.y += Math.cos(time * 0.001 + i * 1.5) * 0.2;
      });

      // Draw connections
      ctx.strokeStyle = 'rgba(229, 229, 229, 0.5)';
      ctx.lineWidth = 1;
      connections.forEach(conn => {
        const from = nodes[conn.from];
        const to = nodes[conn.to];
        
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach(node => {
        // Calculate distance to mouse
        const dx = mouseRef.current.x - node.x;
        const dy = mouseRef.current.y - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const scale = distance < 100 ? 1 + (100 - distance) / 100 : 1;

        // Draw node
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * scale, 0, Math.PI * 2);
        ctx.fill();

        // Draw glow on hover
        if (distance < 50) {
          ctx.fillStyle = node.color + '20';
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.size * scale * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw pulse effects
      const pulseRadius = 20 + Math.sin(time * 0.002) * 10;
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(nodes[0].x, nodes[0].y, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();

      time += 16;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="constellation-canvas"
      style={{ width: '100%', height: '400px' }}
    />
  );
}