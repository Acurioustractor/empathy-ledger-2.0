-- =====================================================  
-- LINK STORIES TO THEMES BASED ON CONTENT
-- =====================================================

-- Auto-assign themes to stories based on keyword matching
WITH story_content AS (
  SELECT 
    s.id as story_id,
    lower(COALESCE(t.edited_transcript, t.raw_transcript, s.transcript, '')) as content
  FROM stories s
  LEFT JOIN transcripts t ON t.story_id = s.id AND t.is_current = true
),
theme_assignments AS (
  SELECT story_id, th.id as theme_id, 0.7 as relevance_score
  FROM story_content sc
  CROSS JOIN themes th
  WHERE 
    (th.name = 'Community' AND sc.content ~ '(community|together|support|help|neighbor)') OR
    (th.name = 'Family' AND sc.content ~ '(family|mother|father|child|parent|sibling)') OR  
    (th.name = 'Mental Health' AND sc.content ~ '(mental|depression|anxiety|stress|therapy)') OR
    (th.name = 'Homelessness' AND sc.content ~ '(homeless|housing|shelter|street|rough)') OR
    (th.name = 'Hope' AND sc.content ~ '(hope|future|better|positive|optimistic)') OR
    (th.name = 'Resilience' AND sc.content ~ '(strong|overcome|survive|tough|resilient)') OR
    (th.name = 'Justice' AND sc.content ~ '(justice|fair|right|wrong|system)') OR
    (th.name = 'Addiction' AND sc.content ~ '(drug|alcohol|addiction|substance|recovery)') OR
    (th.name = 'Healthcare' AND sc.content ~ '(doctor|hospital|medical|health|treatment)') OR
    (th.name = 'Employment' AND sc.content ~ '(job|work|employment|unemployed|career)')
)
INSERT INTO story_themes (story_id, theme_id, assigned_by, relevance_score)
SELECT story_id, theme_id, 'auto_keyword', relevance_score
FROM theme_assignments
ON CONFLICT (story_id, theme_id) DO NOTHING;

-- Update theme usage counts
UPDATE themes SET 
  usage_count = (
    SELECT COUNT(*) 
    FROM story_themes 
    WHERE story_themes.theme_id = themes.id
  ),
  last_used = NOW()
WHERE id IN (SELECT DISTINCT theme_id FROM story_themes);

-- Show results
SELECT 
  t.name,
  COUNT(st.story_id) as story_count
FROM themes t
LEFT JOIN story_themes st ON st.theme_id = t.id  
GROUP BY t.id, t.name
ORDER BY story_count DESC;