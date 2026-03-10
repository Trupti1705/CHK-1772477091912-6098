const express = require('express');
const cors = require('cors');
const axios = require('axios');
const polyline = require('@mapbox/polyline');

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

//! HELPER: AQI Level
function getAQILevel(aqi) {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
}

//! HELPER: AQI Breakdown
function calculateAQIBreakdown(aqiValues) {
    let good = 0, moderate = 0, unhealthy = 0;
    aqiValues.forEach(aqi => {
        if (aqi <= 50) good++;
        else if (aqi <= 100) moderate++;
        else unhealthy++;
    });
    const total = aqiValues.length;
    return {
        good: Math.round((good / total) * 100),
        moderate: Math.round((moderate / total) * 100),
        unhealthy: Math.round((unhealthy / total) * 100)
    };
}

//! HELPER: Fetch route from ORS
async function fetchORSRoute(coordinates) {
    const response = await axios.post(
        'https://api.openrouteservice.org/v2/directions/driving-car',
        { coordinates },
        {
            headers: {
                'Authorization': process.env.ORS_API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }
    );
    return response.data.routes[0];
}

//! HELPER: Fetch a route with automatic fallback to direct if waypoint fails
async function fetchRouteWithFallback(coords, label) {
    try {
        return await fetchORSRoute(coords);
    } catch (err) {
        const isWaypointError = err.response?.data?.error?.code === 2010;
        if (isWaypointError && coords.length > 2) {
            console.log(`  ⚠️  ${label} waypoint not routable — falling back to direct route`);
            return await fetchORSRoute([coords[0], coords[coords.length - 1]]);
        }
        throw err;
    }
}

//! HELPER: Sample N evenly spaced points from a route
function sampleRoutePoints(decodedCoords, numSamples) {
    const total = decodedCoords.length;
    if (total === 0) return [];
    if (total <= numSamples) return decodedCoords;

    const points = [];
    for (let i = 0; i < numSamples; i++) {
        const idx = Math.round((i / (numSamples - 1)) * (total - 1));
        points.push(decodedCoords[idx]);
    }
    return points;
}

//! HELPER: Round coordinate to 2 decimal places for caching
function roundCoord(val) {
    return Math.round(val * 100) / 100;
}

//! CACHE: Avoid duplicate IQAir calls for same area
const aqiCache = {};

async function fetchAQI(lat, lon) {
    const key = `${roundCoord(lat)}_${roundCoord(lon)}`;
    if (aqiCache[key] !== undefined) {
        console.log(`Cache hit for ${key}: ${aqiCache[key]}`);
        return aqiCache[key];
    }

    try {
        console.log(`Fetching AQI for ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
        const response = await axios.get('http://api.airvisual.com/v2/nearest_city', {
            params: { lat, lon, key: process.env.IQAIR_API_KEY }
        });
        const aqi = response.data.data.current.pollution.aqius;
        console.log(`  → AQI: ${aqi}`);
        aqiCache[key] = aqi;
        return aqi;
    } catch (err) {
        console.log(`  → AQI failed (${err.response?.data?.data?.message || err.message}), using fallback 100`);
        return 100;
    }
}

//! HELPER: Get AQI for a route using 5 spread-out sample points
async function getRouteAQI(decodedCoords) {
    const NUM_SAMPLES = 5;
    const samplePoints = sampleRoutePoints(decodedCoords, NUM_SAMPLES);
    const aqiValues = [];

    for (const point of samplePoints) {
        const aqi = await fetchAQI(point[0], point[1]);
        aqiValues.push(aqi);
        await sleep(1200);
    }

    return aqiValues;
}

//! HELPER: Score a route
function scoreRoute(summary, aqiValues, sliderValue) {
    const avgAQI = Math.round(
        aqiValues.reduce((sum, aqi) => sum + aqi, 0) / aqiValues.length
    );

    const aqiWeight      = sliderValue / 100;
    const distanceWeight = 1 - aqiWeight;

    const normalizedAQI      = avgAQI / 500;
    const normalizedDistance = summary.distance / 30000;

    const score = (distanceWeight * normalizedDistance) + (aqiWeight * normalizedAQI);

    return {
        avgAQI,
        score: parseFloat(score.toFixed(4)),
        aqiWeight,
        distanceWeight
    };
}

//! ROUTES
app.get('/', (req, res) => {
    res.status(200).json({ status: true, message: "Backend running" });
});

app.get('/api/test-route', async (req, res) => {
    try {
        const response = await axios.post(
            'https://api.openrouteservice.org/v2/directions/driving-car',
            { coordinates: [[73.8294, 18.5362], [73.8077, 18.5074]] },
            { headers: { "Authorization": process.env.ORS_API_KEY, "Content-Type": 'application/json' } }
        );
        const route = response.data.routes[0];
        res.status(200).json({
            success: true,
            distance: `${(route.summary.distance / 1000).toFixed(2)} Km`,
            duration: `${Math.round(route.summary.duration / 60)} min`
        });
    } catch (err) {
        res.status(500).json({ success: false, err: err.message, details: err.response?.data });
    }
});

app.get('/api/test-aqi', async (req, res) => {
    try {
        const response = await axios.get('http://api.airvisual.com/v2/nearest_city', {
            params: { lat: 18.5362, lon: 73.8294, key: process.env.IQAIR_API_KEY }
        });
        const data = response.data.data;
        const pollution = data.current.pollution;
        res.json({
            success: true,
            location: data.city,
            aqi: pollution.aqius,
            aqiLevel: getAQILevel(pollution.aqius)
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/geocode', async (req, res) => {
    try {
        const { text, biasLat, biasLon } = req.query;
        if (!text) return res.status(400).json({ success: false, error: "Text parameter required" });

        const params = {
            api_key: process.env.ORS_API_KEY,
            text,
            size: 5,
            'boundary.country': 'IND',   // restrict to India
        };

        // If caller passes a bias point (e.g. the already-resolved start location),
        // ORS will rank geographically nearby results higher
        if (biasLat && biasLon) {
            params['focus.point.lat'] = parseFloat(biasLat);
            params['focus.point.lon'] = parseFloat(biasLon);
        }

        const response = await axios.get('https://api.openrouteservice.org/geocode/search', { params });
        const features = response.data.features;
        if (!features || features.length === 0)
            return res.status(404).json({ success: false, error: "Location not found" });

        const [lng, lat] = features[0].geometry.coordinates;
        res.json({ success: true, lat, lng, label: features[0].properties.label });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
});
//! MAIN ROUTE
app.post('/api/route', async (req, res) => {
    try {
        console.log('\n=== NEW ROUTE REQUEST ===');
        const { startLat, startLon, endLat, endLon, sliderValue } = req.body;

        const midLat = (startLat + endLat) / 2;
        const midLon = (startLon + endLon) / 2;

        // Compute a perpendicular offset direction relative to the route bearing.
        // This pushes alternate waypoints sideways (not just N/S) which is more
        // meaningful and avoids hardcoded cardinal offsets landing in non-routable
        // terrain (fields, rivers, etc.) for small Indian towns.
        const dLat = endLat - startLat;
        const dLon = endLon - startLon;
        const len = Math.sqrt(dLat * dLat + dLon * dLon) || 1;

        // Perpendicular unit vector (rotated 90° from route direction)
        const perpLat = -dLon / len;
        const perpLon =  dLat / len;

        // Small offset ~0.01 deg ≈ 1 km — large enough to suggest a different
        // road, small enough to stay within the routable road network
        const OFFSET = 0.01;

        const directCoords = [
            [startLon, startLat],
            [endLon, endLat]
        ];
        const northCoords = [
            [startLon, startLat],
            [midLon + perpLon * OFFSET, midLat + perpLat * OFFSET],
            [endLon, endLat]
        ];
        const southCoords = [
            [startLon, startLat],
            [midLon - perpLon * OFFSET, midLat - perpLat * OFFSET],
            [endLon, endLat]
        ];

        console.log('Fetching 3 routes from ORS...');
        const [orsRoute1, orsRoute2, orsRoute3] = await Promise.all([
            fetchRouteWithFallback(directCoords, 'Direct'),
            fetchRouteWithFallback(northCoords,  'North'),
            fetchRouteWithFallback(southCoords,  'South'),
        ]);
        console.log('Routes fetched. Getting AQI for each...');

        const coords1 = polyline.decode(orsRoute1.geometry);
        const coords2 = polyline.decode(orsRoute2.geometry);
        const coords3 = polyline.decode(orsRoute3.geometry);

        console.log('\n--- Route 1 AQI ---');
        const aqi1 = await getRouteAQI(coords1);
        await sleep(3000);

        console.log('\n--- Route 2 AQI ---');
        const aqi2 = await getRouteAQI(coords2);
        await sleep(3000);

        console.log('\n--- Route 3 AQI ---');
        const aqi3 = await getRouteAQI(coords3);

        const score1 = scoreRoute(orsRoute1.summary, aqi1, sliderValue);
        const score2 = scoreRoute(orsRoute2.summary, aqi2, sliderValue);
        const score3 = scoreRoute(orsRoute3.summary, aqi3, sliderValue);

        console.log(`\nScores — R1: ${score1.score} (AQI ${score1.avgAQI}), R2: ${score2.score} (AQI ${score2.avgAQI}), R3: ${score3.score} (AQI ${score3.avgAQI})`);

        const rawRoutes = [
            {
                distance: orsRoute1.summary.distance,
                duration: orsRoute1.summary.duration,
                avgAQI: score1.avgAQI,
                score: score1.score,
                aqiSamples: aqi1,
                coordinates: coords1.map(p => [p[1], p[0]])
            },
            {
                distance: orsRoute2.summary.distance,
                duration: orsRoute2.summary.duration,
                avgAQI: score2.avgAQI,
                score: score2.score,
                aqiSamples: aqi2,
                coordinates: coords2.map(p => [p[1], p[0]])
            },
            {
                distance: orsRoute3.summary.distance,
                duration: orsRoute3.summary.duration,
                avgAQI: score3.avgAQI,
                score: score3.score,
                aqiSamples: aqi3,
                coordinates: coords3.map(p => [p[1], p[0]])
            }
        ];

        const byDistance = [...rawRoutes].sort((a, b) => a.distance - b.distance);
        const byAQI      = [...rawRoutes].sort((a, b) => a.avgAQI - b.avgAQI);
        const byScore    = [...rawRoutes].sort((a, b) => a.score - b.score);

        const fastest  = byDistance[0];
        const cleanest = byAQI[0];
        const balanced = byScore.find(r => r !== fastest && r !== cleanest) || byScore[1];

        const labelledRoutes = [
            {
                ...fastest,
                name: '⚡ Fastest Route',
                color: '#f59e0b',
                distance: `${(fastest.distance / 1000).toFixed(2)} km`,
                duration: `${Math.round(fastest.duration / 60)} min`,
                aqiLevel: getAQILevel(fastest.avgAQI),
                aqiBreakdown: calculateAQIBreakdown(fastest.aqiSamples)
            },
            {
                ...balanced,
                name: '⚖️ Balanced Route',
                color: '#3b82f6',
                distance: `${(balanced.distance / 1000).toFixed(2)} km`,
                duration: `${Math.round(balanced.duration / 60)} min`,
                aqiLevel: getAQILevel(balanced.avgAQI),
                aqiBreakdown: calculateAQIBreakdown(balanced.aqiSamples)
            },
            {
                ...cleanest,
                name: '🌿 Clean Air Route',
                color: '#10b981',
                distance: `${(cleanest.distance / 1000).toFixed(2)} km`,
                duration: `${Math.round(cleanest.duration / 60)} min`,
                aqiLevel: getAQILevel(cleanest.avgAQI),
                aqiBreakdown: calculateAQIBreakdown(cleanest.aqiSamples)
            }
        ];

        console.log('\n=== FINAL ROUTES ===');
        labelledRoutes.forEach(r => console.log(`${r.name}: ${r.distance}, AQI ${r.avgAQI}, score ${r.score}`));

        res.json({ success: true, routes: labelledRoutes });

    } catch (err) {
        console.error('ROUTE ERROR:', err.response?.data || err.message);
        res.status(500).json({ status: false, message: err.message, details: err.response?.data });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on PORT:${PORT}`));