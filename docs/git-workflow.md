# Git Workflow & Development Process

## Branching Strategy

We use a **GitFlow-inspired** approach with safety-first principles for database migrations.

### Branch Structure

```
main (production)
├── develop (staging)
├── feature/feature-name
├── hotfix/fix-name
└── migration/migration-name
```

### Branch Descriptions

**`main`** - Production branch
- Always deployable
- Protected with required reviews
- Automatic deployment to production
- Only accepts merges from `develop` or `hotfix/*`

**`develop`** - Staging branch  
- Integration branch for new features
- Deployed to staging environment
- All features merge here first
- Must pass all tests before merging to `main`

**`feature/*`** - Feature branches
- New features and improvements
- Branch from `develop`
- Merge back to `develop` via PR
- Naming: `feature/story-submission-ui`

**`migration/*`** - Database migration branches
- Special branch type for database changes
- Requires additional review process
- Must include rollback scripts
- Naming: `migration/add-sovereignty-tables`

**`hotfix/*`** - Emergency fixes
- Branch from `main`
- Can merge directly to `main` and `develop`
- For critical production issues only

## Development Workflow

### 1. Starting New Work

```bash
# Update develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Start development
```

### 2. During Development

```bash
# Regular commits with meaningful messages
git add .
git commit -m "feat: add storyteller consent management

- Implement granular privacy controls
- Add cultural protocol validation
- Update UI for consent settings"

# Push regularly
git push origin feature/your-feature-name
```

### 3. Ready for Review

```bash
# Update your branch with latest develop
git checkout develop
git pull origin develop
git checkout feature/your-feature-name
git rebase develop

# Push and create PR
git push origin feature/your-feature-name
```

## Database Migration Workflow

### Special Process for Database Changes

1. **Create Migration Branch**
   ```bash
   git checkout develop
   git checkout -b migration/add-new-tables
   ```

2. **Development Process**
   - Write migration SQL files
   - Create corresponding rollback scripts
   - Test in local environment
   - Document changes in migration notes

3. **Migration Checklist**
   - [ ] Migration script tested locally
   - [ ] Rollback script tested
   - [ ] Backup procedures documented
   - [ ] Performance impact assessed
   - [ ] Team notified of breaking changes

4. **Review Process**
   - Database admin must review
   - Requires 2 approvals minimum
   - Must pass staging tests
   - Includes rollback plan

## Pull Request Process

### PR Requirements

**All PRs must include:**
- [ ] Clear description of changes
- [ ] Link to related issue/task
- [ ] Screenshots for UI changes
- [ ] Test results
- [ ] Breaking change documentation

**Database PRs additionally require:**
- [ ] Migration script included
- [ ] Rollback script included
- [ ] Performance impact assessment
- [ ] Backup strategy confirmed

### PR Templates

#### Feature PR Template
```markdown
## Summary
Brief description of what this PR does.

## Changes Made
- List of specific changes
- Any breaking changes
- New dependencies

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots
(Include for UI changes)

## Additional Notes
Any other context or concerns.
```

#### Migration PR Template
```markdown
## Database Migration

### Summary
Description of database changes and rationale.

### Migration Details
- **Tables affected:** 
- **Estimated duration:** 
- **Downtime required:** 
- **Data size impact:** 

### Migration Files
- [ ] Up migration: `supabase/migrations/YYYYMMDD_description.sql`
- [ ] Down migration: `supabase/migrations/YYYYMMDD_description_rollback.sql`
- [ ] Migration script: `scripts/migrations/migrate-YYYYMMDD.js`

### Testing Checklist
- [ ] Tested on empty database
- [ ] Tested with production-like data
- [ ] Rollback tested and verified
- [ ] Performance benchmarked
- [ ] Backup/restore tested

### Rollback Plan
1. Stop application
2. Run rollback script
3. Restore from backup if needed
4. Verify data integrity

### Team Notifications
- [ ] Team notified of migration window
- [ ] Users notified if downtime required
- [ ] Support team briefed
```

## Environment Management

### Environment Structure

