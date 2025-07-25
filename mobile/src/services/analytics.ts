import { trackOfflineEngagement } from './database';
import NetInfo from '@react-native-community/netinfo';

// Types
interface EngagementEvent {
  type: string;
  story_id?: string;
  storyteller_id?: string;
  data?: any;
  timestamp?: string;
  device_type?: string;
  context?: string;
}

interface ReadingAnalytics {
  story_id: string;
  reading_time_seconds: number;
  scroll_depth_percentage: number;
  highlights_count: number;
  audio_listened_percentage?: number;
  engagement_quality: 'low' | 'medium' | 'high' | 'deep';
  completion_status: 'started' | 'quarter' | 'half' | 'three_quarter' | 'completed';
}

interface CollaborationAnalytics {
  collaboration_type: 'mentorship' | 'referral' | 'collective_project';
  participants: string[];
  interaction_depth: 'initial' | 'ongoing' | 'deep' | 'concluded';
  cultural_protocol_adherence: boolean;
}

// Analytics service
class AnalyticsService {
  private isOnline: boolean = true;
  private eventQueue: EngagementEvent[] = [];
  
  constructor() {
    this.setupNetworkListener();
  }
  
  private setupNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      // Sync queued events when coming back online
      if (wasOffline && this.isOnline) {
        this.syncQueuedEvents();
      }
    });
  }
  
  private async syncQueuedEvents() {
    try {
      // In production, this would sync with server
      console.log(`Syncing ${this.eventQueue.length} queued analytics events`);
      
      for (const event of this.eventQueue) {
        await this.sendToServer(event);
      }
      
      this.eventQueue = [];
    } catch (error) {
      console.error('Error syncing analytics events:', error);
    }
  }
  
  private async sendToServer(event: EngagementEvent): Promise<void> {
    // In production, this would make API call to analytics endpoint
    console.log('Analytics event sent:', event);
  }
  
  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  public async trackEngagement(event: EngagementEvent): Promise<void> {
    try {
      const enrichedEvent: EngagementEvent = {
        ...event,
        timestamp: event.timestamp || new Date().toISOString(),
        device_type: 'mobile',
        context: event.context || 'mobile_app'
      };
      
      // Store offline for sync later
      await trackOfflineEngagement({
        id: this.generateEventId(),
        story_id: enrichedEvent.story_id || 'unknown',
        engagement_type: enrichedEvent.type,
        data: enrichedEvent,
        timestamp: enrichedEvent.timestamp!,
        synced: false
      });
      
      // Try to send immediately if online
      if (this.isOnline) {
        await this.sendToServer(enrichedEvent);
      } else {
        this.eventQueue.push(enrichedEvent);
      }
      
    } catch (error) {
      console.error('Error tracking engagement:', error);
    }
  }
  
  public async trackStoryView(storyId: string, storytellerId: string, accessLevel: string): Promise<void> {
    await this.trackEngagement({
      type: 'story_view',
      story_id: storyId,
      storyteller_id: storytellerId,
      data: {
        access_level: accessLevel,
        view_source: 'mobile_reader'
      }
    });
  }
  
  public async trackReadingProgress(analytics: ReadingAnalytics): Promise<void> {
    await this.trackEngagement({
      type: 'reading_progress',
      story_id: analytics.story_id,
      data: {
        reading_time_seconds: analytics.reading_time_seconds,
        scroll_depth_percentage: analytics.scroll_depth_percentage,
        highlights_count: analytics.highlights_count,
        audio_listened_percentage: analytics.audio_listened_percentage,
        engagement_quality: analytics.engagement_quality,
        completion_status: analytics.completion_status
      }
    });
  }
  
  public async trackAudioEngagement(storyId: string, data: {
    total_duration_ms: number;
    listened_duration_ms: number;
    skip_count: number;
    replay_count: number;
    completion_percentage: number;
  }): Promise<void> {
    await this.trackEngagement({
      type: 'audio_engagement',
      story_id: storyId,
      data
    });
  }
  
  public async trackHighlight(storyId: string, highlightText: string): Promise<void> {
    await this.trackEngagement({
      type: 'highlight_added',
      story_id: storyId,
      data: {
        highlight_text: highlightText.substring(0, 100), // Limit length
        highlight_length: highlightText.length,
        timestamp: new Date().toISOString()
      }
    });
  }
  
  public async trackShare(storyId: string, shareMethod: string): Promise<void> {
    await this.trackEngagement({
      type: 'story_shared',
      story_id: storyId,
      data: {
        share_method: shareMethod,
        platform: 'mobile'
      }
    });
  }
  
  public async trackCollaboration(analytics: CollaborationAnalytics): Promise<void> {
    await this.trackEngagement({
      type: 'collaboration_engagement',
      data: {
        collaboration_type: analytics.collaboration_type,
        participants_count: analytics.participants.length,
        interaction_depth: analytics.interaction_depth,
        cultural_protocol_adherence: analytics.cultural_protocol_adherence
      }
    });
  }
  
  public async trackCulturalProtocolInteraction(data: {
    protocol_type: string;
    action: 'viewed' | 'accepted' | 'reported_concern';
    story_id?: string;
    storyteller_cultural_level?: string;
  }): Promise<void> {
    await this.trackEngagement({
      type: 'cultural_protocol_interaction',
      story_id: data.story_id,
      data: {
        protocol_type: data.protocol_type,
        action: data.action,
        storyteller_cultural_level: data.storyteller_cultural_level
      }
    });
  }
  
  public async trackAppUsage(data: {
    session_duration_minutes: number;
    screens_visited: string[];
    features_used: string[];
    offline_time_percentage: number;
  }): Promise<void> {
    await this.trackEngagement({
      type: 'app_usage_session',
      data
    });
  }
  
  public async trackError(error: {
    error_type: string;
    error_message: string;
    stack_trace?: string;
    context?: string;
    story_id?: string;
  }): Promise<void> {
    await this.trackEngagement({
      type: 'error_occurred',
      story_id: error.story_id,
      data: {
        error_type: error.error_type,
        error_message: error.error_message,
        context: error.context,
        stack_trace: error.stack_trace?.substring(0, 500) // Limit length
      }
    });
  }
  
  // Helper method to calculate engagement quality
  public calculateEngagementQuality(data: {
    reading_time_seconds: number;
    scroll_depth_percentage: number;
    highlights_count: number;
    audio_percentage?: number;
  }): 'low' | 'medium' | 'high' | 'deep' {
    let score = 0;
    
    // Reading time scoring (up to 30 points)
    if (data.reading_time_seconds > 300) score += 30; // 5+ minutes
    else if (data.reading_time_seconds > 120) score += 20; // 2+ minutes
    else if (data.reading_time_seconds > 60) score += 10; // 1+ minute
    
    // Scroll depth scoring (up to 30 points)
    if (data.scroll_depth_percentage > 90) score += 30;
    else if (data.scroll_depth_percentage > 75) score += 20;
    else if (data.scroll_depth_percentage > 50) score += 15;
    else if (data.scroll_depth_percentage > 25) score += 10;
    
    // Highlights scoring (up to 25 points)
    if (data.highlights_count > 5) score += 25;
    else if (data.highlights_count > 2) score += 15;
    else if (data.highlights_count > 0) score += 10;
    
    // Audio engagement scoring (up to 15 points)
    if (data.audio_percentage) {
      if (data.audio_percentage > 80) score += 15;
      else if (data.audio_percentage > 50) score += 10;
      else if (data.audio_percentage > 25) score += 5;
    }
    
    // Classify engagement quality
    if (score >= 80) return 'deep';
    if (score >= 60) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }
  
  public async getAnalyticsSummary(): Promise<any> {
    try {
      // In production, this would fetch from server
      return {
        total_stories_read: 0,
        total_reading_time_minutes: 0,
        average_engagement_quality: 'medium',
        cultural_protocols_interactions: 0,
        collaboration_participations: 0,
        offline_sync_pending: this.eventQueue.length
      };
    } catch (error) {
      console.error('Error getting analytics summary:', error);
      return null;
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Export convenience methods
export const trackEngagement = analyticsService.trackEngagement.bind(analyticsService);
export const trackStoryView = analyticsService.trackStoryView.bind(analyticsService);
export const trackReadingProgress = analyticsService.trackReadingProgress.bind(analyticsService);
export const trackAudioEngagement = analyticsService.trackAudioEngagement.bind(analyticsService);
export const trackHighlight = analyticsService.trackHighlight.bind(analyticsService);
export const trackShare = analyticsService.trackShare.bind(analyticsService);
export const trackCollaboration = analyticsService.trackCollaboration.bind(analyticsService);
export const trackCulturalProtocolInteraction = analyticsService.trackCulturalProtocolInteraction.bind(analyticsService);
export const trackAppUsage = analyticsService.trackAppUsage.bind(analyticsService);
export const trackError = analyticsService.trackError.bind(analyticsService);
export const calculateEngagementQuality = analyticsService.calculateEngagementQuality.bind(analyticsService);
export const getAnalyticsSummary = analyticsService.getAnalyticsSummary.bind(analyticsService);
