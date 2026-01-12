import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    switch (type) {
      case 'regional-impact':
        return await getRegionalImpactData(supabase)
      case 'network-graph':
        return await getNetworkGraphData(supabase)
      case 'knowledge-flow':
        return await getKnowledgeFlowData(supabase)
      case 'overview':
        return await getOverviewData(supabase)
      default:
        return NextResponse.json({ error: 'Invalid analytics type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 })
  }
}

async function getRegionalImpactData(supabase: any) {
  // Get story counts by location
  const { data: locationData, error: locationError } = await supabase
    .from('users')
    .select(`
      primary_location_id,
      locations!inner(name, state, country)
    `)
    .not('primary_location_id', 'is', null)

  if (locationError) throw locationError

  // Group by state/region
  const regionCounts: { [key: string]: { stories: number, users: number, state: string } } = {}
  
  locationData?.forEach((user: any) => {
    const state = user.locations?.state || 'Unknown'
    if (!regionCounts[state]) {
      regionCounts[state] = { stories: 0, users: 0, state }
    }
    regionCounts[state].users += 1
  })

  // Get stories by user location
  const { data: storyData, error: storyError } = await supabase
    .from('stories')
    .select(`
      id,
      linked_storytellers,
      users!inner(primary_location_id, locations!inner(state))
    `)

  if (storyError) throw storyError

  // Count stories by region
  storyData?.forEach((story: any) => {
    if (story.users?.locations?.state) {
      const state = story.users.locations.state
      if (regionCounts[state]) {
        regionCounts[state].stories += 1
      }
    }
  })

  // Convert to array format expected by visualization
  const regionData = Object.entries(regionCounts).map(([state, data], index) => ({
    id: state.toLowerCase().replace(/\s+/g, '-'),
    name: state,
    impact: Math.min(95, 45 + (data.stories * 2) + (data.users * 1)), // Calculate impact score
    stories: data.stories,
    users: data.users,
    population: getStatePopulation(state), // Helper function
    centroid: getStateCentroid(state, index) // Helper function
  }))

  return NextResponse.json({ regionData })
}

async function getNetworkGraphData(supabase: any) {
  // Get communities (organizations)
  const { data: communities, error: commError } = await supabase
    .from('communities')
    .select('*')
    .limit(5)

  if (commError) throw commError

  // Get projects
  const { data: projects, error: projError } = await supabase
    .from('projects')
    .select(`
      *,
      communities!inner(name)
    `)
    .limit(5)

  if (projError) throw projError

  // Get story themes/topics
  const { data: stories, error: storyError } = await supabase
    .from('stories')
    .select('linked_themes, status')
    .eq('status', 'Published')
    .limit(10)

  if (storyError) throw storyError

  // Build network nodes
  const nodes = []
  const links = []

  // Add community nodes
  communities?.forEach((community: any, index: number) => {
    nodes.push({
      id: `comm-${community.id}`,
      name: community.name || `Community ${index + 1}`,
      type: 'community',
      x: 150 + (index * 100),
      y: 200 + (index * 50),
      size: 12 + Math.min(6, community.description?.length / 20 || 0),
      connections: Math.floor(Math.random() * 8) + 3,
      influence: Math.floor(Math.random() * 40) + 60
    })
  })

  // Add project nodes
  projects?.forEach((project: any, index: number) => {
    nodes.push({
      id: `proj-${project.id}`,
      name: project.name || `Project ${index + 1}`,
      type: 'outcome',
      x: 300 + (index * 80),
      y: 100 + (index * 60),
      size: 10 + Math.min(8, (project.description?.length || 0) / 15),
      connections: Math.floor(Math.random() * 6) + 4,
      influence: Math.floor(Math.random() * 30) + 70
    })

    // Link projects to their parent communities
    if (project.organization_id) {
      links.push({
        source: `comm-${project.organization_id}`,
        target: `proj-${project.id}`,
        strength: 0.8,
        type: 'generated'
      })
    }
  })

  // Add story theme nodes
  const themes = extractThemes(stories)
  themes.forEach((theme: string, index: number) => {
    nodes.push({
      id: `theme-${theme}`,
      name: theme,
      type: 'story',
      x: 200 + (index * 70),
      y: 150 + (index * 40),
      size: 8 + Math.min(4, theme.length / 10),
      connections: Math.floor(Math.random() * 5) + 2,
      influence: Math.floor(Math.random() * 25) + 55,
      theme: theme.toLowerCase()
    })

    // Link themes to random projects (representing influence)
    if (projects && projects.length > 0) {
      const randomProject = projects[Math.floor(Math.random() * projects.length)]
      links.push({
        source: `theme-${theme}`,
        target: `proj-${randomProject.id}`,
        strength: 0.6,
        type: 'influenced'
      })
    }
  })

  return NextResponse.json({ 
    nodes,
    links 
  })
}

async function getKnowledgeFlowData(supabase: any) {
  // Get communities and their knowledge metrics
  const { data: communities, error: commError } = await supabase
    .from('communities')
    .select(`
      *,
      projects(count)
    `)
    .limit(6)

  if (commError) throw commError

  // Get story counts by community
  const { data: storyCounts, error: storyError } = await supabase
    .from('stories')
    .select(`
      project_id,
      projects!inner(organization_id)
    `)

  if (storyError) throw storyError

  // Build knowledge nodes
  const nodes = communities?.map((community: any, index: number) => {
    const storyCount = storyCounts?.filter(s => 
      s.projects?.organization_id === community.id
    ).length || 0

    return {
      id: community.id,
      name: community.name || `Community ${index + 1}`,
      x: 100 + (index * 80),
      y: 150 + (Math.sin(index * 0.5) * 100),
      type: 'community',
      knowledge: Math.min(95, 40 + (storyCount * 5) + Math.floor(Math.random() * 25))
    }
  }) || []

  // Add expert/policy nodes
  nodes.push(
    {
      id: 'research-centre',
      name: 'Research Centre',
      x: 250,
      y: 80,
      type: 'expert',
      knowledge: 92
    },
    {
      id: 'policy-makers',
      name: 'Policy Makers', 
      x: 400,
      y: 120,
      type: 'policy',
      knowledge: 73
    }
  )

  // Build knowledge flows
  const flows = [
    {
      from: nodes[0]?.id || 'community-1',
      to: 'research-centre',
      strength: 0.8,
      type: 'story-sharing',
      active: true
    },
    {
      from: 'research-centre',
      to: 'policy-makers',
      strength: 0.9,
      type: 'evidence',
      active: true
    }
  ]

  // Add flows between communities
  for (let i = 0; i < nodes.length - 1; i++) {
    if (nodes[i].type === 'community' && nodes[i + 1]?.type === 'community') {
      flows.push({
        from: nodes[i].id,
        to: nodes[i + 1].id,
        strength: 0.6,
        type: 'peer-learning',
        active: Math.random() > 0.3
      })
    }
  }

  return NextResponse.json({
    nodes,
    flows
  })
}

async function getOverviewData(supabase: any) {
  // Get overall platform statistics
  const [
    { count: totalStories },
    { count: totalUsers },
    { count: totalProjects },
    { count: totalCommunities }
  ] = await Promise.all([
    supabase.from('stories').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('communities').select('*', { count: 'exact', head: true })
  ])

  return NextResponse.json({
    totalStories: totalStories || 0,
    totalUsers: totalUsers || 0,
    totalProjects: totalProjects || 0,
    totalCommunities: totalCommunities || 0
  })
}

// Helper functions
function getStatePopulation(state: string): number {
  const populations: { [key: string]: number } = {
    'NSW': 8164000,
    'VIC': 6648000,
    'QLD': 5185000,
    'WA': 2667000,
    'SA': 1771000,
    'TAS': 541000,
    'NT': 246000,
    'ACT': 431000
  }
  return populations[state] || 1000000
}

function getStateCentroid(state: string, index: number): [number, number] {
  const centroids: { [key: string]: [number, number] } = {
    'NSW': [400, 300],
    'VIC': [380, 380], 
    'QLD': [450, 200],
    'WA': [200, 280],
    'SA': [340, 340],
    'TAS': [380, 420],
    'NT': [320, 150],
    'ACT': [410, 320]
  }
  return centroids[state] || [300 + (index * 50), 250]
}

function extractThemes(stories: any[]): string[] {
  const themes = new Set<string>()
  
  stories?.forEach((story: any) => {
    if (story.linked_themes && Array.isArray(story.linked_themes)) {
      story.linked_themes.forEach((theme: string) => {
        if (theme && theme.trim()) {
          themes.add(theme.trim())
        }
      })
    }
  })
  
  // Default themes if none found
  if (themes.size === 0) {
    return ['Healthcare', 'Housing', 'Education', 'Employment', 'Community']
  }
  
  return Array.from(themes).slice(0, 8) // Limit to 8 themes
}