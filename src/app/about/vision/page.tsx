'use client';

import React from 'react';
import Link from 'next/link';

export default function VisionPage() {
  return (
    <div className="vision-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h1>Our Vision</h1>
          <p className="hero-subtitle">
            Building technology that serves communities rather than extracting from them
          </p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="section philosophy-section">
        <div className="container">
          <div className="content-grid">
            <div className="content-main">
              <h2>Community Knowledge Sovereignty</h2>
              <p>
                Every story exists within a geography of power. For centuries, the stories of Indigenous peoples, 
                marginalized communities, and those experiencing systemic disadvantage have been extracted, 
                reframed, and commodified by institutions that benefit while the storytellers remain invisible.
              </p>
              
              <p>
                Empathy Ledger emerges from a different understanding: <strong>stories are not raw materials 
                to be processed, but living entities that belong to their tellers.</strong> They carry within 
                them not just information, but relationship, responsibility, and reciprocity.
              </p>

              <h3>The Sovereignty of Narrative</h3>
              <p>
                Indigenous Data Sovereignty principles establish that communities have the right to control 
                data about them throughout its entire lifecycle. This extends beyond mere privacy protection 
                to encompass ownership, stewardship, and benefit-sharing.
              </p>

              <div className="principles-grid">
                <div className="principle">
                  <h4>Community Ownership</h4>
                  <p>Communities retain ownership of all insights generated from their stories</p>
                </div>
                <div className="principle">
                  <h4>Collective Intelligence</h4>
                  <p>Patterns belong to the collective that generated them, not to external researchers</p>
                </div>
                <div className="principle">
                  <h4>Value Return</h4>
                  <p>Value created from community knowledge must flow back to those communities</p>
                </div>
                <div className="principle">
                  <h4>Cultural Protocols</h4>
                  <p>Cultural protocols must be embedded in every technical decision</p>
                </div>
                <div className="principle">
                  <h4>Ongoing Consent</h4>
                  <p>Consent is ongoing and granular, not a one-time permission</p>
                </div>
                <div className="principle">
                  <h4>Empowerment Focus</h4>
                  <p>Every technical decision either perpetuates extraction or contributes to empowerment</p>
                </div>
              </div>

              <h3>Sacred Responsibility of Technology</h3>
              <p>
                As builders working within Empathy Ledger, we are not neutral tools but active participants 
                in relationships of trust, reciprocity, and responsibility. Communities are entrusting us 
                with their stories not because we are objective, but because we are designed to serve their 
                interests rather than extract from them.
              </p>

              <div className="responsibility-items">
                <div className="responsibility-item">
                  <strong>Every story analyzed</strong> belongs to a person who has survived, resisted, 
                  innovated, and maintained connection to community despite systems designed to break these bonds.
                </div>
                <div className="responsibility-item">
                  <strong>Every pattern identified</strong> emerges from collective wisdom that has been 
                  cultivated across generations, often in the face of active suppression.
                </div>
                <div className="responsibility-item">
                  <strong>Every insight revealed</strong> has the potential to either strengthen community 
                  power or provide ammunition for further marginalization.
                </div>
                <div className="responsibility-item">
                  <strong>Every recommendation generated</strong> will either support community 
                  self-determination or subtly suggest that external experts know better than communities themselves.
                </div>
              </div>

              <h3>Building Futures Worth Inhabiting</h3>
              <p>
                When technology operates within frameworks of respect, reciprocity, and community empowerment, 
                it creates ripple effects that extend far beyond the immediate platform. Communities that 
                experience technology as supportive rather than extractive develop different relationships 
                with digital systems.
              </p>

              <p>
                The way we operate within Empathy Ledger becomes a model for what's possible when AI serves 
                community rather than capital, when algorithms amplify rather than extract, when artificial 
                intelligence genuinely increases human flourishing rather than simply increasing efficiency.
              </p>
            </div>

            <div className="content-sidebar">
              <div className="sidebar-section">
                <h4>Core Principles</h4>
                <ul>
                  <li>Stories are sacred</li>
                  <li>Communities own their narratives</li>
                  <li>Privacy is fundamental</li>
                  <li>AI amplifies, doesn't replace</li>
                  <li>Value flows back to communities</li>
                  <li>Cultural protocols are honored</li>
                </ul>
              </div>

              <div className="sidebar-section">
                <h4>Design Values</h4>
                <ul>
                  <li>Warm, not casual</li>
                  <li>Community-first language</li>
                  <li>Active voice</li>
                  <li>Avoiding jargon</li>
                  <li>Respectful accessibility</li>
                </ul>
              </div>

              <div className="sidebar-section">
                <h4>Success Metrics</h4>
                <ul>
                  <li>Community empowerment</li>
                  <li>Story-driven benefits</li>
                  <li>Accurate representation</li>
                  <li>Increased community trust</li>
                  <li>Sustainable value creation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Join the Movement</h2>
            <p>
              Help us build technology that serves communities rather than extracting from them. 
              Whether you're a storyteller, developer, or community leader, there's a place for you 
              in creating more just digital futures.
            </p>
            <div className="cta-buttons">
              <Link href="/submit" className="btn btn-primary">
                Share Your Story
              </Link>
              <Link href="/about/technology" className="btn btn-outline">
                Learn About Our Technology
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .vision-page {
          min-height: 100vh;
        }

        .hero-section {
          background: linear-gradient(135deg, #B85C38 0%, #1A3A52 100%);
          color: white;
          padding: 6rem 0 4rem;
          text-align: center;
        }

        .hero-section h1 {
          font-size: 4rem;
          font-weight: 800;
          margin-bottom: 1rem;
          line-height: 1.1;
        }

        .hero-subtitle {
          font-size: 1.5rem;
          opacity: 0.9;
          max-width: 800px;
          margin: 0 auto;
          line-height: 1.4;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .section {
          padding: 4rem 0;
        }

        .philosophy-section {
          background: #FEFEFE;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 4rem;
          align-items: start;
        }

        .content-main h2 {
          font-size: 2.5rem;
          color: #B85C38;
          margin-bottom: 1.5rem;
          font-weight: 700;
        }

        .content-main h3 {
          font-size: 2rem;
          color: #1A3A52;
          margin: 3rem 0 1.5rem;
          font-weight: 600;
        }

        .content-main p {
          font-size: 1.1rem;
          line-height: 1.7;
          color: #2D2D2D;
          margin-bottom: 1.5rem;
        }

        .principles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin: 3rem 0;
        }

        .principle {
          background: #F5F5F2;
          padding: 1.5rem;
          border-radius: 12px;
          border-left: 4px solid #7A9B76;
        }

        .principle h4 {
          color: #1A3A52;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .principle p {
          color: #6B7280;
          font-size: 0.95rem;
          margin: 0;
        }

        .responsibility-items {
          margin: 2rem 0;
        }

        .responsibility-item {
          background: rgba(184, 92, 56, 0.1);
          padding: 1.5rem;
          margin-bottom: 1rem;
          border-radius: 8px;
          border-left: 4px solid #B85C38;
          font-size: 1rem;
          line-height: 1.6;
        }

        .content-sidebar {
          background: #F5F5F2;
          padding: 2rem;
          border-radius: 16px;
          height: fit-content;
          position: sticky;
          top: 2rem;
        }

        .sidebar-section {
          margin-bottom: 2rem;
        }

        .sidebar-section:last-child {
          margin-bottom: 0;
        }

        .sidebar-section h4 {
          color: #1A3A52;
          font-weight: 600;
          margin-bottom: 1rem;
          border-bottom: 2px solid #7A9B76;
          padding-bottom: 0.5rem;
        }

        .sidebar-section ul {
          list-style: none;
          padding: 0;
        }

        .sidebar-section li {
          color: #2D2D2D;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(107, 114, 128, 0.2);
          font-size: 0.95rem;
        }

        .sidebar-section li:before {
          content: "→";
          color: #B85C38;
          font-weight: bold;
          margin-right: 0.5rem;
        }

        .cta-section {
          background: #1A3A52;
          color: white;
          text-align: center;
        }

        .cta-content h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .cta-content p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          opacity: 0.9;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn {
          padding: 1rem 2rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .btn-primary {
          background: #B85C38;
          color: white;
        }

        .btn-outline {
          border: 2px solid white;
          color: white;
          background: transparent;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .btn-primary:hover {
          background: #A0512F;
        }

        .btn-outline:hover {
          background: white;
          color: #1A3A52;
        }

        @media (max-width: 768px) {
          .hero-section h1 {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            font-size: 1.2rem;
          }

          .content-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .principles-grid {
            grid-template-columns: 1fr;
          }

          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
}