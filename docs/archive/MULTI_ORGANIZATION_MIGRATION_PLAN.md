# Multi-Organization Migration Plan

## 🎯 EXECUTIVE SUMMARY

The Airtable analysis revealed **Empathy Ledger is a multi-organization storytelling platform** with:
- **12+ organizations** (not just Orange Sky)
- **210 storytellers** across 23+ global locations  
- **International scope**: Australia, Spain, Athens, London
- **Complex project structure** requiring sophisticated migration

## 📊 DETAILED FINDINGS

### Organization Breakdown
| Organization | Storytellers | Type | Primary Locations |
|--------------|-------------|------|------------------|
| **Orange Sky** | 107 (51%) | Nonprofit | 23 Australian locations |
| **Goods.** | 22 (10%) | Community | 4 locations |
| **Diagrama** | 15 (7%) | Nonprofit | Spain |
| **PICC** | 13 (6%) | Community | Multiple |
| **TOMNET** | 9 (4%) | Network | Multiple |
| **MMEIC** | 8 (4%) | Community | Multiple |
| **Others** | 36 (17%) | Various | Multiple |

### Geographic Distribution
- **Australia**: 20 locations, 188 storytellers
- **Spain**: 12 storytellers (Diagrama)
- **Athens**: 4 storytellers
- **London**: 1 storyteller

## 🏗️ MIGRATION ARCHITECTURE

### Phase 1: Foundation (Complete ✅)
**Organizations Table** - 12 organizations with:
- Multi-country support (Australia, Spain, Greece, UK)
- Organization types (nonprofit, community, network, advocacy)
- Sovereignty compliance scoring
- Subscription tiers and feature flags

**Projects Table** - 50+ location-based projects:
- Orange Sky: 23 location-based projects
- Other orgs: Project per organization or location group
- Multi-language support (English, Spanish)
- Cultural sensitivity settings
- Story collection methods (web, SMS, phone, WhatsApp)

### Phase 2: Data Migration (Next)
**Storyteller-to-Project Mapping**:
```typescript
// Complex mapping algorithm needed:
// 1. Extract Project + Organization + Location from Airtable
// 2. Map to correct organization in Supabase
// 3. Assign to location-based project
// 4. Handle edge cases (missing data, international locations)
```

**Existing Data Updates**:
```sql
-- Add project_id to existing tables
ALTER TABLE stories ADD COLUMN project_id UUID REFERENCES projects(id);
ALTER TABLE media ADD COLUMN project_id UUID REFERENCES projects(id);

-- Update existing data with project context
UPDATE stories SET project_id = (SELECT project_id FROM user_project_mapping...);
```

## 🚀 IMPLEMENTATION STATUS

### ✅ COMPLETED
1. **Airtable Analysis**: Complete understanding of 210 storytellers across 12+ organizations
2. **Schema Design**: Organizations and Projects tables designed for multi-organization complexity
3. **Migration Script**: `/scripts/create-organizations-projects-migration.ts` ready to deploy
4. **CMS Integration Plan**: Updated for multi-organization context

### 🔄 IN PROGRESS  
1. **Foundation Deployment**: Ready to run migration script
2. **Storyteller Mapping**: Need to create user-to-project assignment logic

### ⏳ PENDING
1. **Data Migration**: Link existing storytellers/stories to projects
2. **CMS Update**: Update CMS integration for project context
3. **Testing**: Verify multi-organization functionality

## 📋 DETAILED MIGRATION PLAN

### Step 1: Deploy Foundation (30 minutes)
```bash
# Run the organizations/projects migration
tsx scripts/create-organizations-projects-migration.ts

# Creates:
# - 12 organizations
# - 50+ projects (location-based for Orange Sky, org-based for others)
# - Proper table structure with sovereignty compliance
```

### Step 2: Storyteller-Project Mapping (45 minutes)
```typescript
// Create script to:
// 1. Fetch all Airtable storytellers
// 2. Map Project + Organization + Location to Supabase projects
// 3. Create user records in Supabase (if not exist)
// 4. Create project_members records for each user-project relationship
// 5. Handle edge cases and data quality issues
```

### Step 3: Existing Data Migration (30 minutes)
```sql
-- Update existing stories/media with project context
-- Based on storyteller -> project mappings
-- Ensure data integrity throughout
```

### Step 4: CMS Integration Update (20 minutes)
```typescript
// Update CMS service to work with:
// - Multi-organization context
// - Project-based content isolation
// - Organization-level branding and settings
```

### Step 5: Testing & Validation (30 minutes)
```bash
# Test multi-organization functionality
# Verify storyteller-project relationships
# Test CMS with project context
# Validate sovereignty compliance across organizations
```

## 🎯 SPECIFIC MIGRATION PRIORITIES

### Priority 1: Orange Sky (51% of data)
- **107 storytellers** across 23 Australian locations
- **Most structured data** with clear location mapping
- **Proven model** for other organizations
- **23 location-based projects**: Newcastle, Brisbane, Palm Island, etc.

### Priority 2: Major Organizations (30% of data)
- **Goods.** (22 storytellers) - 4 location-based projects
- **Diagrama** (15 storytellers) - Spain operations with Spanish language support
- **PICC** (13 storytellers) - Single organization project

### Priority 3: Smaller Organizations (19% of data)
- **TOMNET, MMEIC, Young Guns, etc.** - 9 organizations with 2-9 storytellers each
- **Single project per organization** approach
- **Simpler migration** due to smaller scale

## 🛡️ RISK MITIGATION

### Data Protection
- ✅ **All changes are additive** - no existing table modifications
- ✅ **Backup strategy** - original Airtable data preserved
- ✅ **Rollback plan** - can disable new tables without affecting existing features
- ✅ **Gradual migration** - can test with subset before full deployment

### Complexity Management
- ✅ **Orange Sky first** - largest, most structured organization
- ✅ **Location-based projects** - proven scalable approach
- ✅ **Standardized roles** - volunteer, service user, staff hierarchy
- ✅ **International support** - Spanish language, multiple countries

## 📊 SUCCESS METRICS

### Technical
- [ ] 12 organizations created in Supabase
- [ ] 50+ projects created with proper organization links
- [ ] 210 storytellers mapped to correct projects
- [ ] Existing stories/media linked to projects
- [ ] CMS working with multi-organization context

### Business
- [ ] Orange Sky operations fully migrated and functional
- [ ] International organizations (Spain, Athens) working
- [ ] Multi-language support operational
- [ ] Sovereignty compliance maintained across all organizations

## 🚨 IMMEDIATE NEXT STEPS

1. **Review migration script** - `/scripts/create-organizations-projects-migration.ts`
2. **Deploy foundation** - Run the organizations/projects migration
3. **Create storyteller mapping** - Build user-to-project assignment logic
4. **Test with Orange Sky** - Validate largest organization first
5. **Scale to all organizations** - Roll out to remaining 11 organizations

---

**This migration transforms Empathy Ledger from a single-organization system into a multi-organization storytelling platform supporting communities worldwide while maintaining sovereignty and cultural protocols.**