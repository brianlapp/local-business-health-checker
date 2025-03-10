
# Local Business Website Scanner (Shit Score™ Generator)

## 🎯 Goal
Automate local business discovery, scan their websites for performance & tech issues, and rank them based on how badly they need a rebuild.

## 📌 Features
- **Business Discovery** → Scrape business names & websites from Google Maps API.
- **Website Analysis** → Use GTmetrix & BuiltWith APIs to analyze speed, tech stack, and UX issues.
- **Ranking System (Shit Score™)** → Assigns a 0-100 score based on:
  - 🚨 Slow loading times (+30 points)
  - 🚨 Outdated CMS (Joomla, old WordPress, Wix) (+20 points)
  - 🚨 Missing SSL (HTTP Only) (+15 points)
  - 🚨 Non-mobile-friendly layouts (+15 points)
  - 🎨 Comic Sans/ugly fonts (bonus +10 points)
- **Dashboard UI** → Displays ranked businesses inside Loveable.dev.
- **One-Click Outreach** → Generates emails for businesses needing help.

## 🛠 Tech Stack
- **Frontend:** React + Tailwind CSS + shadcn/ui
- **Backend:** Loveable.dev (handles API calls & automation)
- **Database:** Supabase (stores business info & scan results)
- **APIs Used:** 
  - **Google Maps API** (business scraping)
  - **GTmetrix API** (performance scanning)
  - **BuiltWith API** (tech stack detection)

## 💰 Cost Constraint
🚀 **$0 UNTIL WE LAND A CLIENT!**  
- Staying within **free API limits**  
- Using **Loveable.dev credits**  
- Leveraging **existing Netlify hosting**

## 📂 Project Structure
```
/src
  ├─ components/            # React components
  │  ├─ BusinessCard.tsx   # Individual business display
  │  ├─ Dashboard.tsx      # Main dashboard view
  │  ├─ ScoreDisplay.tsx   # Shit Score™ visualization
  │  └─ Header.tsx         # App header
  │
  ├─ services/             # API integrations
  │  ├─ gtmetrix.ts       # Speed & performance analysis
  │  ├─ builtwith.ts      # CMS & tech detection
  │  └─ maps.ts           # Business URL scraping
  │
  ├─ types/               # TypeScript definitions
  │  └─ business.ts       # Business data types
  │
  └─ utils/               # Helper functions
     ├─ score.ts         # Score calculation logic
     └─ email.ts         # Email template generation
```

## ⚡ Shit Score™ Calculation
Score is calculated by adding penalty points:
1. Page Speed Issues:
   - Load Time > 5s: +30 points
   - Load Time 3-5s: +20 points
   - Load Time 2-3s: +10 points

2. CMS/Platform:
   - Wix/Squarespace: +20 points
   - Outdated WordPress (< 5.0): +20 points
   - Joomla/Drupal (old versions): +20 points

3. Technical Issues:
   - No SSL: +15 points
   - Not Mobile-Friendly: +15 points
   - Default/Bad Fonts: +10 points

Final score is the sum of all penalties (max 100).
Higher score = More urgent rebuild needed.

## 🔄 Workflow
1. **Discovery:**
   - Daily scan of Google Maps for new businesses
   - Store basic info in Supabase

2. **Analysis:**
   - Run GTmetrix scan on each new site
   - Check BuiltWith for tech stack
   - Calculate Shit Score™

3. **Review & Outreach:**
   - Manual verification of high-scoring sites
   - One-click email generation
   - Track outreach status

## 🎯 Next Steps
1. Set up Supabase tables
2. Implement basic UI dashboard
3. Add API integrations
4. Create automated scanning
5. Add email templates
