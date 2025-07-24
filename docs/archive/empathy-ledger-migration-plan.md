# Empathy Ledger Migration Plan: Airtable → Supabase

## Philosophy & Principles

> "Every story matters. Every voice deserves respect."

This migration honors **storyteller sovereignty** above all else. We are not extracting data - we are carefully transferring community narratives with the deepest respect for:

- **Consent**: Default to private, never assume permission
- **Ownership**: Stories belong to storytellers, not platforms
- **Cultural Protocols**: Respect Indigenous and community ways of knowing
- **Privacy**: Protect personal information as sacred trust
- **Dignity**: Honor each person's experience and identity

## Migration Strategy: Three-Phase Approach

### Phase 1: Storyteller Sovereignty Setup 🛡️
**Principle**: Establish safe foundation before touching any stories

1. **Create storyteller profiles** with default-private settings
2. **Establish consent frameworks** for each storyteller
3. **Set up cultural protocols** for sensitive content
4. **Verify privacy safeguards** are active

### Phase 2: Story Content Migration 📝
**Principle**: Preserve narrative integrity while respecting consent

1. **Map story content** with full transcript and media preservation
2. **Apply privacy-first approach** (default to private)
3. **Maintain storyteller attribution** and ownership
4. **Preserve cultural context** and community connections

### Phase 3: Community Wisdom Integration 🌟
**Principle**: Connect stories to build collective intelligence

1. **Identify story themes** and community patterns
2. **Create consensual connections** between storytellers
3. **Generate community insights** with storyteller approval
4. **Track value creation** to ensure benefits flow back to communities

## Field Mapping: Airtable → Supabase Empathy Ledger Schema

### Core Story Fields

| Airtable Field | Supabase Field | Migration Rule | Sovereignty Consideration |
|---|---|---|---|
| `Title` | `stories.title` | Direct map | ✅ Public titles are storyteller choice |
| `Transcript (from Media)` | `stories.transcript` | Direct map | 🔒 Core narrative content, respect privacy |
| `Story Image` | `stories.media_content.images[]` | JSON structure | 📸 Media sovereignty - preserve attribution |
| `Video Links` | `stories.video_url` | Direct map | 🎥 Verify storyteller consent for video sharing |
| `Audio Links` | `stories.audio_url` | Direct map | 🎵 Audio content requires explicit consent |

### Storyteller Identity Fields

| Airtable Field | Supabase Field | Migration Rule | Sovereignty Consideration |
|---|---|---|---|
| `Storytellers` | `users.full_name` | Extract names, create profiles | 👤 Default to display name only |
| `Email` (if present) | `users.email` | Map if available | 📧 Critical for ownership verification |
| `Community` | `users.community_affiliation` | Direct map | 🏘️ Community connection for cultural protocols |
| `Location` | `stories.location` | Story-level, not profile | 📍 Avoid personal location tracking |

### Privacy & Consent Fields

| Airtable Field | Supabase Field | Migration Rule | Sovereignty Consideration |
|---|---|---|---|
| `Permissions` | `stories.consent_settings` | Map to JSON consent object | 🔐 **DEFAULT TO MOST RESTRICTIVE** |
| `Public/Private` | `stories.privacy_level` | Map: Default 'private' | 🛡️ **PRIVACY FIRST APPROACH** |
| `Status` | `stories.status` | Map, but verify consent | ✅ Pending review by default |

### Cultural Protocol Fields

| Airtable Field | Supabase Field | Migration Rule | Sovereignty Consideration |
|---|---|---|---|
| `Cultural Notes` | `stories.cultural_protocols` | JSON structure | 🎭 Sacred knowledge protocols |
| `Sensitive Content` | `stories.cultural_protocols.sensitive` | Boolean flag | ⚠️ Extra protection needed |
| `Community Context` | `stories.cultural_protocols.context` | Text field | 🌿 Preserve cultural meaning |

## Default Consent Settings (Privacy-First)

Every migrated story will start with these **RESTRICTIVE** consent settings:

