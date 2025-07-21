# The Empathy Ledger Team Setup Guide

## Getting Ready for Safe Implementation

This guide walks your team through setting up a professional development environment with proper Git workflow, database management, and deployment safety.

## 🎯 Goals

- **Zero data loss**: Every action is reversible with backups
- **Safe deployments**: Staging → Production with automated testing
- **Team collaboration**: Clear workflow and code review process
- **Security first**: Secrets management and compliance monitoring

---

## 📋 Prerequisites

### Required Software

```bash
# Node.js 18+ and npm 9+
node --version  # Should be 18.0.0 or higher
npm --version   # Should be 9.0.0 or higher

# Git with proper configuration
git --version
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Docker (for local database if needed)
docker --version
```

### Required Accounts

- [ ] **GitHub**: Access to the repository
- [ ] **Supabase**: Database management
- [ ] **Vercel**: Deployment platform
- [ ] **AWS**: Backup storage (S3)
- [ ] **Slack**: Team notifications

---

## 🚀 Quick Start (5 minutes)

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/your-org/empathy-ledger.git
cd empathy-ledger

# Install dependencies
npm install

# Setup environment
npm run setup
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your actual values
nano .env.local  # or your preferred editor
```

### 3. Initialize Database

```bash
# Setup and migrate database
npm run db:setup
npm run db:migrate
npm run db:seed
```

### 4. Start Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

---

## 🗄️ Database Setup

### Development Database Options

**Option 1: Supabase (Recommended)**

1. Create Supabase project at [supabase.com](https://supabase.com)
2. Copy URL and keys to `.env.local`
3. Run migrations: `npm run db:migrate`

**Option 2: Local PostgreSQL**

```bash
# Using Docker
docker run --name empathy-ledger-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=empathy_ledger \
  -p 5432:5432 -d postgres:15

# Update .env.local
DATABASE_URL=postgresql://postgres:password@localhost:5432/empathy_ledger
```

### Database Commands

```bash
# Migration commands
npm run db:migrate          # Run pending migrations
npm run db:rollback         # Rollback last migration
npm run db:reset            # Reset database completely

# Data management
npm run db:seed             # Populate with test data
npm run airtable:export     # Export current Airtable data
npm run migrate:dry-run     # Test migration without changes

# Database tools
npm run db:studio           # Open Supabase Studio
```

---

## 🔀 Git Workflow

### Branch Structure

```
main (production)     ← Always deployable
├── develop (staging) ← Integration branch
├── feature/xyz       ← New features
├── migration/abc     ← Database changes
└── hotfix/urgent     ← Emergency fixes
```

### Daily Workflow

```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# Make changes, commit regularly
git add .
git commit -m "feat: add storyteller dashboard

Implement privacy controls and consent management
for storytellers to manage their story visibility.

Closes #123"

# Push and create PR
git push origin feature/your-feature-name
# Go to GitHub to create Pull Request
```

### Database Migration Workflow

```bash
# Create migration branch
git checkout develop
git checkout -b migration/add-sovereignty-tables

# Create migration files
npm run generate:migration -- add-sovereignty-tables

# Test migration
npm run db:migrate:test
npm run db:rollback:test

# Commit with detailed message
git add .
git commit -m "migration: add indigenous data sovereignty tables

Add tables for:
- Community protocols
- Data stewards
- Sovereignty preferences

BREAKING CHANGE: Requires database migration
Includes rollback script for safety"
```

---

## 🔐 Environment Configuration

### Environment Files

- `.env.example` - Template (committed to Git)
- `.env.local` - Development (never committed)
- GitHub Secrets - Staging/Production (never committed)

### Required Environment Variables

**Core Application**

```bash
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Database (Supabase)**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_key_here
DATABASE_URL=postgresql://postgres:[password]@[host]:[port]/[database]
```

**Migration (Temporary)**

```bash
AIRTABLE_API_KEY=your_airtable_key
AIRTABLE_BASE_ID=your_base_id
DRY_RUN=true  # Always start with dry run
```

**Backup & Security**

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
BACKUP_BUCKET=empathy-ledger-backups-dev
BACKUP_ENCRYPTION_PASSWORD=your_32_char_password
```

### Environment Validation

```bash
# Check if all required variables are set
npm run env:validate

# Setup missing variables
npm run env:setup
```

---

## 🧪 Testing Strategy

### Test Types

1. **Unit Tests**: Individual components/functions
2. **Integration Tests**: Database and API interactions
3. **E2E Tests**: Full user workflows
4. **Smoke Tests**: Quick health checks

### Running Tests

```bash
# Run all tests
npm test

# Specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# With coverage
npm run test:coverage

# Watch mode during development
npm run test:watch
```

### Test Database

```bash
# Setup separate test database
npm run db:setup:test
npm run db:migrate:test
npm run db:seed:test
```

---

## 🚀 Deployment Process

### Staging Deployment (Automatic)

```bash
# Push to develop branch triggers staging deployment
git checkout develop
git merge feature/your-feature
git push origin develop

# Automatically deploys to staging.empathyledger.com
# Runs smoke tests
# Notifies team via Slack
```

### Production Deployment (Manual PR)

