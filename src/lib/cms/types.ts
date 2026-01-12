// CMS Types for Empathy Ledger
// World-class TypeScript definitions for the CMS system

export type PageStatus = 'draft' | 'review' | 'published' | 'archived'
export type PageVisibility = 'public' | 'community' | 'members' | 'admin'
export type PageType = 'static' | 'dynamic' | 'community' | 'landing' | 'template'
export type CulturalSensitivity = 'general' | 'restricted' | 'ceremonial' | 'sacred'

export type BlockType = 
  | 'hero'
  | 'text' 
  | 'image'
  | 'video'
  | 'audio'
  | 'testimonial'
  | 'stats'
  | 'form'
  | 'story_showcase'
  | 'community_stats'
  | 'interactive_map'
  | 'timeline'
  | 'gallery'
  | 'embed'
  | 'call_to_action'

export interface CMSPage {
  id: string
  slug: string
  title: string
  content: ContentBlock[]
  meta_description?: string
  meta_keywords?: string[]
  
  // Sovereignty Features
  page_type: PageType
  visibility: PageVisibility
  cultural_sensitivity: CulturalSensitivity
  requires_elder_review: boolean
  
  // Content Management
  status: PageStatus
  author_id?: string
  reviewer_id?: string
  review_notes?: string
  
  // SEO & Analytics
  canonical_url?: string
  og_image_url?: string
  view_count: number
  bounce_rate?: number
  avg_time_on_page?: string
  
  // Scheduling
  published_at?: string
  expires_at?: string
  
  // Versioning
  version: number
  parent_version_id?: string
  version_notes?: string
  
  // Metadata
  created_at: string
  updated_at: string
  
  // Computed fields
  author?: Profile
  reviewer?: Profile
  content_blocks?: ContentBlock[]
}

export interface ContentBlock {
  id: string
  page_id: string
  block_type: BlockType
  block_order: number
  block_data: Record<string, any>
  
  // Display Control
  display_conditions?: Record<string, any>
  css_classes?: string[]
  custom_styles?: Record<string, any>
  
  // A/B Testing
  experiment_id?: string
  variant_name?: string
  traffic_allocation: number
  
  // Analytics
  interaction_count: number
  conversion_events?: any[]
  
  created_at: string
  updated_at: string
}

export interface NavigationMenu {
  id: string
  name: string
  menu_items: MenuItem[]
  visibility_rules: Record<string, any>
  required_permissions?: string[]
  styling?: Record<string, any>
  behavior_config?: Record<string, any>
  active: boolean
  created_at: string
  updated_at: string
}

export interface MenuItem {
  id: string
  label: string
  href?: string
  icon?: string
  children?: MenuItem[]
  order_position: number
  required_role?: string[]
  required_communities?: string[]
  active: boolean
}

export interface MediaFile {
  id: string
  filename: string
  original_filename: string
  file_path: string
  file_size: number
  mime_type: string
  file_type: 'image' | 'video' | 'audio' | 'document' | 'other'
  
  // Media Metadata
  title?: string
  alt_text?: string
  caption?: string
  description?: string
  attribution?: string
  
  // Technical Details
  dimensions?: { width: number; height: number }
  duration?: string
  color_palette?: string[]
  
  // Sovereignty & Consent
  consent_settings: {
    public_display: boolean
    commercial_use: boolean
    attribution_required: boolean
    cultural_protocols: string[]
  }
  
  // Organization
  folder_path: string
  tags: string[]
  categories: string[]
  
  // Processing & Optimization
  processed_variants: Record<string, any>
  processing_status: 'pending' | 'processing' | 'complete' | 'error'
  optimization_score?: number
  
  // Usage Tracking
  usage_count: number
  last_used?: string
  used_in_pages: string[]
  
  uploaded_by?: string
  created_at: string
  updated_at: string
  
  // Computed fields
  uploader?: Profile
  url?: string
  thumbnail_url?: string
}

// Block-specific data types
export interface HeroBlockData {
  title: string
  subtitle?: string
  description?: string
  background_image?: string
  background_video?: string
  overlay_opacity?: number
  text_alignment?: 'left' | 'center' | 'right'
  cta_buttons?: Array<{
    text: string
    href: string
    style: 'primary' | 'secondary' | 'outline'
  }>
}

export interface TextBlockData {
  content: string
  alignment?: 'left' | 'center' | 'right' | 'justify'
  font_size?: 'small' | 'medium' | 'large' | 'xl'
  color?: string
  background_color?: string
  padding?: string
}

export interface ImageBlockData {
  image_url: string
  alt_text: string
  caption?: string
  alignment?: 'left' | 'center' | 'right'
  size?: 'small' | 'medium' | 'large' | 'full'
  clickable?: boolean
  link_url?: string
  lazy_load?: boolean
}

export interface VideoBlockData {
  video_url: string
  poster_image?: string
  title?: string
  description?: string
  autoplay?: boolean
  muted?: boolean
  controls?: boolean
  loop?: boolean
  aspect_ratio?: '16:9' | '4:3' | '1:1' | '9:16'
}

export interface StatsBlockData {
  stats: Array<{
    value: string | number
    label: string
    description?: string
    icon?: string
    color?: string
  }>
  layout?: 'horizontal' | 'vertical' | 'grid'
  animated?: boolean
  show_icons?: boolean
}

