# Location Mapping Strategy: Airtable → Supabase

## 🎯 **CURRENT SITUATION**

### Airtable (Source)
- **162 storytellers** have location data in `Location` field
- **25 unique locations** across Australia + international
- **Top locations**: Palm Island (25), Hobart (14), Brisbane (13), Spain (12)

### Supabase (Target)  
- **206 users** already migrated from Airtable
- **6 locations** exist in `locations` table
- **0 users** currently have `primary_location_id` set ❌
- **Missing 19 locations** that exist in Airtable

## 📊 **LOCATION MISMATCH ANALYSIS**

### ✅ **Locations Already in Supabase:**
- Palm Island ✅
- Hobart ✅  
- Adelaide ✅
- Melbourne ✅
- Canberra ✅
- Tennant Creek ✅ (but Airtable has "Tennent Creek" - spelling issue)

### ❌ **Missing from Supabase (Need to Add):**
1. **Brisbane** (13 storytellers)
2. **Perth** (10 storytellers) 
3. **Newcastle** (10 storytellers)
4. **Central Coast** (10 storytellers)
5. **Kalgoorlie** (13 storytellers)
6. **Toowoomba** (9 storytellers)
7. **Spain** (12 storytellers - international)
8. **Athens** (4 storytellers - international)
9. **Mackay, Darwin, Alice Springs, Mount Isa, Rockhampton, Gladstone**
10. + 9 other locations

## 🔗 **MAPPING STRATEGY**

### Phase 1: Expand Locations Table
```sql
-- Add missing locations to Supabase
INSERT INTO locations (name, type, country, state) VALUES
('Brisbane', 'city', 'Australia', 'QLD'),
('Perth', 'city', 'Australia', 'WA'),
('Newcastle', 'city', 'Australia', 'NSW'),
('Central Coast', 'region', 'Australia', 'NSW'),
('Kalgoorlie', 'city', 'Australia', 'WA'),
('Spain', 'country', 'Spain', NULL),
('Athens', 'city', 'Greece', NULL'),
-- ... etc for all 19 missing locations
```

### Phase 2: Normalize Location Names
```typescript
const LOCATION_MAPPING = {
  // Fix spelling issues
  'Tennent Creek': 'Tennant Creek',
  'Bundaburg': 'Bundaberg', 
  
  // Standardize naming
  'Central Coast': 'Central Coast',
  'Alice Springs': 'Alice Springs',
  
  // International locations
  'Spain': 'Spain',
  'Athens': 'Athens',
  'London': 'London'
}
```

### Phase 3: Link Users to Locations
```typescript
// For each Airtable storyteller with location:
// 1. Find matching user in Supabase (by name/email pattern)
// 2. Look up location_id in Supabase locations table  
// 3. Update user.primary_location_id

const storyteller = {
  name: "Greg Graham",
  location: "Newcastle" // From Airtable
}

const user = await supabase
  .from('users')
  .select('id')
  .eq('email', 'greg-graham-1753075981041@empathyledger.migration')
  .single()

const location = await supabase
  .from('locations')  
  .select('id')
  .eq('name', 'Newcastle')
  .single()

await supabase
  .from('users')
  .update({ primary_location_id: location.id })
  .eq('id', user.id)
```

## ⚠️ **DATA QUALITY ISSUES TO RESOLVE**

### Spelling Variations:
- "Tennent Creek" → "Tennant Creek" 
- "Bundaburg" → "Bundaberg"

### Missing Context:
- Some locations need state clarification
- International locations need country context

### Coverage Gaps:
- Only 162/210 storytellers have location data
- 48 storytellers will need default/unknown location handling

## 🚀 **PROPOSED MIGRATION FLOW**

1. **Add Missing Locations** to Supabase `locations` table (19 new entries)
2. **Create Location Mapping Script** with normalization rules
3. **Link Existing Users** to their primary locations (162 users get location_id)
4. **Handle Edge Cases** for users without location data
5. **Validate Results** - ensure all linkages are correct

## 🎯 **KEY QUESTIONS FOR YOU:**

1. **Should we create the 19 missing locations** in Supabase now?
2. **How should we handle international locations** (Spain, Athens, London)?
3. **What about the 48 storytellers without location data** - default location or leave null?
4. **Location naming convention** - do you prefer "Newcastle, NSW" or just "Newcastle"?

Once we clarify these, we can proceed with the location mapping and then connect it to the project structure!