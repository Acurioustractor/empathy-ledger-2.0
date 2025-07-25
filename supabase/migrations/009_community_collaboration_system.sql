-- Sprint 3 Week 2: Community Collaboration Features
-- Storyteller collaboration tools, mentorship, referrals, and cross-pollination system

-- Storyteller Collaboration Hub
CREATE TABLE IF NOT EXISTS storyteller_collaborations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Collaboration Participants
  initiator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  collaborator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Collaboration Details
  collaboration_type TEXT CHECK (collaboration_type IN ('mentorship', 'peer_collaboration', 'collective_project', 'referral_partnership', 'cultural_exchange')) NOT NULL,
  collaboration_status TEXT DEFAULT 'proposed' CHECK (collaboration_status IN ('proposed', 'active', 'completed', 'declined', 'on_hold')),
  
  -- Project Information
  project_title TEXT,
  project_description TEXT,
  collaboration_goals TEXT[],
  expected_outcomes TEXT[],
  timeline_start DATE,
  timeline_end DATE,
  
  -- Cultural Integration
  cultural_protocols_agreed BOOLEAN DEFAULT false,
  aboriginal_advisor_review_required BOOLEAN DEFAULT false,
  cultural_competency_requirements TEXT[],
  
  -- Revenue and Recognition Sharing
  revenue_sharing_model JSONB DEFAULT '{
    "model_type": "equal_split",
    "initiator_percentage": 50,
    "collaborator_percentage": 50,
    "community_contribution": 5,
    "platform_fee": 5
  }'::jsonb,
  attribution_agreement JSONB DEFAULT '[]'::jsonb,
  
  -- Communication and Progress
  communication_preferences JSONB DEFAULT '{
    "primary_channel": "platform_messaging",
    "meeting_frequency": "weekly",
    "timezone_coordination": "flexible"
  }'::jsonb,
  progress_updates JSONB DEFAULT '[]'::jsonb,
  
  -- Community Value Tracking
  community_impact_score DECIMAL(3,2) DEFAULT 0.0,
  knowledge_sharing_value DECIMAL(3,2) DEFAULT 0.0,
  cultural_learning_value DECIMAL(3,2) DEFAULT 0.0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mentorship Program Management
CREATE TABLE IF NOT EXISTS mentorship_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Mentor and Mentee
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Program Structure
  program_type TEXT CHECK (program_type IN ('professional_development', 'cultural_competency', 'storytelling_skills', 'platform_navigation', 'community_engagement')) NOT NULL,
  program_status TEXT DEFAULT 'active' CHECK (program_status IN ('active', 'completed', 'paused', 'cancelled')),
  
  -- Mentorship Focus Areas
  focus_areas TEXT[] NOT NULL,
  learning_objectives TEXT[],
  success_metrics TEXT[],
  
  -- Schedule and Structure
  meeting_frequency TEXT DEFAULT 'bi_weekly' CHECK (meeting_frequency IN ('weekly', 'bi_weekly', 'monthly', 'as_needed')),
  session_duration_minutes INTEGER DEFAULT 60,
  total_planned_sessions INTEGER DEFAULT 10,
  completed_sessions INTEGER DEFAULT 0,
  
  -- Cultural Protocol Integration
  cultural_protocols_included BOOLEAN DEFAULT true,
  aboriginal_mentor_involvement BOOLEAN DEFAULT false,
  cultural_competency_component BOOLEAN DEFAULT true,
  
  -- Progress Tracking
  mentorship_milestones JSONB DEFAULT '[]'::jsonb,
  feedback_sessions JSONB DEFAULT '[]'::jsonb,
  mentor_feedback_rating DECIMAL(2,1),
  mentee_feedback_rating DECIMAL(2,1),
  
  -- Program Outcomes
  program_completion_rate DECIMAL(3,2) DEFAULT 0.0,
  skill_development_progress JSONB DEFAULT '{}'::jsonb,
  professional_impact_indicators TEXT[],
  
  program_start_date DATE DEFAULT CURRENT_DATE,
  program_end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cross-Pollination System for Story and Expertise Sharing
