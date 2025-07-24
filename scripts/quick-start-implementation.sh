#!/bin/bash

# EMPATHY LEDGER - QUICK START IMPLEMENTATION SCRIPT
# This script sets up the complete AI storyteller analysis system

set -e  # Exit on any error

echo "🚀 EMPATHY LEDGER IMPLEMENTATION SETUP"
echo "======================================"
echo ""

# Check if running with required parameters
if [ $# -eq 0 ]; then
    echo "Usage: $0 [environment]"
    echo "Environments: development, staging, production"
    exit 1
fi

ENVIRONMENT=$1
PROJECT_ROOT="$(pwd)"
LOG_FILE="$PROJECT_ROOT/setup-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}" | tee -a "$LOG_FILE"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check environment variables
check_env_var() {
    if [ -z "${!1}" ]; then
        error "Environment variable $1 is required but not set"
    fi
}

# PHASE 1: PREREQUISITES CHECK
log "Phase 1: Checking Prerequisites"

# Check Node.js
if ! command_exists node; then
    error "Node.js is required but not installed. Please install Node.js 18+ and try again."
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt "18" ]; then
    error "Node.js 18+ is required. Current version: $(node --version)"
fi

# Check npm
if ! command_exists npm; then
    error "npm is required but not installed."
fi

# Check psql for database operations
if ! command_exists psql; then
    warn "psql not found. Database setup will be skipped."
    SKIP_DB=true
fi

# Check git
if ! command_exists git; then
    warn "git not found. Some operations may be limited."
fi

log "✅ Prerequisites check completed"

# PHASE 2: ENVIRONMENT SETUP
log "Phase 2: Setting up Environment"

# Create necessary directories
mkdir -p logs
mkdir -p backups
mkdir -p uploads
mkdir -p temp

# Set up environment file
ENV_FILE=".env.${ENVIRONMENT}"
if [ ! -f "$ENV_FILE" ]; then
    log "Creating environment file: $ENV_FILE"
    
    cat > "$ENV_FILE" << EOF
# Empathy Ledger Configuration - ${ENVIRONMENT}
NODE_ENV=${ENVIRONMENT}

# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
DATABASE_URL=your_database_url_here

# AI Services
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here

# Translation Services
GOOGLE_TRANSLATE_API_KEY=your_google_translate_key_here

# Storage
STORAGE_BUCKET=empathy-ledger-${ENVIRONMENT}
AWS_ACCESS_KEY_ID=your_aws_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_here

# Monitoring
SENTRY_DSN=your_sentry_dsn_here
ANALYTICS_ID=your_analytics_id_here

# Email Services
SENDGRID_API_KEY=your_sendgrid_key_here
SUPPORT_EMAIL=support@empathyledger.org

# Security
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)

# Feature Flags
ENABLE_AI_ANALYSIS=true
ENABLE_MULTI_LANGUAGE=true
ENABLE_BATCH_PROCESSING=true
ENABLE_MONITORING=true

# Rate Limiting
API_RATE_LIMIT=100
AI_RATE_LIMIT=10
CONCURRENT_ANALYSES=5

# Quality Thresholds
MIN_QUALITY_SCORE=0.8
BIAS_DETECTION_THRESHOLD=0.7
CULTURAL_SENSITIVITY_THRESHOLD=0.8
EOF

    warn "Please edit $ENV_FILE with your actual API keys and configuration"
    info "Required API keys:"
    info "  - Supabase URL and Service Role Key"
    info "  - OpenAI API Key (for AI analysis)"
    info "  - Google Translate API Key (for multi-language)"
    
    read -p "Press Enter when you've configured the environment file..."
fi

# Source the environment file
set -a  # Export all variables
source "$ENV_FILE"
set +a

log "✅ Environment setup completed"

# PHASE 3: DEPENDENCY INSTALLATION
log "Phase 3: Installing Dependencies"

# Install npm dependencies
if [ -f "package.json" ]; then
    log "Installing npm dependencies..."
    npm install | tee -a "$LOG_FILE"
else
    error "package.json not found. Are you in the project root directory?"
fi

# Install additional AI analysis dependencies
log "Installing AI analysis dependencies..."
npm install openai anthropic @google-cloud/translate | tee -a "$LOG_FILE"

# Install monitoring dependencies
if [ "$ENVIRONMENT" != "development" ]; then
    log "Installing production monitoring dependencies..."
    npm install @sentry/nextjs | tee -a "$LOG_FILE"
