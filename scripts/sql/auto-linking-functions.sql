
        -- Function to automatically link new transcripts to storytellers
        CREATE OR REPLACE FUNCTION auto_link_transcript_to_storyteller()
        RETURNS TRIGGER AS $$
        BEGIN
            -- When a new transcript is added, ensure story-storyteller connection exists
            IF NOT EXISTS (
                SELECT 1 FROM stories s 
                WHERE s.id = NEW.story_id 
                AND s.storyteller_id IS NOT NULL
            ) THEN
                RAISE EXCEPTION 'Transcript must be linked to a story with a storyteller';
            END IF;
            
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Function to auto-assign themes to new quotes based on existing patterns
        CREATE OR REPLACE FUNCTION auto_assign_themes_to_quote()
        RETURNS TRIGGER AS $$
        DECLARE
            story_themes_array TEXT[];
        BEGIN
            -- Get themes already assigned to the story
            SELECT ARRAY_AGG(th.name) INTO story_themes_array
            FROM story_themes st
            JOIN themes th ON th.id = st.theme_id
            WHERE st.story_id = NEW.story_id;
            
            -- Auto-assign story themes to the quote
            IF story_themes_array IS NOT NULL THEN
                NEW.themes := story_themes_array;
            END IF;
            
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Function to suggest themes for new transcripts
        CREATE OR REPLACE FUNCTION suggest_themes_for_transcript(transcript_text TEXT)
        RETURNS TABLE(theme_name TEXT, confidence FLOAT) AS $$
        BEGIN
            RETURN QUERY
            SELECT 
                th.name,
                CASE 
                    WHEN lower(transcript_text) ~ lower(th.name) THEN 0.9
                    WHEN lower(transcript_text) ~ lower(split_part(th.name, ' ', 1)) THEN 0.6
                    ELSE 0.0
                END as confidence
            FROM themes th
            WHERE lower(transcript_text) ~ lower(th.name)
               OR lower(transcript_text) ~ lower(split_part(th.name, ' ', 1))
            ORDER BY confidence DESC;
        END;
        $$ LANGUAGE plpgsql;

        -- Triggers
        DROP TRIGGER IF EXISTS trig_auto_link_transcript ON transcripts;
        CREATE TRIGGER trig_auto_link_transcript
            BEFORE INSERT ON transcripts
            FOR EACH ROW EXECUTE FUNCTION auto_link_transcript_to_storyteller();

        DROP TRIGGER IF EXISTS trig_auto_assign_themes ON quotes;
        CREATE TRIGGER trig_auto_assign_themes
            BEFORE INSERT ON quotes
            FOR EACH ROW EXECUTE FUNCTION auto_assign_themes_to_quote();
        