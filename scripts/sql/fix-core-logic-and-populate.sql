-- =====================================================
-- FIX CORE LOGIC AND POPULATE MISSING DATA
-- Storytellers → Transcripts → Quotes + Themes → Stories
-- =====================================================

-- 1. ADD ESSENTIAL THEMES
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

-- 2. EXTRACT QUOTES FROM EXISTING TRANSCRIPTS
-- =====================================================

-- Function to extract meaningful quotes from transcripts
CREATE OR REPLACE FUNCTION extract_quotes_from_transcript(
    p_story_id UUID,
    p_transcript_text TEXT
) RETURNS INTEGER AS $$
DECLARE
    quote_count INTEGER := 0;
    sentence_array TEXT[];
    sentence TEXT;
    sentence_length INTEGER;
BEGIN
    -- Split transcript into sentences (rough approach)
    sentence_array := string_to_array(p_transcript_text, '. ');
    
    FOREACH sentence IN ARRAY sentence_array LOOP
        sentence := trim(sentence);
        sentence_length := length(sentence);
        
        -- Extract meaningful quotes (20-200 characters, not questions)
        IF sentence_length BETWEEN 20 AND 200 
           AND sentence NOT LIKE '%?%' 
           AND sentence NOT LIKE 'Um%'
           AND sentence NOT LIKE 'Uh%'
           AND sentence NOT LIKE '%you know%'
           AND sentence ILIKE ANY(ARRAY['%I%', '%we%', '%my%', '%our%', '%life%', '%feel%', '%experience%', '%learned%', '%realize%']) THEN
            
            INSERT INTO quotes (
                story_id,
                quote_text,
                themes,
                extracted_by
            ) VALUES (
                p_story_id,
                sentence || '.',
                ARRAY[]::TEXT[], -- Will be populated later
                'auto_extraction'
            );
            
            quote_count := quote_count + 1;
        END IF;
        
        -- Limit to 5 quotes per transcript to avoid spam
        IF quote_count >= 5 THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN quote_count;
END;
$$ LANGUAGE plpgsql;

-- 3. POPULATE QUOTES FROM ALL TRANSCRIPTS
-- =====================================================

DO $$
DECLARE
    transcript_record RECORD;
    extracted_count INTEGER;
    total_quotes INTEGER := 0;
BEGIN
    -- Extract quotes from each transcript
    FOR transcript_record IN 
        SELECT t.story_id, 
               COALESCE(t.edited_transcript, t.raw_transcript) as transcript_text,
               s.title
        FROM transcripts t
        JOIN stories s ON s.id = t.story_id
        WHERE t.is_current = true 
          AND COALESCE(t.edited_transcript, t.raw_transcript) IS NOT NULL
          AND length(COALESCE(t.edited_transcript, t.raw_transcript)) > 50
    LOOP
        extracted_count := extract_quotes_from_transcript(
            transcript_record.story_id, 
            transcript_record.transcript_text
        );
        
        total_quotes := total_quotes + extracted_count;
        
        RAISE NOTICE 'Extracted % quotes from "%"', extracted_count, transcript_record.title;
    END LOOP;
    
    RAISE NOTICE 'Total quotes extracted: %', total_quotes;
END $$;

-- 4. AUTO-ASSIGN THEMES TO STORIES BASED ON CONTENT
-- =====================================================

-- Function to assign themes based on keywords
CREATE OR REPLACE FUNCTION auto_assign_themes() RETURNS INTEGER AS $$
DECLARE
    story_record RECORD;
    theme_record RECORD;
    assignment_count INTEGER := 0;
    transcript_text TEXT;
BEGIN
    -- For each story with a transcript
    FOR story_record IN 
        SELECT s.id, s.title,
               COALESCE(t.edited_transcript, t.raw_transcript) as transcript
        FROM stories s
        JOIN transcripts t ON t.story_id = s.id AND t.is_current = true
        WHERE COALESCE(t.edited_transcript, t.raw_transcript) IS NOT NULL
    LOOP
        transcript_text := lower(story_record.transcript);
        
        -- Check each theme for keyword matches
        FOR theme_record IN SELECT id, name FROM themes LOOP
            -- Simple keyword matching (you can improve this)
            IF (theme_record.name = 'Community' AND transcript_text ~ '(community|together|support|help|neighbor)') OR
               (theme_record.name = 'Family' AND transcript_text ~ '(family|mother|father|child|parent|sibling)') OR
               (theme_record.name = 'Mental Health' AND transcript_text ~ '(mental|depression|anxiety|stress|therapy)') OR
               (theme_record.name = 'Homelessness' AND transcript_text ~ '(homeless|housing|shelter|street|rough)') OR
               (theme_record.name = 'Hope' AND transcript_text ~ '(hope|future|better|positive|optimistic)') OR
               (theme_record.name = 'Resilience' AND transcript_text ~ '(strong|overcome|survive|tough|resilient)') OR
               (theme_record.name = 'Justice' AND transcript_text ~ '(justice|fair|right|wrong|system)') OR
               (theme_record.name = 'Addiction' AND transcript_text ~ '(drug|alcohol|addiction|substance|recovery)') OR
               (theme_record.name = 'Healthcare' AND transcript_text ~ '(doctor|hospital|medical|health|treatment)') OR
               (theme_record.name = 'Employment' AND transcript_text ~ '(job|work|employment|unemployed|career)')
            THEN
                -- Insert theme assignment
                INSERT INTO story_themes (story_id, theme_id, assigned_by, relevance_score)
                VALUES (story_record.id, theme_record.id, 'auto_keyword', 0.7)
                ON CONFLICT (story_id, theme_id) DO NOTHING;
                
                assignment_count := assignment_count + 1;
            END IF;
        END LOOP;
    END LOOP;
    
    RETURN assignment_count;
END $$;

-- Run the auto-assignment
SELECT auto_assign_themes() as themes_assigned;

-- 5. UPDATE USAGE COUNTS
-- =====================================================

-- Update theme usage counts
UPDATE themes SET 
    usage_count = (
        SELECT COUNT(*) 
        FROM story_themes 
        WHERE story_themes.theme_id = themes.id
    ),
    last_used = (
        SELECT MAX(created_at) 
        FROM story_themes 
        WHERE story_themes.theme_id = themes.id
    );

-- 6. CREATE SUMMARY REPORT
-- =====================================================

SELECT 'DATA POPULATION COMPLETE!' as status;

SELECT 
    'storytellers' as table_name,
    COUNT(*) as count
FROM users WHERE role = 'storyteller'
UNION ALL
SELECT 'transcripts', COUNT(*) FROM transcripts
UNION ALL  
SELECT 'stories', COUNT(*) FROM stories
UNION ALL
SELECT 'quotes', COUNT(*) FROM quotes  
UNION ALL
SELECT 'themes', COUNT(*) FROM themes
UNION ALL
SELECT 'story_themes', COUNT(*) FROM story_themes;

-- Show sample quotes
SELECT 'SAMPLE QUOTES:' as section;
SELECT 
    s.title,
    q.quote_text,
    array_to_string(q.themes, ', ') as themes
FROM quotes q
JOIN stories s ON s.id = q.story_id
LIMIT 5;

-- Show theme assignments
SELECT 'THEME ASSIGNMENTS:' as section;
SELECT 
    t.name as theme,
    COUNT(st.story_id) as story_count
FROM themes t
LEFT JOIN story_themes st ON st.theme_id = t.id
GROUP BY t.id, t.name
ORDER BY story_count DESC;