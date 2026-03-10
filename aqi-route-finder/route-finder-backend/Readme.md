# 🗺️ AQI Route Finder — Backend

A smart route-finding backend that suggests the **best driving routes based on both distance and air quality (AQI)**. Think Google Maps, but it also considers the air you'll breathe along the way.

---

## 🚀 Features

- 🛣️ **3 Route Alternatives** — Generates direct, left-offset, and right-offset routes
- 🌿 **AQI-Aware Routing** — Samples air quality at 5 points along each route
- ⚡ **Fastest Route** — Shortest distance option
- ⚖️ **Balanced Route** — Best mix of distance and air quality
- 🌱 **Clean Air Route** — Lowest AQI exposure route
- 🎚️ **Slider Control** — Frontend can weight AQI vs distance preference (0–100)
- 🧠 **Smart Caching** — Avoids duplicate IQAir API calls for nearby coordinates
- 📍 **Geocoding** — Convert place names to coordinates (India-focused)
- 🔄 **Fallback Routing** — If waypoint is unreachable, falls back to direct route

---

## 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| Node.js + Express | Backend server |
| OpenRouteService (ORS) | Route generation & geocoding |
| IQAir AirVisual API | Real-time AQI data |
| @mapbox/polyline | Decode ORS route geometry |
| axios | HTTP requests |
| dotenv | Environment variable management |
| cors | Cross-origin request handling |

---

## 📁 Project Structure

```
route-finder-backend/
├── server.js          # Main Express server
├── .env               # API keys (not committed)
├── .gitignore
├── package.json
└── package-lock.json
```

---

## ⚙️ Getting Started

### 1. Install dependencies
```bash
cd route-finder-backend
npm install
```

### 2. Set up environment variables
Create a `.env` file:
```env
ORS_API_KEY=your_openrouteservice_api_key
IQAIR_API_KEY=your_iqair_airvisual_api_key
```

- Get ORS API key → [openrouteservice.org](https://openrouteservice.org/)
- Get IQAir API key → [iqair.com/air-pollution-data-api](https://www.iqair.com/air-pollution-data-api)

### 3. Start the server
```bash
node server.js
```

Server runs on **http://localhost:5000**

---

## 📡 API Endpoints

### `GET /`
Health check
```json
{ "status": true, "message": "Backend running" }
```

---

### `GET /api/geocode`
Convert a place name to coordinates

**Query Params:**
| Param | Required | Description |
|---|---|---|
| `text` | ✅ | Place name to search |
| `biasLat` | ❌ | Latitude to bias results near |
| `biasLon` | ❌ | Longitude to bias results near |

**Response:**
```json
{
  "success": true,
  "lat": 18.5206,
  "lng": 73.8569,
  "label": "Pune, Maharashtra, India"
}
```

---

### `POST /api/route`
Get 3 AQI-scored route options between two points

**Request Body:**
```json
{
  "startLat": 18.5362,
  "startLon": 73.8294,
  "endLat": 18.5074,
  "endLon": 73.8077,
  "sliderValue": 50
}
```

> `sliderValue` — 0 = prioritize shortest distance, 100 = prioritize cleanest air

**Response:**
```json
{
  "success": true,
  "routes": [
    {
      "name": "⚡ Fastest Route",
      "color": "#f59e0b",
      "distance": "3.21 km",
      "duration": "8 min",
      "avgAQI": 85,
      "aqiLevel": "Moderate",
      "aqiBreakdown": { "good": 20, "moderate": 60, "unhealthy": 20 },
      "coordinates": [[lon, lat], ...]
    },
    {
      "name": "⚖️ Balanced Route",
      ...
    },
    {
      "name": "🌿 Clean Air Route",
      ...
    }
  ]
}
```

---

### `GET /api/test-route`
Test ORS routing with hardcoded Pune coordinates

### `GET /api/test-aqi`
Test IQAir AQI fetch with hardcoded Pune coordinates

---

## 🧠 How Route Scoring Works

For each route, 5 evenly spaced points are sampled and AQI is fetched for each. The route is then scored using:

```
score = (distanceWeight × normalizedDistance) + (aqiWeight × normalizedAQI)
```

Where:
- `aqiWeight = sliderValue / 100`
- `distanceWeight = 1 - aqiWeight`
- `normalizedAQI = avgAQI / 500`
- `normalizedDistance = distance / 30000`

Lower score = better route. The 3 routes are then labelled as **Fastest**, **Balanced**, and **Clean Air**.

---

## 🎨 AQI Scale

| Range | Level |
|---|---|
| 0–50 | Good |
| 51–100 | Moderate |
| 101–150 | Unhealthy for Sensitive Groups |
| 151–200 | Unhealthy |
| 201–300 | Very Unhealthy |
| 301+ | Hazardous |

---

## ⚠️ Notes

- IQAir free tier has rate limits — the backend adds **1.2s delay** between AQI calls and **3s delay** between routes to avoid hitting limits
- AQI results are **cached** by rounded coordinates (2 decimal places ≈ ~1km grid) to minimize API calls
- Routes are India-focused (geocoding restricted to `boundary.country: IND`)