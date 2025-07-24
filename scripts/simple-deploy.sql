-- Simple deployment script for Empathy Ledger World-Class Architecture
-- Run this in your Supabase SQL Editor

-- First, let's check what we have
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;