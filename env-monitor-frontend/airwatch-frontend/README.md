# 🌍 VayuSena — Real-time Air Quality Monitoring

A real-time air quality monitoring dashboard built with React + Vite, powered by Firebase Realtime Database. Monitor AQI levels, pollutant breakdowns, and health advisories across multiple stations live.

---

## 🚀 Features

- 🗺️ **Interactive Map** — Live station markers on a Leaflet map (OpenStreetMap)
- 📊 **Air Quality Trends** — 24-reading historical charts with temperature & humidity
- 🏭 **Multi-Station Support** — Switch between monitoring stations (Akluj, Lohogaon, Pimpri, SVERI COE)
- 🧪 **Sensor Breakdown** — MQ135 & MQ7 sensor values converted to PM2.5, PM10, CO₂, NH₃, CO readings
- ⚠️ **Active Alerts** — Real-time alerts when AQI exceeds safe thresholds
- 🩺 **Health Advisory** — Dynamic health recommendations based on current AQI
- 🔮 **24h Prediction** — Expected AQI range and peak hours forecast
- 📥 **Export Data** — Download station data as CSV
- 🤖 **AI Chatbot** — Ask about air quality using the built-in chatbot
- 🔴 **Live Updates** — Firebase Realtime Database for instant data sync

---

## 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| React + Vite | Frontend framework |
| Firebase Realtime Database | Live data backend |
| Leaflet.js | Interactive maps |
| Recharts | Charts and graphs |
| Inter / Segoe UI | Typography |

---

## 📁 Project Structure

```
airwatch-frontend/
├── public/
├── src/
│   ├── components/
│   │   └── Dashboard.jsx       # Map + Trends + Comparison
│   ├── layout/
│   │   ├── MainLayout.jsx      # Root layout with Firebase listeners
│   │   ├── Header.jsx          # Top navbar with station selector
│   │   ├── Sidebar.jsx         # Filters, stations list, alerts
│   │   ├── RightSidebar.jsx    # Health advisory, stats, sensor donut chart
│   │   └── Chatbot.jsx         # AI chatbot for air quality queries
│   ├── firebase.js             # Firebase config & initialization
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── .env                        # Firebase credentials (not committed)
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## ⚙️ Getting Started

### 1. Clone the repository
```bash
git clone <repo-url>
cd airwatch-frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root of `airwatch-frontend/`:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_DATABASE_URL=your_database_url
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔥 Firebase Database Structure

```
VayuSena/
├── Station/
│   └── <StationID>/
│       ├── Name
│       ├── AQI
│       ├── PM2_5
│       ├── PM10
│       ├── Humidity
│       ├── Temperature
│       ├── MQ135_Value
│       ├── MQ7_CO_Value
│       ├── Latitude
│       └── Longitude
└── History/
    └── <ReadingID>/
        ├── AQI
        ├── Temperature
        ├── Humidity
        ├── MQ135_Value
        ├── MQ7_CO_Value
        ├── Latitude
        └── Longitude
```

---

## 🎨 AQI Scale

| Range | Category | Color |
|---|---|---|
| 0–50 | Good | 🟢 Green |
| 51–100 | Moderate | 🟡 Yellow |
| 101–150 | Sensitive | 🟠 Orange |
| 151–200 | Unhealthy | 🔴 Red |
| 201+ | Very Bad | 🔴 Dark Red |

---

## 📦 Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

---

## 🙏 Acknowledgements

- [Firebase](https://firebase.google.com/) — Realtime database
- [Leaflet.js](https://leafletjs.com/) — Maps
- [OpenStreetMap](https://www.openstreetmap.org/) — Map tiles
- [Recharts](https://recharts.org/) — Charts