-- =========================================
-- INITIAL THEME TAXONOMY SETUP
-- =========================================
-- Creates research-backed themes for story categorization
-- Run this in Supabase SQL Editor

-- Insert initial themes for story categorization
INSERT INTO themes (name, description, category, level, sort_order, ai_confidence_threshold, status) VALUES

-- CORE LIFE THEMES (Strength & Growth)
('Resilience', 'Stories of overcoming challenges and bouncing back from adversity', 'strength', 0, 1, 0.75, 'active'),
('Community', 'Connection, belonging, and collective support systems', 'social', 0, 2, 0.75, 'active'),
('Identity', 'Self-discovery, cultural identity, and personal growth journeys', 'self', 0, 3, 0.75, 'active'),
('Healing', 'Recovery, trauma processing, and restoration of wellbeing', 'wellbeing', 0, 4, 0.75, 'active'),
('Wisdom', 'Life lessons, insights, and knowledge sharing across generations', 'growth', 0, 5, 0.75, 'active'),

-- EMOTIONAL THEMES
('Hope', 'Optimism, future vision, and positive outlook despite challenges', 'emotion', 0, 6, 0.75, 'active'),
('Grief', 'Loss, mourning, and processing difficult emotions healthily', 'emotion', 0, 7, 0.75, 'active'),
('Joy', 'Happiness, celebration, and positive life experiences', 'emotion', 0, 8, 0.75, 'active'),
('Fear', 'Anxiety, worry, and working through challenging emotions', 'emotion', 0, 9, 0.75, 'active'),
('Love', 'Relationships, care, and deep human connections', 'emotion', 0, 10, 0.75, 'active'),

-- LIFE EVENT THEMES
('Family', 'Family relationships, dynamics, and generational experiences', 'life_event', 0, 11, 0.75, 'active'),
('Work', 'Career, employment, and professional life journeys', 'life_event', 0, 12, 0.75, 'active'),
('Health', 'Physical and mental health experiences and recovery', 'life_event', 0, 13, 0.75, 'active'),
('Education', 'Learning, schooling, and knowledge acquisition paths', 'life_event', 0, 14, 0.75, 'active'),
('Migration', 'Moving, displacement, and new beginnings in different places', 'life_event', 0, 15, 0.75, 'active'),

-- SOCIAL ISSUE THEMES
('Injustice', 'Unfairness, discrimination, and systemic challenges faced', 'social_issue', 0, 16, 0.75, 'active'),
('Poverty', 'Economic hardship and financial struggles overcome', 'social_issue', 0, 17, 0.75, 'active'),
('Violence', 'Surviving harm, abuse, and traumatic experiences', 'social_issue', 0, 18, 0.75, 'active'),
('Equality', 'Rights, fairness, and social justice advocacy', 'social_issue', 0, 19, 0.75, 'active'),
('Environment', 'Nature, climate, and environmental consciousness', 'social_issue', 0, 20, 0.75, 'active'),

-- ADDITIONAL STRENGTH-BASED THEMES
('Courage', 'Brave acts and standing up despite fear or opposition', 'strength', 0, 21, 0.75, 'active'),
('Perseverance', 'Persistence and determination through long challenges', 'strength', 0, 22, 0.75, 'active'),
('Innovation', 'Creative solutions and new ways of thinking or doing', 'growth', 0, 23, 0.75, 'active'),
('Leadership', 'Guiding others and taking initiative in communities', 'social', 0, 24, 0.75, 'active'),
('Transformation', 'Significant life changes and personal evolution', 'growth', 0, 25, 0.75, 'active')

;

-- Update usage_count for all themes to 0 (fresh start)
UPDATE themes SET usage_count = 0;

-- Verify the insert
SELECT 
    category,
    COUNT(*) as theme_count,
    STRING_AGG(name, ', ' ORDER BY sort_order) as themes
FROM themes 
WHERE status = 'active'
GROUP BY category
ORDER BY category;

-- Show total count
SELECT COUNT(*) as total_active_themes FROM themes WHERE status = 'active';

-- Success message
SELECT 'Theme taxonomy created successfully! 25 themes ready for AI analysis.' as result;