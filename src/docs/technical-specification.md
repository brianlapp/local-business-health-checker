
# Freelance Opportunity Finder: Technical Specification

## 1. System Architecture

### 1.1 Core Components
1. **Discovery Engine**
   - Job board API integration
   - Google Maps API integration
   - Web scraping module
   - Data normalization pipeline

2. **Opportunity Database**
   - Real-time data storage
   - Relationship tracking
   - History and version control

3. **Evaluation System**
   - Scoring algorithm
   - Filtering engine
   - Prioritization mechanism

4. **Outreach Manager**
   - Template system
   - Personalization engine
   - Response tracking
   - Follow-up automation

5. **Analytics Dashboard**
   - Activity metrics
   - Success rates
   - ROI calculator
   - Time tracking

### 1.2 Data Flow
1. **Collection Flow**
   - External APIs → Raw data storage → Normalization → Structured database
   - User input → Validation → Database update

2. **Processing Flow**
   - Database → Scoring engine → Prioritized queue
   - User preferences → Filtering rules → Filtered opportunities

3. **Action Flow**
   - Selected opportunities → Outreach generator → Email API → Tracking
   - Scheduled follow-ups → Notification system → User interface/email

4. **Analysis Flow**
   - User actions → Activity log → Analytics processor → Dashboard
   - Response data → Success metrics → Performance insights

## 2. Database Schema

### 2.1 Primary Tables

#### `opportunities`
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

#### `agencies`
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

#### `businesses`
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

#### `outreach`
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

#### `templates`
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

#### `portfolio_items`
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

### 2.2 Relationship Tables

#### `outreach_attachments`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `outreach_id` | UUID | Foreign key to outreach |
| `portfolio_item_id` | UUID | Foreign key to portfolio_items |
| `created_at` | Timestamp | Record creation time |

#### `opportunity_skills`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `opportunity_id` | UUID | Foreign key to opportunities |
| `skill_name` | Text | Name of skill |
| `importance` | Text | Required, Preferred, etc. |
| `created_at` | Timestamp | Record creation time |

## 3. API Integration Specifications

### 3.1 Google Maps API
- **Purpose**: Discover agencies and businesses
- **Endpoints Used**:
  - Places API for business search
  - Place Details API for contact information
  - Geocoding API for location data
- **Rate Limits**: 
  - 2,500 free requests per day
  - Implement caching to reduce API usage
  - Batch requests where possible
- **Data Processing**:
  - Filter results by business type
  - Extract contact information where available
  - Store geocoded location data for future reference

### 3.2 Job Board APIs
- **Indeed API**:
  - Search jobs by keyword, location
  - Filter by date, salary, job type
  - Extract application details
- **Upwork API** (Unofficial):
  - Search jobs by category, skills
  - Filter by budget, client history
  - Track job posting age and applicant count
- **Rate Limiting Strategy**:
  - Implement exponential backoff
  - Distribute requests across 24-hour period
  - Cache results to minimize duplicate requests

### 3.3 Email API (SendGrid)
- **Features Used**:
  - Transactional sending
  - Template management
  - Open and click tracking
  - Scheduling for follow-ups
- **Implementation**:
  - Create reusable templates with variable substitution
  - Implement tracking pixel for open detection
  - Use unique links for click tracking
  - Schedule automated follow-ups

### 3.4 GPT API
- **Usage Areas**:
  - Proposal customization
  - Response analysis
  - Content summarization
- **Prompt Templates**:
  - Proposal generation based on job requirements
  - Follow-up email variations
  - Response analysis and suggested replies
- **Cost Management**:
  - Use cheaper models for simple tasks
  - Implement token counting and limiting
  - Cache common responses

## 4. Frontend Components

### 4.1 Dashboard
- **Opportunity Queue**: Prioritized list of potential opportunities
- **Outreach Calendar**: Scheduled and completed outreach
- **Activity Feed**: Recent system activity
- **Quick Stats**: Key metrics at a glance

### 4.2 Opportunity Management
- **Discovery Interface**: Search and filter options
- **Evaluation Form**: Manual scoring and notes
- **Detail View**: Complete opportunity information
- **Action Panel**: Apply, contact, or dismiss options

### 4.3 Outreach Tools
- **Template Editor**: Create and manage templates
- **Email Composer**: AI-assisted email writing
- **Proposal Builder**: Custom proposal generation
- **Follow-up Manager**: Scheduled communications

### 4.4 Analytics Dashboard
- **Success Metrics**: Conversion rates by channel
- **Time Analytics**: Time invested vs. results
- **Pipeline Visualization**: Opportunity funnel
- **Trend Analysis**: Performance over time

## 5. Backend Services

### 5.1 Discovery Service
- **Job Board Scanner**: Automated job discovery
- **Agency Finder**: Recruitment agency discovery
- **Business Scanner**: Local business discovery
- **Data Normalization**: Consistent data format conversion

### 5.2 Evaluation Service
- **Scoring Engine**: Algorithm for opportunity evaluation
- **Matching System**: Skill and requirement matching
- **Filtering Rules**: Custom filtering logic
- **Prioritization Queue**: Opportunity ordering

### 5.3 Outreach Service
- **Email Generator**: Template-based email creation
- **Proposal Builder**: Custom proposal creation
- **Follow-up Scheduler**: Automated follow-up system
- **Response Analyzer**: Email response processing

### 5.4 Analytics Service
- **Data Collection**: Activity and result tracking
- **Metric Calculation**: KPI computation
- **Report Generation**: Scheduled reports
- **Trend Analysis**: Historical data analysis

## 6. Implementation Phases

### Phase 1: Core Infrastructure (Weeks 1-2)
- Set up Supabase database with core tables
- Create basic UI framework and navigation
- Implement authentication and user preferences
- Build opportunity data model and basic CRUD

### Phase 2: Job Board Integration (Weeks 3-4)
- Implement Indeed API integration
- Create Upwork scraping module
- Build data normalization pipeline
- Develop basic opportunity scoring

### Phase 3: Agency Discovery (Weeks 5-6)
- Implement Google Maps API integration
- Build agency database and tracking
- Create bulk email submission system
- Develop agency relationship tracking

### Phase 4: Local Business Analysis (Weeks 7-8)
- Build local business discovery
- Implement website analysis tools
- Create agency client identification
- Develop competition analysis features

### Phase 5: AI-Powered Outreach (Weeks 9-10)
- Integrate GPT API for content generation
- Build template system with variables
- Implement email tracking and analytics
- Create automated follow-up system

## 7. Testing Strategy

### 7.1 Unit Testing
- Component-level tests for UI elements
- Function-level tests for utility functions
- API wrapper tests with mocked responses

### 7.2 Integration Testing
- API integration tests with sandbox environments
- Database operation sequence testing
- Cross-module functionality testing

### 7.3 End-to-End Testing
- Complete workflow testing
- Real-world scenario simulations
- Performance testing under load

### 7.4 User Testing
- Usability testing with actual workflows
- A/B testing for outreach templates
- Success rate monitoring for different approaches

## 8. Deployment Strategy

### 8.1 Development Environment
- Local development with Docker
- Supabase local instance
- Mock APIs for testing

### 8.2 Staging Environment
- Netlify preview deployments
- Supabase development instance
- Limited API quota usage

### 8.3 Production Environment
- Netlify production deployment
- Supabase production instance
- Full API access with monitoring

### 8.4 Monitoring
- Error tracking with Sentry
- Performance monitoring
- API usage tracking
- Cost monitoring
