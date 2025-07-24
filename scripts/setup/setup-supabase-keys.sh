#!/bin/bash

# =====================================================================
# SUPABASE API KEY SETUP SCRIPT - SECURE METHOD
# =====================================================================
# This script helps you set up Supabase API keys securely
# =====================================================================

set -e  # Exit on any error

echo "🔐 SUPABASE API KEY SETUP - SECURE METHOD"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to validate API key format
validate_api_key() {
    local key="$1"
    local key_type="$2"
    
    if [[ -z "$key" ]]; then
        echo -e "${RED}❌ $key_type key is empty${NC}"
        return 1
    fi
    
    if [[ ! "$key" =~ ^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$ ]]; then
        echo -e "${RED}❌ $key_type key format is invalid${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ $key_type key format is valid${NC}"
    return 0
}

# Function to backup current environment
backup_environment() {
    if [ -f ".env.local" ]; then
        echo -e "${BLUE}📋 Creating backup of current .env.local...${NC}"
        cp .env.local ".env.local.backup.$(date +%Y%m%d_%H%M%S)"
        echo -e "${GREEN}✅ Backup created${NC}"
    fi
}

# Function to update environment file
update_environment() {
    local supabase_url="$1"
    local anon_key="$2"
    local service_key="$3"
    
    echo -e "${BLUE}📝 Updating .env.local with new Supabase keys...${NC}"
    
    # Create new .env.local with Supabase configuration
    cat > .env.local << EOF
# EMPATHY LEDGER - ENVIRONMENT CONFIGURATION
# =========================================
# Generated: $(date)
# Security: 600 permissions (owner-only)

# SUPABASE CONFIGURATION
# =====================
NEXT_PUBLIC_SUPABASE_URL=$supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=$anon_key
SUPABASE_SERVICE_ROLE_KEY=$service_key

# DATABASE CONFIGURATION
# =====================
SUPABASE_DB_PASSWORD=wft8wab8dhy.geh9WXN

# ADDITIONAL SERVICES (configure as needed)
# ========================================

# GOOGLE OAUTH
# GOOGLE_CLIENT_ID=your_google_client_id
# GOOGLE_CLIENT_SECRET=your_google_client_secret

# CLAUDE API
# CLAUDE_API_KEY=your_claude_api_key

# ASSEMBLYAI
# ASSEMBLYAI_API_KEY=your_assemblyai_api_key

# AIRTABLE
# AIRTABLE_API_KEY=your_airtable_api_key
# AIRTABLE_BASE_ID=your_airtable_base_id

# EMAIL SERVICE (Resend recommended)
# RESEND_API_KEY=your_resend_api_key

# MEDIA PROCESSING (Cloudinary recommended)
# CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
# CLOUDINARY_API_KEY=your_cloudinary_api_key
# CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# PAYMENT PROCESSING (Stripe recommended)
# STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
# STRIPE_SECRET_KEY=your_stripe_secret_key
# STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# SEARCH (Algolia recommended)
# ALGOLIA_APP_ID=your_algolia_app_id
# ALGOLIA_SEARCH_KEY=your_algolia_search_key
# ALGOLIA_ADMIN_KEY=your_algolia_admin_key

# CONTENT MODERATION
# OPENAI_API_KEY=your_openai_api_key
# PERSPECTIVE_API_KEY=your_perspective_api_key

# ANALYTICS (PostHog recommended)
# POSTHOG_API_KEY=your_posthog_api_key
# POSTHOG_HOST=https://app.posthog.com

# ERROR TRACKING (Sentry recommended)
# SENTRY_DSN=your_sentry_dsn

# BACKUP (AWS S3 recommended)
# AWS_ACCESS_KEY_ID=your_aws_access_key_id
# AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
# AWS_REGION=your_aws_region
# AWS_S3_BUCKET=your_s3_bucket_name
EOF

    # Set secure permissions
    chmod 600 .env.local
    echo -e "${GREEN}✅ .env.local updated with secure permissions${NC}"
}

# Function to test Supabase connection
test_connection() {
    echo -e "${BLUE}🧪 Testing Supabase connection...${NC}"
    
    # Test if the application is running
    if curl -s http://localhost:3003 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Application is running${NC}"
        
        # Test Supabase health endpoint
        response=$(curl -s http://localhost:3003/api/health/supabase 2>/dev/null || echo "error")
        
        if [[ "$response" == *"healthy"* ]]; then
            echo -e "${GREEN}✅ Supabase connection successful!${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️  Supabase connection test failed${NC}"
            echo -e "${BLUE}   Response: $response${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  Application not running on port 3003${NC}"
        echo -e "${BLUE}   Start the app with: npm run dev${NC}"
        return 1
    fi
}

# Main execution
main() {
    echo -e "${BLUE}🔑 SUPABASE API KEY SETUP${NC}"
    echo ""
    
    # Check if running interactively
    if [ -t 0 ]; then
        echo -e "${YELLOW}📋 INTERACTIVE MODE${NC}"
        echo ""
        
        # Get Supabase URL
        read -p "Enter your Supabase URL (e.g., https://your-project.supabase.co): " supabase_url
        
        # Get anon key
        echo ""
        echo -e "${BLUE}📋 Enter your anon public key (from Supabase dashboard):${NC}"
        read -p "Anon Key: " anon_key
        
        # Get service role key
        echo ""
        echo -e "${BLUE}🔒 Enter your service_role secret key (from Supabase dashboard):${NC}"
        read -s -p "Service Role Key: " service_key
        echo ""
        
        # Validate keys
        echo ""
        echo -e "${BLUE}🔍 Validating API keys...${NC}"
        validate_api_key "$anon_key" "Anon" || exit 1
        validate_api_key "$service_key" "Service Role" || exit 1
        
        # Backup and update
        backup_environment
        update_environment "$supabase_url" "$anon_key" "$service_key"
        
        echo ""
        echo -e "${GREEN}✅ Supabase keys configured successfully!${NC}"
        echo ""
        echo -e "${BLUE}🧪 Testing connection...${NC}"
        test_connection
        
    else
        echo -e "${YELLOW}📋 NON-INTERACTIVE MODE${NC}"
        echo ""
        echo "Usage: $0"
        echo ""
        echo "This script will prompt you for your Supabase API keys"
        echo "and configure them securely in your .env.local file."
        echo ""
        echo "Make sure you have your API keys ready from:"
        echo "https://supabase.com/dashboard → Settings → API"
        exit 1
    fi
}

# Run main function
main "$@" 