/**
 * STORYTELLER ADMIN DASHBOARD
 * Self-service profile and story management
 */

import { createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import styles from './admin.module.css';

interface Props {
  params: { id: string };
}

export default async function StorytellerAdminPage({ params }: Props) {
  const supabase = await createAdminClient();
  
  // Get storyteller data
  const { data: storyteller } = await supabase
    .from('storytellers')
    .select(`
      *,
      stories(id, title, content, privacy_level, created_at),
      transcript_analysis(themes_identified, key_quotes, confidence_score)
    `)
    .eq('id', params.id)
    .single();

  if (!storyteller) {
    redirect('/storytellers');
  }

  return (
    <div className={styles.storytellerAdmin}>
      <div className={styles.adminHeader}>
        <h1>Welcome back, {storyteller.full_name}</h1>
        <p>Manage your storyteller profile and content</p>
      </div>

      <div className={styles.adminGrid}>
        {/* Profile Management */}
        <section className={styles.adminCard}>
          <h2>📝 Profile Information</h2>
          <div className={styles.profilePreview}>
            <img src={storyteller.profile_image_url} alt={storyteller.full_name} />
            <div>
              <h3>{storyteller.full_name}</h3>
              <p>{storyteller.role}</p>
              <p>{storyteller.bio}</p>
            </div>
          </div>
          <button className={styles.btnPrimary}>Edit Profile</button>
        </section>

        {/* Story Management */}
        <section className={styles.adminCard}>
          <h2>📚 Your Stories ({storyteller.stories?.length || 0})</h2>
          <div className="stories-list">
            {storyteller.stories?.map(story => (
              <div key={story.id} className={styles.storyItem}>
                <h4>{story.title}</h4>
                <p>Privacy: {story.privacy_level}</p>
                <p>Created: {new Date(story.created_at).toLocaleDateString()}</p>
                <div className={styles.storyActions}>
                  <button>Edit</button>
                  <button>Preview</button>
                  <button>Privacy</button>
                </div>
              </div>
            ))}
          </div>
          <button className={styles.btnPrimary}>+ Add New Story</button>
        </section>

        {/* Privacy Controls */}
        <section className={styles.adminCard}>
          <h2>🔒 Privacy & Data Control</h2>
          <div className="privacy-settings">
            <div className={styles.settingItem}>
              <input type="checkbox" id="public-profile" defaultChecked />
              <label htmlFor="public-profile">Public profile visible</label>
            </div>
            <div className={styles.settingItem}>
              <input type="checkbox" id="story-sharing" defaultChecked />
              <label htmlFor="story-sharing">Stories can be shared</label>
            </div>
            <div className={styles.settingItem}>
              <input type="checkbox" id="quote-sharing" defaultChecked />
              <label htmlFor="quote-sharing">Quotes can be featured</label>
            </div>
          </div>
          <button className={styles.btnSecondary}>Download My Data</button>
        </section>

        {/* AI Analysis */}
        <section className={styles.adminCard}>
          <h2>🤖 Story Analysis</h2>
          {storyteller.transcript_analysis?.map(analysis => (
            <div key={analysis.id} className="analysis-preview">
              <p><strong>Themes:</strong> {analysis.themes_identified?.length || 0} identified</p>
              <p><strong>Key Quotes:</strong> {analysis.key_quotes?.length || 0} extracted</p>
              <p><strong>Confidence:</strong> {Math.round((analysis.confidence_score || 0) * 100)}%</p>
            </div>
          ))}
          <button className={styles.btnSecondary}>View Full Analysis</button>
        </section>

        {/* Quick Actions */}
        <section className={styles.adminCard}>
          <h2>⚡ Quick Actions</h2>
          <div className={styles.quickActions}>
            <button className={styles.actionBtn}>
              📖 Create New Story
            </button>
            <button className={styles.actionBtn}>
              🎤 Upload Audio/Video
            </button>
            <button className={styles.actionBtn}>
              🔗 Share Profile Link
            </button>
            <button className={styles.actionBtn}>
              📊 View Community Impact
            </button>
          </div>
        </section>

        {/* Community Engagement */}
        <section className={styles.adminCard}>
          <h2>💬 Community Engagement</h2>
          <div className={styles.engagementStats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>0</span>
              <span className={styles.statLabel}>Story Views</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>0</span>
              <span className={styles.statLabel}>Comments</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>0</span>
              <span className={styles.statLabel}>Reactions</span>
            </div>
          </div>
        </section>
      </div>

    </div>
  );
}