export interface TestimonialBlockData {
  quote: string
  author_name: string
  author_title?: string
  author_image?: string
  author_organization?: string
  rating?: number
  show_rating?: boolean
  layout?: 'card' | 'quote' | 'minimal'
}

export interface StoryShowcaseBlockData {
  story_ids?: string[]
  community_filter?: string[]
  tag_filter?: string[]
  limit: number
  display_mode: 'grid' | 'list' | 'carousel' | 'masonry'
  show_excerpts: boolean
  show_authors: boolean
  show_dates: boolean
  show_communities: boolean
  randomize?: boolean
}

export interface CommunityStatsBlockData {
  community_ids?: string[]
  metrics: Array<'stories' | 'members' | 'impact_score' | 'engagement' | 'growth'>
  time_range?: '7d' | '30d' | '90d' | '1y' | 'all'
  chart_type?: 'numbers' | 'chart' | 'dashboard'
  animated?: boolean
  show_trends?: boolean
}

export interface FormBlockData {
  form_title: string
  form_description?: string
  fields: Array<{
    id: string
    type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file'
    label: string
    placeholder?: string
    required?: boolean
    options?: string[] // For select, radio
    validation?: {
      min_length?: number
      max_length?: number
      pattern?: string
      file_types?: string[]
      max_file_size?: number
    }
  }>
  submit_text?: string
  success_message?: string
  redirect_url?: string
  send_email?: boolean
  email_recipients?: string[]
}

// CMS API Interfaces
export interface CMSPageInsert {
  slug: string
  title: string
  content?: ContentBlock[]
  meta_description?: string
  meta_keywords?: string[]
  page_type: PageType
  visibility?: PageVisibility
  cultural_sensitivity?: CulturalSensitivity
  requires_elder_review?: boolean
  status?: PageStatus
  author_id?: string
}

export interface CMSPageUpdate {
  title?: string
  content?: ContentBlock[]
  meta_description?: string
  meta_keywords?: string[]
  page_type?: PageType
  visibility?: PageVisibility
  cultural_sensitivity?: CulturalSensitivity
  requires_elder_review?: boolean
  status?: PageStatus
  reviewer_id?: string
  review_notes?: string
  canonical_url?: string
  og_image_url?: string
  published_at?: string
  expires_at?: string
  version_notes?: string
}

export interface ContentBlockInsert {
  page_id: string
  block_type: BlockType
  block_order: number
  block_data: Record<string, any>
  display_conditions?: Record<string, any>
  css_classes?: string[]
  custom_styles?: Record<string, any>
}

export interface ContentBlockUpdate {
  block_type?: BlockType
  block_order?: number
  block_data?: Record<string, any>
  display_conditions?: Record<string, any>
  css_classes?: string[]
  custom_styles?: Record<string, any>
}

export interface MediaUpload {
  file: File
  title?: string
  alt_text?: string
  caption?: string
  description?: string
  attribution?: string
  folder_path?: string
  tags?: string[]
  categories?: string[]
  consent_settings?: Partial<MediaFile['consent_settings']>
}

// CMS Query Options
export interface CMSPageQuery {
  slug?: string
  status?: PageStatus | PageStatus[]
  visibility?: PageVisibility | PageVisibility[]
  page_type?: PageType | PageType[]
  author_id?: string
  include_blocks?: boolean
  include_author?: boolean
  include_analytics?: boolean
  limit?: number
  offset?: number
  order_by?: 'created_at' | 'updated_at' | 'published_at' | 'title' | 'view_count'
  order_direction?: 'asc' | 'desc'
}

export interface MediaQuery {
  file_type?: string | string[]
  folder_path?: string
  tags?: string[]
  categories?: string[]
  uploaded_by?: string
  processing_status?: MediaFile['processing_status']
  limit?: number
  offset?: number
  search?: string
}

// CMS Response Types
export interface CMSPageResponse {
  page: CMSPage
  blocks: ContentBlock[]
  author?: Profile
  reviewer?: Profile
  analytics?: {
    views_last_7d: number
    views_last_30d: number
    avg_time_on_page: number
    bounce_rate: number
  }
}

export interface CMSPagesListResponse {
  pages: CMSPage[]
  total: number
  limit: number
  offset: number
}

export interface MediaLibraryResponse {
  media: MediaFile[]
  total: number
  limit: number
  offset: number
  folders: string[]
  total_size: number
}

// Error handling
export interface CMSError {
  code: string
  message: string
  details?: any
}

// Event types for real-time updates
export type CMSEvent = 
  | { type: 'page_created'; payload: CMSPage }
  | { type: 'page_updated'; payload: CMSPage }
  | { type: 'page_deleted'; payload: { id: string } }
  | { type: 'block_added'; payload: ContentBlock }
  | { type: 'block_updated'; payload: ContentBlock }
  | { type: 'block_deleted'; payload: { id: string } }
  | { type: 'media_uploaded'; payload: MediaFile }
  | { type: 'media_deleted'; payload: { id: string } }

// Profile type (referenced in CMS types)
export interface Profile {
  id: string
  email?: string
  display_name?: string
  avatar_url?: string
  role?: string
  community_affiliations?: string[]
  cultural_clearances?: string[]
  created_at: string
  updated_at: string
}