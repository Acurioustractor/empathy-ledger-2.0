-- Create profiles table for application compatibility
-- This table is expected by the application code but was missing from earlier migrations

BEGIN;

-- Create profiles table that matches application expectations
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  age_range TEXT,
  location_general TEXT,
  languages_spoken TEXT[] DEFAULT '{}',
  role TEXT DEFAULT 'storyteller' CHECK (role IN ('storyteller', 'organization_admin', 'community_moderator', 'platform_admin', 'researcher')),
  privacy_settings JSONB DEFAULT '{}',
  notification_preferences JSONB DEFAULT '{}',
  stories_contributed INTEGER DEFAULT 0,
  communities_joined INTEGER DEFAULT 0,
  insights_generated INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles(is_active);

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can read own profile" ON profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Public profiles are viewable" ON profiles
FOR SELECT TO authenticated
USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT; 