```json
{
  "allowAnalysis": false,           // No AI analysis without consent
  "allowCommunitySharing": false,   // Private to storyteller only
  "allowPublicSharing": false,      // Not public by default
  "allowResearch": false,           // No research use
  "allowValueCreation": false,      // No commercial use
  "allowCrossCommunityConnection": false,  // No cross-community sharing
  "allowPolicyUse": false,          // No policy advocacy use
  "allowMediaUse": false            // No media redistribution
}
```

**Rationale**: We can always expand permissions with explicit consent, but we cannot undo privacy violations.

## Migration Safety Protocols

### Pre-Migration Safeguards
- [ ] **Backup verification**: Complete Airtable export with verification
- [ ] **Schema validation**: Ensure Supabase schema matches sovereignty principles
- [ ] **Permission testing**: Verify RLS policies protect private content
- [ ] **Rollback preparation**: Script to reverse migration if needed

### During Migration Monitoring
- [ ] **Privacy verification**: Check every story defaults to private
- [ ] **Consent mapping**: Ensure consent settings are correctly applied
- [ ] **Media preservation**: Verify all media links and attribution preserved
- [ ] **Storyteller ownership**: Confirm each story is linked to correct storyteller

### Post-Migration Validation
- [ ] **Data integrity check**: All stories migrated with proper relationships
- [ ] **Privacy audit**: No private stories accidentally made public
- [ ] **Media accessibility**: All media links working and properly attributed
- [ ] **Storyteller notification**: Process for storytellers to claim and review their stories

## Special Considerations for Real Storytellers

Our analysis found **48 real stories** from storytellers including:
- Robyn Watts
- Norman Frank
- Freddy Wai
- And 45 others

### Storyteller Outreach Protocol
1. **Pre-migration contact**: Reach out to explain migration and empathy ledger principles
2. **Consent confirmation**: Verify they want their stories included
3. **Privacy preferences**: Let them set their own consent settings
4. **Cultural protocols**: Ask about any cultural considerations for their stories
5. **Ongoing ownership**: Establish how they can access and modify their stories

### Content Sensitivity Review
- Some stories may contain **sensitive personal experiences**
- Stories may reference **cultural practices** requiring special protocols
- **Trauma-informed approach** needed for difficult stories
- **Community review** process for culturally significant content

## Technical Implementation Plan

### Database Preparation
1. Ensure Supabase RLS policies are active and tested
2. Create migration user accounts with appropriate permissions  
3. Set up logging for all migration operations
4. Prepare rollback procedures

### Migration Script Updates
The existing `airtable-migration.ts` needs updates to:
1. **Map actual field names** discovered in analysis
2. **Apply default-private consent settings** 
3. **Preserve media links and attribution**
4. **Create storyteller profiles** with sovereignty protections
5. **Log all consent decisions** for transparency

### Validation Steps
1. **Field mapping verification**: Ensure all discovered fields are handled
2. **Consent setting validation**: Verify privacy-first approach
3. **Media preservation check**: All transcripts, images, videos preserved
4. **Relationship integrity**: Stories properly linked to storytellers
5. **Cultural protocol setup**: Special handling for sensitive content

## Post-Migration Community Process

### Storyteller Empowerment
1. **Account creation**: Help storytellers claim their profiles
2. **Consent education**: Explain what each permission means
3. **Story review**: Let them review and modify their stories
4. **Privacy control**: Show them how to adjust their privacy settings
5. **Value sharing**: Explain how they benefit from any value created

### Community Engagement
1. **Community introduction**: Explain empathy ledger principles to communities
2. **Cultural protocol consultation**: Work with communities on their specific needs
3. **Benefit sharing setup**: Ensure value flows back to storytellers and communities
4. **Ongoing consent**: Regular check-ins about story sharing preferences

## Success Metrics (Community-Defined)

- **Storyteller satisfaction**: Do storytellers feel their stories are treated with respect?
- **Privacy protection**: Zero privacy violations or unauthorized sharing
- **Content preservation**: 100% of story content and media successfully migrated
- **Cultural respect**: Community feedback on cultural protocol adherence
- **Empowerment increase**: Do storytellers feel more ownership and control?

---

*This migration plan puts storytellers first, always. Every decision prioritizes their dignity, ownership, and cultural protocols over technical convenience or platform needs.*