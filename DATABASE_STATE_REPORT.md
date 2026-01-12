# Supabase Database State Report
**Generated:** July 24, 2025  
**Database:** tednluwflfhxyucgwigh.supabase.co

## Executive Summary

**ACTUAL TABLE COUNT: 7 tables**  
**DISCREPANCY CONFIRMED:** User reports 9 tables, my previous analysis mentioned 42 tables, but the reality is only 7 tables exist.

## Confirmed Existing Tables

| # | Table Name | Rows | Status | Key Information |
|---|------------|------|--------|-----------------|
| 1 | **storytellers** | 211 | ✅ Active | Core entity with 23 columns, includes Airtable migration data |
| 2 | **stories** | 49 | ✅ Active | 15 columns, linked to storytellers |
| 3 | **projects** | 11 | ✅ Active | 8 columns, project management |
| 4 | **organizations** | 20 | ✅ Active | 9 columns, organizational data |
| 5 | **locations** | 21 | ✅ Active | 7 columns, geographic data |
| 6 | **transcripts** | 200 | ✅ Active | 42 columns, comprehensive transcript management |
| 7 | **cms_pages** | 7 | ✅ Active | 15 columns, content management |

## Tables That Do NOT Exist

The following tables were referenced in previous analyses but **do not exist** in the current database:

### Core Tables (Expected but Missing)
- `countries` - Referenced but doesn't exist
- `media` - Media files table missing
- `quotes` - Quote extraction table missing
- `communities` - Community management missing

### Junction/Relationship Tables (Missing)
- `project_storytellers` - Many-to-many relationships
- `project_locations` - Location associations
- `storyteller_media` - Media attachments

### CMS Tables (Mostly Missing)
- `cms_content` - Only `cms_pages` exists
- `cms_components` - Missing
- `cms_settings` - Missing

### User Management (Missing)
- `users` - No custom user table
- `profiles` - No user profiles
- Auth tables are in `auth` schema (not accessible via public API)

## Detailed Table Schemas

### 1. storytellers (211 rows)
**Primary entity for people sharing stories**
- `id` (UUID), `full_name`, `email`, `profile_image_url`
- `bio`, `organization_id`, `project_id`, `location_id`
- `consent_given`, `consent_date`, `privacy_preferences`
- `role`, `phone_number`, `cultural_background`, `preferred_pronouns`
- `airtable_record_id` (migration data)
- Comprehensive consent and privacy tracking

### 2. stories (49 rows)
**Story content management**
- `id`, `title`, `content`, `summary`
- `storyteller_id`, `privacy_level`, `themes`
- `media_url`, `transcription`, `video_embed_code`
- Basic story structure with media support

### 3. projects (11 rows)
**Project/initiative tracking**
- `id`, `name`, `description`
- `organization_id`, `location`, `status`
- Simple project management structure

### 4. organizations (20 rows)
**Organizational entities**
- `id`, `name`, `description`, `type`
- `location`, `contact_email`, `website_url`
- Basic organization profiles

### 5. locations (21 rows)
**Geographic reference data**
- `id`, `name`, `country`
- `state_province`, `city`, `coordinates`
- Geographic hierarchy support

### 6. transcripts (200 rows)
**Most comprehensive table - interview/story transcripts**
- 42 columns including:
- Content: `transcript_content`, `word_count`, `character_count`
- Consent: Multiple consent fields for different uses
- Processing: `processing_status`, `analysis_requested_date`
- Safety: `content_warnings`, `trauma_informed_considerations`
- Quality: `analysis_quality_score`, `transcription_confidence_score`

### 7. cms_pages (7 rows)
**Content management for static pages**
- `id`, `slug`, `title`, `description`
- `page_type`, `status`, `content`
- SEO fields: `seo_title`, `seo_description`, `seo_keywords`
- Basic CMS functionality

## Key Findings

### 1. Migration Status
- **Airtable migration appears partially complete**
- 211 storytellers migrated (with `airtable_record_id`)
- 200 transcripts imported
- Missing media files and relationships

### 2. Data Relationships
- Stories can link to storytellers (`storyteller_id`)
- Storytellers link to projects and locations
- No junction tables for many-to-many relationships

### 3. Missing Infrastructure
- No media files table (URLs stored as text)
- No user authentication tables in public schema
- Limited CMS capabilities (only pages, no components)
- No analytics or tracking tables

### 4. Data Quality
- **High data volume** in core tables
- Comprehensive consent tracking in transcripts
- Privacy controls implemented
- Airtable legacy data preserved

## Recommendations

### Immediate Actions Needed
1. **Reconcile table count discrepancy** - Only 7 tables exist, not 9 or 42
2. **Complete media table creation** if media files need proper management
3. **Add junction tables** for many-to-many relationships
4. **Verify which tables the user sees as "9 tables"** - might include auth schema

### Data Architecture Gaps
1. No proper media file management
2. Missing user profile system
3. Incomplete CMS implementation
4. No analytics/events tracking

### Next Steps
1. Confirm what specific 9 tables the user can see
2. Determine if auth schema tables are being counted
3. Plan media table implementation if needed
4. Design user management system

## Conclusion

The actual database contains **7 functional tables** with **492 total rows** of data. The system has a solid foundation for storytelling and content management, but is missing several expected tables for media, relationships, and user management. The discrepancy between expected (42) and actual (7) tables suggests significant cleanup occurred or tables were never created as planned.