CREATE TABLE IF NOT EXISTS cross_pollination_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Connection Participants
  storyteller_a_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  storyteller_b_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Connection Type and Reasoning
  connection_type TEXT CHECK (connection_type IN ('complementary_expertise', 'similar_themes', 'cultural_bridge', 'professional_synergy', 'community_impact_potential')) NOT NULL,
  ai_match_score DECIMAL(3,2) DEFAULT 0.0,
  ai_reasoning JSONB DEFAULT '{}'::jsonb,
  
  -- Collaboration Potential Areas
  shared_themes TEXT[],
  complementary_skills TEXT[],
  collaboration_opportunities TEXT[],
  cultural_learning_potential TEXT[],
  
  -- Connection Status and Engagement
  connection_status TEXT DEFAULT 'suggested' CHECK (connection_status IN ('suggested', 'introduced', 'engaged', 'collaborating', 'completed', 'declined')),
  introduction_method TEXT,
  first_interaction_date TIMESTAMPTZ,
  last_interaction_date TIMESTAMPTZ,
  
  -- Aboriginal Protocol Considerations
  cultural_sensitivity_verified BOOLEAN DEFAULT false,
  protocol_alignment_score DECIMAL(3,2) DEFAULT 0.0,
  cultural_bridge_potential BOOLEAN DEFAULT false,
  
  -- Community Value Generation
  community_value_potential DECIMAL(3,2) DEFAULT 0.0,
  knowledge_exchange_value DECIMAL(3,2) DEFAULT 0.0,
  professional_growth_value DECIMAL(3,2) DEFAULT 0.0,
  
  -- Success Tracking
  collaboration_outcomes TEXT[],
  professional_referrals_generated INTEGER DEFAULT 0,
  story_collaborations_created INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collective Projects for Community Co-creation
CREATE TABLE IF NOT EXISTS collective_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Project Leadership
  project_lead_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_title TEXT NOT NULL,
  project_description TEXT NOT NULL,
  
  -- Project Type and Scope
  project_type TEXT CHECK (project_type IN ('story_collection', 'community_research', 'cultural_documentation', 'platform_enhancement', 'advocacy_campaign', 'educational_resource')) NOT NULL,
  project_scope TEXT CHECK (project_scope IN ('local', 'regional', 'national', 'international')) DEFAULT 'local',
  
  -- Community and Cultural Integration
  aboriginal_community_involvement BOOLEAN DEFAULT false,
  cultural_protocols_required BOOLEAN DEFAULT false,
  community_advisory_participation BOOLEAN DEFAULT false,
  
  -- Participation and Collaboration
  max_participants INTEGER DEFAULT 10,
  current_participants INTEGER DEFAULT 1,
  open_to_new_participants BOOLEAN DEFAULT true,
  required_skills TEXT[],
  preferred_cultural_competencies TEXT[],
  
  -- Project Timeline and Milestones
  project_status TEXT DEFAULT 'planning' CHECK (project_status IN ('planning', 'recruiting', 'active', 'completed', 'on_hold', 'cancelled')),
  planned_start_date DATE,
  planned_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  
  -- Resource and Revenue Management
  budget_requirements JSONB DEFAULT '{}'::jsonb,
  revenue_sharing_model JSONB DEFAULT '{
    "model": "equal_participation",
    "community_contribution_percentage": 10,
    "cultural_advisor_percentage": 5
  }'::jsonb,
  
  -- Community Impact and Value
  expected_community_impact TEXT[],
  success_metrics TEXT[],
  community_benefit_score DECIMAL(3,2) DEFAULT 0.0,
  cultural_preservation_value DECIMAL(3,2) DEFAULT 0.0,
  
  -- Project Outcomes and Results
  project_deliverables TEXT[],
  community_feedback JSONB DEFAULT '[]'::jsonb,
  participant_testimonials TEXT[],
  lessons_learned TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Participation Management
CREATE TABLE IF NOT EXISTS project_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES collective_projects(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Participation Details
  participation_role TEXT CHECK (participation_role IN ('co_lead', 'contributor', 'advisor', 'community_representative', 'cultural_consultant')) DEFAULT 'contributor',
  participation_status TEXT DEFAULT 'active' CHECK (participation_status IN ('active', 'completed', 'withdrawn', 'on_leave')),
  
  -- Contribution and Skills
  skills_contributing TEXT[],
  time_commitment_hours_per_week INTEGER,
  cultural_expertise_areas TEXT[],
  
  -- Recognition and Revenue
  contribution_percentage DECIMAL(5,2) DEFAULT 0.0,
  revenue_share_percentage DECIMAL(5,2) DEFAULT 0.0,
  recognition_preferences JSONB DEFAULT '{}'::jsonb,
  
  -- Participation Timeline
  joined_date DATE DEFAULT CURRENT_DATE,
  completed_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(project_id, participant_id)
);

