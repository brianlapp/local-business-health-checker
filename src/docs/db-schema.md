
# Supabase Database Schema for Freelance Opportunity Finder

## 🚀 Table: `opportunities`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `title` | Text | Opportunity title |
| `description` | Text | Detailed description |
| `source` | Text | Source (job board, agency, direct) |
| `source_id` | Text | Original ID in source system |
| `url` | Text | Link to original posting |
| `company_name` | Text | Associated company |
| `location` | Text | Geographic location |
| `is_remote` | Boolean | Remote work possibility |
| `compensation_min` | Numeric | Minimum compensation |
| `compensation_max` | Numeric | Maximum compensation |
| `compensation_type` | Text | Hourly, fixed, etc. |
| `skills_required` | JSONB | Required skills array |
| `posted_date` | Timestamp | When opportunity was posted |
| `deadline` | Timestamp | Application deadline |
| `score` | Integer | Match score (0-100) |
| `status` | Text | New, Reviewing, Applied, Rejected, etc. |
| `notes` | Text | User notes |
| `created_at` | Timestamp | Record creation time |
| `updated_at` | Timestamp | Record update time |

## 🚀 Table: `agencies`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `name` | Text | Agency name |
| `website` | Text | Agency website |
| `email` | Text | Contact email |
| `phone` | Text | Contact phone |
| `address` | Text | Physical address |
| `location_data` | JSONB | Geocoded location data |
| `specialization` | Text | Industry focus |
| `notes` | Text | User notes |
| `created_at` | Timestamp | Record creation time |
| `updated_at` | Timestamp | Record update time |

## 🚀 Table: `businesses`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `name` | Text | Business name |
| `website` | Text | Business website |
| `email` | Text | Contact email |
| `phone` | Text | Contact phone |
| `address` | Text | Physical address |
| `location_data` | JSONB | Geocoded location data |
| `industry` | Text | Business industry |
| `size` | Text | Business size |
| `agency_id` | UUID | Current agency (if known) |
| `website_score` | Integer | Website quality score (0-100) |
| `website_issues` | JSONB | Identified website issues |
| `last_updated` | Timestamp | Website last updated (estimate) |
| `notes` | Text | User notes |
| `created_at` | Timestamp | Record creation time |
| `updated_at` | Timestamp | Record update time |

## 🚀 Table: `outreach`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `entity_type` | Text | Agency, Business, or Opportunity |
| `entity_id` | UUID | ID of related record |
| `contact_name` | Text | Name of contact person |
| `contact_email` | Text | Email used for contact |
| `template_used` | Text | Template identifier |
| `subject` | Text | Email subject |
| `content` | Text | Email content |
| `sent_at` | Timestamp | When email was sent |
| `status` | Text | Sent, Opened, Replied, etc. |
| `response_received` | Text | Content of response |
| `response_time` | Interval | Time to response |
| `follow_up_scheduled` | Timestamp | When follow-up is due |
| `follow_up_count` | Integer | Number of follow-ups sent |
| `created_at` | Timestamp | Record creation time |
| `updated_at` | Timestamp | Record update time |

## 🚀 Table: `templates`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `name` | Text | Template name |
| `type` | Text | Email, Proposal, etc. |
| `subject` | Text | Email subject template |
| `content` | Text | Template content with variables |
| `variables` | JSONB | Required variable definitions |
| `target_entity_type` | Text | Agency, Business, or Opportunity |
| `created_at` | Timestamp | Record creation time |
| `updated_at` | Timestamp | Record update time |

## 🚀 Table: `portfolio_items`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `title` | Text | Project title |
| `description` | Text | Project description |
| `url` | Text | Project URL |
| `image_url` | Text | Screenshot/image URL |
| `skills` | JSONB | Skills used in project |
| `industry` | Text | Project industry |
| `created_at` | Timestamp | Record creation time |
| `updated_at` | Timestamp | Record update time |

## 🚀 Table: `outreach_attachments`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `outreach_id` | UUID | Foreign key to outreach |
| `portfolio_item_id` | UUID | Foreign key to portfolio_items |
| `created_at` | Timestamp | Record creation time |

## 🚀 Table: `opportunity_skills`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `opportunity_id` | UUID | Foreign key to opportunities |
| `skill_name` | Text | Name of skill |
| `importance` | Text | Required, Preferred, etc. |
| `created_at` | Timestamp | Record creation time |

## 🚀 Database Functions and Triggers

### Function: `update_updated_at()`
```sql
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Trigger: `set_updated_at` (applied to all tables)
```sql
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON [table_name]
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();
```

### Function: `calculate_opportunity_score()`
```sql
CREATE OR REPLACE FUNCTION public.calculate_opportunity_score(opportunity_id UUID)
RETURNS void AS $$
DECLARE
  skill_match INTEGER := 0;
  compensation_match INTEGER := 0;
  location_match INTEGER := 0;
  final_score INTEGER := 0;
BEGIN
  -- Calculate score components (placeholder logic)
  -- In a real implementation, this would contain complex scoring logic
  
  -- Calculate final score (simplified example)
  final_score := skill_match + compensation_match + location_match;
  
  -- Update the opportunity record
  UPDATE opportunities
  SET score = final_score
  WHERE id = opportunity_id;
END;
$$ LANGUAGE plpgsql;
```

## 🚀 Row-Level Security Policies

### Policies for all tables
```sql
-- Enable Row Level Security
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- Create policy for full access
CREATE POLICY "Full access for authenticated users"
ON [table_name]
FOR ALL
TO authenticated
USING (true);
```

## 🚀 Index Definitions

```sql
-- Indexes for opportunities table
CREATE INDEX idx_opportunities_source ON opportunities(source);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_score ON opportunities(score DESC);
CREATE INDEX idx_opportunities_posted_date ON opportunities(posted_date DESC);

-- Indexes for agencies table
CREATE INDEX idx_agencies_name ON agencies(name);
CREATE INDEX idx_agencies_specialization ON agencies(specialization);

-- Indexes for businesses table
CREATE INDEX idx_businesses_name ON businesses(name);
CREATE INDEX idx_businesses_industry ON businesses(industry);
CREATE INDEX idx_businesses_website_score ON businesses(website_score);

-- Indexes for outreach table
CREATE INDEX idx_outreach_entity ON outreach(entity_type, entity_id);
CREATE INDEX idx_outreach_status ON outreach(status);
CREATE INDEX idx_outreach_follow_up ON outreach(follow_up_scheduled);
```
