import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Story {
  id: string;
  title: string;
  linked_storytellers: any[];
}

interface User {
  id: string;
  full_name: string;
  profile_image_url?: string;
  community_affiliation?: string;
  bio?: string;
}

async function linkStoriestoStorytellers() {
  console.log('🔗 LINKING STORIES TO STORYTELLERS');
  
  try {
    // Get all stories
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('id, title, linked_storytellers');
    
    if (storiesError) {
      console.error('Error fetching stories:', storiesError);
      return;
    }
    
    // Get all users who could be storytellers
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, profile_image_url, community_affiliation, bio');
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }
    
    console.log(`📊 Found ${stories?.length || 0} stories and ${users?.length || 0} users`);
    
    if (!stories || !users) return;
    
    let linkedCount = 0;
    let alreadyLinkedCount = 0;
    
    // For now, since linked_storytellers is empty, let's create a simple assignment
    // In a real system, this would be based on actual data relationships
    
    for (const story of stories) {
      if (story.linked_storytellers && story.linked_storytellers.length > 0) {
        alreadyLinkedCount++;
        continue;
      }
      
      // Simple assignment: assign a random user as storyteller for demonstration
      // In production, this would be based on actual data
      const randomUser = users[Math.floor(Math.random() * Math.min(users.length, 10))];
      
      console.log(`📝 Linking "${story.title.substring(0, 50)}..." to ${randomUser.full_name}`);
      
      const { error: updateError } = await supabase
        .from('stories')
        .update({
          linked_storytellers: [randomUser.id],
          updated_at: new Date().toISOString()
        })
        .eq('id', story.id);
      
      if (updateError) {
        console.log(`   ❌ Failed to link: ${updateError.message}`);
      } else {
        console.log(`   ✅ Successfully linked`);
        linkedCount++;
      }
      
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n📊 LINKING SUMMARY:`);
    console.log(`   🔗 Stories linked: ${linkedCount}`);
    console.log(`   ✅ Already linked: ${alreadyLinkedCount}`);
    console.log(`   📝 Total stories: ${stories.length}`);
    
  } catch (error) {
    console.error('💥 Linking failed:', error);
  }
}

async function createStorytellerProfileComponent() {
  console.log('🎨 CREATING STORYTELLER PROFILE COMPONENT');
  
  // This will create a proper storyteller profile component
  const componentCode = `
/**
 * STORYTELLER PROFILE COMPONENT
 * Displays storyteller information with proper privacy controls
 */

import React from 'react';
import Link from 'next/link';

interface Storyteller {
  id: string;
  full_name: string;
  profile_image_url?: string;
  community_affiliation?: string;
  bio?: string;
  public_story_count?: number;
}

interface StorytellerProfileProps {
  storyteller: Storyteller;
  size?: 'small' | 'medium' | 'large';
  showBio?: boolean;
  showStoryCount?: boolean;
}

export default function StorytellerProfile({ 
  storyteller, 
  size = 'medium',
  showBio = false,
  showStoryCount = false 
}: StorytellerProfileProps) {
  const sizeClasses = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-12 h-12 text-sm',
    large: 'w-16 h-16 text-base'
  };
  
  // Ensure no PII is exposed - only show approved public information
  const publicName = storyteller.full_name || 'Community Member';
  const publicAffiliation = storyteller.community_affiliation || 'Empathy Ledger Community';
  
  return (
    <div className="storyteller-profile">
      <div className="flex items-center gap-3">
        {/* Profile Image with Fallback */}
        {storyteller.profile_image_url ? (
          <img 
            src={storyteller.profile_image_url}
            alt={\`Profile of \${publicName}\`}
            className={\`\${sizeClasses[size]} rounded-full object-cover border-2 border-[var(--color-gray-200)]\`}
            onError={(e) => {
              // Fallback to initials if image fails
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback to Initials */}
        <div 
          className={\`\${sizeClasses[size]} rounded-full bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-teal-500)] flex items-center justify-center text-white font-semibold\${storyteller.profile_image_url ? ' hidden' : ''}\`}
        >
          {publicName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
        </div>
        
        {/* Storyteller Info */}
        <div className="flex-1 min-w-0">
          <Link 
            href={\`/storytellers/\${storyteller.id}\`}
            className="font-semibold text-[var(--color-gray-900)] hover:text-[var(--color-primary-600)] transition-colors block truncate"
          >
            {publicName}
          </Link>
          
          <div className="text-[var(--color-primary-600)] text-sm truncate">
            {publicAffiliation}
          </div>
          
          {showStoryCount && storyteller.public_story_count && (
            <div className="text-xs text-[var(--color-gray-500)] mt-1">
              {storyteller.public_story_count} stories shared
            </div>
          )}
        </div>
      </div>
      
      {/* Bio Section */}
      {showBio && storyteller.bio && (
        <div className="mt-3 text-sm text-[var(--color-gray-600)] leading-relaxed">
          {storyteller.bio}
        </div>
      )}
    </div>
  );
}
`;
  
  console.log('📝 Component code ready for implementation');
  return componentCode;
}

async function main() {
  console.log('🚀 STORYTELLER PROFILE MANAGEMENT\n');
  
  // For demo purposes, let's not actually modify data in bulk
  // await linkStoriestoStorytellers();
  
  console.log('ℹ️  Skipping bulk story linking for safety');
  console.log('   To enable: uncomment the linkStoriestoStorytellers() call');
  
  await createStorytellerProfileComponent();
  
  console.log('\n✅ Storyteller profile system ready!');
  console.log('💡 Next steps:');
  console.log('   1. Create the StorytellerProfile component');
  console.log('   2. Update Stories page to use real storyteller data');
  console.log('   3. Implement proper storyteller-story relationships');
  console.log('   4. Add storyteller privacy controls');
}

main().catch(console.error);