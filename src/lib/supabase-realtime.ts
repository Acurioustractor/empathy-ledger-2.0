/**
 * Real-time Supabase Subscriptions for Empathy Ledger
 *
 * Features:
 * - Story updates in real-time
 * - Community activity feeds
 * - User presence tracking
 * - Connection management with auto-reconnect
 * - Event batching for performance
 */

import { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { Database } from './database.types';

// Types for real-time events
export interface StoryUpdateEvent {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: Database['public']['Tables']['stories']['Row'];
  old?: Database['public']['Tables']['stories']['Row'];
  timestamp: Date;
}

export interface CommunityActivityEvent {
  type: 'new_story' | 'story_updated' | 'user_joined' | 'analysis_completed';
  communityId: string;
  data: any;
  timestamp: Date;
}

export interface UserPresenceEvent {
  userId: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: Date;
  currentPage?: string;
}

// Event handlers
export type StoryUpdateHandler = (event: StoryUpdateEvent) => void;
export type CommunityActivityHandler = (event: CommunityActivityEvent) => void;
export type UserPresenceHandler = (event: UserPresenceEvent) => void;
export type ConnectionStatusHandler = (
  status: 'connected' | 'disconnected' | 'reconnecting'
) => void;

// Real-time manager
export class SupabaseRealtimeManager {
  private client: SupabaseClient<Database>;
  private channels: Map<string, RealtimeChannel> = new Map();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventQueue: any[] = [];
  private batchSize = 10;
  private batchInterval = 1000; // 1 second
  private batchTimer: NodeJS.Timeout | null = null;

  // Event handlers
  private storyHandlers: StoryUpdateHandler[] = [];
  private communityHandlers: CommunityActivityHandler[] = [];
  private presenceHandlers: UserPresenceHandler[] = [];
  private connectionHandlers: ConnectionStatusHandler[] = [];

  constructor(client: SupabaseClient<Database>) {
    this.client = client;
    this.setupEventBatching();
  }

  // Setup event batching for performance
  private setupEventBatching(): void {
    this.batchTimer = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.processBatchedEvents();
      }
    }, this.batchInterval);
  }

  private processBatchedEvents(): void {
    const events = this.eventQueue.splice(0, this.batchSize);

    events.forEach(event => {
      switch (event.type) {
        case 'story_update':
          this.storyHandlers.forEach(handler => handler(event.data));
          break;
        case 'community_activity':
          this.communityHandlers.forEach(handler => handler(event.data));
          break;
        case 'user_presence':
          this.presenceHandlers.forEach(handler => handler(event.data));
          break;
      }
    });
  }

  // Subscribe to public story updates
  subscribeToPublicStories(handler: StoryUpdateHandler): () => void {
    this.storyHandlers.push(handler);

    const channelName = 'public_stories';
    if (!this.channels.has(channelName)) {
      const channel = this.client
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'stories',
            filter: 'privacy_level=eq.public',
          },
          payload => {
            const event: StoryUpdateEvent = {
              eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
              new: payload.new as Database['public']['Tables']['stories']['Row'],
              old: payload.old as Database['public']['Tables']['stories']['Row'],
              timestamp: new Date(),
            };

            // Add to batch queue
            this.eventQueue.push({
              type: 'story_update',
              data: event,
            });
          }
        )
        .subscribe(status => {
          this.handleChannelStatus(channelName, status);
        });

      this.channels.set(channelName, channel);
    }

    // Return unsubscribe function
    return () => {
      const index = this.storyHandlers.indexOf(handler);
      if (index > -1) {
        this.storyHandlers.splice(index, 1);
      }
    };
  }

  // Subscribe to community activity
  subscribeToCommunityActivity(
    communityId: string,
    handler: CommunityActivityHandler
  ): () => void {
    this.communityHandlers.push(handler);

    const channelName = `community_${communityId}`;
    if (!this.channels.has(channelName)) {
      const channel = this.client
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'stories',
          },
          async payload => {
            // Get user info to check community affiliation
            const { data: user } = await this.client
              .from('users')
              .select('community_affiliation')
              .eq('id', payload.new.storyteller_id)
              .single();

            if (user?.community_affiliation === communityId) {
              const event: CommunityActivityEvent = {
                type: 'new_story',
                communityId,
                data: payload.new,
                timestamp: new Date(),
              };

              this.eventQueue.push({
                type: 'community_activity',
                data: event,
              });
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'story_analysis',
          },
          payload => {
            const event: CommunityActivityEvent = {
              type: 'analysis_completed',
              communityId,
              data: payload.new,
              timestamp: new Date(),
            };

            this.eventQueue.push({
              type: 'community_activity',
              data: event,
            });
          }
        )
        .subscribe(status => {
          this.handleChannelStatus(channelName, status);
        });

      this.channels.set(channelName, channel);
    }

    return () => {
      const index = this.communityHandlers.indexOf(handler);
      if (index > -1) {
        this.communityHandlers.splice(index, 1);
      }
    };
  }

  // Subscribe to user presence
  subscribeToUserPresence(
    userId: string,
    handler: UserPresenceHandler
  ): () => void {
    this.presenceHandlers.push(handler);

    const channelName = `presence_${userId}`;
    if (!this.channels.has(channelName)) {
      const channel = this.client
        .channel(channelName)
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          Object.entries(state).forEach(([key, presence]) => {
            const event: UserPresenceEvent = {
              userId: key,
              status: 'online',
              lastSeen: new Date(),
              currentPage: (presence as any)?.[0]?.currentPage,
            };

            this.eventQueue.push({
              type: 'user_presence',
              data: event,
            });
          });
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          const event: UserPresenceEvent = {
            userId: key,
            status: 'online',
            lastSeen: new Date(),
            currentPage: newPresences?.[0]?.currentPage,
          };

          this.eventQueue.push({
            type: 'user_presence',
            data: event,
          });
        })
        .on('presence', { event: 'leave' }, ({ key }) => {
          const event: UserPresenceEvent = {
            userId: key,
            status: 'offline',
            lastSeen: new Date(),
          };

          this.eventQueue.push({
            type: 'user_presence',
            data: event,
          });
        })
        .subscribe(status => {
          this.handleChannelStatus(channelName, status);
        });

      this.channels.set(channelName, channel);

      // Track current user's presence
      channel.track({
        userId,
        status: 'online',
        currentPage:
          typeof window !== 'undefined' ? window.location.pathname : '/',
      });
    }

    return () => {
      const index = this.presenceHandlers.indexOf(handler);
      if (index > -1) {
        this.presenceHandlers.splice(index, 1);
      }
    };
  }

  // Handle channel connection status
  private handleChannelStatus(channelName: string, status: string): void {
    console.log(`Channel ${channelName} status: ${status}`);

    switch (status) {
      case 'SUBSCRIBED':
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyConnectionHandlers('connected');
        break;
      case 'CHANNEL_ERROR':
      case 'TIMED_OUT':
      case 'CLOSED':
        this.isConnected = false;
        this.notifyConnectionHandlers('disconnected');
        this.attemptReconnect(channelName);
        break;
    }
  }

  // Reconnection logic
  private async attemptReconnect(channelName: string): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        `Max reconnection attempts reached for channel ${channelName}`
      );
      return;
    }

    this.reconnectAttempts++;
    this.notifyConnectionHandlers('reconnecting');

    await new Promise(resolve =>
      setTimeout(resolve, this.reconnectDelay * this.reconnectAttempts)
    );

    const channel = this.channels.get(channelName);
    if (channel) {
      channel.subscribe();
    }
  }

  // Connection status handlers
  onConnectionStatusChange(handler: ConnectionStatusHandler): () => void {
    this.connectionHandlers.push(handler);

    return () => {
      const index = this.connectionHandlers.indexOf(handler);
      if (index > -1) {
        this.connectionHandlers.splice(index, 1);
      }
    };
  }

  private notifyConnectionHandlers(
    status: 'connected' | 'disconnected' | 'reconnecting'
  ): void {
    this.connectionHandlers.forEach(handler => handler(status));
  }

  // Update user presence page
  updatePresencePage(userId: string, page: string): void {
    const channelName = `presence_${userId}`;
    const channel = this.channels.get(channelName);

    if (channel) {
      channel.track({
        userId,
        status: 'online',
        currentPage: page,
      });
    }
  }

  // Cleanup all subscriptions
  cleanup(): void {
    // Clear batch timer
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }

    // Unsubscribe from all channels
    this.channels.forEach(channel => {
      this.client.removeChannel(channel);
    });

    this.channels.clear();
    this.storyHandlers = [];
    this.communityHandlers = [];
    this.presenceHandlers = [];
    this.connectionHandlers = [];
    this.eventQueue = [];
  }

  // Get connection status
  getConnectionStatus(): {
    isConnected: boolean;
    activeChannels: number;
    reconnectAttempts: number;
    queuedEvents: number;
  } {
    return {
      isConnected: this.isConnected,
      activeChannels: this.channels.size,
      reconnectAttempts: this.reconnectAttempts,
      queuedEvents: this.eventQueue.length,
    };
  }
}