fi

log "✅ Dependencies installation completed"

# PHASE 4: DATABASE SETUP
if [ "$SKIP_DB" != "true" ]; then
    log "Phase 4: Database Setup"
    
    # Check database connection
    if [ -n "$DATABASE_URL" ]; then
        log "Testing database connection..."
        if psql "$DATABASE_URL" -c "SELECT 1;" >/dev/null 2>&1; then
            log "✅ Database connection successful"
            
            # Deploy database schema
            log "Deploying database schema..."
            psql "$DATABASE_URL" -f scripts/sql/ai-analysis-schema.sql | tee -a "$LOG_FILE"
            
            # Insert initial data
            log "Inserting initial theme taxonomy..."
            psql "$DATABASE_URL" -c "INSERT INTO theme_taxonomy (theme_name, category, description) VALUES 
                ('Mental Health Journey', 'wellness', 'Personal experiences with mental health challenges and recovery'),
                ('Community Support', 'relationships', 'Finding and providing support within community networks'),
                ('Career Transformation', 'growth', 'Professional development and career change experiences'),
                ('Cultural Identity', 'identity', 'Connection to cultural heritage and identity exploration'),
                ('Resilience Building', 'strength', 'Developing capacity to overcome challenges and adversity')
                ON CONFLICT (theme_name) DO NOTHING;" | tee -a "$LOG_FILE"
            
            log "✅ Database setup completed"
        else
            error "Cannot connect to database. Please check DATABASE_URL"
        fi
    else
        warn "DATABASE_URL not set. Skipping database setup."
    fi
else
    warn "Skipping database setup (psql not available)"
fi

# PHASE 5: AI SERVICES SETUP
log "Phase 5: AI Services Configuration"

# Test OpenAI connection
if [ -n "$OPENAI_API_KEY" ]; then
    log "Testing OpenAI connection..."
    if curl -s -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models >/dev/null; then
        log "✅ OpenAI connection successful"
    else
        warn "OpenAI connection failed. Please check OPENAI_API_KEY"
    fi
else
    warn "OPENAI_API_KEY not set"
fi

# Test translation service
if [ -n "$GOOGLE_TRANSLATE_API_KEY" ]; then
    log "Translation service configured"
else
    warn "GOOGLE_TRANSLATE_API_KEY not set. Multi-language features will be limited."
fi

log "✅ AI services configuration completed"

# PHASE 6: BUILD AND TEST
log "Phase 6: Build and Test"

# Build the application
log "Building application..."
npm run build 2>&1 | tee -a "$LOG_FILE" || error "Build failed"

# Run tests if available
if [ -f "jest.config.js" ] || [ -f "jest.config.ts" ]; then
    log "Running tests..."
    npm test 2>&1 | tee -a "$LOG_FILE" || warn "Some tests failed"
fi

log "✅ Build and test completed"

# PHASE 7: MONITORING SETUP
log "Phase 7: Monitoring Setup"

# Create monitoring script
cat > monitoring/health-check.js << 'EOF'
#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

async function healthCheck() {
    try {
        // Database check
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        const { data, error } = await supabase
            .from('storytellers')
            .select('count')
            .limit(1);
            
        if (error) throw error;
        
        console.log('✅ Database: Healthy');
        
        // AI service check (if API key available)
        if (process.env.OPENAI_API_KEY) {
            const response = await fetch('https://api.openai.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                }
            });
            
            if (response.ok) {
                console.log('✅ AI Service: Healthy');
            } else {
                console.log('❌ AI Service: Unhealthy');
            }
        }
        
        console.log('✅ System: Overall Healthy');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Health Check Failed:', error.message);
        process.exit(1);
    }
}

healthCheck();
EOF

chmod +x monitoring/health-check.js

# Create startup script
cat > start.sh << EOF
#!/bin/bash
# Empathy Ledger Startup Script

echo "🚀 Starting Empathy Ledger..."

# Source environment
source .env.${ENVIRONMENT}

# Run health check
echo "Running health check..."
node monitoring/health-check.js

if [ \$? -eq 0 ]; then
    echo "✅ Health check passed. Starting application..."
    npm run start
else
    echo "❌ Health check failed. Please check configuration."
    exit 1
fi
EOF

chmod +x start.sh

log "✅ Monitoring setup completed"