```bash
# Create PR from develop to main
# Requires:
# - All tests passing
# - Code review approval
# - Database admin review (if migrations)

# After PR approval and merge:
# - Creates automatic backup
# - Runs database migrations
# - Deploys to production
# - Runs health checks
# - Notifies team
```

### Emergency Rollback

```bash
# If deployment fails
npm run deploy:rollback

# If database issues
npm run restore --backup-id=latest

# If critical issues
npm run recover --scenario=data_loss
```

---

## 🔒 Security & Compliance

### API Key Management

```bash
# Never commit real API keys
# Use GitHub secrets for staging/production
# Rotate keys regularly
npm run env:rotate-secrets
```

### Security Scanning

```bash
# Run security checks
npm run security:scan

# Fix vulnerabilities
npm run security:fix

# Check for secrets in code
npm run security:secrets
```

### Compliance Checks

```bash
# GDPR and Indigenous data sovereignty
npm run compliance:check

# Generate compliance report
npm run compliance:report
```

---

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Check application health
npm run health:check

# Monitor errors and performance
npm run monitor:errors
npm run monitor:performance
```

### Backup Management

```bash
# Create backup
npm run backup:full

# List available backups
npm run backup:list

# Verify backup integrity
npm run backup:verify
```

### Maintenance

```bash
# Enable maintenance mode
npm run maintenance:enable

# Clean up old logs
npm run cleanup:logs

# Clean up old backups
npm run cleanup:backups
```

---

## 👥 Team Roles & Responsibilities

### **Database Administrator**

- Review all migration PRs
- Monitor database performance
- Manage backups and recovery
- Approve production migrations

### **Frontend Developers**

- Create feature branches
- Write component tests
- Follow UI/UX guidelines
- Review UI-related PRs

### **Backend Developers**

- API development and testing
- Database schema design
- Integration testing
- Security implementation

### **DevOps/Platform**

- CI/CD pipeline maintenance
- Environment management
- Security monitoring
- Performance optimization

### **Product Owner**

- Review feature PRs
- Approve user-facing changes
- Prioritize development work
- Define acceptance criteria

---

## 📞 Support & Troubleshooting

### Common Issues

**Database Connection Error**

```bash
# Check environment variables
npm run env:validate

# Verify database is running
npm run health:check

# Reset database connection
npm run db:reset
```

**Migration Fails**

```bash
# Check migration syntax
npm run migration:report

# Rollback to last known good state
npm run db:rollback

# Test migration in isolation
npm run db:migrate:test
```

**Build Fails**

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check
```

**Environment Issues**

```bash
# Validate all environment variables
npm run env:validate

# Copy fresh template
cp .env.example .env.local

# Check for missing dependencies
npm run setup
```

### Getting Help

1. **Documentation**: Check `/docs` directory
2. **Team Chat**: #dev-team channel in Slack
3. **Issues**: Create GitHub issue with template
4. **Emergency**: #dev-alerts channel for urgent issues

### Emergency Contacts

- **Database Issues**: @database-admin
- **Security Concerns**: @security-team
- **Production Outage**: @on-call-engineer
- **Business Critical**: @product-owner

---

## 🎓 Learning Resources

### Required Reading

- [ ] [Git Workflow Guide](./git-workflow.md)
- [ ] [Database Architecture Strategy](./database-architecture-strategy.md)
- [ ] [Implementation Roadmap](../IMPLEMENTATION_ROADMAP.md)

### Best Practices

- **Commit Messages**: Use conventional commit format
- **PR Reviews**: Check functionality, security, performance
- **Testing**: Write tests before pushing to develop
- **Documentation**: Update docs for new features

### Code Style

```bash
# Format code before committing
npm run format

# Check linting
npm run lint

# Fix auto-fixable issues
npm run quality:fix
```

---

## ✅ Checklist: Ready for Development

### Environment Setup

- [ ] Repository cloned and dependencies installed
- [ ] `.env.local` configured with valid values
- [ ] Database connection working
- [ ] Can run `npm run dev` successfully
- [ ] Can run `npm test` successfully

### Git Configuration

- [ ] Git username and email configured
- [ ] SSH key added to GitHub account
- [ ] Can create feature branch and push
- [ ] Understand branching strategy

### Team Access

- [ ] Added to GitHub repository
- [ ] Access to Slack channels
- [ ] Supabase project access (if needed)
- [ ] Understanding of deployment process

### Knowledge Check

- [ ] Read team documentation
- [ ] Understand data sovereignty principles
- [ ] Know emergency procedures
- [ ] Familiar with testing strategy

---

## 🚨 Emergency Procedures

### Data Loss Emergency

1. **STOP** all write operations immediately
2. Alert team via #dev-alerts
3. Run: `npm run backup:emergency`
4. Contact database administrator
5. Do NOT attempt repairs without approval

### Security Breach

1. **IMMEDIATE**: Rotate all API keys
2. Alert security team
3. Check access logs
4. Run security scan
5. Document incident

### Production Outage

1. Check status page and monitoring
2. Run health checks: `npm run health:check`
3. If needed: `npm run deploy:rollback`
4. Alert team with impact assessment
5. Investigate root cause

---

Remember: **When in doubt, ask for help. Data safety comes first!**

The Empathy Ledger serves communities who trust us with their stories. Every decision should honor that trust and responsibility.
