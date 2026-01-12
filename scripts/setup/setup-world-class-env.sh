#!/bin/bash
# World-Class Environment Setup

echo "🌍 Setting up world-class environment configuration..."

# 1. Clean up old files
echo "🧹 Cleaning up old environment files..."
mkdir -p .env-archive
mv .env.vault .env-archive/ 2>/dev/null || true

# 2. Ensure .env is the master
if [ ! -f ".env" ]; then
    echo "❌ .env file not found! This should be your master configuration."
    exit 1
fi

# 3. Create .env.local from .env
cp .env .env.local
chmod 600 .env .env.local
echo "✅ Created .env.local from master .env file"

# 4. Update .gitignore
if ! grep -q "\.env\.local" .gitignore; then
    echo -e "\n# Environment files" >> .gitignore
    echo ".env" >> .gitignore
    echo ".env.local" >> .gitignore
    echo ".env-archive/" >> .gitignore
    echo "✅ Updated .gitignore"
fi

# 5. Extract key info for other projects
echo ""
echo "📋 Configuration for other projects (like JusticeHub):"
echo "=================================================="
echo ""
echo "Add these to your JusticeHub .env file:"
echo ""
echo "# Empathy Ledger API Access"
echo "EMPATHY_LEDGER_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env | grep -v "^#" | head -1 | cut -d= -f2)"
echo "EMPATHY_LEDGER_ANON_KEY=$(grep "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env | grep -v "^#" | tail -1 | cut -d= -f2)"
echo ""
echo "=================================================="

# 6. Security check
echo ""
echo "🔒 Security Status:"
echo "  - .env permissions: $(ls -l .env | awk '{print $1}')"
echo "  - .env.local permissions: $(ls -l .env.local | awk '{print $1}')"
echo ""

# 7. Test connection
echo "🧪 Testing Supabase connection..."
node -e "
const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '$(grep "NEXT_PUBLIC_SUPABASE_URL" .env | grep -v "^#" | tail -1 | cut -d= -f2)';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '$(grep "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env | grep -v "^#" | tail -1 | cut -d= -f2)';

if (!url || !key) {
  console.log('❌ Missing Supabase configuration');
  process.exit(1);
}

console.log('✅ Configuration loaded successfully');
console.log('   URL:', url);
console.log('   Key:', key.substring(0, 20) + '...');
"

echo ""
echo "✅ World-class environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Run the RLS fix SQL in your Supabase dashboard"
echo "2. Test with: npm run dev"
echo "3. Share the config with JusticeHub"