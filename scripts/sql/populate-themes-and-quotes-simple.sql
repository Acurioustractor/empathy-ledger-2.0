-- =====================================================
-- POPULATE THEMES AND QUOTES - SIMPLE VERSION
-- =====================================================

-- 1. ADD THEMES FIRST
-- =====================================================

INSERT INTO themes (name, description, color_hex, display_order) VALUES
('Community', 'Stories about community connection and support', '#4CAF50', 1),
('Resilience', 'Overcoming challenges and bouncing back', '#FF9800', 2),
('Hope', 'Stories of hope and optimism for the future', '#2196F3', 3),
('Justice', 'Social justice, fairness, and systemic change', '#9C27B0', 4),
('Family', 'Family relationships, bonds, and experiences', '#E91E63', 5),
('Mental Health', 'Mental health struggles and recovery', '#607D8B', 6),
('Addiction', 'Addiction, recovery, and substance abuse', '#795548', 7),
('Homelessness', 'Experiences with housing instability', '#FF5722', 8),
('Employment', 'Work, unemployment, and economic challenges', '#009688', 9),
('Healthcare', 'Healthcare access and medical experiences', '#F44336', 10),
('Education', 'Learning, school, and educational barriers', '#3F51B5', 11),
('Discrimination', 'Experiences of prejudice and bias', '#424242', 12),
('Trauma', 'Traumatic experiences and healing', '#8BC34A', 13),
('Identity', 'Personal identity and self-discovery', '#CDDC39', 14),
('Relationships', 'Personal relationships and connections', '#FFC107', 15)
ON CONFLICT (name) DO NOTHING;

-- Check themes were added
SELECT COUNT(*) as themes_added FROM themes;