import { useState, useEffect } from 'react';
import { database } from '../firebase.js';
import { ref, onValue } from 'firebase/database';

import Chatbot from './Chatbot.jsx';
import Header from "./Header";
import Sidebar from "./Sidebar";
import Dashboard from "../components/Dashboard";
import RightPannel from "./RightSidebar";

// npm run dev

function MainLayout() {
    const [stations, setStations] = useState([])
    const [historyData, setHistoryData] = useState([])
    const [selectedStation, setSelectedStation] = useState('Lohogaon')
    const [loading, setLoading] = useState(true)
    const [gpsCoords, setGpsCoords] = useState([18.5206, 73.8569])

    useEffect(() => {
        const stationRef = ref(database, 'VayuSena/Station')
        const historyRef = ref(database, 'VayuSena/History')

        onValue(historyRef, (snap) => {
            const raw = snap.val()
            if (raw) {
                const sortedKeys = Object.keys(raw)
                    .filter(k => raw[k] && raw[k].AQI)
                    .sort((a, b) => Number(a) - Number(b))

                const historyArray = sortedKeys.map((key, index) => {
                    const minutesAgo = (sortedKeys.length - 1 - index) * 10;
                    const timestamp = new Date(Date.now() - minutesAgo * 60 * 1000);
                    return {
                        reading: `#${key}`,
                        aqi: raw[key].AQI || 0,
                        temperature: raw[key].Temperature || 0,
                        humidity: raw[key].Humidity || 0,
                        mq135: raw[key].MQ135_Value || 0,
                        mq7co: raw[key].MQ7_CO_Value || 0,
                        time: timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                        fullTimestamp: timestamp
                    };
                })
                setHistoryData(historyArray)

                const latestKey = sortedKeys[sortedKeys.length - 1]
                const latest = raw[latestKey]
                const lat = latest?.Latitude && latest.Latitude !== 0 && latest.Latitude !== "No Fix" ? latest.Latitude : 18.5206
                const lng = latest?.Longitude && latest.Longitude !== 0 && latest.Longitude !== "No Fix" ? latest.Longitude : 73.8569
                setGpsCoords([lat, lng])
            }
        })

        onValue(stationRef, (snap) => {
            const data = snap.val()
            if (data) {
                const combined = Object.keys(data).map(id => {
                    const s = data[id]
                    return {
                        id,
                        name: s.Name || s.name || id,
                        position: [
                            s.Latitude && s.Latitude !== 0 ? s.Latitude : (s.latitude && s.latitude !== 0 ? s.latitude : gpsCoords[0]),
                            s.Longitude && s.Longitude !== 0 ? s.Longitude : (s.longitude && s.longitude !== 0 ? s.longitude : gpsCoords[1]),
                        ],
                        aqi: s.AQI || 0,
                        PM25: s.PM2_5 || s.PM25 || 0,
                        PM10: s.PM10 || 0,
                        NO2: 0, SO2: 0, O3: 0,
                        humidity: s.Humidity || s.humidity || 0,
                        temperature: s.Temperature || s.temperature || 0,
                        mq135: s.MQ135_Value || 0,
                        mq7co: s.MQ7_Value || s.MQ7_CO_Value || 0,
                        timestamp: new Date().toISOString()
                    }
                })
                setStations(combined)
                if (combined.length > 0) setSelectedStation(combined[0].id)
                setLoading(false)
            }
        })
    }, [])

    if (loading) {
        return (
            <div style={styles.loadingScreen}>
                <style>{`
                    @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
                    @keyframes slide { 0%{width:0%} 100%{width:100%} }
                `}</style>
                <div style={styles.loadingBox}>
                    <div style={styles.loadingEmoji}>🌍</div>
                    <div style={styles.loadingTitle}>AirWatch</div>
                    <div style={styles.loadingSubtitle}>Real-time Air Quality Monitoring</div>
                    <div style={styles.barTrack}>
                        <div style={styles.barFill} />
                    </div>
                    <div style={styles.loadingNote}>Connecting to Firebase...</div>
                </div>
            </div>
        )
    }

    return (
        <div style={styles.container}>
            <style>{`
                @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
                @keyframes slide { 0%{width:0%} 100%{width:100%} }
                * { scrollbar-width: thin; scrollbar-color: #c8d5c8 #f0f5f0; }
                *::-webkit-scrollbar { width: 6px; }
                *::-webkit-scrollbar-track { background: #f0f5f0; }
                *::-webkit-scrollbar-thumb { background: #c8d5c8; border-radius: 10px; }
                button:hover { opacity: 0.82; }
            `}</style>
            <Header stations={stations} selectedStation={selectedStation} onStationChange={s => setSelectedStation(s)} />
            <div style={styles.body}>
                <Sidebar stations={stations} selectedStation={selectedStation} onStationChange={s => setSelectedStation(s)} />
                <Dashboard stations={stations} selectedStation={selectedStation} historyData={historyData} />
                <RightPannel stations={stations} selectedStation={selectedStation} />
            </div>
            <Chatbot stations={stations} />
        </div>
    )
}

const styles = {
    container: {
        display: "flex", flexDirection: "column",
        height: "100vh", width: "100%",
        margin: 0, padding: 0, boxSizing: "border-box",
        backgroundColor: "#dcf7dc",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
    },
    body: { display: "flex", flex: 1, overflow: "hidden" },
    loadingScreen: {
        display: "flex", justifyContent: "center", alignItems: "center",
        height: "100vh", backgroundColor: "#dcf7dc",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
    },
    loadingBox: {
        display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
        padding: "44px 52px",
        backgroundColor: "#fff",
        border: "2px solid #d6dfd6",
        borderRadius: "14px",
    },
    loadingEmoji: { fontSize: "44px" },
    loadingTitle: { fontSize: "26px", fontWeight: "800", color: "#1c2e1c", letterSpacing: "-0.3px" },
    loadingSubtitle: { fontSize: "13px", color: "#8a9e8a", fontWeight: "500" },
    barTrack: {
        width: "200px", height: "4px",
        backgroundColor: "#e8f0e8", borderRadius: "10px",
        overflow: "hidden", marginTop: "6px",
    },
    barFill: {
        height: "100%", backgroundColor: "#5a8a6a",
        borderRadius: "10px",
        animation: "slide 1.6s ease-in-out infinite",
    },
    loadingNote: { fontSize: "12px", color: "#9aaa9a", fontWeight: "500" },
}

export default MainLayout
