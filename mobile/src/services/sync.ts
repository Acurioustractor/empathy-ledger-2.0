import NetInfo from '@react-native-community/netinfo';
import { getUnsyncedEngagements, markEngagementSynced, cacheStory, getDatabaseInfo } from './database';
import { analyticsService } from './analytics';

// Types
interface SyncStatus {
  is_online: boolean;
  last_sync_attempt?: string;
  last_successful_sync?: string;
  pending_uploads: number;
  pending_downloads: number;
  sync_errors: string[];
}

interface SyncResult {
  success: boolean;
  uploaded_count: number;
  downloaded_count: number;
  errors: string[];
  sync_duration_ms: number;
}

// Sync service
class SyncService {
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private lastSyncAttempt: string | null = null;
  private lastSuccessfulSync: string | null = null;
  private syncErrors: string[] = [];
  
  constructor() {
    this.setupNetworkListener();
    this.startPeriodicSync();
  }
  
  private setupNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      // Trigger sync when coming back online
      if (wasOffline && this.isOnline) {
        console.log('Network restored - triggering sync');
        this.syncOfflineData();
      }
    });
  }
  
  private startPeriodicSync() {
    // Sync every 5 minutes when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncOfflineData();
      }
    }, 5 * 60 * 1000);
  }
  
  public stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
  
  public async syncOfflineData(): Promise<SyncResult> {
    if (this.syncInProgress) {
      console.log('Sync already in progress');
      return {
        success: false,
        uploaded_count: 0,
        downloaded_count: 0,
        errors: ['Sync already in progress'],
        sync_duration_ms: 0
      };
    }
    
    if (!this.isOnline) {
      console.log('Cannot sync - offline');
      return {
        success: false,
        uploaded_count: 0,
        downloaded_count: 0,
        errors: ['Device is offline'],
        sync_duration_ms: 0
      };
    }
    
    this.syncInProgress = true;
    this.lastSyncAttempt = new Date().toISOString();
    const startTime = Date.now();
    
    let uploadedCount = 0;
    let downloadedCount = 0;
    const errors: string[] = [];
    
    try {
      console.log('Starting offline data sync...');
      
      // 1. Upload pending engagements
      try {
        uploadedCount = await this.uploadPendingEngagements();
        console.log(`Uploaded ${uploadedCount} engagement events`);
      } catch (error) {
        const errorMsg = `Upload failed: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
      
      // 2. Download new stories and updates
      try {
        downloadedCount = await this.downloadNewContent();
        console.log(`Downloaded ${downloadedCount} content updates`);
      } catch (error) {
        const errorMsg = `Download failed: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
      
      // 3. Sync cultural protocols updates
      try {
        await this.syncCulturalProtocols();
        console.log('Cultural protocols synced');
      } catch (error) {
        const errorMsg = `Cultural protocols sync failed: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
      
      // 4. Sync collaboration data
      try {
        await this.syncCollaborationData();
        console.log('Collaboration data synced');
      } catch (error) {
        const errorMsg = `Collaboration sync failed: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
      
      const syncDuration = Date.now() - startTime;
      const success = errors.length === 0;
      
      if (success) {
        this.lastSuccessfulSync = new Date().toISOString();
        this.syncErrors = [];
      } else {
        this.syncErrors = errors;
      }
      
      console.log(`Sync completed in ${syncDuration}ms - Success: ${success}`);
      
      return {
        success,
        uploaded_count: uploadedCount,
        downloaded_count: downloadedCount,
        errors,
        sync_duration_ms: syncDuration
      };
      
    } catch (error) {
      const errorMsg = `Sync failed: ${error}`;
      console.error(errorMsg);
      this.syncErrors = [errorMsg];
      
      return {
        success: false,
        uploaded_count: 0,
        downloaded_count: 0,
        errors: [errorMsg],
        sync_duration_ms: Date.now() - startTime
      };
    } finally {
      this.syncInProgress = false;
    }
  }
  
  private async uploadPendingEngagements(): Promise<number> {
    const unsyncedEngagements = await getUnsyncedEngagements();
    let uploadCount = 0;
    
    for (const engagement of unsyncedEngagements) {
      try {
        // In production, this would make API call
        await this.uploadEngagementToServer(engagement);
        await markEngagementSynced(engagement.id);
        uploadCount++;
      } catch (error) {
        console.error(`Failed to upload engagement ${engagement.id}:`, error);
        // Continue with other engagements
      }
    }
    
    return uploadCount;
  }
  
  private async uploadEngagementToServer(engagement: any): Promise<void> {
    // In production, this would make actual API call
    console.log('Uploading engagement to server:', {
      id: engagement.id,
      type: engagement.engagement_type,
      story_id: engagement.story_id,
      timestamp: engagement.timestamp
    });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  private async downloadNewContent(): Promise<number> {
    try {
      // In production, this would fetch from API
      const newStories = await this.fetchNewStoriesFromServer();
      
      for (const story of newStories) {
        await cacheStory(story);
      }
      
      return newStories.length;
    } catch (error) {
      console.error('Error downloading new content:', error);
      throw error;
    }
  }
  
  private async fetchNewStoriesFromServer(): Promise<any[]> {
    // In production, this would make actual API call
    console.log('Fetching new stories from server...');
    
    // Simulate API response
    return [];
  }
  
  private async syncCulturalProtocols(): Promise<void> {
    try {
      // In production, this would sync cultural protocols with server
      console.log('Syncing cultural protocols with server...');
      
      // Check for protocol updates
      // Update local protocols if needed
      // Sync protocol acceptance status
    } catch (error) {
      console.error('Error syncing cultural protocols:', error);
      throw error;
    }
  }
  
  private async syncCollaborationData(): Promise<void> {
    try {
      // In production, this would sync collaboration data
      console.log('Syncing collaboration data...');
      
      // Upload collaboration interactions
      // Download new collaboration opportunities
      // Sync mentorship and referral status
    } catch (error) {
      console.error('Error syncing collaboration data:', error);
      throw error;
    }
  }
  
  public async getSyncStatus(): Promise<SyncStatus> {
    try {
      const networkState = await NetInfo.fetch();
      const dbInfo = await getDatabaseInfo();
      
      return {
        is_online: networkState.isConnected ?? false,
        last_sync_attempt: this.lastSyncAttempt || undefined,
        last_successful_sync: this.lastSuccessfulSync || undefined,
        pending_uploads: dbInfo.unsyncedEngagements || 0,
        pending_downloads: 0, // Would be calculated from server comparison
        sync_errors: this.syncErrors
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        is_online: false,
        pending_uploads: 0,
        pending_downloads: 0,
        sync_errors: [`Error getting sync status: ${error}`]
      };
    }
  }
  
  public async forceSyncNow(): Promise<SyncResult> {
    if (!this.isOnline) {
      throw new Error('Cannot force sync while offline');
    }
    
    console.log('Force sync requested by user');
    return await this.syncOfflineData();
  }
  
  public async clearSyncErrors(): Promise<void> {
    this.syncErrors = [];
  }
  
  public isSyncInProgress(): boolean {
    return this.syncInProgress;
  }
  
  public getLastSyncTime(): string | null {
    return this.lastSuccessfulSync;
  }
  
  // Helper method for testing sync connectivity
  public async testConnection(): Promise<boolean> {
    try {
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        return false;
      }
      
      // In production, this would ping the API server
      console.log('Testing API connectivity...');
      
      // Simulate API ping
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const syncService = new SyncService();

// Export convenience methods
export const syncOfflineData = syncService.syncOfflineData.bind(syncService);
export const getSyncStatus = syncService.getSyncStatus.bind(syncService);
export const forceSyncNow = syncService.forceSyncNow.bind(syncService);
export const testConnection = syncService.testConnection.bind(syncService);
