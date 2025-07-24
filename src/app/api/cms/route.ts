import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const slug = searchParams.get('slug')
    const page_type = searchParams.get('page_type')
    
    switch (type) {
      case 'page':
        return await getPage(supabase, slug)
      case 'pages':
        return await getPages(supabase, page_type)
      case 'blocks':
        return await getContentBlocks(supabase)
      case 'media':
        return await getMediaLibrary(supabase)
      default:
        return NextResponse.json({ error: 'Invalid CMS request type' }, { status: 400 })
    }
  } catch (error) {
    console.error('CMS API error:', error)
    return NextResponse.json({ error: 'Failed to fetch CMS data' }, { status: 500 })
  }
}

async function getPage(supabase: any, slug: string | null) {
  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
  }

  try {
    const { data: page, error } = await supabase
      .from('cms_pages')
      .select(`
        *,
        cms_page_blocks!inner(
          position,
          content_data,
          is_visible,
          cms_content_blocks!inner(
            name,
            block_type,
            category,
            schema,
            default_content
          )
        )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error) {
      // If CMS tables don't exist or page not found, return fallback
      if (error.code === '42P01' || error.code === 'PGRST116') {
        return NextResponse.json({ 
          useFallback: true, 
          message: 'CMS not available, using static content' 
        })
      }
      throw error
    }

    return NextResponse.json({ page })
  } catch (error) {
    console.error('Error fetching page:', error)
    return NextResponse.json({ 
      useFallback: true, 
      error: 'Page not found in CMS' 
    })
  }
}

async function getPages(supabase: any, pageType: string | null) {
  try {
    let query = supabase
      .from('cms_pages')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (pageType) {
      query = query.eq('page_type', pageType)
    }

    const { data: pages, error } = await query

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({ 
          useFallback: true, 
          pages: [] 
        })
      }
      throw error
    }

    return NextResponse.json({ pages })
  } catch (error) {
    console.error('Error fetching pages:', error)
    return NextResponse.json({ 
      useFallback: true, 
      pages: [] 
    })
  }
}

async function getContentBlocks(supabase: any) {
  try {
    const { data: blocks, error } = await supabase
      .from('cms_content_blocks')
      .select('*')
      .eq('is_active', true)

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({ 
          useFallback: true, 
          blocks: [] 
        })
      }
      throw error
    }

    return NextResponse.json({ blocks })
  } catch (error) {
    console.error('Error fetching content blocks:', error)
    return NextResponse.json({ 
      useFallback: true, 
      blocks: [] 
    })
  }
}

async function getMediaLibrary(supabase: any) {
  try {
    const { data: media, error } = await supabase
      .from('cms_media')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({ 
          useFallback: true, 
          media: [] 
        })
      }
      throw error
    }

    return NextResponse.json({ media })
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json({ 
      useFallback: true, 
      media: [] 
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const body = await request.json()
    const { type, data } = body
    
    switch (type) {
      case 'page':
        return await createPage(supabase, data)
      case 'block':
        return await createContentBlock(supabase, data)
      case 'media':
        return await uploadMedia(supabase, data)
      default:
        return NextResponse.json({ error: 'Invalid creation type' }, { status: 400 })
    }
  } catch (error) {
    console.error('CMS creation error:', error)
    return NextResponse.json({ error: 'Failed to create content' }, { status: 500 })
  }
}

async function createPage(supabase: any, pageData: any) {
  const { data, error } = await supabase
    .from('cms_pages')
    .insert(pageData)
    .select()
    .single()

  if (error) throw error
  
  return NextResponse.json({ page: data })
}

async function createContentBlock(supabase: any, blockData: any) {
  const { data, error } = await supabase
    .from('cms_content_blocks')
    .insert(blockData)
    .select()
    .single()

  if (error) throw error
  
  return NextResponse.json({ block: data })
}

async function uploadMedia(supabase: any, mediaData: any) {
  const { data, error } = await supabase
    .from('cms_media')
    .insert(mediaData)
    .select()
    .single()

  if (error) throw error
  
  return NextResponse.json({ media: data })
}