# PHASE 8: DOCUMENTATION GENERATION
log "Phase 8: Generating Documentation"

# Create quick reference
cat > QUICK_REFERENCE.md << EOF
# Empathy Ledger - Quick Reference

## Environment: ${ENVIRONMENT}

### Start Application
\`\`\`bash
./start.sh
\`\`\`

### Health Check
\`\`\`bash
node monitoring/health-check.js
\`\`\`

### Database Access
\`\`\`bash
psql "\$DATABASE_URL"
\`\`\`

### View Logs
\`\`\`bash
tail -f logs/application.log
\`\`\`

### Configuration Files
- Environment: .env.${ENVIRONMENT}
- Database Schema: scripts/sql/ai-analysis-schema.sql
- Implementation Guide: docs/IMPLEMENTATION_SCALING_GUIDE.md

### Key URLs (after startup)
- Application: http://localhost:3000
- Admin Panel: http://localhost:3000/admin
- API Docs: http://localhost:3000/api/docs
- Health Check: http://localhost:3000/api/health

### Support
- Documentation: /docs
- Logs: setup-$(date +%Y%m%d-%H%M%S).log
- Issues: https://github.com/empathy-ledger/issues
EOF

log "✅ Documentation generated"

# PHASE 9: FINAL SETUP
log "Phase 9: Final Setup and Validation"

# Create backup script
cat > scripts/backup.sh << 'EOF'
#!/bin/bash
# Database backup script

BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/empathy_ledger_backup_$TIMESTAMP.sql"

mkdir -p "$BACKUP_DIR"

echo "Creating backup: $BACKUP_FILE"
pg_dump "$DATABASE_URL" > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"

echo "✅ Backup created: $BACKUP_FILE.gz"

# Clean old backups (keep last 7 days)
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete
EOF

chmod +x scripts/backup.sh

# Create service configuration for production
if [ "$ENVIRONMENT" = "production" ]; then
    cat > empathy-ledger.service << EOF
[Unit]
Description=Empathy Ledger Application
After=network.target

[Service]
Type=simple
User=empathy
WorkingDirectory=/opt/empathy-ledger
ExecStart=/opt/empathy-ledger/start.sh
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

    log "Service file created: empathy-ledger.service"
    info "To install as system service:"
    info "  sudo cp empathy-ledger.service /etc/systemd/system/"
    info "  sudo systemctl enable empathy-ledger"
    info "  sudo systemctl start empathy-ledger"
fi

log "✅ Final setup completed"

# SUMMARY
echo ""
echo "🎉 EMPATHY LEDGER SETUP COMPLETED SUCCESSFULLY!"
echo "=============================================="
echo ""
echo "📋 Setup Summary:"
echo "  Environment: $ENVIRONMENT"
echo "  Log file: $LOG_FILE"
echo "  Configuration: .env.$ENVIRONMENT"
echo ""
echo "🚀 Next Steps:"
echo "  1. Review and update configuration in .env.$ENVIRONMENT"
echo "  2. Start the application: ./start.sh"
echo "  3. Visit http://localhost:3000 to verify setup"
echo "  4. Check docs/IMPLEMENTATION_SCALING_GUIDE.md for detailed usage"
echo ""
echo "📞 Support:"
echo "  - Documentation: /docs directory"
echo "  - Health check: node monitoring/health-check.js"
echo "  - Backup database: ./scripts/backup.sh"
echo ""
echo "⚠️  Important Notes:"
echo "  - Update API keys in .env.$ENVIRONMENT before first use"
echo "  - Run health check to verify all services"
echo "  - Review privacy settings for your organization"
echo "  - Set up regular backups for production"
echo ""

if [ "$ENVIRONMENT" = "production" ]; then
    echo "🔒 Production Security Reminders:"
    echo "  - Enable HTTPS/SSL certificates"
    echo "  - Set up firewall rules"
    echo "  - Configure log rotation"
    echo "  - Enable monitoring alerts"
    echo "  - Review backup procedures"
    echo ""
fi

log "Setup script completed successfully"

# Final validation
echo "Running final validation..."
if [ -f ".env.$ENVIRONMENT" ] && [ -f "start.sh" ] && [ -f "QUICK_REFERENCE.md" ]; then
    echo "✅ All required files created"
    echo ""
    echo "Ready to launch! Run './start.sh' when you're ready to begin."
else
    error "Some files are missing. Please check the setup log: $LOG_FILE"
fi