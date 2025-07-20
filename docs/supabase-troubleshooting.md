# Supabase Troubleshooting Guide

## Common Issues and Solutions

### 1. Project Paused (Most Common)

**Symptoms:**
- "Session timed out" error
- Database connection failures
- Authentication not working

**Cause:**
- Free tier projects pause after ~1 week of inactivity
- No data is lost, just temporarily unavailable

**Solution:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Find your paused project (will show "Paused" status)
4. Click on the project
5. Click "Restart Project" or "Resume" button
6. Wait 2-5 minutes for restart to complete

**Prevention:**
- Upgrade to Pro tier ($25/month) - prevents auto-pausing
- Use our built-in keep-alive system (automatically enabled)
- Regular development activity keeps project active

### 2. Keep-Alive System

Your project now includes automatic keep-alive functionality:

**How it works:**
- Runs health check every 6 hours
- Simple database query to maintain activity
- Stores timestamps in localStorage for tracking

**Monitor status:**
- Visit `/admin` page to check Supabase health
- Green indicator = active, Red = needs restart
- Shows last keep-alive timestamp

### 3. Environment Variables

Ensure your `.env.local` file has:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Get these values:**
1. Supabase Dashboard → Your Project → Settings → API
2. Copy Project URL and anon/public key

### 4. Database Schema Issues

If tables are missing after restart:
1. Check Supabase Dashboard → Table Editor
2. Run SQL from `/supabase/schema.sql` if needed
3. Verify Row Level Security policies are active

### 5. Storage Issues

For media upload problems:
1. Supabase Dashboard → Storage
2. Ensure 'media' bucket exists
3. Check bucket policies allow uploads

### 6. Authentication Problems

**Reset auth if needed:**
1. Supabase Dashboard → Authentication → Users
2. Check if test users exist
3. Reset passwords through dashboard if needed

## Quick Health Check Commands

```bash
# Check if Supabase is responding
curl -I "https://your-project-id.supabase.co/rest/v1/" \
  -H "apikey: your-anon-key"

# Should return 200 OK if active
```

## Production Recommendations

### 1. Upgrade to Pro Tier
- No auto-pausing
- Better performance
- More storage and bandwidth
- Priority support

### 2. Monitoring Setup
- Set up Supabase webhooks for project events
- Monitor database performance
- Track storage usage

### 3. Backup Strategy
- Enable Point-in-Time Recovery (Pro tier)
- Regular database backups
- Export user data regularly

## Support Resources

- **Supabase Discord:** [discord.supabase.com](https://discord.supabase.com)
- **Documentation:** [supabase.com/docs](https://supabase.com/docs)
- **Status Page:** [status.supabase.com](https://status.supabase.com)

## Project-Specific Notes

### Current Setup
- **Database:** PostgreSQL with RLS enabled
- **Authentication:** Supabase Auth with custom profiles
- **Storage:** Supabase Storage for media files
- **Keep-alive:** Automatic 6-hour health checks

### Key Tables
- `profiles` - User data and preferences
- `stories` - Story content and metadata
- `communities` - Community management
- `community_members` - User-community relationships

### Storage Buckets
- `media` - Story audio, video, and images
- Organized by story ID: `stories/{story-id}/{type}/filename`

---

**Last Updated:** $(date)
**Version:** 1.0.0