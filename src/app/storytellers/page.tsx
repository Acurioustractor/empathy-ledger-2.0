'use client';

import React from 'react';
import Link from 'next/link';
// import StorytellerCardsClean from '@/components/cms/StorytellerCardsClean';

export default function StorytellersPage() {
  return (
    <div className="storytellers-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">COMMUNITY STORYTELLERS</div>
            <h1 className="hero-title">Voices of Courage</h1>
            <p className="hero-description">
              Meet the brave individuals who have chosen to share their experiences with dignity, 
              maintaining complete control over their narrative and privacy.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Philosophy Section */}
      <section className="privacy-section">
        <div className="privacy-container">
          <div className="privacy-card">
            <div className="privacy-header">
              <div className="privacy-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2>Our Privacy Promise</h2>
            </div>
            
            <p className="privacy-intro">
              Every storyteller you see here has made <strong>informed choices</strong> about what they share. 
              This isn't just about data protection—it's about <strong>dignity, consent, and empowerment</strong>.
            </p>
            
            <div className="principles-grid">
              <div className="principle-card">
                <h3>🔐 Complete Control</h3>
                <p>Storytellers choose exactly what appears: their photo, location, organization, and story details.</p>
              </div>
              
              <div className="principle-card">
                <h3>✋ Informed Consent</h3>
                <p>Every person understands how their information will be displayed and has actively chosen to participate.</p>
              </div>
              
              <div className="principle-card">
                <h3>🔄 Always Changeable</h3>
                <p>Privacy preferences can be updated anytime. Storytellers can modify or remove their story entirely.</p>
              </div>
              
              <div className="principle-card">
                <h3>🎯 Purpose-Driven</h3>
                <p>Stories are shared to reduce isolation, build understanding, and help others feel less alone.</p>
              </div>
            </div>
            
            <div className="privacy-note">
              <p>
                <strong>This represents our commitment:</strong> Technology should amplify human dignity, not exploit it. 
                Every story here is a gift freely given to help others.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real Storytellers */}
      <section className="storytellers-section">
        <div className="storytellers-container">
          {/* <StorytellerCardsClean 
            title="Community Storytellers"
            subtitle="Real voices, authentic experiences, shared with purpose"
            limit={12}
          /> */}
          <div className="text-center p-8 bg-gray-100 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Storytellers</h3>
            <p className="text-gray-600 mb-4">Storyteller profiles coming soon!</p>
            <Link href="/stories" className="text-blue-600 hover:text-blue-700 font-medium">
              Browse Stories →
            </Link>
          </div>
        </div>
      </section>

      {/* For Storytellers Section */}
      <section className="controls-section">
        <div className="controls-container">
          <div className="controls-content">
            <h2>For Current & Future Storytellers</h2>
            <p className="controls-description">
              Your privacy and dignity are non-negotiable. Here's how we protect both.
            </p>
            
            <div className="controls-grid">
              <div className="control-group">
                <h3>What You Control</h3>
                <div className="control-items">
                  <div className="control-item">
                    <span className="control-emoji">📸</span>
                    <div className="control-text">
                      <strong>Your Photo</strong>
                      <p>Choose to show your image or use an initial-based placeholder</p>
                    </div>
                  </div>
                  
                  <div className="control-item">
                    <span className="control-emoji">📍</span>
                    <div className="control-text">
                      <strong>Your Location</strong>
                      <p>Show your city/region or keep location completely private</p>
                    </div>
                  </div>
                  
                  <div className="control-item">
                    <span className="control-emoji">🏢</span>
                    <div className="control-text">
                      <strong>Your Organization</strong>
                      <p>Display your community/workplace affiliation or keep it hidden</p>
                    </div>
                  </div>
                  
                  <div className="control-item">
                    <span className="control-emoji">💬</span>
                    <div className="control-text">
                      <strong>Your Story Elements</strong>
                      <p>Choose which themes and quotes from your story are highlighted</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="guarantee-card">
                <h3>Our Guarantee</h3>
                <ul className="guarantee-list">
                  <li>✅ No story is public without your explicit consent</li>
                  <li>✅ You can change privacy settings anytime</li>
                  <li>✅ You can remove your story completely anytime</li>
                  <li>✅ No personal information is shared with third parties</li>
                  <li>✅ All changes take effect immediately</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Impact */}
      <section className="impact-section">
        <div className="impact-container">
          <div className="impact-header">
            <h2>The Power of Authentic Stories</h2>
            <p>When people choose to share with dignity and purpose</p>
          </div>

          <div className="impact-grid">
            <div className="impact-card">
              <div className="impact-emoji">🤝</div>
              <h3>Connection</h3>
              <p>Stories create bridges between different experiences, showing our shared humanity.</p>
            </div>
            
            <div className="impact-card">
              <div className="impact-emoji">💡</div>
              <h3>Understanding</h3>
              <p>Each voice adds perspective, helping us see challenges and solutions from new angles.</p>
            </div>
            
            <div className="impact-card">
              <div className="impact-emoji">🌱</div>
              <h3>Healing</h3>
              <p>Sharing and witnessing authentic experiences can be transformative for all involved.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2>Your Story Matters</h2>
            <p>Join a community where privacy, dignity, and authentic connection come together</p>
            <div className="cta-buttons">
              <Link href="/submit" className="btn btn-primary">
                Share Your Story
              </Link>
              <Link href="/privacy" className="btn btn-secondary">
                Privacy Details
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .storytellers-page {
          min-height: 100vh;
        }

        /* Hero Section */
        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 6rem 0 4rem 0;
          text-align: center;
        }

        .hero-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-badge {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.5rem 1.5rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-bottom: 2rem;
          display: inline-block;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .hero-description {
          font-size: 1.3rem;
          line-height: 1.6;
          margin: 0;
          color: rgba(255, 255, 255, 0.95);
        }

        /* Privacy Section */
        .privacy-section {
          background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%);
          padding: 4rem 0;
        }

        .privacy-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .privacy-card {
          background: white;
          padding: 3rem;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.1);
        }

        .privacy-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .privacy-icon {
          color: #6366f1;
          margin-bottom: 1rem;
        }

        .privacy-icon svg {
          width: 3rem;
          height: 3rem;
        }

        .privacy-header h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0;
          color: #1e293b;
        }

        .privacy-intro {
          font-size: 1.2rem;
          text-align: center;
          margin-bottom: 3rem;
          color: #475569;
          line-height: 1.6;
        }

        .principles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .principle-card {
          padding: 1.5rem;
          background: #f8faff;
          border-radius: 12px;
          border-left: 4px solid #6366f1;
        }

        .principle-card h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #1e293b;
        }

        .principle-card p {
          color: #64748b;
          line-height: 1.5;
          margin: 0;
        }

        .privacy-note {
          background: #fef3c7;
          padding: 1.5rem;
          border-radius: 12px;
          border-left: 4px solid #f59e0b;
          text-align: center;
        }

        .privacy-note p {
          margin: 0;
          color: #92400e;
          font-weight: 500;
        }

        /* Storytellers Section */
        .storytellers-section {
          padding: 4rem 0;
        }

        .storytellers-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        /* Controls Section */
        .controls-section {
          background: #fafafa;
          padding: 4rem 0;
        }

        .controls-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .controls-content {
          text-align: center;
        }

        .controls-content h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: #1e293b;
        }

        .controls-description {
          font-size: 1.2rem;
          color: #64748b;
          margin-bottom: 3rem;
        }

        .controls-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          text-align: left;
        }

        .control-group h3 {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: #1e293b;
        }

        .control-items {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .control-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .control-emoji {
          font-size: 1.5rem;
          margin-top: 0.25rem;
        }

        .control-text strong {
          display: block;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .control-text p {
          color: #64748b;
          margin: 0;
          font-size: 0.9rem;
        }

        .guarantee-card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        }

        .guarantee-card h3 {
          color: #059669;
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }

        .guarantee-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .guarantee-list li {
          padding: 0.5rem 0;
          color: #374151;
          border-bottom: 1px solid #f3f4f6;
        }

        .guarantee-list li:last-child {
          border-bottom: none;
        }

        /* Impact Section */
        .impact-section {
          padding: 4rem 0;
        }

        .impact-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .impact-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .impact-header h2 {
          font-size: 2.5rem;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .impact-header p {
          color: #64748b;
          font-size: 1.1rem;
        }

        .impact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .impact-card {
          text-align: center;
          padding: 2rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
        }

        .impact-emoji {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .impact-card h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #1e293b;
        }

        .impact-card p {
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }

        /* CTA Section */
        .cta-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 4rem 0;
          text-align: center;
        }

        .cta-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .cta-content h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .cta-content p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          color: rgba(255, 255, 255, 0.95);
        }

        .cta-buttons {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .btn {
          padding: 1rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .btn-primary {
          background: white;
          color: #6366f1;
          border-color: white;
        }

        .btn-primary:hover {
          background: #f8faff;
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: transparent;
          color: white;
          border-color: white;
        }

        .btn-secondary:hover {
          background: white;
          color: #6366f1;
          transform: translateY(-2px);
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .hero-description {
            font-size: 1.1rem;
          }
          
          .privacy-card {
            padding: 2rem;
          }
          
          .principles-grid {
            grid-template-columns: 1fr;
          }
          
          .controls-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          
          .impact-grid {
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