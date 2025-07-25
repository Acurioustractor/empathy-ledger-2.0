import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Surface, Searchbar, Chip, FAB, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';

// Services
import { getCachedStories, getDatabaseInfo } from '../services/database';
import { syncOfflineData, getSyncStatus } from '../services/sync';
import { trackStoryView, trackEngagement } from '../services/analytics';

// Types
interface Story {
  id: string;
  title: string;
  content: string;
  storyteller_id: string;
  storyteller_name: string;
  audio_url?: string;
  video_url?: string;
  created_at: string;
  updated_at: string;
  access_level: 'public' | 'premium' | 'organizational';
  professional_themes: string[];
  cultural_protocols_required: boolean;
  sync_status: 'synced' | 'pending_upload' | 'pending_download' | 'conflict';
}

interface StoriesScreenProps {
  navigation: any;
}

export default function StoriesScreen({ navigation }: StoriesScreenProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [selectedAccessLevels, setSelectedAccessLevels] = useState<string[]>(['public', 'premium', 'organizational']);
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [allThemes, setAllThemes] = useState<string[]>([]);

  useEffect(() => {
    loadStories();
    setupNetworkListener();
    loadSyncStatus();
  }, []);

  useEffect(() => {
    filterStories();
  }, [stories, searchQuery, selectedThemes, selectedAccessLevels]);

  const setupNetworkListener = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });
    return unsubscribe;
  };

  const loadStories = async () => {
    try {
      setLoading(true);
      
      // Load cached stories
      const cachedStories = await getCachedStories();
      setStories(cachedStories);
      
      // Extract all unique themes
      const themes = new Set<string>();
      cachedStories.forEach(story => {
        story.professional_themes.forEach(theme => themes.add(theme));
      });
      setAllThemes(Array.from(themes));
      
      // Try to sync new content if online
      if (isOnline) {
        try {
          await syncOfflineData();
          // Reload stories after sync
          const updatedStories = await getCachedStories();
          setStories(updatedStories);
        } catch (error) {
          console.error('Sync failed during load:', error);
        }
      }
      
    } catch (error) {
      console.error('Error loading stories:', error);
      Alert.alert('Error', 'Failed to load stories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadSyncStatus = async () => {
    try {
      const status = await getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStories();
    await loadSyncStatus();
    setRefreshing(false);
  }, [isOnline]);

  const filterStories = () => {
    let filtered = stories;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(story => 
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.storyteller_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by selected themes
    if (selectedThemes.length > 0) {
      filtered = filtered.filter(story =>
        story.professional_themes.some(theme => selectedThemes.includes(theme))
      );
    }
    
    // Filter by access levels
    filtered = filtered.filter(story => selectedAccessLevels.includes(story.access_level));
    
    setFilteredStories(filtered);
  };

  const handleStoryPress = async (story: Story) => {
    try {
      // Track story view
      await trackStoryView(story.id, story.storyteller_id, story.access_level);
      
      // Navigate to story reader
      navigation.navigate('StoryReader', { 
        story,
        accessLevel: story.access_level
      });
    } catch (error) {
      console.error('Error opening story:', error);
    }
  };

  const toggleThemeFilter = (theme: string) => {
    setSelectedThemes(prev => 
      prev.includes(theme) 
        ? prev.filter(t => t !== theme)
        : [...prev, theme]
    );
  };

  const toggleAccessLevelFilter = (level: string) => {
    setSelectedAccessLevels(prev => 
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'public': return '#4CAF50';
      case 'premium': return '#FF9800';
      case 'organizational': return '#2196F3';
      default: return '#757575';
    }
  };

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case 'public': return '🌍';
      case 'premium': return '💎';
      case 'organizational': return '🏢';
      default: return '📖';
    }
  };

  const renderStoryItem = ({ item: story }: { item: Story }) => (
    <TouchableOpacity onPress={() => handleStoryPress(story)}>
      <Surface style={styles.storyCard}>
        <View style={styles.storyHeader}>
          <View style={styles.storyTitleContainer}>
            <Text style={styles.storyTitle} numberOfLines={2}>
              {story.title}
            </Text>
            <Text style={styles.storytellerName}>
              by {story.storyteller_name}
            </Text>
          </View>
          <View style={styles.accessLevelContainer}>
            <Text style={[styles.accessLevelBadge, { backgroundColor: getAccessLevelColor(story.access_level) }]}>
              {getAccessLevelIcon(story.access_level)} {story.access_level.toUpperCase()}
            </Text>
          </View>
        </View>
        
        <Text style={styles.storyPreview} numberOfLines={3}>
          {story.content.substring(0, 150)}...
        </Text>
        
        {/* Professional Themes */}
        {story.professional_themes.length > 0 && (
          <View style={styles.themesContainer}>
            {story.professional_themes.slice(0, 3).map((theme, index) => (
              <Chip 
                key={index} 
                style={styles.themeChip}
                textStyle={styles.themeChipText}
                compact
              >
                {theme}
              </Chip>
            ))}
            {story.professional_themes.length > 3 && (
              <Text style={styles.moreThemes}>
                +{story.professional_themes.length - 3} more
              </Text>
            )}
          </View>
        )}
        
        <View style={styles.storyFooter}>
          <View style={styles.storyMeta}>
            {story.cultural_protocols_required && (
              <Text style={styles.culturalProtocolBadge}>
                🏛️ Cultural Protocol Required
              </Text>
            )}
            {story.audio_url && (
              <Text style={styles.mediaAvailable}>
                🎧 Audio Available
              </Text>
            )}
            {story.video_url && (
              <Text style={styles.mediaAvailable}>
                📹 Video Available
              </Text>
            )}
          </View>
          <Text style={styles.lastUpdated}>
            {new Date(story.updated_at).toLocaleDateString()}
          </Text>
        </View>
        
        {/* Sync Status Indicator */}
        {story.sync_status !== 'synced' && (
          <View style={styles.syncStatusContainer}>
            <Text style={[
              styles.syncStatus,
              { color: story.sync_status === 'conflict' ? '#f44336' : '#ff9800' }
            ]}>
              {story.sync_status === 'pending_upload' && '⬆️ Pending Upload'}
              {story.sync_status === 'pending_download' && '⬇️ Pending Download'}
              {story.sync_status === 'conflict' && '⚠️ Sync Conflict'}
            </Text>
          </View>
        )}
      </Surface>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>
        {searchQuery || selectedThemes.length > 0 ? 'No stories match your filters' : 'No stories available'}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {!isOnline ? 'You\'re offline. Stories will sync when connection is restored.' : 
         searchQuery || selectedThemes.length > 0 ? 'Try adjusting your search or filters' : 
         'New stories will appear here as they become available'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading stories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Surface style={styles.header}>
        <Text style={styles.headerTitle}>📖 Stories</Text>
        <View style={styles.headerStatus}>
          {!isOnline && (
            <Text style={styles.offlineIndicator}>📶 Offline</Text>
          )}
          {syncStatus?.pending_uploads > 0 && (
            <Text style={styles.syncPending}>
              ⬆️ {syncStatus.pending_uploads} pending
            </Text>
          )}
        </View>
      </Surface>
      
      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search stories, storytellers, or content..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>
      
      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Access Levels:</Text>
        <View style={styles.filterChips}>
          {['public', 'premium', 'organizational'].map(level => (
            <Chip
              key={level}
              selected={selectedAccessLevels.includes(level)}
              onPress={() => toggleAccessLevelFilter(level)}
              style={[styles.filterChip, selectedAccessLevels.includes(level) && styles.selectedFilterChip]}
              textStyle={styles.filterChipText}
            >
              {getAccessLevelIcon(level)} {level}
            </Chip>
          ))}
        </View>
        
        {allThemes.length > 0 && (
          <>
            <Text style={styles.filtersTitle}>Professional Themes:</Text>
            <View style={styles.filterChips}>
              {allThemes.slice(0, 6).map(theme => (
                <Chip
                  key={theme}
                  selected={selectedThemes.includes(theme)}
                  onPress={() => toggleThemeFilter(theme)}
                  style={[styles.filterChip, selectedThemes.includes(theme) && styles.selectedFilterChip]}
                  textStyle={styles.filterChipText}
                  compact
                >
                  {theme}
                </Chip>
              ))}
            </View>
          </>
        )}
      </View>
      
      {/* Stories List */}
      <FlatList
        data={filteredStories}
        renderItem={renderStoryItem}
        keyExtractor={(item) => item.id}
        style={styles.storiesList}
        contentContainerStyle={styles.storiesListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
      
      {/* Results Summary */}
      {filteredStories.length > 0 && (
        <Surface style={styles.resultsSummary}>
          <Text style={styles.resultsText}>
            {filteredStories.length} of {stories.length} stories
            {(searchQuery || selectedThemes.length > 0) && ' (filtered)'}
          </Text>
        </Surface>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  offlineIndicator: {
    fontSize: 12,
    color: '#f44336',
    fontWeight: '500',
  },
  syncPending: {
    fontSize: 12,
    color: '#ff9800',
    fontWeight: '500',
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    elevation: 2,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#e0e0e0',
  },
  selectedFilterChip: {
    backgroundColor: '#2196F3',
  },
  filterChipText: {
    fontSize: 12,
  },
  storiesList: {
    flex: 1,
  },
  storiesListContent: {
    padding: 16,
    paddingTop: 0,
  },
  storyCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  storyTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 22,
  },
  storytellerName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  accessLevelContainer: {
    alignItems: 'flex-end',
  },
  accessLevelBadge: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  storyPreview: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  themesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  themeChip: {
    backgroundColor: '#e3f2fd',
  },
  themeChipText: {
    fontSize: 11,
    color: '#1976d2',
  },
  moreThemes: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  storyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  storyMeta: {
    flex: 1,
  },
  culturalProtocolBadge: {
    fontSize: 11,
    color: '#e65100',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 2,
    alignSelf: 'flex-start',
  },
  mediaAvailable: {
    fontSize: 11,
    color: '#2e7d32',
    marginBottom: 2,
  },
  lastUpdated: {
    fontSize: 11,
    color: '#999',
  },
  syncStatusContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  syncStatus: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  resultsSummary: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  resultsText: {
    fontSize: 12,
    color: '#1976d2',
    textAlign: 'center',
  },
});
