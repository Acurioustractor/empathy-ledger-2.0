import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StoryBeautificationRequest {
  story_id: string;
  title: string;
  content: string;
  transcription?: string;
  force_reprocess?: boolean;
}

interface BeautificationResult {
  beautified_title: string;
  beautified_content: string;
  executive_summary: string;
  key_quotes: string[];
  emotional_tone: string;
  readability_score: number;
  themes: string[];
  categories: string[];
  sensitivity_flags: string[];
  topic_tags: string[];
  social_share_text: string;
  newsletter_excerpt: string;
  keywords: string[];
  completeness_score: number;
  coherence_score: number;
  impact_score: number;
  confidence_score: number;
  model_version: string;
  processing_notes?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Handle different request methods
    if (req.method === 'POST') {
      return await handleBeautification(req, supabaseClient);
    } else if (req.method === 'GET') {
      return await handleBatchProcessing(supabaseClient);
    } else {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
    }

  } catch (error) {
    console.error('Error in story-beautifier function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})

async function handleBeautification(req: Request, supabaseClient: any) {
  const { story_id }: StoryBeautificationRequest = await req.json();
  
  // Get story data
  const { data: story, error: fetchError } = await supabaseClient
    .from('stories')
    .select('id, title, content, transcription, ai_processing_status')
    .eq('id', story_id)
    .single();

  if (fetchError || !story) {
    return new Response(
      JSON.stringify({ error: 'Story not found' }), 
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Skip if already processed
  if (story.ai_processing_status === 'completed') {
    return new Response(
      JSON.stringify({ message: 'Story already processed', story_id }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Mark as processing
  await supabaseClient
    .from('stories')
    .update({ ai_processing_status: 'processing' })
    .eq('id', story_id);

  try {
    // Process with AI
    const beautificationResult = await beautifyStoryContent({
      story_id: story.id,
      title: story.title,
      content: story.content,
      transcription: story.transcription
    });

    // Update database with results
    const { error: updateError } = await supabaseClient
      .rpc('update_story_ai_results', {
        story_id: story.id,
        results: beautificationResult
      });

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        story_id, 
        message: 'Story beautified successfully' 
      }), 
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    // Mark as failed
    await supabaseClient
      .from('stories')
      .update({ 
        ai_processing_status: 'failed',
        ai_processing_notes: error.message 
      })
      .eq('id', story_id);

    throw error;
  }
}

async function handleBatchProcessing(supabaseClient: any) {
  // Get stories needing processing
  const { data: stories, error } = await supabaseClient
    .rpc('get_stories_needing_ai_processing', { batch_size: 5 });

  if (error) {
    throw new Error(`Failed to fetch stories: ${error.message}`);
  }

  if (!stories || stories.length === 0) {
    return new Response(
      JSON.stringify({ message: 'No stories pending processing' }), 
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  // Process each story
  const results = [];
  for (const story of stories) {
    try {
      await handleBeautification(
        new Request('', { 
          method: 'POST', 
          body: JSON.stringify({ story_id: story.id }) 
        }), 
        supabaseClient
      );
      results.push({ story_id: story.id, status: 'processed' });
    } catch (error) {
      results.push({ story_id: story.id, status: 'failed', error: error.message });
    }
  }

  return new Response(
    JSON.stringify({ 
      processed: results.length, 
      results 
    }), 
    { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function beautifyStoryContent(request: StoryBeautificationRequest): Promise<BeautificationResult> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const content = request.content || request.transcription || '';
  
  const prompt = `
You are an expert content beautifier for community storytelling. Transform this raw story transcript into professional, engaging content while preserving the authentic voice and meaning.

STORY TITLE: ${request.title}
RAW CONTENT: ${content}

Please provide a JSON response with the following structure:
{
  "beautified_title": "A more engaging, readable title",
  "beautified_content": "Clean, formatted content without timestamps, preserving quotes and narrative flow",
  "executive_summary": "A professional 2-3 sentence summary suitable for stakeholders",
  "key_quotes": ["Powerful quote 1", "Meaningful quote 2"],
  "emotional_tone": "Choose one: hopeful, reflective, urgent, inspiring, concerning, joyful, determined",
  "readability_score": 8,
  "themes": ["theme1", "theme2"],
  "categories": ["healthcare", "housing", "community", "policy", etc.],
  "sensitivity_flags": ["trauma", "medical", "cultural", etc. - only if present],
  "topic_tags": ["specific topic tags"],
  "social_share_text": "Compelling 250-char summary for social media",
  "newsletter_excerpt": "2-3 sentence excerpt perfect for email newsletters",
  "keywords": ["SEO keyword 1", "keyword 2"],
  "completeness_score": 0.85,
  "coherence_score": 0.90,
  "impact_score": 0.75,
  "confidence_score": 0.88
}

Guidelines:
- Remove timestamp markers like [00:00:00] but keep the natural flow
- Clean up transcription artifacts while preserving authentic voice
- Identify themes related to social issues, community needs, policy impacts
- Extract 2-4 powerful quotes that capture key messages
- Ensure beautified_content reads naturally while staying true to the original
- Scores should be decimals between 0-1
- Be culturally sensitive and respectful
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // Cost-effective for this task
      messages: [
        {
          role: 'system',
          content: 'You are an expert content beautifier specializing in community storytelling and social impact narratives. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent results
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const aiResponse = data.choices[0]?.message?.content;

  if (!aiResponse) {
    throw new Error('No response from OpenAI');
  }

  try {
    const result = JSON.parse(aiResponse);
    result.model_version = 'gpt-4o-mini';
    result.processing_notes = 'Successfully processed by OpenAI GPT-4o-mini';
    
    return result;
  } catch (parseError) {
    throw new Error(`Failed to parse AI response: ${parseError.message}`);
  }
}

/* 
To deploy this Edge Function:

1. Install Supabase CLI: npm install -g supabase
2. Login: supabase login
3. Link project: supabase link --project-ref YOUR_PROJECT_REF
4. Set secrets:
   supabase secrets set OPENAI_API_KEY=your_openai_api_key
5. Deploy: supabase functions deploy story-beautifier

Test the function:
- POST /functions/v1/story-beautifier - Process single story
- GET /functions/v1/story-beautifier - Batch process pending stories
*/