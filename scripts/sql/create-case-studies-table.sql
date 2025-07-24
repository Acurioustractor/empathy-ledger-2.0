-- EMPATHY LEDGER CASE STUDIES TABLE
-- This table stores detailed case studies of successful implementations
-- to showcase the platform's impact and inspire new communities

-- Create case studies table
CREATE TABLE IF NOT EXISTS case_studies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic Information
  slug VARCHAR(255) UNIQUE NOT NULL, -- URL-friendly identifier
  title VARCHAR(255) NOT NULL,
  organization_name VARCHAR(255) NOT NULL,
  location VARCHAR(255), -- e.g., "British Columbia, Canada"
  category VARCHAR(100), -- Healthcare, Mental Health, Education, etc.
  
  -- Profile and Media
  profile_image_url TEXT, -- Organization/project profile image
  hero_image_url TEXT, -- Large hero image for case study page
  video_url TEXT, -- Embedded video URL (YouTube, Vimeo, or Supabase storage)
  video_thumbnail_url TEXT,
  
  -- Content
  excerpt TEXT NOT NULL, -- Short description for cards
  overview TEXT, -- Longer introduction
  challenge TEXT, -- What problem were they solving?
  solution TEXT, -- How did they use Empathy Ledger?
  implementation TEXT, -- Step-by-step process
  results TEXT, -- What were the outcomes?
  future_plans TEXT, -- What's next?
  
  -- Impact Metrics (stored as JSONB for flexibility)
  impact_metrics JSONB DEFAULT '{}',
  /* Example structure:
  {
    "stories_collected": 2847,
    "communities_served": 523,
    "policy_changes": 12,
    "lives_impacted": "45,000+",
    "custom_metrics": {
      "services_redesigned": 15,
      "cost_savings": "$2.3M"
    }
  }
  */
  
  -- Quotes and Testimonials
  testimonials JSONB DEFAULT '[]',
  /* Example structure:
  [
    {
      "quote": "Empathy Ledger transformed how we understand our community's needs.",
      "author": "Dr. Sarah Chen",
      "role": "Director of Community Health",
      "image_url": "https://..."
    }
  ]
  */
  
  -- Process Steps (for visual timeline)
  process_steps JSONB DEFAULT '[]',
  /* Example structure:
  [
    {
      "step": 1,
      "title": "Community Engagement",
      "description": "Built trust with 500+ Indigenous communities",
      "duration": "3 months",
      "icon": "🤝"
    }
  ]
  */
  
  -- Tags and Metadata
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  
  -- SEO and Social
  meta_title VARCHAR(255),
  meta_description TEXT,
  og_image_url TEXT, -- Open Graph image for social sharing
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Relations
  created_by UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id), -- Link to actual project if exists
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  inquiry_count INTEGER DEFAULT 0 -- How many contacted after reading
);

-- Create indexes for performance
CREATE INDEX idx_case_studies_slug ON case_studies(slug);
CREATE INDEX idx_case_studies_category ON case_studies(category);
CREATE INDEX idx_case_studies_featured ON case_studies(featured) WHERE featured = true;
CREATE INDEX idx_case_studies_published ON case_studies(published) WHERE published = true;
CREATE INDEX idx_case_studies_tags ON case_studies USING gin(tags);

-- Enable RLS
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Everyone can view published case studies
CREATE POLICY "Published case studies are viewable by everyone" 
  ON case_studies FOR SELECT 
  USING (published = true);

-- Admins can do everything
CREATE POLICY "Admins can manage case studies" 
  ON case_studies FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_case_studies_updated_at 
  BEFORE UPDATE ON case_studies 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample case studies
