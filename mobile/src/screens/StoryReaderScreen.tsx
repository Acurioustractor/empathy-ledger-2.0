import React from 'react';
import { View, StyleSheet } from 'react-native';
import MobileStoryReader from '../components/story/MobileStoryReader';

interface StoryReaderScreenProps {
  route: {
    params: {
      story: any;
      accessLevel: 'public' | 'premium' | 'organizational';
    }
  };
  navigation: any;
}

export default function StoryReaderScreen({ route, navigation }: StoryReaderScreenProps) {
  const { story, accessLevel } = route.params;

  const handleEngagement = (engagement: any) => {
    // Handle engagement events from the story reader
    console.log('Story reader engagement:', engagement);
  };

  return (
    <View style={styles.container}>
      <MobileStoryReader 
        story={story}
        accessLevel={accessLevel}
        onEngagement={handleEngagement}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
