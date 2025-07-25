#!/bin/bash

# =====================================================================
# DEPLOY STORY BEAUTIFICATION SYSTEM
# =====================================================================
# This script deploys the complete automated beautification system

set -e  # Exit on any error

echo "🚀 Deploying Story Beautification System..."

# Check if required tools are installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Install with: npm install -g supabase"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo "⚠️  psql not found. Database operations will use Supabase CLI only."
fi

# Get project configuration
echo "📋 Please provide your Supabase project details:"
read -p "Project Reference ID: " PROJECT_REF
read -p "Database Password: " -s DB_PASSWORD
echo
read -p "OpenAI API Key: " -s OPENAI_API_KEY
echo

# Validate inputs
if [[ -z "$PROJECT_REF" || -z "$DB_PASSWORD" || -z "$OPENAI_API_KEY" ]]; then
    echo "❌ All fields are required"
    exit 1
fi

echo "🔗 Linking to Supabase project..."
supabase link --project-ref "$PROJECT_REF"

echo "🔑 Setting up secrets..."
supabase secrets set OPENAI_API_KEY="$OPENAI_API_KEY"

echo "📊 Running database migration..."
supabase db push

echo "🚀 Deploying Edge Function..."
supabase functions deploy story-beautifier

echo "⚙️ Setting up database triggers..."
# Run the trigger setup SQL
supabase db reset --linked

echo "🧪 Testing the system..."

# Test the Edge Function
echo "Testing Edge Function..."
FUNCTION_URL="https://$PROJECT_REF.functions.supabase.co/story-beautifier"

# Test with a sample story (if any exist)
SAMPLE_STORY_ID=$(supabase db query "SELECT id FROM stories LIMIT 1" --output tsv | tail -n +2)

if [[ -n "$SAMPLE_STORY_ID" ]]; then
    echo "Testing with story ID: $SAMPLE_STORY_ID"
    curl -X POST "$FUNCTION_URL" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"story_id\": \"$SAMPLE_STORY_ID\"}"
    echo
else
    echo "No sample stories found for testing"
fi

echo "✅ Deployment complete!"
echo
echo "📊 System Status:"
echo "• Database migrations: Applied"
echo "• Edge Function: Deployed at $FUNCTION_URL"
echo "• Triggers: Active"
echo "• Secrets: Configured"
echo
echo "🔧 Next Steps:"
echo "1. Update your environment variables with the new columns"
echo "2. Test with a real story insert/update"
echo "3. Monitor processing via: SELECT * FROM story_beautification_status;"
echo "4. Set up monitoring alerts for failed processing"
echo
echo "📚 Usage:"
echo "• Automatic: New stories will be processed automatically"
echo "• Manual single: POST to $FUNCTION_URL with {story_id: 'uuid'}"
echo "• Manual batch: GET $FUNCTION_URL to process all pending"
echo "• Reprocess all: SELECT process_all_pending_stories();"