```
Production (main branch)
├── Database: Supabase Production
├── Domain: empathyledger.com
├── Monitoring: Full monitoring enabled
└── Backups: Automated daily backups

Staging (develop branch)
├── Database: Supabase Staging
├── Domain: staging.empathyledger.com
├── Monitoring: Basic monitoring
└── Backups: Weekly backups

Development (feature branches)
├── Database: Local Supabase / Dev instance
├── Domain: localhost:3000
├── Monitoring: Development only
└── Backups: Manual as needed
```

### Environment Variables

Each environment uses different configuration:

**`.env.example`** - Template for all environments
**`.env.local`** - Local development (not committed)
**`.env.staging`** - Staging configuration (GitHub secrets)
**`.env.production`** - Production configuration (GitHub secrets)

## Commit Message Standards

### Format
```
type(scope): description

body (optional)

footer (optional)
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks
- `migration`: Database migrations
- `security`: Security-related changes

### Examples
```bash
feat(stories): add consent management system

Implement granular privacy controls for storytellers
including cultural protocol validation and community
governance settings.

Closes #123

fix(auth): resolve login redirect loop

Users were getting stuck in redirect loop when
accessing protected pages after login.

migration(sovereignty): add indigenous data tables

Add tables for community protocols, data stewards,
and sovereignty preferences to support CARE principles.

BREAKING CHANGE: Requires database migration
```

## Release Process

### Version Numbering
We use semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (database schema changes)
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes and minor improvements

### Release Steps

1. **Create Release Branch**
   ```bash
   git checkout develop
   git checkout -b release/v1.2.0
   ```

2. **Prepare Release**
   - Update version numbers
   - Update CHANGELOG.md
   - Final testing
   - Documentation updates

3. **Deploy to Staging**
   - Merge to develop
   - Deploy to staging
   - User acceptance testing

4. **Deploy to Production**
   - Create PR to main
   - Required approvals
   - Automated deployment
   - Monitor deployment

5. **Post-Release**
   - Tag release
   - Merge back to develop
   - Update documentation
   - Notify stakeholders

## Emergency Procedures

### Hotfix Process
```bash
# Create hotfix from main
git checkout main
git checkout -b hotfix/critical-fix

# Make minimal changes
# Test thoroughly

# Deploy to staging first if possible
git checkout develop
git merge hotfix/critical-fix

# Deploy to production
git checkout main
git merge hotfix/critical-fix
git tag v1.2.1

# Clean up
git branch -d hotfix/critical-fix
```

### Rollback Process
```bash
# If deployment fails
git checkout main
git reset --hard <previous-commit>
git push origin main --force-with-lease

# If database migration fails
npm run migration:rollback --to=<backup-point>
```

## Security Considerations

### Protected Branches
- `main` and `develop` are protected
- Require PR reviews
- Require status checks to pass
- No direct pushes allowed
- No force pushes allowed

### Secrets Management
- Environment variables in GitHub secrets
- Database credentials never in code
- API keys rotated regularly
- Separate secrets per environment

### Code Review Requirements
- **Minimum 1 reviewer** for features
- **Database admin review** for migrations
- **Security review** for auth/privacy changes
- **Product owner review** for UX changes

## Monitoring & Alerts

### GitHub Actions Monitor
- Build status
- Test results
- Deployment status
- Security scans

### Database Monitoring
- Migration success/failure
- Backup completion
- Performance metrics
- Error rates

### Communication Channels
- **Slack #dev-alerts**: Automated notifications
- **Slack #dev-team**: Team discussions
- **Email alerts**: Critical issues only

---

## Quick Reference Commands

```bash
# Start new feature
git checkout develop && git pull && git checkout -b feature/my-feature

# Update feature with latest develop
git checkout develop && git pull && git checkout feature/my-feature && git rebase develop

# Emergency hotfix
git checkout main && git checkout -b hotfix/emergency-fix

# Database migration
git checkout develop && git checkout -b migration/add-tables

# Deploy to staging
git checkout develop && git push origin develop

# Deploy to production  
# (via PR only - no direct pushes)
```

Remember: **When in doubt, ask for help. Data safety comes first!**