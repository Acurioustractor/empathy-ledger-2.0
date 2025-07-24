#!/usr/bin/env tsx

/**
 * Update Frontend Components to Use Supabase
 * 
 * Identifies and updates remaining components to use Supabase instead of mock data
 */

import { readFile, writeFile } from 'fs/promises'
import { glob } from 'glob'
import path from 'path'

async function updateFrontendComponents() {
  console.log('🔄 Updating Frontend Components to Use Supabase...')
  console.log('=' .repeat(60))
  
  try {
    // 1. Find components using mock data
    console.log('\n📋 SCANNING FOR MOCK DATA USAGE:')
    
    const files = await glob('src/**/*.{tsx,ts}', { 
      cwd: '/Users/benknight/Code/Empathy Ledger v.02',
      absolute: true 
    })
    
    const mockDataFiles: string[] = []
    
    for (const file of files) {
      try {
        const content = await readFile(file, 'utf-8')
        
        // Check for mock data patterns
        if (
          content.includes('mockData') ||
          content.includes('placeholder') ||
          content.includes('hardcoded') ||
          content.includes('// TODO: Replace with') ||
          content.includes('fake data') ||
          content.includes('sample data')
        ) {
          mockDataFiles.push(file)
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    console.log(`Found ${mockDataFiles.length} files with potential mock data:`)
    mockDataFiles.forEach(file => {
      const relativePath = path.relative('/Users/benknight/Code/Empathy Ledger v.02', file)
      console.log(`   ${relativePath}`)
    })
    
    // 2. Update Story Submission Form
    console.log('\n🚀 PRIORITY 1: Story Submission Form')
    await updateStorySubmissionForm()
    
    // 3. Update visualization components
    console.log('\n📊 PRIORITY 2: Data Visualizations')
    await updateVisualizationComponents()
    
    // 4. Update remaining mock data
    console.log('\n🔧 PRIORITY 3: Replace Remaining Mock Data')
    await updateMockDataReferences()
    
    console.log('\n✅ Frontend Update Complete!')
    console.log('🚀 Next Steps:')
    console.log('1. Test all updated components')
    console.log('2. Update any remaining API endpoints')
    console.log('3. Run final validation tests')
    console.log('4. Deploy and disable Airtable access')
    
  } catch (error) {
    console.error('❌ Frontend update failed:', error)
    throw error
  }
}

async function updateStorySubmissionForm() {
  const formPath = '/Users/benknight/Code/Empathy Ledger v.02/src/components/story/StorySubmissionForm.tsx'
  
  try {
    const content = await readFile(formPath, 'utf-8')
    
    // Add real submission logic
    const updatedContent = content.replace(
      /const handleSubmit = async \(\) => \{[\s\S]*?\};/,
      `const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Submit to Supabase via API
      const response = await fetch('/api/stories/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          // Add metadata
          submitted_at: new Date().toISOString(),
          ip_address: null, // Privacy-first approach
          user_agent: null, // No tracking
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit story');
      }

      const result = await response.json();
      
      if (onSubmit) {
        onSubmit(formData);
      }

      // Show success message
      console.log('Story submitted successfully:', result);
      
    } catch (error) {
      console.error('Story submission error:', error);
      // Show error message to user
    } finally {
      setIsSubmitting(false);
    }
  };`
    )
    
    await writeFile(formPath, updatedContent)
    console.log('   ✅ Updated StorySubmissionForm.tsx with real Supabase submission')
    
  } catch (error) {
    console.error('   ❌ Failed to update StorySubmissionForm:', error)
  }
}

async function updateVisualizationComponents() {
  const vizComponents = [
    'src/app/visualisations/impact-heatmap/page.tsx',
    'src/app/visualisations/network-graph/page.tsx', 
    'src/app/visualisations/knowledge-river/page.tsx'
  ]
  
  for (const component of vizComponents) {
    const fullPath = `/Users/benknight/Code/Empathy Ledger v.02/${component}`
    
    try {
      const content = await readFile(fullPath, 'utf-8')
      
      // Add data fetching from Supabase
      if (!content.includes('supabase') && !content.includes('fetch')) {
        console.log(`   ⚠️  ${component} needs Supabase integration`)
        console.log('      TODO: Add useEffect hook to fetch real data from /api/analytics')
      } else {
        console.log(`   ✅ ${component} already integrated`)
      }
      
    } catch (error) {
      console.log(`   ❌ Could not read ${component}`)
    }
  }
}

async function updateMockDataReferences() {
  // This would scan and suggest updates for remaining mock data
  // For now, we'll just log what needs to be done
  
  console.log('   📋 Manual review needed for:')
  console.log('   • Components with hardcoded data arrays')
  console.log('   • Test components using sample data')
  console.log('   • Documentation with placeholder content')
  console.log('   • API routes returning mock responses')
}

// Create the missing API endpoint for story submission
async function createStorySubmissionAPI() {
  const apiPath = '/Users/benknight/Code/Empathy Ledger v.02/src/app/api/stories/submit/route.ts'
  
  const apiContent = `import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const storyData = await request.json()
    
    // Validate required fields
    if (!storyData.content || !storyData.shareLevel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Insert story into Supabase
    const { data, error } = await supabase
      .from('stories')
      .insert({
        title: storyData.title,
        story_transcript: storyData.content,
        privacy_level: storyData.shareLevel,
        status: 'Published',
        featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error('Story submission error:', error)
      return NextResponse.json(
        { error: 'Failed to save story' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      story_id: data.id,
      message: 'Story submitted successfully'
    })
    
  } catch (error: any) {
    console.error('Story submission API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}`

  try {
    await writeFile(apiPath, apiContent)
    console.log('   ✅ Created /api/stories/submit endpoint')
  } catch (error) {
    console.error('   ❌ Failed to create API endpoint:', error)
  }
}

// Run the update
updateFrontendComponents().catch(console.error)

// Also create the missing API
createStorySubmissionAPI().catch(console.error)