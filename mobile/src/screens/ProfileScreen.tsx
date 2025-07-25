import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { Surface, Button, Card, Avatar, Chip, Divider, ProgressBar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

// Services
import { getSetting, saveSetting, getDatabaseInfo } from '../services/database';
import { getSyncStatus } from '../services/sync';
import { getAnalyticsSummary, trackEngagement } from '../services/analytics';
import { getAboriginalAdvisoryInfo } from '../services/culturalProtocols';

interface UserProfile {
  name: string;
  email?: string;
  cultural_competency_level: string;
  reading_preferences: string[];
  collaboration_interests: string[];
  onboarding_completed: boolean;
  account_created: string;
}

interface UserStats {
  stories_read: number;
  reading_time_hours: number;
  collaborations_joined: number;
  highlights_created: number;
  cultural_protocols_interactions: number;
}

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aboriginalAdvisoryInfo] = useState(getAboriginalAdvisoryInfo());

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Load user profile from settings
      const [name, email, competencyLevel, onboardingComplete, accountCreated] = await Promise.all([
        getSetting('user_name') || 'Mobile User',
        getSetting('user_email'),
        getSetting('cultural_competency_level') || 'basic',
        getSetting('onboarding_complete') === 'true',
        getSetting('account_created') || new Date().toISOString()
      ]);
      
      setProfile({
        name,
        email,
        cultural_competency_level: competencyLevel,
        reading_preferences: [], // Would be loaded from settings
        collaboration_interests: [], // Would be loaded from settings
        onboarding_completed: onboardingComplete,
        account_created: accountCreated
      });
      
      // Load user stats
      const analyticsData = await getAnalyticsSummary();
      setStats({
        stories_read: analyticsData?.total_stories_read || 0,
        reading_time_hours: Math.round((analyticsData?.total_reading_time_minutes || 0) / 60),
        collaborations_joined: analyticsData?.collaboration_participations || 0,
        highlights_created: analyticsData?.highlights_created || 0,
        cultural_protocols_interactions: analyticsData?.cultural_protocols_interactions || 0
      });
      
      // Load sync and database info
      const [syncData, databaseData] = await Promise.all([
        getSyncStatus(),
        getDatabaseInfo()
      ]);
      
      setSyncStatus(syncData);
      setDbInfo(databaseData);
      
    } catch (error) {
      console.error('Error loading profile data:', error);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  };

  const handleUpdateProfile = async () => {
    try {
      // Track profile update engagement
      await trackEngagement({
        type: 'profile_update_requested',
        data: {
          current_competency_level: profile?.cultural_competency_level,
          onboarding_completed: profile?.onboarding_completed
        }
      });
      
      Alert.alert(
        'Update Profile',
        'Profile editing will be available in a future update. For now, you can update your cultural competency level through the settings.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCulturalCompetencyInfo = () => {
    Alert.alert(
      'Cultural Competency Levels',
      `Basic: General respect and awareness\nStandard: Understanding of cultural protocols\nEnhanced: Active engagement with cultural practices\nCultural Practitioner: Deep cultural knowledge\nElder: Traditional knowledge keeper\n\nYour current level: ${profile?.cultural_competency_level}\n\nFor guidance, contact: ${aboriginalAdvisoryInfo.contact_email}`,
      [{ text: 'OK' }]
    );
  };

  const getCompetencyColor = (level: string) => {
    switch (level) {
      case 'elder': return '#4A148C';
      case 'knowledge_keeper': return '#6A1B9A';
      case 'culturally_competent': return '#8E24AA';
      case 'enhanced': return '#AB47BC';
      case 'standard': return '#BA68C8';
      case 'developing': return '#CE93D8';
      case 'basic': return '#E1BEE7';
      default: return '#F3E5F5';
    }
  };

  const getCompetencyProgress = (level: string): number => {
    const levels = ['basic', 'standard', 'enhanced', 'culturally_competent', 'knowledge_keeper', 'elder'];
    return (levels.indexOf(level) + 1) / levels.length;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#2196F3']}
        />
      }
    >
      {/* Header */}
      <Surface style={styles.header}>
        <Avatar.Text 
          size={64} 
          label={profile?.name?.split(' ').map(n => n[0]).join('') || 'U'}
          style={[styles.avatar, { backgroundColor: getCompetencyColor(profile?.cultural_competency_level || 'basic') }]}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.userName}>{profile?.name || 'Mobile User'}</Text>
          {profile?.email && (
            <Text style={styles.userEmail}>{profile.email}</Text>
          )}
          <Text style={styles.memberSince}>
            Member since {new Date(profile?.account_created || '').toLocaleDateString()}
          </Text>
        </View>
      </Surface>
      
      {/* Cultural Competency */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🏛️ Cultural Competency</Text>
            <Button 
              mode="outlined" 
              compact 
              onPress={handleCulturalCompetencyInfo}
            >
              Info
            </Button>
          </View>
          
          <View style={styles.competencyContainer}>
            <Text style={styles.competencyLevel}>
              Current Level: {profile?.cultural_competency_level?.replace('_', ' ')}
            </Text>
            <ProgressBar 
              progress={getCompetencyProgress(profile?.cultural_competency_level || 'basic')}
              color={getCompetencyColor(profile?.cultural_competency_level || 'basic')}
              style={styles.competencyProgress}
            />
            <Text style={styles.competencyDescription}>
              {profile?.cultural_competency_level === 'basic' && 'General respect and cultural awareness'}
              {profile?.cultural_competency_level === 'standard' && 'Understanding of cultural protocols'}
              {profile?.cultural_competency_level === 'enhanced' && 'Active engagement with cultural practices'}
              {profile?.cultural_competency_level === 'culturally_competent' && 'Deep cultural knowledge and practice'}
              {profile?.cultural_competency_level === 'knowledge_keeper' && 'Traditional knowledge keeper'}
              {profile?.cultural_competency_level === 'elder' && 'Elder and traditional knowledge holder'}
            </Text>
          </View>
          
          <View style={styles.advisoryInfo}>
            <Text style={styles.advisoryTitle}>Aboriginal Advisory Support:</Text>
            <Text style={styles.advisoryContact}>
              📧 {aboriginalAdvisoryInfo.contact_email}
            </Text>
            <Text style={styles.advisoryCoordinator}>
              👤 {aboriginalAdvisoryInfo.protocols_coordinator}
            </Text>
          </View>
        </Card.Content>
      </Card>
      
      {/* Reading & Engagement Stats */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>📊 Your Engagement</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats?.stories_read || 0}</Text>
              <Text style={styles.statLabel}>Stories Read</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats?.reading_time_hours || 0}h</Text>
              <Text style={styles.statLabel}>Reading Time</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats?.collaborations_joined || 0}</Text>
              <Text style={styles.statLabel}>Collaborations</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats?.highlights_created || 0}</Text>
              <Text style={styles.statLabel}>Highlights</Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.protocolStats}>
            <Text style={styles.protocolStatsTitle}>
              🏛️ Cultural Protocol Interactions: {stats?.cultural_protocols_interactions || 0}
            </Text>
            <Text style={styles.protocolStatsDescription}>
              Your respectful engagement with cultural content helps build a more inclusive storytelling community.
            </Text>
          </View>
        </Card.Content>
      </Card>
      
      {/* Sync & Data Status */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>🔄 Data & Sync Status</Text>
          
          <View style={styles.syncStatusContainer}>
            <View style={styles.syncRow}>
              <Text style={styles.syncLabel}>Connection:</Text>
              <Text style={[styles.syncValue, { color: syncStatus?.is_online ? '#4CAF50' : '#f44336' }]}>
                {syncStatus?.is_online ? '✅ Online' : '❌ Offline'}
              </Text>
            </View>
            
            <View style={styles.syncRow}>
              <Text style={styles.syncLabel}>Last Sync:</Text>
              <Text style={styles.syncValue}>
                {syncStatus?.last_successful_sync ? 
                  new Date(syncStatus.last_successful_sync).toLocaleString() : 
                  'Never'
                }
              </Text>
            </View>
            
            {syncStatus?.pending_uploads > 0 && (
              <View style={styles.syncRow}>
                <Text style={styles.syncLabel}>Pending Upload:</Text>
                <Text style={[styles.syncValue, { color: '#ff9800' }]}>
                  {syncStatus.pending_uploads} items
                </Text>
              </View>
            )}
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.dataInfo}>
            <Text style={styles.dataInfoTitle}>Cached Data:</Text>
            <Text style={styles.dataInfoItem}>📚 {dbInfo?.cachedStories || 0} stories</Text>
            <Text style={styles.dataInfoItem}>📖 {dbInfo?.readingProgress || 0} reading sessions</Text>
            <Text style={styles.dataInfoItem}>🏛️ {dbInfo?.culturalProtocols || 0} cultural protocols</Text>
          </View>
        </Card.Content>
      </Card>
      
      {/* Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>⚙️ Account Actions</Text>
          
          <View style={styles.actionButtons}>
            <Button 
              mode="outlined" 
              onPress={handleUpdateProfile}
              style={styles.actionButton}
            >
              Update Profile
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={() => {
                Alert.alert(
                  'Privacy Settings',
                  'Privacy settings will be available in a future update.',
                  [{ text: 'OK' }]
                );
              }}
              style={styles.actionButton}
            >
              Privacy Settings
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={() => {
                Alert.alert(
                  'Cultural Resources',
                  `Visit our cultural competency resources:\n\n${aboriginalAdvisoryInfo.cultural_competency_resources}\n\nCommunity guidelines:\n${aboriginalAdvisoryInfo.community_guidelines}`,
                  [{ text: 'OK' }]
                );
              }}
              style={styles.actionButton}
            >
              Cultural Resources
            </Button>
          </View>
        </Card.Content>
      </Card>
      
      {/* Onboarding Status */}
      {!profile?.onboarding_completed && (
        <Card style={[styles.card, styles.warningCard]}>
          <Card.Content>
            <Text style={styles.warningTitle}>⚠️ Complete Your Onboarding</Text>
            <Text style={styles.warningText}>
              To fully participate in the Empathy Ledger community, please complete your cultural protocols onboarding.
            </Text>
            <Button 
              mode="contained" 
              onPress={() => {
                Alert.alert(
                  'Complete Onboarding',
                  'Onboarding completion will guide you through cultural protocols and community guidelines.',
                  [{ text: 'OK' }]
                );
              }}
              style={styles.warningButton}
            >
              Complete Onboarding
            </Button>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    elevation: 2,
    marginBottom: 16,
  },
  avatar: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  memberSince: {
    fontSize: 12,
    color: '#999',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  competencyContainer: {
    marginBottom: 16,
  },
  competencyLevel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  competencyProgress: {
    height: 8,
    marginBottom: 8,
  },
  competencyDescription: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  advisoryInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  advisoryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  advisoryContact: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  advisoryCoordinator: {
    fontSize: 11,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  divider: {
    marginVertical: 16,
  },
  protocolStats: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
  },
  protocolStatsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e65100',
    marginBottom: 4,
  },
  protocolStatsDescription: {
    fontSize: 12,
    color: '#e65100',
    lineHeight: 16,
  },
  syncStatusContainer: {
    marginBottom: 16,
  },
  syncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  syncLabel: {
    fontSize: 14,
    color: '#666',
  },
  syncValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  dataInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  dataInfoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dataInfoItem: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  actionButtons: {
    gap: 8,
  },
  actionButton: {
    marginBottom: 8,
  },
  warningCard: {
    backgroundColor: '#fff3e0',
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e65100',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#e65100',
    lineHeight: 20,
    marginBottom: 16,
  },
  warningButton: {
    backgroundColor: '#ff9800',
  },
});
