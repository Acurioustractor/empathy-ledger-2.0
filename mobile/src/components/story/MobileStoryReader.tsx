import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Surface, Button, ProgressBar, IconButton, Menu, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

// Services
import { saveStoryProgress, getStoryProgress } from '../../services/database';
import { trackEngagement } from '../../services/analytics';
import { checkCulturalProtocols } from '../../services/culturalProtocols';

// Types
interface Story {
  id: string;
  title: string;
  content: string;
  audio_url?: string;
  cultural_protocols_required: boolean;
  storyteller: {
    id: string;
    name: string;
    cultural_competency_level: string;
  };
  professional_themes: string[];
  access_level: 'public' | 'premium' | 'organizational';
}

interface ReadingProgress {
  story_id: string;
  scroll_percentage: number;
  time_spent_seconds: number;
  last_position: number;
  completed: boolean;
}

interface MobileStoryReaderProps {
  story: Story;
  accessLevel: 'public' | 'premium' | 'organizational';
  onEngagement?: (engagement: any) => void;
}

const { height: screenHeight } = Dimensions.get('window');

export default function MobileStoryReader({ 
  story, 
  accessLevel, 
  onEngagement 
}: MobileStoryReaderProps) {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [readingProgress, setReadingProgress] = useState<ReadingProgress | null>(null);
  const [startTime] = useState(Date.now());
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [audioPosition, setAudioPosition] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [culturalProtocolsChecked, setCulturalProtocolsChecked] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [highlights, setHighlights] = useState<string[]>([]);

  useEffect(() => {
    initializeStoryReader();
    return () => {
      // Cleanup audio and save progress on unmount
      if (sound) {
        sound.unloadAsync();
      }
      saveCurrentProgress();
    };
  }, []);

  useEffect(() => {
    // Check cultural protocols if required
    if (story.cultural_protocols_required && !culturalProtocolsChecked) {
      checkStoryCulturalProtocols();
    }
  }, [story.cultural_protocols_required]);

  const initializeStoryReader = async () => {
    try {
      // Load previous reading progress
      const progress = await getStoryProgress(story.id);
      if (progress) {
        setReadingProgress(progress);
        // Scroll to last position
        if (scrollViewRef.current && progress.last_position > 0) {
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({ 
              y: progress.last_position, 
              animated: true 
            });
          }, 500);
        }
      }

      // Initialize audio if available
      if (story.audio_url) {
        await initializeAudio();
      }

      // Track story view
      trackEngagement({
        type: 'story_view',
        story_id: story.id,
        access_level: accessLevel,
        device_type: 'mobile'
      });

    } catch (error) {
      console.error('Error initializing story reader:', error);
    }
  };

  const initializeAudio = async () => {
    try {
      if (!story.audio_url) return;

      const { sound: audioSound } = await Audio.Sound.createAsync(
        { uri: story.audio_url },
        {
          shouldPlay: false,
          isLooping: false,
        },
        onAudioStatusUpdate
      );

      setSound(audioSound);
      
      // Get audio duration
      const status = await audioSound.getStatusAsync();
      if (status.isLoaded) {
        setAudioDuration(status.durationMillis || 0);
      }
    } catch (error) {
      console.error('Error loading audio:', error);
      Alert.alert('Audio Error', 'Unable to load story audio');
    }
  };

  const onAudioStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setAudioPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);
    }
  };

  const checkStoryCulturalProtocols = async () => {
    try {
      const protocolCheck = await checkCulturalProtocols({
        story_id: story.id,
        storyteller_cultural_level: story.storyteller.cultural_competency_level,
        reader_context: 'mobile_reading'
      });

      if (protocolCheck.requires_acknowledgment) {
        Alert.alert(
          '🏛️ Cultural Protocol Notice',
          protocolCheck.message || 'This story involves cultural content that requires respectful engagement.',
          [
            {
              text: 'I Understand',
              onPress: () => setCulturalProtocolsChecked(true)
            }
          ]
        );
      } else {
        setCulturalProtocolsChecked(true);
      }
    } catch (error) {
      console.error('Error checking cultural protocols:', error);
      setCulturalProtocolsChecked(true); // Allow reading if check fails
    }
  };

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const progress = contentOffset.y / (contentSize.height - layoutMeasurement.height);
    const clampedProgress = Math.max(0, Math.min(1, progress));
    
    setScrollProgress(clampedProgress);
    
    // Update reading progress
    const currentProgress: ReadingProgress = {
      story_id: story.id,
      scroll_percentage: clampedProgress * 100,
      time_spent_seconds: Math.floor((Date.now() - startTime) / 1000),
      last_position: contentOffset.y,
      completed: clampedProgress > 0.9
    };
    
    setReadingProgress(currentProgress);
    
    // Track engagement milestones
    if (clampedProgress >= 0.25 && (!readingProgress || readingProgress.scroll_percentage < 25)) {
      trackEngagement({
        type: 'reading_milestone',
        story_id: story.id,
        milestone: '25_percent',
        time_spent: currentProgress.time_spent_seconds
      });
    }
    
    if (clampedProgress >= 0.75 && (!readingProgress || readingProgress.scroll_percentage < 75)) {
      trackEngagement({
        type: 'reading_milestone',
        story_id: story.id,
        milestone: '75_percent',
        time_spent: currentProgress.time_spent_seconds
      });
    }
  };

  const saveCurrentProgress = async () => {
    if (readingProgress) {
      await saveStoryProgress(readingProgress);
    }
  };

  const toggleAudioPlayback = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Error toggling audio playback:', error);
    }
  };

  const handleAudioSeek = async (position: number) => {
    if (!sound) return;

    try {
      await sound.setPositionAsync(position);
    } catch (error) {
      console.error('Error seeking audio:', error);
    }
  };

  const addHighlight = (text: string) => {
    setHighlights(prev => [...prev, text]);
    trackEngagement({
      type: 'highlight_added',
      story_id: story.id,
      highlight_text: text.substring(0, 100) // Limit length
    });
  };

  const shareStory = async () => {
    try {
      await Share.share({
        message: `Check out this story: "${story.title}" on Empathy Ledger`,
        url: `https://empathyledger.com/stories/${story.id}`,
        title: story.title
      });
      
      trackEngagement({
        type: 'story_shared',
        story_id: story.id,
        platform: 'mobile_share'
      });
    } catch (error) {
      console.error('Error sharing story:', error);
    }
  };

  const adjustFontSize = (delta: number) => {
    setFontSize(prev => Math.max(12, Math.min(24, prev + delta)));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Surface style={styles.header}>
        <IconButton 
          icon="arrow-left" 
          onPress={() => navigation.goBack()}
          iconColor="#fff"
        />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {story.title}
          </Text>
          <Text style={styles.headerSubtitle}>
            by {story.storyteller.name}
          </Text>
        </View>
        <Menu
          visible={showMenu}
          onDismiss={() => setShowMenu(false)}
          anchor={
            <IconButton 
              icon="dots-vertical" 
              onPress={() => setShowMenu(true)}
              iconColor="#fff"
            />
          }
        >
          <Menu.Item 
            onPress={() => {
              adjustFontSize(2);
              setShowMenu(false);
            }} 
            title="Increase font size" 
            leadingIcon="format-font-size-increase"
          />
          <Menu.Item 
            onPress={() => {
              adjustFontSize(-2);
              setShowMenu(false);
            }} 
            title="Decrease font size" 
            leadingIcon="format-font-size-decrease"
          />
          <Divider />
          <Menu.Item 
            onPress={() => {
              shareStory();
              setShowMenu(false);
            }} 
            title="Share story" 
            leadingIcon="share-variant"
          />
        </Menu>
      </Surface>

      {/* Reading Progress */}
      <ProgressBar 
        progress={scrollProgress} 
        color="#2196F3" 
        style={styles.progressBar}
      />

      {/* Audio Controls */}
      {story.audio_url && sound && (
        <Surface style={styles.audioControls}>
          <IconButton
            icon={isPlaying ? "pause" : "play"}
            onPress={toggleAudioPlayback}
            size={24}
          />
          <View style={styles.audioProgress}>
            <Text style={styles.audioTime}>
              {Math.floor(audioPosition / 60000)}:
              {Math.floor((audioPosition % 60000) / 1000).toString().padStart(2, '0')}
            </Text>
            <ProgressBar
              progress={audioDuration > 0 ? audioPosition / audioDuration : 0}
              color="#2196F3"
              style={styles.audioProgressBar}
            />
            <Text style={styles.audioTime}>
              {Math.floor(audioDuration / 60000)}:
              {Math.floor((audioDuration % 60000) / 1000).toString().padStart(2, '0')}
            </Text>
          </View>
        </Surface>
      )}

      {/* Cultural Protocol Notice */}
      {story.cultural_protocols_required && (
        <Surface style={styles.culturalNotice}>
          <Text style={styles.culturalNoticeText}>
            🏛️ This story includes cultural content - please engage respectfully
          </Text>
        </Surface>
      )}

      {/* Story Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        onScroll={handleScroll}
        scrollEventThrottle={100}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.storyContainer}>
          {/* Professional Themes */}
          {story.professional_themes.length > 0 && (
            <View style={styles.themesContainer}>
              <Text style={styles.themesTitle}>Professional Themes:</Text>
              <View style={styles.themes}>
                {story.professional_themes.map((theme, index) => (
                  <View key={index} style={styles.themeTag}>
                    <Text style={styles.themeText}>{theme}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Story Text */}
          <Text 
            style={[styles.storyText, { fontSize }]}
            selectable={true}
            onSelectionChange={({ nativeEvent }) => {
              if (nativeEvent.text && nativeEvent.text.length > 10) {
                // Add selected text as highlight
                addHighlight(nativeEvent.text);
              }
            }}
          >
            {story.content}
          </Text>

          {/* Access Level Notice */}
          {accessLevel === 'public' && (
            <Surface style={styles.upgradeNotice}>
              <Text style={styles.upgradeText}>
                🔒 This is a preview. Subscribe to access the complete story and professional insights.
              </Text>
              <Button 
                mode="contained" 
                onPress={() => {/* Navigate to subscription */}}
                style={styles.upgradeButton}
              >
                Upgrade Access
              </Button>
            </Surface>
          )}

          {/* Highlights Section */}
          {highlights.length > 0 && (
            <View style={styles.highlightsContainer}>
              <Text style={styles.highlightsTitle}>Your Highlights:</Text>
              {highlights.map((highlight, index) => (
                <View key={index} style={styles.highlight}>
                  <Text style={styles.highlightText}>"{highlight}"</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Reading Completion */}
      {readingProgress?.completed && (
        <Surface style={styles.completionBanner}>
          <Text style={styles.completionText}>
            ✅ Story completed! Consider exploring the storyteller's other work.
          </Text>
          <Button 
            mode="outlined" 
            onPress={() => {/* Navigate to storyteller profile */}}
          >
            View Profile
          </Button>
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
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 10,
    paddingHorizontal: 4,
    backgroundColor: '#1976D2',
    elevation: 4,
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#E3F2FD',
    fontSize: 14,
  },
  progressBar: {
    height: 3,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 2,
  },
  audioProgress: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  audioTime: {
    fontSize: 12,
    color: '#666',
    width: 40,
    textAlign: 'center',
  },
  audioProgressBar: {
    flex: 1,
    marginHorizontal: 8,
  },
  culturalNotice: {
    margin: 16,
    padding: 12,
    backgroundColor: '#FFF3E0',
    elevation: 1,
  },
  culturalNoticeText: {
    color: '#E65100',
    fontSize: 14,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  storyContainer: {
    padding: 16,
  },
  themesContainer: {
    marginBottom: 16,
  },
  themesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  themes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  themeText: {
    color: '#1976D2',
    fontSize: 12,
    fontWeight: '500',
  },
  storyText: {
    lineHeight: 28,
    color: '#333',
    textAlign: 'justify',
  },
  upgradeNotice: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#FFF8E1',
    elevation: 1,
  },
  upgradeText: {
    color: '#F57F17',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  upgradeButton: {
    alignSelf: 'center',
  },
  highlightsContainer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  highlightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  highlight: {
    backgroundColor: '#FFFDE7',
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FBC02D',
  },
  highlightText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#333',
  },
  completionBanner: {
    padding: 16,
    backgroundColor: '#E8F5E8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  completionText: {
    flex: 1,
    color: '#2E7D32',
    fontSize: 14,
    marginRight: 12,
  },
});