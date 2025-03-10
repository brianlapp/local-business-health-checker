
# Local Business Website Scanner Implementation Specification

## Project Overview
The Local Business Website Scanner (Shit Score™ Generator) is a tool to automate local business discovery, scan websites for performance and technical issues, and rank them based on how badly they need a rebuild.

## Current Status
- Basic UI dashboard and database tables are set up
- CRUD operations for businesses are implemented
- Basic scoring display is in place
- Dual scanning system (Lighthouse + GTmetrix) implemented
- UI components refactored for better maintainability
- Rate limiting and usage tracking for GTmetrix API
- Performance metrics collection and display
- Manual email template generation
- Web scraping implementation for business discovery

## Implementation Plan

### Phase 1: Web Scraping Implementation [COMPLETED]
1. **YellowPages Scraping**
   - Purpose: Discover local businesses and their websites without API costs
   - Implementation: Create edge function for web scraping
   - Storage: Store scraped businesses in Supabase

2. **GTmetrix API Integration**
   - Purpose: Analyze website performance metrics
   - Storage: Store API key in Supabase secrets
   - Implementation: Create edge function for performance scanning

3. **BuiltWith API Integration**
   - Purpose: Detect CMS and technology stack
   - Storage: Store API key in Supabase secrets
   - Implementation: Create edge function for tech analysis

### Phase 2: Business Discovery Implementation [COMPLETED]
1. **Web Scraper Integration**
   - Create UI for geographic area scanning
   - Implement source selection for different directories
   - Store discovered businesses in Supabase

2. **Manual Business Addition**
   - Enhance existing form for manual business entry
   - Add validation for website URLs
   - Implement batch upload option via CSV

### Phase 3: Website Analysis Engine
1. **Performance Analysis**
   - Integrate GTmetrix API for speed metrics
   - Extract and store page load time, speed score
   - Implement queue system for batch scanning

2. **Technology Detection**
   - Integrate BuiltWith API for CMS detection
   - Identify outdated technology stacks
   - Store technology data in Supabase

3. **Additional Analysis**
   - SSL certificate verification
   - Mobile responsiveness check
   - Font usage detection

### Phase 4: Comprehensive Scoring System [COMPLETED]
1. **Shit Score™ Algorithm**
   ✅ Implemented scoring logic based on multiple factors:
     - Page speed (0-30 points)
     - CMS/platform (0-20 points)
     - SSL status (0-15 points)
     - Mobile friendliness (0-15 points)
     - Typography (0-10 points)
     - Additional issues (0-10 points)

2. **Score Visualization**
   ✅ Enhanced UI with detailed score breakdown
   ✅ Added visual indicators for critical issues
   ✅ Implemented historical score tracking
   ✅ Added dual scanning system visualization

### Phase 5: Manual Outreach Support [COMPLETED]
1. **Email Template Generation**
   ✅ Implemented personalized email template generator
   ✅ Added copy-to-clipboard functionality
   ✅ Dynamically includes business-specific issues

2. **Website Review**
   ✅ Added "Review Website" button to open business site
   ✅ Streamlined verification workflow before outreach

### Phase 6: Automated Scanning & Batch Processing [IN PROGRESS]
1. **Scanning Automation**
   ⏳ Implement scheduled scans using Supabase cron jobs
   ⏳ Build queue management for rate limiting
   ⏳ Add scan status tracking

2. **Batch Operations**
   ⏳ Create batch scanning functionality
   ⏳ Implement progress tracking for large scans
   ⏳ Add error handling and retry logic

### Future Development (V2)
1. **Additional Web Scraping Sources**
   - Implement Chamber of Commerce scraping
   - Add Yelp Business Directory scraping
   - Create local business directory scraping

2. **Automated Outreach System**
   - Build follow-up scheduling system
   - Implement tracking of sent/replied emails
   - Create outreach analytics dashboard

## Technical Architecture

### Database Schema Extensions
- Add fields for detailed scan results
- Create tables for scan history and scheduled scans
- Implement relationship between businesses and technology data

### Web Scraping Architecture
- Edge functions for scraping different business directories
- Rate limiting and error handling implementation
- Configurable scraping sources

### Frontend Architecture
- Component-based UI with shadcn/ui components
- Business data management through React Query
- Real-time updates via Supabase subscriptions

### Security Considerations
- API key protection through server-side calls
- Rate limiting to prevent API overuse
- Data validation for all inputs

## Development Phases & Timeline Estimate

| Phase | Description | Estimated Time |
|-------|-------------|----------------|
| 1 | Web Scraping Implementation | 1 day |
| 2 | Business Discovery Implementation | 1 day |
| 3 | Website Analysis Engine | 3 days |
| 4 | Comprehensive Scoring System | 1 day |
| 5 | Manual Outreach Support | 1 day |
| 6 | Automated Scanning & Batch Processing | 3 days |

Total estimated development time: 10 days

## Testing Strategy
- Unit tests for scoring algorithm
- Integration tests for API connections
- End-to-end tests for scanning workflow
- Performance testing for batch operations

## Deployment Strategy
- Continuous deployment through Netlify
- Staged rollout of features
- Monitoring of API usage and costs
