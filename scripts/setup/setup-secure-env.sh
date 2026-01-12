#!/bin/bash

# =====================================================================
# EMPATHY LEDGER - SECURE ENVIRONMENT SETUP SCRIPT
# =====================================================================
# This script helps set up a secure environment configuration
# =====================================================================

set -e  # Exit on any error

echo "🔒 EMPATHY LEDGER - SECURE ENVIRONMENT SETUP"
echo "============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local already exists${NC}"
    echo "Creating backup..."
    cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${GREEN}✅ Backup created${NC}"
fi

# Copy secure template
echo ""
echo "📋 Setting up secure environment configuration..."
cp env-secure-template.txt .env.local

# Set secure permissions
echo "🔐 Setting secure file permissions..."
chmod 600 .env.local
echo -e "${GREEN}✅ File permissions set to 600 (owner-only)${NC}"

# Generate secure secrets
echo ""
echo "🔑 Generating secure secrets..."

# Generate NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -base64 32 | tr -d '\n')
sed -i.bak "s/empathy-ledger-super-secure-secret-2025-change-in-production/$NEXTAUTH_SECRET/" .env.local

# Generate encryption key
ENCRYPTION_KEY=$(openssl rand -base64 32 | tr -d '\n' | head -c 32)
sed -i.bak "s/EmpathyLedger2025SecureStoryData!/$ENCRYPTION_KEY/" .env.local

# Generate CSRF secret
CSRF_SECRET=$(openssl rand -base64 24 | tr -d '\n')
sed -i.bak "s/csrf-protection-empathy-ledger-2025/$CSRF_SECRET/" .env.local

# Clean up backup files
rm -f .env.local.bak

echo -e "${GREEN}✅ Secure secrets generated${NC}"

# Verify setup
echo ""
echo "🔍 Verifying secure setup..."
if [ -f "scripts/env-security-check.js" ]; then
    node scripts/env-security-check.js
else
    echo -e "${YELLOW}⚠️  Security check script not found${NC}"
fi

echo ""
echo -e "${GREEN}🎉 SECURE ENVIRONMENT SETUP COMPLETE!${NC}"
echo ""
echo "📝 NEXT STEPS:"
echo "1. Review .env.local and update any placeholder values"
echo "2. Test your application: npm run dev"
echo "3. For production: use env-production-template.txt"
echo "4. Never commit .env.local to version control"
echo ""
echo -e "${BLUE}💡 TIP: Run 'node scripts/env-security-check.js' anytime to validate security${NC}" 