# AQI Route Finder — Frontend

Find driving routes based on air quality, not just distance. Enter a start and destination, adjust the slider toward clean air or speed, and get 3 real-time scored routes on a map.

---

## Stack

- React
- Axios
- React Leaflet + Leaflet.js (OpenStreetMap)

---

## Getting Started

Backend needs to be running on `http://localhost:5000` first.

```bash
npm install
npm run dev
```

Runs at `http://localhost:5173`.

---

## Folder Structure

```
src/
├── App.jsx
├── components/
│   ├── Sidebar.jsx
│   ├── MapView.jsx
│   └── RouteCard.jsx
```

---

## How It Works

**App.jsx** owns all state. When you hit Find Route:

1. Geocodes the start location
2. Geocodes the destination — biased toward start coordinates so nearby towns are picked over distant same-named ones (e.g. Velapur near Akluj, not the one 254km away)
3. POSTs both coordinates + slider value to `/api/route`
4. Gets back 3 routes and shows the one matching your slider

Slider ranges:
- 0–33 → Clean Air Route
- 34–66 → Balanced Route
- 67–100 → Fastest Route

**Sidebar.jsx** — location inputs, slider, and the Find Route button.

**MapView.jsx** — draws the selected route as a polyline, flies to start on load. "My Location" button fills the start input with your GPS coordinates.

**RouteCard.jsx** — shows distance, duration, avg AQI, and the breakdown (% good / moderate / unhealthy) for the selected route.

---

## API

### `GET /api/geocode`

```
/api/geocode?text=Velapur&biasLat=17.52&biasLon=75.01
```

`biasLat` and `biasLon` are optional — only passed when geocoding the destination.

### `POST /api/route`

```json
{
  "startLat": 17.52,
  "startLon": 75.01,
  "endLat": 17.65,
  "endLon": 74.98,
  "sliderValue": 50
}
```

Takes ~20 seconds because AQI is fetched live with rate-limit delays between calls.

---

## Notes

- AQI falls back to 100 (Moderate) if IQAir hits rate limits mid-request
- Very short routes may return the same road for all 3 options
- Map defaults to Pune on first load, moves to route start once results come in
- Don't forget to import `leaflet/dist/leaflet.css` or markers won't render