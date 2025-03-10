
# Supabase Database Schema

## 🚀 Table: `businesses`
| Column         | Type       | Description                                  |
|---------------|-----------|----------------------------------------------|
| `id`         | UUID      | Primary Key                                  |
| `name`       | Text      | Business Name                               |
| `website`    | Text      | Business Website URL                        |
| `score`      | Integer   | Shit Score™ (0-100)                         |
| `cms`        | Text      | CMS or Tech Stack (WordPress, Joomla, etc.) |
| `speed_score` | Integer   | GTmetrix Score (0-100)                      |
| `last_checked` | Timestamp | Date of last scan                          |

## 🚀 Table: `outreach`
| Column         | Type       | Description                                  |
|---------------|-----------|----------------------------------------------|
| `id`         | UUID      | Primary Key                                  |
| `business_id` | UUID      | Foreign Key (links to `businesses`)         |
| `email_status` | Text      | Sent / Pending / Replied                    |
| `last_contacted` | Timestamp | Last email sent                          |
