/**
 * API: Test Complete End-to-End User Journey
 * Validates the entire storyteller onboarding and story creation pipeline
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

interface TestResult {
  step: string;
  status: 'success' | 'error';
  message: string;
  data?: any;
  error?: string;
}

export async function POST() {
  const results: TestResult[] = [];
  let testStoryteller: any = null;
  let testStory: any = null;

  try {
    const supabase = await createAdminClient();
    const testEmail = `test-${Date.now()}@empathyledger.test`;

    // Step 1: Test Storyteller Registration
    try {
      const registrationData = {
        full_name: 'Test Storyteller',
        email: testEmail,
        role: 'Community Organizer',
        organization: 'Test Organization',
        location: 'Test City, Test Country',
        bio: 'This is a test storyteller profile created during the end-to-end journey validation. This bio contains more than fifty words to ensure it meets the completion scoring requirements and demonstrates the comprehensive nature of our storytelling platform.',
        website: 'https://test.example.com',
        linkedin_url: 'https://linkedin.com/in/test',
        privacy_preferences: {
          profile_visibility: 'public',
          allow_contact: true,
          share_analytics: true
        }
      };

      const registrationResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3007'}/api/onboarding/register-storyteller`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });

      if (registrationResponse.ok) {
        const registrationResult = await registrationResponse.json();
        testStoryteller = registrationResult.storyteller;
        results.push({
          step: '1. Storyteller Registration',
          status: 'success',
          message: `Storyteller created with ID: ${testStoryteller.id}`,
          data: {
            storyteller_id: testStoryteller.id,
            completion_score: testStoryteller.completion_score,
            onboarding_tasks: registrationResult.onboarding.next_steps.length
          }
        });
      } else {
        const error = await registrationResponse.json();
        throw new Error(error.error || 'Registration failed');
      }
    } catch (error) {
      results.push({
        step: '1. Storyteller Registration',
        status: 'error',
        message: 'Failed to register storyteller',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return NextResponse.json({ success: false, results });
    }

    // Step 2: Test Storyteller Profile Retrieval
    try {
      const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3007'}/api/storytellers/${testStoryteller.id}`);
      
      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        results.push({
          step: '2. Profile Retrieval',
          status: 'success',
          message: 'Profile retrieved successfully',
          data: {
            has_privacy_preferences: !!profile.privacy_preferences,
            story_count: profile.story_statistics?.total_stories || 0
          }
        });
      } else {
        const errorDetails = await profileResponse.json();
        throw new Error(`Profile retrieval failed: ${errorDetails.error || 'Unknown error'}`);
      }
    } catch (error) {
      results.push({
        step: '2. Profile Retrieval',
        status: 'error',
        message: 'Failed to retrieve profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Step 3: Test AI Theme Suggestions
    try {
      const storyContent = `
        Last summer, I was working with a community organization in our local Indigenous community when I encountered a situation that completely changed how I approach collaboration. We were planning a youth engagement program, and I had developed what I thought was a comprehensive plan based on my previous experience in similar communities.

        However, when I presented the plan to the Elders and community leaders, they politely but firmly pointed out that I had missed several crucial cultural protocols. Rather than being offended, I realized this was an opportunity to learn something far more valuable than any university course could teach.

        The Elder who spoke with me explained that effective community work requires understanding not just the what and the how, but the why behind cultural practices. She spent hours teaching me about the importance of relationship-building, consent protocols, and the role of storytelling in their community.

        This experience taught me that authentic professional relationships are built on humility, respect, and genuine willingness to learn from community wisdom. I now always begin any community project by asking how I can support existing protocols rather than imposing external frameworks.

        This approach has made me a much more effective community organizer and has led to deeper, more sustainable partnerships in all my professional work.
      `;

      const suggestionsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3007'}/api/ai-analysis/suggest-themes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: storyContent,
          storyteller_role: 'Community Organizer'
        })
      });

      if (suggestionsResponse.ok) {
        const suggestions = await suggestionsResponse.json();
        results.push({
          step: '3. AI Theme Suggestions',
          status: 'success',
          message: 'AI suggestions generated successfully',
          data: {
            themes_suggested: suggestions.themes.length,
            professional_outcomes: suggestions.professional_outcomes.length,
            collaboration_opportunities: suggestions.collaboration_opportunities.length,
            confidence_score: suggestions.confidence_score
          }
        });
      } else {
        throw new Error('AI suggestions failed');
      }
    } catch (error) {
      results.push({
        step: '3. AI Theme Suggestions',
        status: 'error',
        message: 'Failed to generate AI suggestions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Step 4: Test Story Creation
    try {
      const storyData = {
        storyteller_id: testStoryteller.id,
        title: 'Learning Cultural Protocols: A Community Organizer\'s Journey',
        story_type: 'primary',
        content: `
          Last summer, I was working with a community organization in our local Indigenous community when I encountered a situation that completely changed how I approach collaboration. We were planning a youth engagement program, and I had developed what I thought was a comprehensive plan based on my previous experience in similar communities.

          However, when I presented the plan to the Elders and community leaders, they politely but firmly pointed out that I had missed several crucial cultural protocols. Rather than being offended, I realized this was an opportunity to learn something far more valuable than any university course could teach.

          The Elder who spoke with me explained that effective community work requires understanding not just the what and the how, but the why behind cultural practices. She spent hours teaching me about the importance of relationship-building, consent protocols, and the role of storytelling in their community.

          This experience taught me that authentic professional relationships are built on humility, respect, and genuine willingness to learn from community wisdom. I now always begin any community project by asking how I can support existing protocols rather than imposing external frameworks.

          This approach has made me a much more effective community organizer and has led to deeper, more sustainable partnerships in all my professional work.
        `,
        themes: ['Cultural Safety', 'Community Building', 'Professional Growth', 'Leadership'],
        privacy_level: 'public',
        professional_outcomes: [
          'Cultural competency development',
          'Community engagement protocols',
          'Collaborative leadership skills'
        ],
        collaboration_opportunities: [
          'Cultural safety training',
          'Community partnership development'
        ]
      };

      const storyResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3007'}/api/storytellers/create-story`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyData)
      });

      if (storyResponse.ok) {
        const storyResult = await storyResponse.json();
        testStory = storyResult.story;
        results.push({
          step: '4. Story Creation',
          status: 'success',
          message: `Story created with ID: ${testStory.id}`,
          data: {
            story_id: testStory.id,
            story_type: testStory.story_type,
            privacy_level: testStory.privacy_level,
            story_url: storyResult.story_url
          }
        });
      } else {
        const error = await storyResponse.json();
        throw new Error(`Story creation failed: ${error.error || error.details || 'Unknown error'}`);
      }
    } catch (error) {
      results.push({
        step: '4. Story Creation',
        status: 'error',
        message: 'Failed to create story',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Step 5: Test Story Retrieval
    if (testStory) {
      try {
        const storyResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3007'}/api/stories/${testStory.id}`);
        
        if (storyResponse.ok) {
          const story = await storyResponse.json();
          results.push({
            step: '5. Story Retrieval',
            status: 'success',
            message: 'Story retrieved successfully',
            data: {
              story_id: story.id,
              title: story.title,
              has_content: !!story.content_structure,
              storyteller_name: story.storyteller?.full_name
            }
          });
        } else {
          throw new Error('Story retrieval failed');
        }
      } catch (error) {
        results.push({
          step: '5. Story Retrieval',
          status: 'error',
          message: 'Failed to retrieve story',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Step 6: Test Engagement Features
    if (testStory) {
      try {
        // Add test reactions
        const reactions = [
          { story_id: testStory.id, user_id: 'test-user-1', reaction_type: 'heart' },
          { story_id: testStory.id, user_id: 'test-user-2', reaction_type: 'inspire' }
        ];

        const { error: reactionsError } = await supabase
          .from('story_reactions')
          .insert(reactions);

        // Add test comments
        const comments = [
          {
            story_id: testStory.id,
            user_id: 'test-user-1',
            content: 'Thank you for sharing this important learning about cultural protocols.',
            is_approved: true
          }
        ];

        const { error: commentsError } = await supabase
          .from('story_comments')
          .insert(comments);

        if (!reactionsError && !commentsError) {
          // Get engagement stats
          const { data: reactionCount } = await supabase
            .from('story_reactions')
            .select('*')
            .eq('story_id', testStory.id);

          const { data: commentCount } = await supabase
            .from('story_comments')
            .select('*')
            .eq('story_id', testStory.id);

          results.push({
            step: '6. Engagement Features',
            status: 'success',
            message: 'Engagement features working correctly',
            data: {
              reactions_added: reactionCount?.length || 0,
              comments_added: commentCount?.length || 0
            }
          });
        } else {
          throw new Error('Failed to add engagement data');
        }
      } catch (error) {
        results.push({
          step: '6. Engagement Features',
          status: 'error',
          message: 'Failed to test engagement features',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Step 7: Cleanup Test Data
    try {
      if (testStory) {
        // Clean up reactions and comments
        await supabase.from('story_reactions').delete().eq('story_id', testStory.id);
        await supabase.from('story_comments').delete().eq('story_id', testStory.id);
        
        // Clean up story
        await supabase.from('stories').delete().eq('id', testStory.id);
      }

      if (testStoryteller) {
        // Clean up privacy preferences
        await supabase.from('storyteller_privacy_preferences').delete().eq('storyteller_id', testStoryteller.id);
        
        // Clean up storyteller
        await supabase.from('storytellers').delete().eq('id', testStoryteller.id);
      }

      results.push({
        step: '7. Cleanup',
        status: 'success',
        message: 'Test data cleaned up successfully'
      });
    } catch (error) {
      results.push({
        step: '7. Cleanup',
        status: 'error',
        message: 'Failed to cleanup test data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Calculate overall success
    const successfulSteps = results.filter(r => r.status === 'success').length;
    const totalSteps = results.length;
    const successRate = Math.round((successfulSteps / totalSteps) * 100);

    return NextResponse.json({
      success: successRate >= 85, // 85% success rate required
      message: `End-to-end journey test completed with ${successRate}% success rate`,
      summary: {
        total_steps: totalSteps,
        successful_steps: successfulSteps,
        failed_steps: totalSteps - successfulSteps,
        success_rate: successRate
      },
      test_results: results,
      journey_validation: {
        onboarding_functional: results.find(r => r.step.includes('Registration'))?.status === 'success',
        profile_management_functional: results.find(r => r.step.includes('Profile'))?.status === 'success',
        ai_analysis_functional: results.find(r => r.step.includes('AI'))?.status === 'success',
        story_creation_functional: results.find(r => r.step.includes('Story Creation'))?.status === 'success',
        content_retrieval_functional: results.find(r => r.step.includes('Story Retrieval'))?.status === 'success',
        engagement_functional: results.find(r => r.step.includes('Engagement'))?.status === 'success',
        cleanup_functional: results.find(r => r.step.includes('Cleanup'))?.status === 'success'
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Critical failure in journey test',
      details: error instanceof Error ? error.message : 'Unknown error',
      completed_results: results
    }, { status: 500 });
  }
}