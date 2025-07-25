'use client';

import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-brand">
              <h3>Empathy Ledger</h3>
              <p>Community-owned storytelling platform where narratives remain with storytellers and communities control their cultural data.</p>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Platform</h4>
            <ul>
              <li><Link href="/simple-stories">Explore Stories</Link></li>
              <li><Link href="/submit">Share Your Story</Link></li>
              <li><Link href="/how-it-works">How It Works</Link></li>
              <li><Link href="/community-gallery">Community Gallery</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Community</h4>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/case-studies">Case Studies</Link></li>
              <li><Link href="/organisation">For Organizations</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Resources</h4>
            <ul>
              <li><Link href="/wiki">Documentation Wiki</Link></li>
              <li><Link href="/trust-security">Trust & Security</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/modules">Platform Modules</Link></li>
              <li><Link href="/visualisations">Data Insights</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2024 Empathy Ledger. Platform owned by the communities it serves.</p>
            <div className="footer-values">
              <span className="value-badge">Community Sovereignty</span>
              <span className="value-badge">Data Justice</span>
              <span className="value-badge">Ethical Technology</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;