-- =====================================================================
-- EMPATHY LEDGER SCHEMA INSPECTION AND FIX
-- First inspect existing structure, then fix safely
-- =====================================================================

-- Let's see what columns exist in the stories table
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'stories' 
ORDER BY ordinal_position;

-- Check what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check what types exist
SELECT typname 
FROM pg_type 
WHERE typname IN ('story_category', 'privacy_level', 'story_status', 'user_role');

-- Check existing policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Now let's fix the stories table structure
-- First, let's add all the missing columns we need
DO $$
BEGIN
    RAISE NOTICE 'Adding missing columns to stories table...';
    
    -- Add contributor_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stories' AND column_name = 'contributor_id'
    ) THEN
        ALTER TABLE stories ADD COLUMN contributor_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added contributor_id column';
    END IF;
    
    -- Add community_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stories' AND column_name = 'community_id'
    ) THEN
        ALTER TABLE stories ADD COLUMN community_id UUID REFERENCES communities(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added community_id column';
    END IF;
    
    -- Add themes if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stories' AND column_name = 'themes'
    ) THEN
        ALTER TABLE stories ADD COLUMN themes TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added themes column';
    END IF;
    
    -- Add tags if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stories' AND column_name = 'tags'
    ) THEN
        ALTER TABLE stories ADD COLUMN tags TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added tags column';
    END IF;
    
    -- Add privacy_level if missing (need to check if type exists first)
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'privacy_level') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'stories' AND column_name = 'privacy_level'
        ) THEN
            ALTER TABLE stories ADD COLUMN privacy_level privacy_level DEFAULT 'private';
            RAISE NOTICE 'Added privacy_level column';
        END IF;
    END IF;
    
    -- Add category if missing
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'story_category') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'stories' AND column_name = 'category'
        ) THEN
            ALTER TABLE stories ADD COLUMN category story_category;
            RAISE NOTICE 'Added category column';
        END IF;
    END IF;
    
    -- Add status if missing
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'story_status') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'stories' AND column_name = 'status'
        ) THEN
            ALTER TABLE stories ADD COLUMN status story_status DEFAULT 'draft';
            RAISE NOTICE 'Added status column';
        END IF;
    END IF;
    
    -- Add can_be_shared if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stories' AND column_name = 'can_be_shared'
    ) THEN
        ALTER TABLE stories ADD COLUMN can_be_shared BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added can_be_shared column';
    END IF;
    
    -- Add allow_research_use if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stories' AND column_name = 'allow_research_use'
    ) THEN
        ALTER TABLE stories ADD COLUMN allow_research_use BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added allow_research_use column';
    END IF;
    
    -- Add allow_ai_analysis if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stories' AND column_name = 'allow_ai_analysis'
    ) THEN
        ALTER TABLE stories ADD COLUMN allow_ai_analysis BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added allow_ai_analysis column';
    END IF;
    
    -- Add media columns if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stories' AND column_name = 'image_urls'
    ) THEN
        ALTER TABLE stories ADD COLUMN image_urls TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added image_urls column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stories' AND column_name = 'audio_url'
    ) THEN
        ALTER TABLE stories ADD COLUMN audio_url TEXT;
        RAISE NOTICE 'Added audio_url column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stories' AND column_name = 'video_url'
    ) THEN
        ALTER TABLE stories ADD COLUMN video_url TEXT;
        RAISE NOTICE 'Added video_url column';
    END IF;
    
    -- Add analytics columns if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stories' AND column_name = 'view_count'
    ) THEN
        ALTER TABLE stories ADD COLUMN view_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added view_count column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stories' AND column_name = 'reaction_count'
    ) THEN
        ALTER TABLE stories ADD COLUMN reaction_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added reaction_count column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stories' AND column_name = 'comment_count'
    ) THEN
        ALTER TABLE stories ADD COLUMN comment_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added comment_count column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stories' AND column_name = 'impact_score'
    ) THEN
        ALTER TABLE stories ADD COLUMN impact_score FLOAT DEFAULT 0;
        RAISE NOTICE 'Added impact_score column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stories' AND column_name = 'sentiment_score'
    ) THEN
        ALTER TABLE stories ADD COLUMN sentiment_score FLOAT;
        RAISE NOTICE 'Added sentiment_score column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stories' AND column_name = 'emotion_scores'
    ) THEN
        ALTER TABLE stories ADD COLUMN emotion_scores JSONB DEFAULT '{}';
        RAISE NOTICE 'Added emotion_scores column';
    END IF;
    
    RAISE NOTICE 'Stories table structure updated successfully';
END $$;

-- Now check the updated structure
SELECT 
    'Updated stories table structure:' as info,
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'stories' 
ORDER BY ordinal_position;