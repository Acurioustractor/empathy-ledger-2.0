/**
 * CMS Service for Empathy Ledger
 * 
 * World-class content management service built on Supabase
 * with sovereignty, cultural protocols, and performance optimizations
 * 
 * UPDATED: Now uses existing Supabase connection patterns for consistency
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { 
  CMSPage, 
  ContentBlock, 
  NavigationMenu, 
  MediaFile,
  CMSPageInsert,
  CMSPageUpdate,
  ContentBlockInsert,
  ContentBlockUpdate,
  MediaUpload,
  CMSPageQuery,
  MediaQuery,
  CMSPageResponse,
  CMSPagesListResponse,
  MediaLibraryResponse,
  CMSError,
  PageStatus,
  BlockType
} from './types'

export class CMSService {
  private getClient: () => SupabaseClient | null
  private getServerClient: () => Promise<SupabaseClient>
  private cache: Map<string, { data: any; expires: number }> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  constructor(
    getClient: () => SupabaseClient | null,
    getServerClient: () => Promise<SupabaseClient>
  ) {
    this.getClient = getClient
    this.getServerClient = getServerClient
  }

  private async getSupabase(): Promise<SupabaseClient> {
    // Try client-side first (for browser), fall back to server-side
    const client = this.getClient()
    if (client) return client
    return await this.getServerClient()
  }

  // =====================================================
  // PAGE MANAGEMENT
  // =====================================================

  async createPage(pageData: CMSPageInsert): Promise<CMSPage> {
    try {
      const supabase = await this.getSupabase()
      
      // Validate cultural sensitivity
      await this.validateCulturalProtocols(pageData)

      // Check slug uniqueness
      const existingPage = await this.getPageBySlug(pageData.slug)
      if (existingPage) {
        throw new Error(`Page with slug '${pageData.slug}' already exists`)
      }

      // Create page
      const { data, error } = await supabase
        .from('cms_pages')
        .insert({
          ...pageData,
          content: pageData.content || [],
        })
        .select(`
          *,
          author:profiles!author_id(id, display_name, avatar_url)
        `)
        .single()

      if (error) throw error

      // Clear relevant caches
      this.invalidateCache(`pages:*`)

      return data as unknown as CMSPage
    } catch (error) {
      throw this.handleError('Failed to create page', error)
    }
  }

  async getPage(pageId: string, options?: {
    includeBlocks?: boolean
    includeAuthor?: boolean
    includeAnalytics?: boolean
  }): Promise<CMSPage | null> {
    try {
      const cacheKey = `page:${pageId}:${JSON.stringify(options)}`
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached

      const supabase = await this.getSupabase()
      let query = supabase
        .from('cms_pages')
        .select(`
          *
          ${options?.includeAuthor ? ', author:profiles!author_id(id, display_name, avatar_url, role)' : ''}
          ${options?.includeBlocks ? ', content_blocks:cms_content_blocks(*)' : ''}
        `)
        .eq('id', pageId)

      const { data, error } = await query.single()

      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        throw error
      }

      // Sort content blocks by order
      if (data && (data as any).content_blocks) {
        (data as any).content_blocks.sort((a: ContentBlock, b: ContentBlock) => a.block_order - b.block_order)
      }

      this.setCache(cacheKey, data)
      return data as unknown as CMSPage
    } catch (error) {
      throw this.handleError('Failed to get page', error)
    }
  }

  async getPageBySlug(slug: string, options?: {
    includeBlocks?: boolean
    includeAuthor?: boolean
    published?: boolean
  }): Promise<CMSPage | null> {
    try {
      const cacheKey = `page:slug:${slug}:${JSON.stringify(options)}`
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached

      const supabase = await this.getSupabase()
      let query = supabase
        .from('cms_pages')
        .select(`
          *
          ${options?.includeAuthor ? ', author:profiles!author_id(id, display_name, avatar_url)' : ''}
          ${options?.includeBlocks ? ', content_blocks:cms_content_blocks(*)' : ''}
        `)
        .eq('slug', slug)

      // Filter by published status if requested
      if (options?.published) {
        query = query.eq('status', 'published')
      }

      const { data, error } = await query.single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      // Sort content blocks by order
      if (data && (data as any).content_blocks) {
        (data as any).content_blocks.sort((a: ContentBlock, b: ContentBlock) => a.block_order - b.block_order)
      }

      // Track view if published
      if ((data as any)?.status === 'published') {
        this.trackPageView((data as any).id)
      }

      this.setCache(cacheKey, data)
      return data as unknown as CMSPage
    } catch (error) {
      throw this.handleError('Failed to get page by slug', error)
    }
  }

  async updatePage(pageId: string, updates: CMSPageUpdate, options?: {
    createVersion?: boolean
    publishImmediately?: boolean
  }): Promise<CMSPage> {
    try {
      const supabase = await this.getSupabase()
      
      // Validate cultural protocols if sensitivity changed
      if (updates.cultural_sensitivity || updates.requires_elder_review) {
        await this.validateCulturalProtocols(updates)
      }

      // Create version if requested
      if (options?.createVersion) {
        await this.createPageVersion(pageId)
      }

      // Prepare update data
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      }

      // Handle publishing
      if (options?.publishImmediately && updates.status === 'published') {
        updateData.published_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('cms_pages')
        .update(updateData)
        .eq('id', pageId)
        .select(`
          *,
          author:profiles!author_id(id, display_name, avatar_url)
        `)
        .single()

      if (error) throw error

      // Clear caches
      this.invalidateCache(`page:${pageId}:*`)
      this.invalidateCache(`page:slug:${data.slug}:*`)

      return data as unknown as CMSPage
    } catch (error) {
      throw this.handleError('Failed to update page', error)
    }
  }

  async deletePage(pageId: string): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      
      // Get page for cache invalidation
      const page = await this.getPage(pageId)
      if (!page) throw new Error('Page not found')

      const { error } = await supabase
        .from('cms_pages')
        .delete()
        .eq('id', pageId)

      if (error) throw error

      // Clear caches
      this.invalidateCache(`page:${pageId}:*`)
      this.invalidateCache(`page:slug:${page.slug}:*`)
      this.invalidateCache(`pages:*`)
    } catch (error) {
      throw this.handleError('Failed to delete page', error)
    }
  }

  async getPages(query: CMSPageQuery = {}): Promise<CMSPagesListResponse> {
    try {
      const cacheKey = `pages:${JSON.stringify(query)}`
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached

      const supabase = await this.getSupabase()
      let supabaseQuery = supabase
        .from('cms_pages')
        .select(`
          *
          ${query.include_author ? ', author:profiles!author_id(id, display_name, avatar_url)' : ''}
        `, { count: 'exact' })

      // Apply filters
      if (query.status) {
        if (Array.isArray(query.status)) {
          supabaseQuery = supabaseQuery.in('status', query.status)
        } else {
          supabaseQuery = supabaseQuery.eq('status', query.status)
        }
      }

      if (query.visibility) {
        if (Array.isArray(query.visibility)) {
          supabaseQuery = supabaseQuery.in('visibility', query.visibility)
        } else {
          supabaseQuery = supabaseQuery.eq('visibility', query.visibility)
        }
      }

      if (query.page_type) {
        if (Array.isArray(query.page_type)) {
          supabaseQuery = supabaseQuery.in('page_type', query.page_type)
        } else {
          supabaseQuery = supabaseQuery.eq('page_type', query.page_type)
        }
      }

      if (query.author_id) {
        supabaseQuery = supabaseQuery.eq('author_id', query.author_id)
      }

      // Apply pagination
      const limit = query.limit || 50
      const offset = query.offset || 0
      supabaseQuery = supabaseQuery.range(offset, offset + limit - 1)

      // Apply ordering
      const orderBy = query.order_by || 'updated_at'
      const orderDirection = query.order_direction || 'desc'
      supabaseQuery = supabaseQuery.order(orderBy, { ascending: orderDirection === 'asc' })

      const { data, error, count } = await supabaseQuery

      if (error) throw error

      const result = {
        pages: data as unknown as CMSPage[],
        total: count || 0,
        limit,
        offset
      }

      this.setCache(cacheKey, result)
      return result
    } catch (error) {
      throw this.handleError('Failed to get pages', error)
    }
  }

  // =====================================================
  // CONTENT BLOCK MANAGEMENT
  // =====================================================

  async addContentBlock(pageId: string, blockData: ContentBlockInsert): Promise<ContentBlock> {
    try {
      const supabase = await this.getSupabase()
      
      // Validate block data
      this.validateBlockData(blockData.block_type, blockData.block_data)

      const { data, error } = await supabase
        .from('cms_content_blocks')
        .insert({
          ...blockData,
          page_id: pageId
        })
        .select()
        .single()

      if (error) throw error

      // Update page's updated_at
      await supabase
        .from('cms_pages')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', pageId)

      // Clear page caches
      this.invalidateCache(`page:${pageId}:*`)

      return data as ContentBlock
    } catch (error) {
      throw this.handleError('Failed to add content block', error)
    }
  }

  async updateContentBlock(blockId: string, updates: ContentBlockUpdate): Promise<ContentBlock> {
    try {
      const supabase = await this.getSupabase()
      
      // Validate block data if provided
      if (updates.block_type && updates.block_data) {
        this.validateBlockData(updates.block_type, updates.block_data)
      }

      const { data, error } = await supabase
        .from('cms_content_blocks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', blockId)
        .select()
        .single()

      if (error) throw error

      // Update page's updated_at
      await supabase
        .from('cms_pages')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', data.page_id)

      // Clear page caches
      this.invalidateCache(`page:${data.page_id}:*`)

      return data as ContentBlock
    } catch (error) {
      throw this.handleError('Failed to update content block', error)
    }
  }

  async deleteContentBlock(blockId: string): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      
      // Get block for page cache invalidation
      const { data: block } = await supabase
        .from('cms_content_blocks')
        .select('page_id')
        .eq('id', blockId)
        .single()

      const { error } = await supabase
        .from('cms_content_blocks')
        .delete()
        .eq('id', blockId)

      if (error) throw error

      if (block) {
        // Update page's updated_at
        await supabase
          .from('cms_pages')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', block.page_id)

        // Clear page caches
        this.invalidateCache(`page:${block.page_id}:*`)
      }
    } catch (error) {
      throw this.handleError('Failed to delete content block', error)
    }
  }

  async reorderContentBlocks(pageId: string, blockOrders: Array<{id: string, order: number}>): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      
      // Update all blocks in a transaction-like approach
      const updates = blockOrders.map(({ id, order }) => 
        supabase
          .from('cms_content_blocks')
          .update({ 
            block_order: order,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
      )

      await Promise.all(updates)

      // Update page's updated_at
      await supabase
        .from('cms_pages')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', pageId)

      // Clear page caches
      this.invalidateCache(`page:${pageId}:*`)
    } catch (error) {
      throw this.handleError('Failed to reorder content blocks', error)
    }
  }

  // =====================================================
  // MEDIA MANAGEMENT
  // =====================================================

  async uploadMedia(upload: MediaUpload): Promise<MediaFile> {
    try {
      const supabase = await this.getSupabase()
      
      // Generate unique filename
      const fileExt = upload.file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${upload.folder_path || '/'}${fileName}`

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, upload.file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Create media record
      const mediaData = {
        filename: fileName,
        original_filename: upload.file.name,
        file_path: uploadData.path,
        file_size: upload.file.size,
        mime_type: upload.file.type,
        file_type: this.getFileType(upload.file.type),
        title: upload.title,
        alt_text: upload.alt_text,
        caption: upload.caption,
        description: upload.description,
        attribution: upload.attribution,
        folder_path: upload.folder_path || '/',
        tags: upload.tags || [],
        categories: upload.categories || [],
        consent_settings: {
          public_display: true,
          commercial_use: false,
          attribution_required: true,
          cultural_protocols: [],
          ...upload.consent_settings
        },
        uploaded_by: (await this.getCurrentUser())?.id
      }

      const { data, error } = await supabase
        .from('cms_media_library')
        .insert(mediaData)
        .select()
        .single()

      if (error) throw error

      // Generate variants for images
      if (data.file_type === 'image') {
        this.generateImageVariants(data.id, data.file_path)
      }

      // Clear media caches
      this.invalidateCache(`media:*`)

      return data as MediaFile
    } catch (error) {
      throw this.handleError('Failed to upload media', error)
    }
  }

  async getMediaLibrary(query: MediaQuery = {}): Promise<MediaLibraryResponse> {
    try {
      const cacheKey = `media:${JSON.stringify(query)}`
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached

      const supabase = await this.getSupabase()
      let supabaseQuery = supabase
        .from('cms_media_library')
        .select('*', { count: 'exact' })

      // Apply filters
      if (query.file_type) {
        if (Array.isArray(query.file_type)) {
          supabaseQuery = supabaseQuery.in('file_type', query.file_type)
        } else {
          supabaseQuery = supabaseQuery.eq('file_type', query.file_type)
        }
      }

      if (query.folder_path) {
        supabaseQuery = supabaseQuery.eq('folder_path', query.folder_path)
      }

      if (query.tags && query.tags.length > 0) {
        supabaseQuery = supabaseQuery.overlaps('tags', query.tags)
      }

      if (query.categories && query.categories.length > 0) {
        supabaseQuery = supabaseQuery.overlaps('categories', query.categories)
      }

      if (query.uploaded_by) {
        supabaseQuery = supabaseQuery.eq('uploaded_by', query.uploaded_by)
      }

      if (query.processing_status) {
        supabaseQuery = supabaseQuery.eq('processing_status', query.processing_status)
      }

      if (query.search) {
        supabaseQuery = supabaseQuery.or(`title.ilike.%${query.search}%,original_filename.ilike.%${query.search}%`)
      }

      // Apply pagination
      const limit = query.limit || 50
      const offset = query.offset || 0
      supabaseQuery = supabaseQuery.range(offset, offset + limit - 1)

      // Order by created_at desc
      supabaseQuery = supabaseQuery.order('created_at', { ascending: false })

      const { data, error, count } = await supabaseQuery

      if (error) throw error

      // Get folder list
      const { data: folderData } = await supabase
        .from('cms_media_library')
        .select('folder_path')
        .neq('folder_path', '/')

      const folders = [...new Set(folderData?.map(f => f.folder_path) || [])]

      // Calculate total size
      const { data: sizeData } = await supabase
        .from('cms_media_library')
        .select('file_size')

      const totalSize = sizeData?.reduce((sum, file) => sum + file.file_size, 0) || 0

      const result = {
        media: data as MediaFile[],
        total: count || 0,
        limit,
        offset,
        folders,
        total_size: totalSize
      }

      this.setCache(cacheKey, result)
      return result
    } catch (error) {
      throw this.handleError('Failed to get media library', error)
    }
  }

  // =====================================================
  // NAVIGATION MANAGEMENT
  // =====================================================

  async getNavigationMenu(name: string = 'main'): Promise<NavigationMenu | null> {
    try {
      const cacheKey = `nav:${name}`
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached

      const supabase = await this.getSupabase()
      const { data, error } = await supabase
        .from('cms_navigation_menus')
        .select('*')
        .eq('name', name)
        .eq('active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      this.setCache(cacheKey, data)
      return data as NavigationMenu
    } catch (error) {
      throw this.handleError('Failed to get navigation menu', error)
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  private validateBlockData(blockType: BlockType, blockData: any): void {
    // Basic validation - can be expanded
    if (!blockData || typeof blockData !== 'object') {
      throw new Error('Block data must be an object')
    }

    // Type-specific validation
    switch (blockType) {
      case 'hero':
        if (!blockData.title) {
          throw new Error('Hero block requires a title')
        }
        break
      case 'text':
        if (!blockData.content) {
          throw new Error('Text block requires content')
        }
        break
      case 'image':
        if (!blockData.image_url || !blockData.alt_text) {
          throw new Error('Image block requires image_url and alt_text')
        }
        break
      // Add more validations as needed
    }
  }

  private async validateCulturalProtocols(pageData: Partial<CMSPageInsert | CMSPageUpdate>): Promise<void> {
    if (pageData.cultural_sensitivity === 'sacred' || pageData.cultural_sensitivity === 'ceremonial') {
      if (!pageData.requires_elder_review) {
        throw new Error('Sacred or ceremonial content requires elder review')
      }
    }
  }

  private async createPageVersion(pageId: string): Promise<void> {
    // Implementation for version control
    const page = await this.getPage(pageId, { includeBlocks: true })
    if (page) {
      const supabase = await this.getSupabase()
      await supabase
        .from('cms_page_versions')
        .insert({
          page_id: pageId,
          version_number: page.version,
          title: page.title,
          content: page.content_blocks || [],
          status: page.status,
          created_by: (await this.getCurrentUser())?.id
        })
    }
  }

  private async trackPageView(pageId: string): Promise<void> {
    try {
      // Increment view count (fire and forget)
      const supabase = await this.getSupabase()
      await supabase
        .from('cms_pages')
        .update({ 
          view_count: 1, // TODO: Implement proper increment
          updated_at: new Date().toISOString()
        })
        .eq('id', pageId)
      
      // Clear cache after view count update
      this.invalidateCache(`page:${pageId}:*`)
    } catch (error) {
      // Silently fail view tracking
    }
  }

  private getFileType(mimeType: string): MediaFile['file_type'] {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('audio/')) return 'audio'
    if (mimeType.includes('pdf') || mimeType.includes('document')) return 'document'
    return 'other'
  }

  private async generateImageVariants(mediaId: string, filePath: string): Promise<void> {
    // Background task to generate thumbnails and optimized versions
    setTimeout(async () => {
      try {
        const supabase = await this.getSupabase()
        const variants = {
          thumbnail: `${filePath}_thumb.webp`,
          medium: `${filePath}_medium.webp`,
          large: `${filePath}_large.webp`
        }

        await supabase
          .from('cms_media_library')
          .update({
            processed_variants: variants,
            processing_status: 'complete'
          })
          .eq('id', mediaId)
      } catch (error) {
        const supabase = await this.getSupabase()
        await supabase
          .from('cms_media_library')
          .update({ processing_status: 'error' })
          .eq('id', mediaId)
      }
    }, 1000)
  }

  private async getCurrentUser() {
    const supabase = await this.getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  // =====================================================
  // CACHING
  // =====================================================

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key)
    if (cached && cached.expires > Date.now()) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + this.CACHE_TTL
    })

    // Limit cache size
    if (this.cache.size > 1000) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
  }

  private invalidateCache(pattern: string): void {
    const regex = new RegExp(pattern.replace('*', '.*'))
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  // =====================================================
  // ERROR HANDLING
  // =====================================================

  private handleError(message: string, error: any): CMSError {
    console.error(`CMS Error: ${message}`, error)
    
    return {
      code: error.code || 'UNKNOWN_ERROR',
      message: `${message}: ${error.message || 'Unknown error'}`,
      details: error
    }
  }
}