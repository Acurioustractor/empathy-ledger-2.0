import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Surface, Button, Card, Avatar, Chip, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

// Services
import { trackCollaboration, trackEngagement } from '../services/analytics';
import { getSetting } from '../services/database';

// Types
interface Collaboration {
  id: string;
  type: 'mentorship' | 'referral' | 'collective_project';
  title: string;
  description: string;
  participants: {
    id: string;
    name: string;
    role: string;
    avatar_url?: string;
    cultural_competency_level: string;
  }[];
  status: 'proposed' | 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
  cultural_protocols_required: boolean;
  expected_duration?: string;
  skills_involved: string[];
  impact_potential: 'local' | 'regional' | 'national' | 'international';
}

interface CollaborationOpportunity {
  id: string;
  type: 'mentorship_offer' | 'mentorship_seek' | 'project_collaboration' | 'referral_network';
  title: string;
  description: string;
  storyteller: {
    id: string;
    name: string;
    expertise_areas: string[];
    cultural_competency_level: string;
    availability: string;
  };
  requirements: string[];
  cultural_considerations: string;
  match_score?: number;
}

export default function CollaborationScreen() {
  const navigation = useNavigation();
  const [activeCollaborations, setActiveCollaborations] = useState<Collaboration[]>([]);
  const [opportunities, setOpportunities] = useState<CollaborationOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'opportunities' | 'history'>('active');
  const [userCompetencyLevel, setUserCompetencyLevel] = useState<string>('basic');

  useEffect(() => {
    loadCollaborationData();
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const competencyLevel = await getSetting('cultural_competency_level') || 'basic';
      setUserCompetencyLevel(competencyLevel);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadCollaborationData = async () => {
    try {
      setLoading(true);
      
      // In production, these would come from API
      const mockActiveCollaborations: Collaboration[] = [
        {
          id: '1',
          type: 'mentorship',
          title: 'Indigenous Youth Leadership Mentorship',
          description: 'Mentoring emerging Indigenous leaders in community organizing and storytelling',
          participants: [
            {
              id: 'mentor-1',
              name: 'Elder Sarah Bigbear',
              role: 'Mentor',
              cultural_competency_level: 'elder',
              avatar_url: undefined
            },
            {
              id: 'mentee-1',
              name: 'Jordan Crow Feather',
              role: 'Mentee',
              cultural_competency_level: 'developing',
              avatar_url: undefined
            }
          ],
          status: 'active',
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-07-20T00:00:00Z',
          cultural_protocols_required: true,
          expected_duration: '6 months',
          skills_involved: ['Community Organizing', 'Traditional Knowledge', 'Leadership Development'],
          impact_potential: 'regional'
        },
        {
          id: '2',
          type: 'collective_project',
          title: 'Climate Justice Storytelling Collective',
          description: 'Collaborative storytelling project documenting climate impacts on Indigenous communities',
          participants: [
            {
              id: 'p1',
              name: 'Maria Santos',
              role: 'Coordinator',
              cultural_competency_level: 'enhanced',
              avatar_url: undefined
            },
            {
              id: 'p2',
              name: 'Dr. James Littlewolf',
              role: 'Researcher',
              cultural_competency_level: 'culturally_competent',
              avatar_url: undefined
            },
            {
              id: 'p3',
              name: 'Aisha Patel',
              role: 'Designer',
              cultural_competency_level: 'standard',
              avatar_url: undefined
            }
          ],
          status: 'active',
          created_at: '2024-02-01T00:00:00Z',
          updated_at: '2024-07-18T00:00:00Z',
          cultural_protocols_required: true,
          expected_duration: '12 months',
          skills_involved: ['Research', 'Storytelling', 'Climate Science', 'Community Engagement'],
          impact_potential: 'international'
        }
      ];
      
      const mockOpportunities: CollaborationOpportunity[] = [
        {
          id: '1',
          type: 'mentorship_offer',
          title: 'Mentorship in Decolonizing Tech Practices',
          description: 'Experienced tech worker offering mentorship on integrating Indigenous values into technology development',
          storyteller: {
            id: 'st1',
            name: 'Alex Windcrow',
            expertise_areas: ['Software Development', 'Indigenous Technology', 'Community Protocols'],
            cultural_competency_level: 'culturally_competent',
            availability: 'Part-time (5-10 hours/month)'
          },
          requirements: ['Basic programming knowledge', 'Interest in decolonizing tech'],
          cultural_considerations: 'Understanding of Indigenous approaches to technology and community consent',
          match_score: 85
        },
        {
          id: '2',
          type: 'project_collaboration',
          title: 'Mental Health Resources in Indigenous Languages',
          description: 'Seeking collaborators for developing culturally appropriate mental health storytelling resources',
          storyteller: {
            id: 'st2',
            name: 'Dr. Rainbow Hawk',
            expertise_areas: ['Mental Health', 'Indigenous Languages', 'Traditional Healing'],
            cultural_competency_level: 'knowledge_keeper',
            availability: 'Project-based (3-6 months)'
          },
          requirements: ['Mental health background', 'Cultural competency certification', 'Language skills preferred'],
          cultural_considerations: 'Must demonstrate respect for traditional healing practices and cultural protocols',
          match_score: 92
        },
        {
          id: '3',
          type: 'referral_network',
          title: 'Indigenous Women Entrepreneurs Network',
          description: 'Building referral network for Indigenous women starting social enterprises',
          storyteller: {
            id: 'st3',
            name: 'Bernadette Standing Cloud',
            expertise_areas: ['Social Enterprise', 'Business Development', 'Indigenous Economics'],
            cultural_competency_level: 'elder',
            availability: 'Ongoing (2-3 hours/week)'
          },
          requirements: ['Business experience', 'Commitment to Indigenous women\'s empowerment'],
          cultural_considerations: 'Understanding of Indigenous approaches to economics and community wealth building',
          match_score: 78
        }
      ];
      
      setActiveCollaborations(mockActiveCollaborations);
      setOpportunities(mockOpportunities);
      
    } catch (error) {
      console.error('Error loading collaboration data:', error);
      Alert.alert('Error', 'Failed to load collaboration data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCollaborationData();
    setRefreshing(false);
  };

  const handleJoinCollaboration = async (opportunity: CollaborationOpportunity) => {
    try {
      // Track interest in collaboration
      await trackCollaboration({
        collaboration_type: opportunity.type === 'mentorship_offer' || opportunity.type === 'mentorship_seek' ? 'mentorship' : 
                            opportunity.type === 'project_collaboration' ? 'collective_project' : 'referral',
        participants: [opportunity.storyteller.id],
        interaction_depth: 'initial',
        cultural_protocol_adherence: true
      });
      
      Alert.alert(
        'Collaboration Request',
        `Your interest in "${opportunity.title}" has been sent to ${opportunity.storyteller.name}. They will be notified and can reach out to discuss next steps.`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Error joining collaboration:', error);
      Alert.alert('Error', 'Failed to send collaboration request. Please try again.');
    }
  };

  const handleViewCollaboration = async (collaboration: Collaboration) => {
    try {
      // Track collaboration view
      await trackEngagement({
        type: 'collaboration_view',
        data: {
          collaboration_id: collaboration.id,
          collaboration_type: collaboration.type,
          participants_count: collaboration.participants.length
        }
      });
      
      // In production, this would navigate to detailed collaboration view
      Alert.alert(
        collaboration.title,
        `${collaboration.description}\n\nStatus: ${collaboration.status}\nParticipants: ${collaboration.participants.map(p => p.name).join(', ')}\n\nSkills: ${collaboration.skills_involved.join(', ')}`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Error viewing collaboration:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'proposed': return '#FF9800';
      case 'paused': return '#9E9E9E';
      case 'completed': return '#2196F3';
      default: return '#757575';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mentorship': return '🎓';
      case 'collective_project': return '🤝';
      case 'referral': return '🔗';
      case 'mentorship_offer': return '🎯';
      case 'mentorship_seek': return '🙋';
      case 'project_collaboration': return '🚀';
      case 'referral_network': return '🌐';
      default: return '📝';
    }
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

  const renderActiveCollaboration = (collaboration: Collaboration) => (
    <TouchableOpacity 
      key={collaboration.id}
      onPress={() => handleViewCollaboration(collaboration)}
    >
      <Card style={styles.collaborationCard}>
        <Card.Content>
          <View style={styles.collaborationHeader}>
            <View style={styles.collaborationTitleContainer}>
              <Text style={styles.collaborationType}>
                {getTypeIcon(collaboration.type)} {collaboration.type.replace('_', ' ').toUpperCase()}
              </Text>
              <Text style={styles.collaborationTitle}>{collaboration.title}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(collaboration.status) }]}>
              <Text style={styles.statusText}>{collaboration.status.toUpperCase()}</Text>
            </View>
          </View>
          
          <Text style={styles.collaborationDescription} numberOfLines={3}>
            {collaboration.description}
          </Text>
          
          {/* Participants */}
          <View style={styles.participantsContainer}>
            <Text style={styles.participantsTitle}>Participants:</Text>
            <View style={styles.participants}>
              {collaboration.participants.map((participant, index) => (
                <View key={participant.id} style={styles.participant}>
                  <Avatar.Text 
                    size={32} 
                    label={participant.name.split(' ').map(n => n[0]).join('')}
                    style={[styles.participantAvatar, { backgroundColor: getCompetencyColor(participant.cultural_competency_level) }]}
                  />
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>{participant.name}</Text>
                    <Text style={styles.participantRole}>{participant.role}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
          
          {/* Skills and Details */}
          <View style={styles.skillsContainer}>
            {collaboration.skills_involved.slice(0, 3).map((skill, index) => (
              <Chip key={index} compact style={styles.skillChip}>
                {skill}
              </Chip>
            ))}
            {collaboration.skills_involved.length > 3 && (
              <Text style={styles.moreSkills}>+{collaboration.skills_involved.length - 3} more</Text>
            )}
          </View>
          
          <View style={styles.collaborationFooter}>
            <Text style={styles.duration}>
              ⏱️ {collaboration.expected_duration || 'Ongoing'}
            </Text>
            <Text style={styles.impact}>
              🌍 {collaboration.impact_potential} impact
            </Text>
            {collaboration.cultural_protocols_required && (
              <Text style={styles.culturalProtocol}>
                🏛️ Cultural protocols required
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderOpportunity = (opportunity: CollaborationOpportunity) => (
    <Card key={opportunity.id} style={styles.opportunityCard}>
      <Card.Content>
        <View style={styles.opportunityHeader}>
          <View style={styles.opportunityTitleContainer}>
            <Text style={styles.opportunityType}>
              {getTypeIcon(opportunity.type)} {opportunity.type.replace('_', ' ').toUpperCase()}
            </Text>
            <Text style={styles.opportunityTitle}>{opportunity.title}</Text>
            {opportunity.match_score && (
              <Text style={styles.matchScore}>
                🎯 {opportunity.match_score}% match
              </Text>
            )}
          </View>
        </View>
        
        <Text style={styles.opportunityDescription} numberOfLines={3}>
          {opportunity.description}
        </Text>
        
        {/* Storyteller Info */}
        <View style={styles.storytellerContainer}>
          <Avatar.Text 
            size={40} 
            label={opportunity.storyteller.name.split(' ').map(n => n[0]).join('')}
            style={[styles.storytellerAvatar, { backgroundColor: getCompetencyColor(opportunity.storyteller.cultural_competency_level) }]}
          />
          <View style={styles.storytellerInfo}>
            <Text style={styles.storytellerName}>{opportunity.storyteller.name}</Text>
            <Text style={styles.storytellerAvailability}>{opportunity.storyteller.availability}</Text>
            <View style={styles.expertiseContainer}>
              {opportunity.storyteller.expertise_areas.slice(0, 2).map((area, index) => (
                <Chip key={index} compact style={styles.expertiseChip}>
                  {area}
                </Chip>
              ))}
            </View>
          </View>
        </View>
        
        {/* Cultural Considerations */}
        {opportunity.cultural_considerations && (
          <View style={styles.culturalConsiderations}>
            <Text style={styles.culturalConsiderationsTitle}>🏛️ Cultural Considerations:</Text>
            <Text style={styles.culturalConsiderationsText}>
              {opportunity.cultural_considerations}
            </Text>
          </View>
        )}
        
        <View style={styles.opportunityFooter}>
          <Button 
            mode="contained" 
            onPress={() => handleJoinCollaboration(opportunity)}
            style={styles.joinButton}
          >
            Express Interest
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Surface style={styles.header}>
        <Text style={styles.headerTitle}>🤝 Community Collaboration</Text>
        <Text style={styles.headerSubtitle}>
          Connect, mentor, and create together with cultural protocols
        </Text>
      </Surface>
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'active', label: 'Active', count: activeCollaborations.length },
          { key: 'opportunities', label: 'Opportunities', count: opportunities.length },
          { key: 'history', label: 'History', count: 0 }
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label} ({tab.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
          />
        }
      >
        {activeTab === 'active' && (
          <View style={styles.tabContent}>
            {activeCollaborations.length > 0 ? (
              activeCollaborations.map(renderActiveCollaboration)
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No Active Collaborations</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Check out the opportunities tab to find ways to collaborate with other storytellers
                </Text>
              </View>
            )}
          </View>
        )}
        
        {activeTab === 'opportunities' && (
          <View style={styles.tabContent}>
            {opportunities.length > 0 ? (
              opportunities.map(renderOpportunity)
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No Collaboration Opportunities</Text>
                <Text style={styles.emptyStateSubtitle}>
                  New opportunities will appear here as storytellers share their projects and mentorship offers
                </Text>
              </View>
            )}
          </View>
        )}
        
        {activeTab === 'history' && (
          <View style={styles.tabContent}>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>Collaboration History</Text>
              <Text style={styles.emptyStateSubtitle}>
                Completed collaborations and past projects will appear here
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  collaborationCard: {
    marginBottom: 16,
    elevation: 2,
  },
  collaborationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  collaborationTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  collaborationType: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  collaborationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 22,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  collaborationDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  participantsContainer: {
    marginBottom: 12,
  },
  participantsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  participants: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  participant: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantAvatar: {
    marginRight: 8,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  participantRole: {
    fontSize: 11,
    color: '#666',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  skillChip: {
    backgroundColor: '#e3f2fd',
  },
  moreSkills: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  collaborationFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  duration: {
    fontSize: 11,
    color: '#666',
  },
  impact: {
    fontSize: 11,
    color: '#666',
  },
  culturalProtocol: {
    fontSize: 11,
    color: '#e65100',
    fontWeight: '500',
  },
  opportunityCard: {
    marginBottom: 16,
    elevation: 2,
  },
  opportunityHeader: {
    marginBottom: 8,
  },
  opportunityTitleContainer: {
    marginBottom: 4,
  },
  opportunityType: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  opportunityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 22,
    marginBottom: 4,
  },
  matchScore: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  opportunityDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  storytellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  storytellerAvatar: {
    marginRight: 12,
  },
  storytellerInfo: {
    flex: 1,
  },
  storytellerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  storytellerAvailability: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  expertiseContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  expertiseChip: {
    backgroundColor: '#e8f5e8',
  },
  culturalConsiderations: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  culturalConsiderationsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#e65100',
    marginBottom: 4,
  },
  culturalConsiderationsText: {
    fontSize: 12,
    color: '#e65100',
    lineHeight: 16,
  },
  opportunityFooter: {
    alignItems: 'center',
  },
  joinButton: {
    alignSelf: 'stretch',
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
});
