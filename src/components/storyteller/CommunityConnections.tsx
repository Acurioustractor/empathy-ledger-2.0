'use client';

import React from 'react';
import Link from 'next/link';
import styles from './CommunityConnections.module.css';

interface CommunityConnectionsProps {
  storyteller: any;
  themes: string[];
  location: string;
  organization: string;
}

export default function CommunityConnections({ 
  storyteller, 
  themes, 
  location, 
  organization 
}: CommunityConnectionsProps) {
  // Mock similar storytellers data
  const similarStorytellers = [
    {
      id: '2',
      name: 'Sarah Chen',
      sharedThemes: themes.slice(0, 2),
      location: location,
      profileImage: null
    },
    {
      id: '3', 
      name: 'Michael Torres',
      sharedThemes: themes.slice(1, 3),
      location: 'Melbourne, VIC',
      profileImage: null
    },
    {
      id: '4',
      name: 'Emma Wilson', 
      sharedThemes: themes.slice(0, 1),
      location: location,
      profileImage: null
    }
  ];

  const communityStats = {
    localStorytellers: 12,
    organizationMembers: 8,
    sharedThemes: themes.length,
    totalCommunity: 847
  };

  return (
    <section className={styles.communitySection}>
      <div className={styles.container}>
        <div className={styles.communityHeader}>
          <h2>Community Connections</h2>
          <p>Discover shared stories and themes within our community</p>
        </div>

        <div className={styles.communityGrid}>
          <div className={styles.connectionCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>🌏</div>
              <h3>Location Community</h3>
            </div>
            
            <div className={styles.locationInfo}>
              <div className={styles.locationName}>{location}</div>
              <div className={styles.locationStats}>
                <span>{communityStats.localStorytellers} storytellers in your area</span>
                <span>Part of the broader Australian narrative</span>
              </div>
            </div>
            
            <div className={styles.cardActions}>
              <Link href={`/storytellers?location=${encodeURIComponent(location)}`} className={styles.actionLink}>
                Browse Local Stories →
              </Link>
            </div>
          </div>

          <div className={styles.connectionCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>🏢</div>
              <h3>Organization Network</h3>
            </div>
            
            <div className={styles.organizationInfo}>
              <div className={styles.organizationName}>{organization}</div>
              <div className={styles.organizationStats}>
                <span>{communityStats.organizationMembers} members sharing stories</span>
                <span>Connected through shared purpose</span>
              </div>
            </div>
            
            <div className={styles.cardActions}>
              <Link href={`/storytellers?organization=${encodeURIComponent(organization)}`} className={styles.actionLink}>
                View Organization Stories →
              </Link>
            </div>
          </div>

          <div className={styles.connectionCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>🎯</div>
              <h3>Shared Themes</h3>
            </div>
            
            <div className={styles.themesInfo}>
              <div className={styles.themesGrid}>
                {themes.slice(0, 4).map((theme, index) => (
                  <Link 
                    key={index} 
                    href={`/stories?theme=${encodeURIComponent(theme)}`}
                    className={styles.themeLink}
                  >
                    {theme}
                  </Link>
                ))}
              </div>
              <div className={styles.themesStats}>
                <span>{communityStats.sharedThemes} themes explored</span>
                <span>Connect through common experiences</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.similarStorytellers}>
          <h3>Similar Storytellers</h3>
          <p>Others sharing related themes and experiences</p>
          
          <div className={styles.storytellersGrid}>
            {similarStorytellers.map((similar) => (
              <Link key={similar.id} href={`/storytellers/${similar.id}`} className={styles.storytellerCard}>
                <div className={styles.storytellerAvatar}>
                  {similar.profileImage ? (
                    <img src={similar.profileImage} alt={similar.name} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {similar.name.charAt(0)}
                    </div>
                  )}
                </div>
                
                <div className={styles.storytellerInfo}>
                  <h4>{similar.name}</h4>
                  <div className={styles.storytellerLocation}>{similar.location}</div>
                  
                  <div className={styles.sharedThemes}>
                    <span className={styles.themesLabel}>Shared themes:</span>
                    <div className={styles.themesList}>
                      {similar.sharedThemes.map((theme, index) => (
                        <span key={index} className={styles.themeTag}>{theme}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.communityStats}>
          <h3>Community Impact</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{communityStats.totalCommunity}</div>
              <div className={styles.statLabel}>Total Community Members</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{communityStats.localStorytellers}</div>
              <div className={styles.statLabel}>Local Storytellers</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{communityStats.sharedThemes}</div>
              <div className={styles.statLabel}>Connected Themes</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}