INSERT INTO case_studies (
  slug,
  title,
  organization_name,
  location,
  category,
  profile_image_url,
  excerpt,
  overview,
  challenge,
  solution,
  implementation,
  results,
  impact_metrics,
  testimonials,
  process_steps,
  tags,
  featured,
  published,
  published_at
) VALUES 
(
  'indigenous-health-network',
  'Indigenous Health Network',
  'First Nations Health Authority',
  'British Columbia, Canada',
  'Healthcare',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
  'How 500+ Indigenous communities transformed healthcare delivery through shared stories of healing and wellness.',
  'The First Nations Health Authority partnered with Empathy Ledger to create a culturally-safe platform for Indigenous communities to share their healthcare experiences while maintaining complete data sovereignty.',
  'Indigenous communities in British Columbia faced significant barriers in accessing culturally appropriate healthcare. Traditional data collection methods violated cultural protocols and failed to capture the full context of health and wellness from an Indigenous perspective.',
  'Empathy Ledger provided a platform that respected Indigenous data sovereignty principles, allowing communities to control their own narratives while contributing to systemic healthcare improvements.',
  'Phase 1: Elder consultation and cultural protocol development. Phase 2: Community engagement and trust building. Phase 3: Story collection with full consent. Phase 4: Community-controlled analysis. Phase 5: Policy recommendations and implementation.',
  'The collected stories led to fundamental changes in healthcare delivery, including the establishment of 15 new Indigenous wellness centers and the integration of traditional healing practices into mainstream healthcare services.',
  '{
    "stories_collected": 2847,
    "communities_served": 523,
    "policy_changes": 12,
    "lives_impacted": "45,000+",
    "custom_metrics": {
      "wellness_centers_created": 15,
      "traditional_healers_integrated": 89,
      "cultural_safety_training_delivered": "1,200 healthcare workers"
    }
  }'::jsonb,
  '[
    {
      "quote": "For the first time, our people''s voices are being heard in their own words, on their own terms. This platform respects our sovereignty while creating real change.",
      "author": "Elder Mary Williams",
      "role": "Cultural Advisor",
      "image_url": "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=200&h=200&fit=crop"
    },
    {
      "quote": "The stories we collected revealed systemic issues we knew existed but couldn''t prove. Now we have the evidence to drive meaningful policy changes.",
      "author": "Dr. Sarah Chen",
      "role": "Director of Indigenous Health",
      "image_url": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop"
    }
  ]'::jsonb,
  '[
    {
      "step": 1,
      "title": "Elder Consultation",
      "description": "Engaged with Elders from 50+ nations to establish cultural protocols",
      "duration": "2 months",
      "icon": "🙏"
    },
    {
      "step": 2,
      "title": "Community Engagement",
      "description": "Built relationships with 500+ communities through local gatherings",
      "duration": "6 months",
      "icon": "🤝"
    },
    {
      "step": 3,
      "title": "Story Collection",
      "description": "Gathered 2,847 stories using culturally appropriate methods",
      "duration": "12 months",
      "icon": "📝"
    },
    {
      "step": 4,
      "title": "Community Analysis",
      "description": "Communities analyzed their own data to identify key themes",
      "duration": "3 months",
      "icon": "🔍"
    },
    {
      "step": 5,
      "title": "Implementation",
      "description": "Translated insights into concrete healthcare improvements",
      "duration": "Ongoing",
      "icon": "🏥"
    }
  ]'::jsonb,
  ARRAY['Healthcare', 'Indigenous', 'Policy Change', 'Data Sovereignty'],
  true,
  true,
  NOW()
),
(
  'youth-mental-health',
  'Youth Voices Matter',
  'Headspace Australia',
  'Melbourne, Australia',
  'Mental Health',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop',
  'Young people sharing mental health journeys led to complete redesign of support services across 150 centers.',
  'Headspace Australia recognized that traditional mental health services weren''t meeting young people''s needs. They partnered with Empathy Ledger to create a safe space for youth to share their experiences anonymously.',
  'Young people aged 12-25 were not engaging with mental health services despite rising rates of anxiety and depression. Traditional feedback mechanisms failed to capture authentic youth voices.',
  'Empathy Ledger''s anonymous story sharing feature allowed young people to share their experiences without fear of judgment or identification, while still providing actionable insights.',
  'Launched with social media campaign. Partnered with youth influencers. Created safe spaces in schools and community centers. Provided multiple formats: text, audio, video, art.',
  'Complete service redesign based on youth feedback. 73% increase in service engagement. Development of peer support programs. Integration of technology-based interventions.',
  '{
    "stories_collected": 8234,
    "communities_served": 150,
    "policy_changes": 3,
    "lives_impacted": "120,000+",
    "custom_metrics": {
      "service_engagement_increase": "73%",
      "peer_supporters_trained": 450,
      "digital_tools_developed": 12
    }
  }'::jsonb,
  '[
    {
      "quote": "Finally, we could hear what young people really needed, not what we thought they needed. It completely transformed our approach.",
      "author": "Jason McGrath",
      "role": "CEO, Headspace",
      "image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop"
    }
  ]'::jsonb,
  '[]'::jsonb,
  ARRAY['Mental Health', 'Youth', 'Service Design', 'Anonymous Stories'],
  true,
  true,
  NOW()
);

-- Add comments for documentation
COMMENT ON TABLE case_studies IS 'Detailed case studies showcasing successful implementations of Empathy Ledger platform';
COMMENT ON COLUMN case_studies.impact_metrics IS 'Flexible JSON structure for various impact measurements';
COMMENT ON COLUMN case_studies.testimonials IS 'Array of testimonial objects with quote, author, role, and optional image';
COMMENT ON COLUMN case_studies.process_steps IS 'Step-by-step implementation process for visual timeline display';