-- Referral Network System
CREATE TABLE IF NOT EXISTS storyteller_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referral Participants
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_storyteller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID, -- Can reference organizations table if available
  
  -- Referral Details
  referral_type TEXT CHECK (referral_type IN ('professional_opportunity', 'speaking_engagement', 'consulting_project', 'collaboration_opportunity', 'mentorship_connection')) NOT NULL,
  opportunity_title TEXT NOT NULL,
  opportunity_description TEXT,
  
  -- Referral Context
  referral_reasoning TEXT,
  skill_match_areas TEXT[],
  cultural_competency_relevance TEXT[],
  expected_value_for_referee TEXT[],
  
  -- Referral Status and Outcomes
  referral_status TEXT DEFAULT 'pending' CHECK (referral_status IN ('pending', 'accepted', 'declined', 'in_progress', 'completed', 'unsuccessful')),
  referee_response TEXT,
  opportunity_outcome TEXT,
  
  -- Revenue and Recognition Sharing
  referral_fee_percentage DECIMAL(4,2) DEFAULT 10.0, -- 10% referral fee
  community_contribution_percentage DECIMAL(4,2) DEFAULT 5.0, -- 5% to community
  revenue_generated DECIMAL(10,2) DEFAULT 0.0,
  referrer_earnings DECIMAL(10,2) DEFAULT 0.0,
  
  -- Success Tracking
  opportunity_completion_date DATE,
  referee_satisfaction_rating DECIMAL(2,1),
  referrer_satisfaction_rating DECIMAL(2,1),
  
  -- Community Impact
  community_benefit_generated TEXT[],
  cultural_competency_development BOOLEAN DEFAULT false,
  follow_up_opportunities_created INTEGER DEFAULT 0,
  
  referral_date DATE DEFAULT CURRENT_DATE,
  opportunity_start_date DATE,
  opportunity_end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community Messaging and Communication Hub
CREATE TABLE IF NOT EXISTS community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Message Participants
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- NULL for group messages
  conversation_type TEXT CHECK (conversation_type IN ('direct_message', 'collaboration_chat', 'mentorship_session', 'project_discussion', 'community_announcement')) NOT NULL,
  
  -- Message Content
  message_content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file_share', 'story_reference', 'collaboration_invite', 'calendar_invite')),
  
  -- Context and References
  collaboration_id UUID REFERENCES storyteller_collaborations(id),
  mentorship_id UUID REFERENCES mentorship_programs(id),
  project_id UUID REFERENCES collective_projects(id),
  story_reference_id UUID REFERENCES stories(id),
  
  -- Message Status
  message_status TEXT DEFAULT 'sent' CHECK (message_status IN ('sent', 'delivered', 'read', 'archived')),
  read_at TIMESTAMPTZ,
  
  -- Cultural Sensitivity
  cultural_sensitivity_checked BOOLEAN DEFAULT false,
  requires_cultural_review BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Community Collaboration Performance
