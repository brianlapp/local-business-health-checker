
# API Instructions for Loveable.dev Integration

## 🚀 1. Google Maps API (Scraping Business URLs)
### Endpoint:

GET https://maps.googleapis.com/maps/api/place/textsearch/json
?query=plumbers+in+[YOUR_CITY]
&key=[YOUR_GOOGLE_MAPS_API_KEY]

### Response Example:
```json
{
  "results": [
    {
      "name": "Joe's Plumbing",
      "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
      "formatted_address": "123 Main St, YourCity, ON",
      "website": "http://joesplumbing.com"
    }
  ]
}
```

### Integration Steps:
1. Call the API with a search query for local businesses (e.g., "Plumbers in Ontario").
2. Parse the business name, address, and website URL.
3. Store the results in Supabase.

## 🚀 2. GTmetrix API (Performance Scanning)

### Endpoint:

POST https://gtmetrix.com/api/1.0/test
Authorization: Basic [YOUR_API_KEY]
Content-Type: application/json

### Payload:

```json
{
  "url": "http://joesplumbing.com"
}
```

### Response Example:

```json
{
  "id": "test_id_123",
  "results": {
    "pagespeed_score": 55,
    "fully_loaded_time": 3200,
    "lighthouse_performance_score": 45
  }
}
```

### Integration Steps:
1. Send website URL to GTmetrix API.
2. Extract performance data (speed score, load time).
3. Store results in Supabase.

## 🚀 3. BuiltWith API (CMS & Tech Stack Detection)

### Endpoint:

GET https://api.builtwith.com/free1/api.json
?KEY=[YOUR_BUILTWITH_API_KEY]
&LOOKUP=joesplumbing.com

### Response Example:

```json
{
  "Results": [
    {
      "Technologies": [
        {"Name": "WordPress", "Category": "CMS"},
        {"Name": "WooCommerce", "Category": "Ecommerce"}
      ]
    }
  ]
}
```

### Integration Steps:
1. Send website URL to BuiltWith API.
2. Extract CMS & platform info.
3. Store results in Supabase.