// React hook for real-time subscriptions (requires React import in consuming component)
export function useRealtimeSubscription<T>(
  manager: SupabaseRealtimeManager,
  subscriptionType: 'stories' | 'community' | 'presence',
  subscriptionId?: string,
  handler?: (event: T) => void
) {
  // Note: This hook requires React to be imported in the consuming component
  // const [isConnected, setIsConnected] = React.useState(false);
  // const [data, setData] = React.useState<T[]>([]);

  // Mock implementation for TypeScript compatibility
  const isConnected = false;
  const data: T[] = [];

  // Implementation would be:
  /*
  React.useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const connectionUnsubscribe = manager.onConnectionStatusChange((status) => {
      setIsConnected(status === 'connected');
    });

    switch (subscriptionType) {
      case 'stories':
        unsubscribe = manager.subscribeToPublicStories((event) => {
          if (handler) handler(event as T);
          setData(prev => [...prev, event as T]);
        });
        break;
      case 'community':
        if (subscriptionId) {
          unsubscribe = manager.subscribeToCommunityActivity(subscriptionId, (event) => {
            if (handler) handler(event as T);
            setData(prev => [...prev, event as T]);
          });
        }
        break;
      case 'presence':
        if (subscriptionId) {
          unsubscribe = manager.subscribeToUserPresence(subscriptionId, (event) => {
            if (handler) handler(event as T);
            setData(prev => [...prev, event as T]);
          });
        }
        break;
    }

    return () => {
      if (unsubscribe) unsubscribe();
      connectionUnsubscribe();
    };
  }, [manager, subscriptionType, subscriptionId]);
  */

  return { isConnected, data };
}

export default SupabaseRealtimeManager;