CREATE INDEX IF NOT EXISTS idx_collaborations_initiator ON storyteller_collaborations(initiator_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_collaborator ON storyteller_collaborations(collaborator_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_status ON storyteller_collaborations(collaboration_status);
CREATE INDEX IF NOT EXISTS idx_collaborations_type ON storyteller_collaborations(collaboration_type);

CREATE INDEX IF NOT EXISTS idx_mentorship_mentor ON mentorship_programs(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_mentee ON mentorship_programs(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_status ON mentorship_programs(program_status);

CREATE INDEX IF NOT EXISTS idx_cross_pollination_a ON cross_pollination_connections(storyteller_a_id);
CREATE INDEX IF NOT EXISTS idx_cross_pollination_b ON cross_pollination_connections(storyteller_b_id);
CREATE INDEX IF NOT EXISTS idx_cross_pollination_status ON cross_pollination_connections(connection_status);
CREATE INDEX IF NOT EXISTS idx_cross_pollination_match_score ON cross_pollination_connections(ai_match_score);

CREATE INDEX IF NOT EXISTS idx_collective_projects_lead ON collective_projects(project_lead_id);
CREATE INDEX IF NOT EXISTS idx_collective_projects_status ON collective_projects(project_status);
CREATE INDEX IF NOT EXISTS idx_collective_projects_type ON collective_projects(project_type);

CREATE INDEX IF NOT EXISTS idx_project_participants_project ON project_participants(project_id);
CREATE INDEX IF NOT EXISTS idx_project_participants_participant ON project_participants(participant_id);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON storyteller_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON storyteller_referrals(referred_storyteller_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON storyteller_referrals(referral_status);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON community_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON community_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_type ON community_messages(conversation_type);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON community_messages(created_at);

-- Row Level Security for Community Features
ALTER TABLE storyteller_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_pollination_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collective_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyteller_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Community Collaboration

-- Storytellers can view and manage their own collaborations
CREATE POLICY "storytellers_manage_collaborations" ON storyteller_collaborations
  FOR ALL USING (
    initiator_id = auth.uid() OR collaborator_id = auth.uid()
  );

-- Storytellers can view and manage their mentorship programs
CREATE POLICY "storytellers_manage_mentorship" ON mentorship_programs
  FOR ALL USING (
    mentor_id = auth.uid() OR mentee_id = auth.uid()
  );

-- Storytellers can view cross-pollination connections involving them
CREATE POLICY "storytellers_view_connections" ON cross_pollination_connections
  FOR SELECT USING (
    storyteller_a_id = auth.uid() OR storyteller_b_id = auth.uid()
  );

-- Project leads can manage their projects, participants can view and update
CREATE POLICY "project_management" ON collective_projects
  FOR ALL USING (
    project_lead_id = auth.uid() OR 
    id IN (SELECT project_id FROM project_participants WHERE participant_id = auth.uid())
  );

-- Project participants can manage their participation
CREATE POLICY "project_participation_management" ON project_participants
  FOR ALL USING (
    participant_id = auth.uid() OR 
    project_id IN (SELECT id FROM collective_projects WHERE project_lead_id = auth.uid())
  );

-- Storytellers can view and manage their referrals
CREATE POLICY "storytellers_manage_referrals" ON storyteller_referrals
  FOR ALL USING (
    referrer_id = auth.uid() OR referred_storyteller_id = auth.uid()
  );

-- Message participants can view and manage their messages
CREATE POLICY "message_participants_manage" ON community_messages
  FOR ALL USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

-- Functions for Community Collaboration

-- Function to suggest cross-pollination connections based on AI analysis
CREATE OR REPLACE FUNCTION suggest_cross_pollination_connections(storyteller_uuid UUID)
RETURNS TABLE (
  suggested_storyteller_id UUID,
  connection_type TEXT,
  match_score DECIMAL,
  reasoning TEXT
) AS $$
BEGIN
  -- Simplified suggestion logic - in production this would use ML models
  RETURN QUERY
  SELECT 
    p.id,
    'complementary_expertise'::TEXT as connection_type,
    CAST(0.85 AS DECIMAL) as match_score,
    'Similar cultural competency and community-centered approach'::TEXT as reasoning
  FROM profiles p
  WHERE p.id != storyteller_uuid
  AND p.role = 'storyteller'
  AND p.id NOT IN (
    SELECT storyteller_b_id FROM cross_pollination_connections 
    WHERE storyteller_a_id = storyteller_uuid
    UNION
    SELECT storyteller_a_id FROM cross_pollination_connections 
    WHERE storyteller_b_id = storyteller_uuid
  )
  ORDER BY p.created_at DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate community impact score for collaborations
CREATE OR REPLACE FUNCTION calculate_community_impact_score(collaboration_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  impact_score DECIMAL DEFAULT 0.0;
BEGIN
  -- Simplified scoring - in production this would be more sophisticated
  SELECT 
    CASE 
      WHEN cultural_protocols_agreed THEN 0.3 
      ELSE 0.0 
    END +
    CASE 
      WHEN aboriginal_advisor_review_required THEN 0.2 
      ELSE 0.0 
    END +
    0.5 -- Base collaboration value
  INTO impact_score
  FROM storyteller_collaborations 
  WHERE id = collaboration_uuid;
  
  RETURN COALESCE(impact_score, 0.0);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update community impact scores
CREATE OR REPLACE FUNCTION trigger_update_community_impact()
RETURNS trigger AS $$
BEGIN
  NEW.community_impact_score = calculate_community_impact_score(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER collaborations_update_impact_score
  BEFORE INSERT OR UPDATE ON storyteller_collaborations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_community_impact();

COMMENT ON TABLE storyteller_collaborations IS 'Hub for storyteller collaboration, mentorship, and partnership management';
COMMENT ON TABLE mentorship_programs IS 'Structured mentorship programs with cultural protocol integration';
COMMENT ON TABLE cross_pollination_connections IS 'AI-powered connections between storytellers for knowledge sharing';
COMMENT ON TABLE collective_projects IS 'Community co-creation projects with Aboriginal protocol integration';
COMMENT ON TABLE project_participants IS 'Management of participation in collective projects';
COMMENT ON TABLE storyteller_referrals IS 'Professional referral network with revenue sharing';
COMMENT ON TABLE community_messages IS 'Communication hub for community collaboration and messaging';