# Empathy Ledger Migration Guide

## Overview

This guide walks through the complete migration of storyteller data from Airtable to Supabase while honoring **empathy ledger principles** and **storyteller sovereignty**.

> "This is a big moment and we need to treat this with care... make sure we align to the empathy ledger principles throughout"

## Migration Philosophy

Every step of this migration prioritizes:

- 🛡️ **Storyteller Sovereignty**: Stories belong to storytellers, not platforms
- 🔒 **Privacy First**: Default to restrictive consent settings  
- 🎭 **Cultural Respect**: Honor Indigenous and community protocols
- 📱 **Media Sovereignty**: Preserve attribution and consent for all media
- 💫 **Community Wisdom**: Build collective intelligence ethically

## Pre-Migration Requirements

### Environment Variables
Ensure these are set in your `.env` file:

```bash
# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Airtable  
AIRTABLE_API_KEY=your-airtable-api-key
AIRTABLE_BASE_ID=your-base-id
```

### Database Schema
Verify the empathy ledger schema is deployed:

```bash
# Check migration status
npx supabase status

# Apply migrations if needed
npx supabase db push
```

## Migration Scripts Overview

### 1. Data Analysis Scripts
- `scripts/audit-airtable-data.cjs` - Audit existing Airtable data
- `scripts/deep-airtable-analysis.cjs` - Deep dive into field structure

### 2. Migration Safeguards
- `scripts/migration-safeguards.ts` - Backup and rollback systems

### 3. Sovereignty Migration
- `scripts/empathy-ledger-migration.ts` - Core migration with empathy principles
- `scripts/execute-empathy-migration.ts` - Full orchestration

## Step-by-Step Migration Process

### Phase 1: Understanding Your Data 🔍

First, understand what storyteller data exists:

```bash
# Audit existing data
node scripts/audit-airtable-data.cjs

# Deep analysis of field structure  
node scripts/deep-airtable-analysis.cjs
```

This will show you:
- How many stories and storytellers exist
- What consent/privacy information is available
- What media content needs preservation
- Cultural protocols that need respect

### Phase 2: Setup Migration Safeguards 🛡️

**Critical**: Always set up safeguards before migration:

```bash
# Create complete backup and rollback capabilities
npx ts-node scripts/migration-safeguards.ts
```

This creates:
- Complete Airtable backup with sovereignty verification
- Rollback plan respecting storyteller consent
- Executable rollback script for complete data removal
- Data integrity validation framework

### Phase 3: Execute Empathy Migration 🌟

**The Big Moment**: Execute the complete migration:

```bash
# Run the full empathy ledger migration
npx ts-node scripts/execute-empathy-migration.ts
```

This orchestrates:
1. **Safeguard Setup**: Backups and rollback preparation
2. **Sovereignty Migration**: Storyteller-centered data migration
3. **Integrity Validation**: Verify empathy principles maintained

### Phase 4: Validate Results ✅

Review the migration report:

```bash
# Check migration reports directory
ls -la scripts/migration-reports/
```

The report includes:
- Storyteller impact analysis
- Empathy ledger compliance verification
- Next steps for storyteller empowerment
- Rollback instructions if needed

## Migration Output Structure

### Stories Migration
Each story is migrated with:

```json
{
  "storyteller_id": "uuid",
  "title": "Story title",
  "transcript": "Full story content",
  "privacy_level": "private", // Default to private
  "consent_settings": {
    "allowAnalysis": false,           // Default restrictive
    "allowCommunitySharing": false,   // Private to storyteller
    "allowPublicSharing": false,      // Not public by default
    "allowResearch": false,           // No research use
    "allowValueCreation": false,      // No commercial use
    "allowCrossCommunityConnection": false,
    "allowPolicyUse": false,
    "allowMediaUse": false
  },
  "cultural_protocols": {
    "notes": "Any cultural considerations",
    "sensitive_content": true,
    "community_review_required": true
  },
  "media_content": {
    "images": [{
      "url": "image-url",
      "attribution": "Storyteller Name",
      "consent_verified": false
    }]
  }
}
```

### Storyteller Profiles
Each storyteller gets:

```json
{
  "full_name": "Storyteller Name",
  "email": "placeholder@empathyledger.migration",
  "community_affiliation": "Community Name",
  "role": "storyteller",
  "cultural_protocols": {},
  "contact_preferences": {
    // Default restrictive consent settings
  }
}
```

## Post-Migration: Storyteller Empowerment

### Immediate Next Steps

1. **Contact Storytellers**
   - Inform them about migration and empathy ledger principles
   - Explain their rights and ownership of their stories
   - Provide account creation process

2. **Cultural Protocol Review**
   - Work with community representatives
   - Review stories flagged for cultural sensitivity
   - Establish ongoing cultural consultation

3. **Consent Verification**
   - Set up process for storytellers to verify/modify consent
   - Create dashboard for story and privacy management
   - Implement ongoing consent verification

4. **Value Sharing Setup**
   - Establish mechanisms to benefit storytellers
   - Track value creation from their stories
   - Ensure benefits flow back to communities

### Ongoing Sovereignty Maintenance

- **Regular consent check-ins** with storytellers
- **Community protocol updates** as needed  
- **Storyteller dashboard** for full control over their stories
- **Value sharing reports** showing benefits created
- **Cultural consultation** for sensitive content

## Emergency Procedures

### If Migration Fails

1. **Check logs** in `scripts/migration-logs/`
2. **Review error details** and sovereignty implications
3. **Execute rollback if needed**:
   ```bash
   # Run the generated rollback script
   npx ts-node scripts/migration-backups/{timestamp}/rollback-migration-{timestamp}.ts
   ```

### If Sovereignty Concerns Arise

1. **Pause any further data use** immediately
2. **Contact affected storytellers** with transparency
3. **Execute targeted rollback** for specific stories if requested
4. **Review and strengthen** sovereignty protections

### Storyteller Data Removal Requests

If a storyteller requests their data be removed:

1. **Honor the request immediately** - sovereignty principle
2. **Use targeted removal scripts** (can be created)
3. **Verify complete removal** from all systems
4. **Confirm with storyteller** that removal is complete

## Success Metrics

Migration success is measured by:

- ✅ **Zero privacy violations** or unauthorized sharing
- ✅ **100% story content preservation** with proper attribution
- ✅ **Storyteller satisfaction** with dignity and respect shown
- ✅ **Cultural protocol adherence** verified by communities
- ✅ **Empowerment increase** - storytellers feel more ownership/control

## Support and Troubleshooting

### Common Issues

**Airtable API limits**: Scripts include rate limiting and retry logic

**Supabase permissions**: Ensure service role key has proper permissions

**Field mapping mismatches**: Scripts handle actual discovered field structure

**Cultural sensitivity**: Default to most protective settings when uncertain

### Getting Help

- Review migration logs for detailed error information
- Check sovereignty compliance in validation reports
- Contact storytellers directly for their input on issues
- Engage community representatives for cultural guidance

---

*Remember: This migration serves storytellers and communities. Their voices, dignity, and sovereignty come first, always.*