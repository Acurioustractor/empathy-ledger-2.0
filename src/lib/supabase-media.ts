import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client conditionally
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create client if environment variables are available
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Media types
export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  title?: string;
  description?: string;
  category?: string;
  width?: number;
  height?: number;
  placeholder?: string;
}

// Get random media items
export async function getRandomMedia(
  count: number = 1,
  type?: 'image' | 'video'
): Promise<MediaItem[]> {
  if (!supabase) {
    console.warn('Supabase client not available - using placeholder data');
    return [];
  }

  try {
    let query = supabase.from('media').select('*').eq('status', 'approved');

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query.order('random()').limit(count);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching media:', error);
    return [];
  }
}

// Get media by category
export async function getMediaByCategory(
  category: string,
  limit: number = 10
): Promise<MediaItem[]> {
  if (!supabase) {
    console.warn('Supabase client not available - using placeholder data');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('category', category)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching media by category:', error);
    return [];
  }
}

// Get featured media
export async function getFeaturedMedia(): Promise<MediaItem[]> {
  if (!supabase) {
    console.warn('Supabase client not available - using placeholder data');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('featured', true)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching featured media:', error);
    return [];
  }
}

// Upload media to Supabase storage
export async function uploadMedia(
  file: File,
  metadata: Partial<MediaItem>
): Promise<MediaItem | null> {
  if (!supabase) {
    console.error('Supabase client not available - cannot upload media');
    return null;
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${metadata.type || 'image'}/${fileName}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('media').getPublicUrl(filePath);

    // Save metadata to database
    const { data, error: dbError } = await supabase
      .from('media')
      .insert({
        url: publicUrl,
        type: metadata.type || 'image',
        title: metadata.title,
        description: metadata.description,
        category: metadata.category,
        width: metadata.width,
        height: metadata.height,
        status: 'pending',
      })
      .select()
      .single();

    if (dbError) throw dbError;
    return data;
  } catch (error) {
    console.error('Error uploading media:', error);
    return null;
  }
}

// Simple blur data URL for placeholder
const blurDataURL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLhSeqealDu+8HzjfaRVfpUCT0dQ/nNdj/AC/u/LJrA/trNQZSKlP5rQUL2CpZu3qZ8UAAA/QnC2mkkc9LKDgtPHzqBIBNhzjjf9R/z+1//9k=';

// Placeholder images for development with blur data URLs
export const placeholderImages = {
  hero: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80',
  community:
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&q=80',
  portrait:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
  workshop:
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80',
  impact:
    'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1920&q=80',
  team: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80',
  story:
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&q=80',
};

// Blur data URLs for placeholders
export const placeholderBlurDataURLs = {
  hero: blurDataURL,
  community: blurDataURL,
  portrait: blurDataURL,
  workshop: blurDataURL,
  impact: blurDataURL,
  team: blurDataURL,
  story: blurDataURL,
};
