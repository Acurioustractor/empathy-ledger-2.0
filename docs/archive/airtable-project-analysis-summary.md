# Airtable Project Structure Analysis Summary

## Overview
Analysis of 210 storyteller records from the Airtable storytellers table to understand project data structure for Supabase migration.

## Key Data Structure Findings

### Primary Project Fields
1. **Project** - Direct project name field (primary)
2. **Organisation** - Organization name field (secondary, not always populated)
3. **Project (from Media)** - Rollup field from linked Media records

### Project Data Insights
- **Total Storytellers**: 210
- **Multiple Organizations**: 12+ distinct organizations identified
- **Migration Complexity**: MEDIUM - Multi-organization structure with location distribution

## Critical Discovery: Multi-Organization Structure

The analysis reveals a **complex multi-organization ecosystem**:

### Major Organizations Identified
1. **Orange Sky** - 107 storytellers (51% - largest organization)
2. **Goods.** - 22 storytellers (community-focused organization)
3. **Diagrama** - 15 storytellers (appears to be Spain-based)
4. **PICC** - 13 storytellers 
5. **TOMNET** - 9 storytellers
6. **MMEIC** - 8 storytellers
7. **Young Guns** - 5 storytellers
8. **Global Laundry Alliance** - 7 storytellers
9. **MingaMinga Rangers** - 7 storytellers
10. **Beyond Shadows** - 3 storytellers
11. **JusticeHub** - 2 storytellers
12. **Oonchiumpa** - 4 storytellers

### Geographic Distribution
**23 unique locations** across multiple countries:
- **Australia**: 20 locations (188 storytellers)
  - Top locations: Palm Island (25), Mackay (14), Hobart (14), Kalgoorlie (13)
- **International**: Spain (12), Athens (4), London (1)

### Role Distribution
- **Volunteers**: 50 storytellers
- **Friends** (service users): 32 storytellers  
- **Service Providers**: 26 storytellers
- **Members**: 7 storytellers
- **Various other roles**: Support Workers, Directors, Educators, etc.

## Migration Strategy Recommendation

### Recommended Approach: **Multi-Organization Migration with Location-Based Projects**

Given the complex multi-organization structure, the migration strategy should be:

1. **Create Multiple Organizations**
   ```sql
   INSERT INTO organizations (name, type, description) VALUES
   ('Orange Sky', 'nonprofit', 'Community laundry and conversation service'),
   ('Goods.', 'community', 'Community organization'),  
   ('Diagrama', 'nonprofit', 'Spain-based organization'),
   ('PICC', 'community', 'Community organization'),
   ('TOMNET', 'network', 'Community network'),
   -- ... and 7 more organizations
   ```

2. **Create Location-Based Projects**
   - For Orange Sky: 23 location-based projects
   - For other orgs: Project structure based on their distribution
   - Examples: "Orange Sky Newcastle", "Goods. Alice Springs", "Diagrama Spain"

3. **Complex Migration Mapping**
   ```sql
   -- Map storytellers to projects based on:
   -- 1. Project field value 
   -- 2. Organization field value
   -- 3. Location for project assignment
   -- 4. Handle missing data with defaults
   ```

## Detailed Location Analysis
**Top 10 locations by storyteller count**:
1. Palm Island: 25 storytellers
2. Mackay: 14 storytellers
3. Hobart: 14 storytellers  
4. Kalgoorlie: 13 storytellers
5. Brisbane: 13 storytellers
6. Spain: 12 storytellers
7. Tennent Creek: 12 storytellers
8. Newcastle: 10 storytellers
9. Perth: 10 storytellers
10. Central Coast: 10 storytellers

## Field Structure for Migration

### Core Storyteller Fields to Migrate
```javascript
{
  // Identity
  name: "string",
  preferred_name: "string", 
  unique_storyteller_id: "string",
  
  // Project Association  
  project: "Orange Sky", // -> map to location-based project
  organisation: "Orange Sky", // -> map to organization
  location: "string", // -> use for project grouping
  
  // Role & Contact
  role: "Volunteer|Service User|Staff",
  secure_contact_email: "string",
  phone_number: "string",
  
  // Content
  bio: "text",
  personal_quote: "text", 
  file_profile_image: "array",
  
  // Privacy
  consent_status: "string",
  preferred_anonymity_level: "string",
  
  // Linked Data
  media: "array", // -> stories, quotes, transcripts
  themes: "array",
  stories: "array"
}
```

## Next Steps for Migration

1. **Multi-Organization Schema Design**: Create flexible schema supporting 12+ organizations
2. **Location-Project Mapping**: Develop algorithm to map storytellers to correct projects
3. **Data Cleaning**: 
   - Standardize location names (e.g., "Bundaburg" vs "Bundaberg")
   - Handle missing project/organization data (5 records)
   - Verify international locations (Spain, Athens, London)
4. **Complex Migration Script**: Handle multiple organization-project combinations
5. **Role Standardization**: Normalize role names and hierarchy
6. **Test Migration**: Start with Orange Sky data, then expand to other organizations

## Recommendations

### Immediate Actions
1. **Design multi-organization schema** with flexible project structure
2. **Create organization type taxonomy** (nonprofit, community, network, etc.)
3. **Plan location-based project hierarchy** for each organization
4. **Handle data quality issues** before migration

### Migration Priorities
1. **Phase 1**: Orange Sky (107 storytellers, 23 locations) - largest and most structured
2. **Phase 2**: Goods. (22 storytellers) - second largest
3. **Phase 3**: Other organizations (81 storytellers across 10 organizations)

### Data Quality Considerations
- **Missing location data**: 5 records need default projects
- **International scope**: Spain, Athens, London require special handling  
- **Role standardization**: 35+ unique role types need normalization
- **Organization mapping**: Some storytellers have project/organization mismatches

## Schema Design Implications

The complex structure requires:
```sql
-- organizations: 12+ records (multi-organization ecosystem)
-- projects: 50+ records (location-based per organization)
-- storytellers: 210 records with complex organization-project mapping
-- roles: Standardized role hierarchy supporting volunteers, service users, staff
```

This is significantly more complex than initially anticipated and requires careful migration planning with robust data validation and error handling.