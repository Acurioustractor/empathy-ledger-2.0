/**
 * API: AI Theme and Outcome Suggestions
 * Provides intelligent suggestions for story themes and professional outcomes
 */

import { NextRequest, NextResponse } from 'next/server';

interface SuggestionRequest {
  content: string;
  storyteller_role?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { content, storyteller_role }: SuggestionRequest = await request.json();

    if (!content || content.length < 100) {
      return NextResponse.json({
        error: 'Content must be at least 100 characters for analysis'
      }, { status: 400 });
    }

    // Analyze content for themes and outcomes
    const suggestions = generateSuggestions(content, storyteller_role);

    return NextResponse.json({
      success: true,
      themes: suggestions.themes,
      professional_outcomes: suggestions.professional_outcomes,
      collaboration_opportunities: suggestions.collaboration_opportunities,
      confidence_score: suggestions.confidence_score
    });

  } catch (error) {
    console.error('AI suggestion error:', error);
    return NextResponse.json({
      error: 'Failed to generate suggestions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generateSuggestions(content: string, role?: string) {
  const contentLower = content.toLowerCase();
  
  // Theme detection based on keywords and context
  const themeKeywords = {
    'Cultural Safety': ['cultural', 'culture', 'safety', 'indigenous', 'aboriginal', 'protocol', 'respect'],
    'Professional Growth': ['learn', 'growth', 'development', 'skill', 'experience', 'journey', 'evolution'],
    'Community Building': ['community', 'connection', 'relationship', 'network', 'collaboration', 'support'],
    'Leadership': ['lead', 'leadership', 'guide', 'mentor', 'influence', 'inspire', 'responsibility'],
    'Communication': ['communicate', 'listen', 'speak', 'conversation', 'dialogue', 'understanding'],
    'Empathy & Compassion': ['empathy', 'compassion', 'care', 'understanding', 'support', 'kindness'],
    'Problem Solving': ['problem', 'solution', 'challenge', 'overcome', 'resolve', 'approach'],
    'Innovation': ['innovation', 'creative', 'new', 'different', 'approach', 'method', 'technology'],
    'Ethical Practice': ['ethics', 'integrity', 'values', 'principle', 'moral', 'responsibility'],
    'Resilience': ['resilience', 'perseverance', 'overcome', 'strength', 'persist', 'endure']
  };

  const detectedThemes = [];
  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    const score = keywords.reduce((acc, keyword) => {
      const matches = (contentLower.match(new RegExp(keyword, 'g')) || []).length;
      return acc + matches;
    }, 0);
    
    if (score >= 2) {
      detectedThemes.push(theme);
    }
  }

  // Professional outcomes based on role and content
  const professionalOutcomes = [];
  
  if (role?.toLowerCase().includes('midwife')) {
    if (contentLower.includes('birth') || contentLower.includes('delivery')) {
      professionalOutcomes.push('Advanced birth support techniques');
    }
    if (contentLower.includes('family') || contentLower.includes('parent')) {
      professionalOutcomes.push('Family-centered care expertise');
    }
  }

  // General outcomes based on content analysis
  if (contentLower.includes('teach') || contentLower.includes('education')) {
    professionalOutcomes.push('Educational leadership and mentoring');
  }
  if (contentLower.includes('manage') || contentLower.includes('coordinate')) {
    professionalOutcomes.push('Project management and coordination skills');
  }
  if (contentLower.includes('research') || contentLower.includes('analysis')) {
    professionalOutcomes.push('Research and analytical capabilities');
  }
  if (detectedThemes.includes('Cultural Safety')) {
    professionalOutcomes.push('Cultural competency and safety protocols');
  }
  if (detectedThemes.includes('Community Building')) {
    professionalOutcomes.push('Community engagement and relationship building');
  }

  // Collaboration opportunities
  const collaborationOpportunities = [];
  
  if (detectedThemes.includes('Cultural Safety')) {
    collaborationOpportunities.push('Cultural safety training and consultation');
  }
  if (detectedThemes.includes('Leadership')) {
    collaborationOpportunities.push('Leadership development programs');
  }
  if (detectedThemes.includes('Innovation')) {
    collaborationOpportunities.push('Innovation and technology implementation');
  }
  if (role?.toLowerCase().includes('midwife')) {
    collaborationOpportunities.push('Healthcare professional development');
    collaborationOpportunities.push('Birth education and support services');
  }
  if (detectedThemes.includes('Community Building')) {
    collaborationOpportunities.push('Community partnership development');
  }

  // Calculate confidence score
  const contentLength = content.length;
  const themeCount = detectedThemes.length;
  const outcomeCount = professionalOutcomes.length;
  
  let confidence = Math.min((contentLength / 500) * 40, 40); // Up to 40 for length
  confidence += Math.min(themeCount * 15, 45); // Up to 45 for themes
  confidence += Math.min(outcomeCount * 5, 15); // Up to 15 for outcomes
  
  return {
    themes: detectedThemes.slice(0, 5), // Limit to top 5
    professional_outcomes: professionalOutcomes.slice(0, 4), // Limit to top 4
    collaboration_opportunities: collaborationOpportunities.slice(0, 3), // Limit to top 3
    confidence_score: Math.round(confidence)
  };
}