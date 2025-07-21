/**
 * Embeddable Story Widgets API
 *
 * Philosophy: Stories can be shared beyond the platform while maintaining
 * sovereignty principles and storyteller control.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const project_id = url.searchParams.get('project_id');
    const widget_type = url.searchParams.get('type') || 'story_card';
    const story_id = url.searchParams.get('story_id');
    const limit = parseInt(url.searchParams.get('limit') || '3');
    const theme = url.searchParams.get('theme') || 'light';
    const format = url.searchParams.get('format') || 'html';

    if (!project_id) {
      return NextResponse.json(
        { error: 'project_id parameter required' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Verify project allows embedding
    const { data: project } = await supabase
      .from('projects')
      .select(
        'api_configuration, branding_config, settings, name, organization_name'
      )
      .eq('id', project_id)
      .eq('status', 'active')
      .single();

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or inactive' },
        { status: 404 }
      );
    }

    const embedding_enabled =
      project.api_configuration?.embedding_enabled ?? true;
    if (!embedding_enabled) {
      return NextResponse.json(
        {
          error: 'Embedding not enabled for this project',
          sovereignty_note: 'Project has chosen to disable story embedding',
        },
        { status: 403 }
      );
    }

    let stories = [];

    if (story_id) {
      // Get specific story
      const { data: story_data } = await supabase
        .from('stories')
        .select(
          `
          id,
          title,
          transcript,
          tags,
          submitted_at,
          privacy_level,
          consent_settings,
          storyteller:storyteller_id (
            full_name,
            community_affiliation
          )
        `
        )
        .eq('id', story_id)
        .eq('project_id', project_id)
        .eq('privacy_level', 'public')
        .single();

      if (!story_data || !story_data.consent_settings?.allowPublicSharing) {
        return NextResponse.json(
          {
            error: 'Story not available for embedding',
            sovereignty_note: 'Story does not have public sharing consent',
          },
          { status: 403 }
        );
      }

      stories = [story_data];
    } else {
      // Get public stories from project
      const { data: stories_data } = await supabase
        .from('stories')
        .select(
          `
          id,
          title,
          transcript,
          tags,
          submitted_at,
          privacy_level,
          consent_settings,
          storyteller:storyteller_id (
            full_name,
            community_affiliation
          )
        `
        )
        .eq('project_id', project_id)
        .eq('privacy_level', 'public')
        .eq('status', 'published')
        .order('submitted_at', { ascending: false })
        .limit(limit);

      // Filter stories with public sharing consent
      stories =
        stories_data?.filter(
          story => story.consent_settings?.allowPublicSharing
        ) || [];
    }

    // Generate widget based on type and format
    let widget_content = '';

    switch (format) {
      case 'html':
        widget_content = generateHTMLWidget(
          widget_type,
          stories,
          project,
          theme
        );
        break;
      case 'json':
        widget_content = JSON.stringify(
          {
            stories: stories.map(story => sanitizeStoryForEmbed(story)),
            project: {
              name: project.name,
              organization: project.organization_name,
            },
            sovereignty_notice:
              'Stories shared with explicit consent. Rights remain with storytellers.',
            powered_by: 'Empathy Ledger',
          },
          null,
          2
        );
        break;
      case 'iframe':
        widget_content = generateIframeWidget(
          widget_type,
          stories,
          project,
          theme,
          project_id
        );
        break;
      default:
        return NextResponse.json(
          { error: 'Unsupported format. Use: html, json, or iframe' },
          { status: 400 }
        );
    }

    // Set appropriate headers
    const headers: Record<string, string> = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'X-Sovereignty-Compliant': 'true',
      'X-Stories-Consented': 'true',
    };

    if (format === 'html' || format === 'iframe') {
      headers['Content-Type'] = 'text/html; charset=utf-8';
    } else if (format === 'json') {
      headers['Content-Type'] = 'application/json';
    }

    return new Response(widget_content, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

function generateHTMLWidget(
  widget_type: string,
  stories: any[],
  project: any,
  theme: string
): string {
  const primary_color = project.branding_config?.primary_color || '#B85C38';
  const secondary_color = project.branding_config?.secondary_color || '#7A9B76';
  const font_family = project.branding_config?.font_family || 'Inter';

  const theme_styles =
    theme === 'dark'
      ? {
          background: '#1a1a1a',
          text: '#ffffff',
          card_bg: '#2d2d2d',
          border: '#404040',
        }
      : {
          background: '#ffffff',
          text: '#1a1a1a',
          card_bg: '#ffffff',
          border: '#e5e5e5',
        };

  switch (widget_type) {
    case 'story_card':
      return generateStoryCardWidget(
        stories,
        project,
        theme_styles,
        primary_color,
        font_family
      );
    case 'story_carousel':
      return generateStoryCarouselWidget(
        stories,
        project,
        theme_styles,
        primary_color,
        font_family
      );
    case 'story_list':
      return generateStoryListWidget(
        stories,
        project,
        theme_styles,
        primary_color,
        font_family
      );
    case 'featured_story':
      return generateFeaturedStoryWidget(
        stories[0],
        project,
        theme_styles,
        primary_color,
        font_family
      );
    default:
      return generateStoryCardWidget(
        stories,
        project,
        theme_styles,
        primary_color,
        font_family
      );
  }
}

function generateStoryCardWidget(
  stories: any[],
  project: any,
  theme: any,
  primary_color: string,
  font_family: string
): string {
  const story_cards = stories
    .map(
      story => `
    <div class="empathy-story-card" style="
      background: ${theme.card_bg};
      border: 1px solid ${theme.border};
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    ">
      ${story.title ? `<h3 style="margin: 0 0 0.5rem 0; color: ${primary_color}; font-size: 1.1rem;">${escapeHtml(story.title)}</h3>` : ''}
      <blockquote style="
        margin: 0 0 1rem 0;
        padding-left: 1rem;
        border-left: 3px solid ${primary_color};
        font-style: italic;
        color: ${theme.text};
        opacity: 0.9;
      ">
        "${escapeHtml(truncateText(story.transcript, 150))}"
      </blockquote>
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.875rem;
        color: ${theme.text};
        opacity: 0.7;
      ">
        <span>— ${escapeHtml(story.storyteller.full_name)}</span>
        <span>${formatDate(story.submitted_at)}</span>
      </div>
    </div>
  `
    )
    .join('');

  return `
    <div class="empathy-widget" style="
      font-family: ${font_family}, system-ui, sans-serif;
      background: ${theme.background};
      color: ${theme.text};
      padding: 1rem;
      border-radius: 8px;
      max-width: 100%;
    ">
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid ${theme.border};
      ">
        <h2 style="margin: 0; color: ${primary_color}; font-size: 1.25rem;">
          ${escapeHtml(project.name)} Stories
        </h2>
        <span style="font-size: 0.75rem; opacity: 0.6;">
          Powered by Empathy Ledger
        </span>
      </div>
      ${story_cards}
      <div style="
        text-align: center;
        margin-top: 1rem;
        padding-top: 0.5rem;
        border-top: 1px solid ${theme.border};
        font-size: 0.75rem;
        color: ${theme.text};
        opacity: 0.6;
      ">
        Stories shared with consent • Rights remain with storytellers
      </div>
    </div>
  `;
}

function generateStoryCarouselWidget(
  stories: any[],
  project: any,
  theme: any,
  primary_color: string,
  font_family: string
): string {
  const story_slides = stories
    .map(
      (story, index) => `
    <div class="carousel-slide" style="
      display: ${index === 0 ? 'block' : 'none'};
      background: ${theme.card_bg};
      border: 1px solid ${theme.border};
      border-radius: 8px;
      padding: 1.5rem;
      text-align: center;
      min-height: 200px;
    ">
      ${story.title ? `<h3 style="margin: 0 0 1rem 0; color: ${primary_color};">${escapeHtml(story.title)}</h3>` : ''}
      <blockquote style="
        margin: 0 0 1rem 0;
        font-style: italic;
        font-size: 1.1rem;
        line-height: 1.6;
        color: ${theme.text};
      ">
        "${escapeHtml(truncateText(story.transcript, 200))}"
      </blockquote>
      <div style="color: ${primary_color}; font-weight: 500;">
        — ${escapeHtml(story.storyteller.full_name)}
      </div>
    </div>
  `
    )
    .join('');

  return `
    <div class="empathy-carousel-widget" style="
      font-family: ${font_family}, system-ui, sans-serif;
      background: ${theme.background};
      color: ${theme.text};
      padding: 1rem;
      border-radius: 8px;
      max-width: 100%;
    ">
      <div style="
        text-align: center;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid ${theme.border};
      ">
        <h2 style="margin: 0; color: ${primary_color};">
          ${escapeHtml(project.name)} Stories
        </h2>
      </div>
      
      <div class="carousel-container" style="position: relative;">
        ${story_slides}
        
        ${
          stories.length > 1
            ? `
        <div style="
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 1rem;
          gap: 0.5rem;
        ">
          <button onclick="previousSlide()" style="
            background: ${primary_color};
            color: white;
            border: none;
            border-radius: 4px;
            padding: 0.5rem 1rem;
            cursor: pointer;
            font-size: 0.875rem;
          ">Previous</button>
          <span style="font-size: 0.875rem; opacity: 0.7;">
            <span id="current-slide">1</span> of ${stories.length}
          </span>
          <button onclick="nextSlide()" style="
            background: ${primary_color};
            color: white;
            border: none;
            border-radius: 4px;
            padding: 0.5rem 1rem;
            cursor: pointer;
            font-size: 0.875rem;
          ">Next</button>
        </div>
        `
            : ''
        }
      </div>
      
      <div style="
        text-align: center;
        margin-top: 1rem;
        font-size: 0.75rem;
        opacity: 0.6;
      ">
        Powered by Empathy Ledger • Stories shared with consent
      </div>
    </div>
    
    <script>
      let currentSlide = 0;
      const slides = document.querySelectorAll('.carousel-slide');
      const totalSlides = ${stories.length};
      
      function showSlide(index) {
        slides.forEach((slide, i) => {
          slide.style.display = i === index ? 'block' : 'none';
        });
        document.getElementById('current-slide').textContent = index + 1;
      }
      
      function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
      }
      
      function previousSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(currentSlide);
      }
      
      // Auto-advance carousel every 5 seconds
      setInterval(nextSlide, 5000);
    </script>
  `;
}

function generateStoryListWidget(
  stories: any[],
  project: any,
  theme: any,
  primary_color: string,
  font_family: string
): string {
  const story_items = stories
    .map(
      story => `
    <li style="
      padding: 0.75rem 0;
      border-bottom: 1px solid ${theme.border};
      list-style: none;
    ">
      <div style="margin-bottom: 0.5rem;">
        ${story.title ? `<strong style="color: ${primary_color};">${escapeHtml(story.title)}</strong><br>` : ''}
        <span style="font-size: 0.875rem; opacity: 0.8;">
          "${escapeHtml(truncateText(story.transcript, 100))}"
        </span>
      </div>
      <div style="
        font-size: 0.75rem;
        opacity: 0.7;
        display: flex;
        justify-content: space-between;
      ">
        <span>${escapeHtml(story.storyteller.full_name)}</span>
        <span>${formatDate(story.submitted_at)}</span>
      </div>
    </li>
  `
    )
    .join('');

  return `
    <div class="empathy-list-widget" style="
      font-family: ${font_family}, system-ui, sans-serif;
      background: ${theme.background};
      color: ${theme.text};
      padding: 1rem;
      border-radius: 8px;
      max-width: 100%;
    ">
      <h2 style="
        margin: 0 0 1rem 0;
        color: ${primary_color};
        text-align: center;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid ${theme.border};
      ">
        ${escapeHtml(project.name)} Stories
      </h2>
      
      <ul style="margin: 0; padding: 0;">
        ${story_items}
      </ul>
      
      <div style="
        text-align: center;
        margin-top: 1rem;
        font-size: 0.75rem;
        opacity: 0.6;
      ">
        Powered by Empathy Ledger • Stories shared with consent
      </div>
    </div>
  `;
}

function generateFeaturedStoryWidget(
  story: any,
  project: any,
  theme: any,
  primary_color: string,
  font_family: string
): string {
  if (!story) {
    return `
      <div style="
        font-family: ${font_family}, system-ui, sans-serif;
        background: ${theme.background};
        color: ${theme.text};
        padding: 2rem;
        text-align: center;
        border-radius: 8px;
      ">
        <p>No stories available for display.</p>
      </div>
    `;
  }

  return `
    <div class="empathy-featured-widget" style="
      font-family: ${font_family}, system-ui, sans-serif;
      background: ${theme.background};
      color: ${theme.text};
      padding: 2rem;
      border-radius: 8px;
      max-width: 100%;
      text-align: center;
    ">
      <div style="margin-bottom: 1rem;">
        <span style="
          font-size: 0.875rem;
          color: ${primary_color};
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        ">
          Featured Story from ${escapeHtml(project.name)}
        </span>
      </div>
      
      ${
        story.title
          ? `
      <h2 style="
        margin: 0 0 1.5rem 0;
        color: ${primary_color};
        font-size: 1.5rem;
        line-height: 1.3;
      ">
        ${escapeHtml(story.title)}
      </h2>
      `
          : ''
      }
      
      <blockquote style="
        margin: 0 0 1.5rem 0;
        padding: 1rem;
        background: ${theme.card_bg};
        border: 1px solid ${theme.border};
        border-radius: 8px;
        font-style: italic;
        font-size: 1.1rem;
        line-height: 1.6;
        color: ${theme.text};
      ">
        "${escapeHtml(story.transcript)}"
      </blockquote>
      
      <div style="
        color: ${primary_color};
        font-weight: 500;
        margin-bottom: 0.5rem;
      ">
        — ${escapeHtml(story.storyteller.full_name)}
      </div>
      
      ${
        story.storyteller.community_affiliation
          ? `
      <div style="
        font-size: 0.875rem;
        opacity: 0.7;
        margin-bottom: 1rem;
      ">
        ${escapeHtml(story.storyteller.community_affiliation)}
      </div>
      `
          : ''
      }
      
      <div style="
        font-size: 0.75rem;
        opacity: 0.6;
        border-top: 1px solid ${theme.border};
        padding-top: 1rem;
      ">
        Shared ${formatDate(story.submitted_at)} • Powered by Empathy Ledger<br>
        Story shared with consent • Rights remain with storyteller
      </div>
    </div>
  `;
}

function generateIframeWidget(
  widget_type: string,
  stories: any[],
  project: any,
  theme: string,
  project_id: string
): string {
  const iframe_url = `${process.env.NEXT_PUBLIC_APP_URL}/embed/iframe?project_id=${project_id}&type=${widget_type}&theme=${theme}`;

  return `
    <iframe 
      src="${iframe_url}"
      width="100%" 
      height="400"
      frameborder="0"
      style="border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
      title="${escapeHtml(project.name)} Stories Widget"
      sandbox="allow-scripts allow-same-origin"
    ></iframe>
  `;
}

function sanitizeStoryForEmbed(story: any) {
  return {
    id: story.id,
    title: story.title,
    excerpt: truncateText(story.transcript, 200),
    storyteller: {
      name: story.storyteller.full_name,
      community: story.storyteller.community_affiliation,
    },
    submitted_at: story.submitted_at,
    tags: story.tags,
  };
}

// Utility functions
function escapeHtml(text: string): string {
  const div = { innerHTML: '', textContent: text };
  div.innerHTML = div.textContent || '';
  return div.innerHTML;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.substring(0, lastSpace > 0 ? lastSpace : maxLength) + '...';
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
