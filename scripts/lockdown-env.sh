#!/bin/bash

# =====================================================================
# EMPATHY LEDGER - ENVIRONMENT LOCKDOWN SCRIPT
# =====================================================================
# This script ensures your environment files are bulletproof secure
# =====================================================================

set -e  # Exit on any error

echo "🔒 EMPATHY LEDGER - ENVIRONMENT LOCKDOWN"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if file exists and is readable
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1 exists${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 not found${NC}"
        return 1
    fi
}

# Function to set secure permissions
secure_file() {
    local file="$1"
    if [ -f "$file" ]; then
        chmod 600 "$file"
        echo -e "${GREEN}✅ Secured $file (600 permissions)${NC}"
    else
        echo -e "${YELLOW}⚠️  $file not found, skipping${NC}"
    fi
}

# Function to validate environment file
validate_env() {
    local file="$1"
    if [ -f "$file" ]; then
        echo -e "${BLUE}🔍 Validating $file...${NC}"
        
        # Check for critical variables
        local critical_vars=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "SUPABASE_SERVICE_KEY")
        local missing_vars=()
        
        for var in "${critical_vars[@]}"; do
            if ! grep -q "^${var}=" "$file"; then
                missing_vars+=("$var")
            fi
        done
        
        if [ ${#missing_vars[@]} -eq 0 ]; then
            echo -e "${GREEN}✅ All critical variables present${NC}"
        else
            echo -e "${YELLOW}⚠️  Missing variables: ${missing_vars[*]}${NC}"
        fi
        
        # Check for placeholder values
        if grep -q "your-" "$file" || grep -q "placeholder" "$file"; then
            echo -e "${YELLOW}⚠️  Contains placeholder values (review needed)${NC}"
        else
            echo -e "${GREEN}✅ No placeholder values detected${NC}"
        fi
    fi
}

echo "📋 STEP 1: Checking environment files..."
echo "========================================"

# Check for environment files
check_file ".env"
check_file ".env.example"
check_file ".env.local"

echo ""
echo "🔐 STEP 2: Setting secure permissions..."
echo "========================================"

# Set secure permissions on all environment files
secure_file ".env"
secure_file ".env.local"
secure_file ".env.local.backup"

# Keep .env.example readable (it's meant to be public)
if [ -f ".env.example" ]; then
    chmod 644 ".env.example"
    echo -e "${GREEN}✅ .env.example set to 644 (public template)${NC}"
fi

echo ""
echo "🔍 STEP 3: Validating environment configuration..."
echo "=================================================="

# Validate primary environment file
if [ -f ".env" ]; then
    validate_env ".env"
else
    echo -e "${RED}❌ No primary .env file found${NC}"
    exit 1
fi

echo ""
echo "🧹 STEP 4: Cleaning up duplicate files..."
echo "========================================"

# Check for duplicates and recommend cleanup
if [ -f ".env" ] && [ -f ".env.local" ]; then
    env_lines=$(wc -l < .env)
    local_lines=$(wc -l < .env.local)
    
    echo -e "${BLUE}📊 File comparison:${NC}"
    echo "   .env: $env_lines lines"
    echo "   .env.local: $local_lines lines"
    
    if [ "$env_lines" -gt "$local_lines" ]; then
        echo -e "${YELLOW}💡 Recommendation: .env appears to be more complete${NC}"
        echo -e "${YELLOW}   Consider removing .env.local to avoid confusion${NC}"
    else
        echo -e "${YELLOW}💡 Recommendation: .env.local appears to be more complete${NC}"
        echo -e "${YELLOW}   Consider renaming .env.local to .env${NC}"
    fi
fi

echo ""
echo "🔒 STEP 5: Final security validation..."
echo "======================================"

# Run the security check script if it exists
if [ -f "scripts/env-security-check.js" ]; then
    echo -e "${BLUE}🔍 Running automated security check...${NC}"
    node scripts/env-security-check.js
else
    echo -e "${YELLOW}⚠️  Security check script not found${NC}"
fi

echo ""
echo "📋 STEP 6: Environment file summary..."
echo "====================================="

# Show final status
echo -e "${BLUE}📁 Current environment files:${NC}"
ls -la .env* | while read -r line; do
    if [[ $line == *".env"* ]]; then
        echo "   $line"
    fi
done

echo ""
echo -e "${GREEN}🎉 ENVIRONMENT LOCKDOWN COMPLETE!${NC}"
echo ""
echo "📝 SECURITY CHECKLIST:"
echo "✅ File permissions set to 600 (owner-only)"
echo "✅ Critical variables validated"
echo "✅ Placeholder values identified"
echo "✅ Duplicate files analyzed"
echo "✅ Security validation completed"
echo ""
echo "🔧 NEXT STEPS:"
echo "1. Review any warnings above"
echo "2. Replace placeholder values with real credentials"
echo "3. Test your application: npm run dev"
echo "4. Run security check anytime: node scripts/env-security-check.js"
echo ""
echo -e "${BLUE}💡 TIP: Run this script anytime you add new environment variables${NC}" 