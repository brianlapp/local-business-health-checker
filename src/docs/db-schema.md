
# Supabase Database Schema

## 🚀 Table: `businesses`
| Column               | Type       | Description                                  |
|---------------------|-----------|----------------------------------------------|
| `id`                | UUID      | Primary Key                                  |
| `name`              | Text      | Business Name                               |
| `website`           | Text      | Business Website URL                        |
| `score`             | Integer   | Shit Score™ (0-100)                         |
| `cms`               | Text      | CMS or Tech Stack (WordPress, Joomla, etc.) |
| `speed_score`       | Integer   | Legacy Speed Score (0-100)                  |
| `lighthouse_score`  | Integer   | Google Lighthouse Performance Score (0-100) |
| `gtmetrix_score`    | Integer   | GTmetrix Performance Score (0-100)          |
| `lighthouse_report_url` | Text  | URL to Lighthouse report                    |
| `gtmetrix_report_url`   | Text  | URL to GTmetrix report                      |
| `last_checked`      | Timestamp | Date of last overall check                  |
| `last_lighthouse_scan` | Timestamp | Date of last Lighthouse scan             |
| `last_gtmetrix_scan`   | Timestamp | Date of last GTmetrix scan               |

## 🚀 Table: `outreach`
| Column         | Type       | Description                                  |
|---------------|-----------|----------------------------------------------|
| `id`         | UUID      | Primary Key                                  |
| `business_id` | UUID      | Foreign Key (links to `businesses`)         |
| `email_status` | Text      | Sent / Pending / Replied                    |
| `last_contacted` | Timestamp | Last email sent                          |

## 🚀 Table: `gtmetrix_usage`
| Column         | Type       | Description                                  |
|---------------|-----------|----------------------------------------------|
| `id`         | UUID      | Primary Key                                  |
| `month`      | Text      | Month in YYYY-MM format                      |
| `scans_used`  | Integer   | Number of GTmetrix scans used this month     |
| `scans_limit` | Integer   | Maximum number of GTmetrix scans per month   |
| `last_updated` | Timestamp | Time of last update to this record          |
