import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import 'leaflet/dist/leaflet.css';
function MapController({ center, zoom }) {
    const map = useMap();
    useEffect(() => { map.setView(center, zoom, { animate: true }); }, [center, zoom, map]);
    return null;
}

function Dashboard({ stations, selectedStation, historyData }) {
    const [activeTab, setActiveTab] = useState('trends');

    const currentStation = stations.find(s => s.id === selectedStation);
    const mapCenter = currentStation ? currentStation.position : [18.6410, 73.7770];
    const mapZoom = 14;
    const graphData = historyData.slice(-24);

    const getColor = (aqi) => {
        if (aqi <= 50) return '#75d093';
        if (aqi <= 100) return '#e4b547';
        if (aqi <= 150) return '#d44a31';
        if (aqi <= 200) return '#eb4040';
        return '#ff0000';
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: '#fff',
                    border: '1.5px solid #d6dfd6',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
                    fontFamily: "'Inter', 'Segoe UI', sans-serif",
                }}>
                    <p style={{ color: '#8a9e8a', fontWeight: '600', fontSize: '11px', margin: '0 0 5px 0' }}>{label}</p>
                    {payload.map((p, i) => (
                        <p key={i} style={{ color: '#1c2e1c', margin: '3px 0', fontSize: '13px', fontWeight: '600' }}>
                            <span style={{ color: p.stroke }}>{p.name}:</span> {p.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div style={styles.container}>

            {/* Header */}
            <div style={styles.header}>
                <div>
                    <div style={styles.titleAccent}>Monitoring</div>
                    <h3 style={styles.title}>{currentStation?.name || 'Pune Region'}</h3>
                </div>
                <div style={styles.livePill}>
                    <div style={styles.liveDot} />
                    <span style={styles.liveText}>Live Firebase</span>
                </div>
            </div>

            {/* Map */}
            <div style={styles.mapWrapper}>
                <MapContainer center={mapCenter} zoom={mapZoom} style={styles.map}>
                    <MapController center={mapCenter} zoom={mapZoom} />
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                    {stations.map(station => (
                        <CircleMarker key={station.id} center={station.position} radius={18}
                            pathOptions={{ color: '#fff', fillColor: getColor(station.aqi), fillOpacity: 0.85, weight: 2 }}
                        >
                            <Popup>
                                <div style={{ fontFamily: "'Inter', sans-serif", minWidth: '130px', textAlign: 'center' }}>
                                    <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '700', color: '#1c2e1c' }}>{station.name}</h4>
                                    <p style={{ margin: '3px 0', fontSize: '12px', color: '#5a6e5a' }}><b>PM2.5:</b> {station.PM25} μg/m³</p>
                                    <p style={{ margin: '3px 0', fontSize: '12px', color: '#5a6e5a' }}><b>PM10:</b> {station.PM10} μg/m³</p>
                                    <p style={{ margin: '8px 0 0', fontSize: '16px', fontWeight: '800', color: getColor(station.aqi) }}>AQI {station.aqi}</p>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}
                </MapContainer>
            </div>

            {/* Legend */}
            <div style={styles.legend}>
                <span style={styles.legendTitle}>AQI Scale</span>
                {[
                    { color: '#00E400', label: 'Good', range: '0–50' },
                    { color: '#FFFF00', label: 'Moderate', range: '51–100' },
                    { color: '#FF7E00', label: 'Sensitive', range: '101–150' },
                    { color: '#FF0000', label: 'Unhealthy', range: '151–200' },
                    { color: '#7E0023', label: 'Very Bad', range: '201+' },
                ].map(item => (
                    <div key={item.label} style={styles.legendItem}>
                        <div style={{ ...styles.legendDot, backgroundColor: item.color }} />
                        <span style={styles.legendLabel}>{item.label}</span>
                        <span style={styles.legendRange}>{item.range}</span>
                    </div>
                ))}
            </div>

            {/* Tabs + Chart */}
            <div style={styles.tabsSection}>
                <div style={styles.tabsBar}>
                    {['trends', 'comparison'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            style={activeTab === tab ? styles.activeTab : styles.tab}>
                            {tab === 'trends' ? 'Trends' : 'Comparison'}
                        </button>
                    ))}
                </div>

                <div style={styles.contentArea}>
                    {activeTab === 'trends' && (
                        <div>
                            <div style={styles.chartTitleRow}>
                                <h4 style={styles.chartTitle}>Air Quality Trends</h4>
                                <span style={styles.chartSub}>Last 24 readings</span>
                            </div>
                            <ResponsiveContainer width="100%" height={270}>
                                <LineChart data={graphData} margin={{ bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#eaf0ea" />
                                    <XAxis dataKey="time" stroke="#c0cec0" strokeWidth={1.5}
                                        tick={{ fill: '#5a6e5a', fontSize: 12, fontFamily: "'Inter','Segoe UI'", fontWeight: '600' }}
                                        angle={-45} textAnchor="end" height={75} interval={0} tickMargin={10} />
                                    <YAxis stroke="#c0cec0" strokeWidth={1.5}
                                        tick={{ fill: '#5a6e5a', fontSize: 12, fontFamily: "'Inter','Segoe UI'", fontWeight: '600' }}
                                        width={44} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="aqi" stroke="#e42f1b" strokeWidth={2.5}
                                        dot={{ fill: '#000000', r: 3.5, strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} name="AQI" />
                                    <Line type="monotone" dataKey="temperature" stroke="#e100ff" strokeWidth={2}
                                        dot={{ fill: '#4a7a5a', r: 3, stroke: '#fff', strokeWidth: 1.5 }} name="Temp (°C)" />
                                    <Line type="monotone" dataKey="humidity" stroke="#00d9ff" strokeWidth={2}
                                        dot={{ fill: '#5a6e8a', r: 3, stroke: '#fff', strokeWidth: 1.5 }} name="Humidity (%)" />
                                </LineChart>
                            </ResponsiveContainer>
                            <div style={styles.chartLegend}>
                                {[{ color: '#e42f1b', label: 'AQI' }, { color: '#e100ff', label: 'Temperature' }, { color: '#00d9ff', label: 'Humidity' }].map(item => (
                                    <div key={item.label} style={styles.chartLegendItem}>
                                        <div style={{ width: '18px', height: '3px', backgroundColor: item.color, borderRadius: '2px' }} />
                                        <span style={{ color: '#6a7e6a', fontSize: '12px', fontWeight: '600' }}>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'comparison' && (
                        <div>
                            <div style={styles.chartTitleRow}>
                                <h4 style={styles.chartTitle}>Station Comparison</h4>
                                <span style={styles.chartSub}>{stations.length} stations</span>
                            </div>
                            <div style={styles.compGrid}>
                                {stations.map(station => (
                                    <div key={station.id} style={{
                                        ...styles.compCard,
                                        borderColor: station.id === selectedStation ? getColor(station.aqi) + '55' : '#d6dfd6',
                                        backgroundColor: station.id === selectedStation ? '#f5faf5' : '#fff',
                                    }}>
                                        <div style={styles.compName}>{station.name}</div>
                                        <div style={{ ...styles.compAqi, color: getColor(station.aqi) }}>{station.aqi}</div>
                                        <div style={styles.compDetail}>PM2.5: {station.PM25} μg/m³</div>
                                        <div style={styles.compDetail}>PM10: {station.PM10} μg/m³</div>
                                        <div style={{
                                            ...styles.compBadge,
                                            color: getColor(station.aqi),
                                            backgroundColor: getColor(station.aqi) + '14',
                                        }}>
                                            {station.aqi <= 50 ? 'Good' : station.aqi <= 100 ? 'Moderate' :
                                                station.aqi <= 150 ? 'Sensitive' : station.aqi <= 200 ? 'Unhealthy' : 'Very Bad'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: "20px",
        backgroundColor: "#dcf7dc",
        flex: 1,
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
    },
    header: {
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
    },
    titleAccent: {
        fontSize: "10px", color: "#7aaa8a",
        fontWeight: "700", letterSpacing: "1.5px",
        textTransform: "uppercase", marginBottom: "4px",
    },
    title: { fontSize: "22px", fontWeight: "800", color: "#1c2e1c", margin: 0 },
    livePill: {
        display: "flex", alignItems: "center", gap: "7px",
        backgroundColor: "#ecf4ec",
        border: "1.5px solid #c8d5c8",
        borderRadius: "5px", padding: "6px 14px",
    },
    liveDot: {
        width: "7px", height: "7px",
        backgroundColor: "#5a8a6a", borderRadius: "50%",
        animation: "pulse 2s infinite",
    },
    liveText: { fontSize: "12px", color: "#4a6e5a", fontWeight: "600" },
    mapWrapper: {
        borderRadius: "10px", overflow: "hidden",
        border: "2px solid #d6dfd6",
        flexShrink: 0,
    },
    map: { height: '560px', width: '100%' },
    legend: {
        display: "flex", alignItems: "center", gap: "18px",
        padding: "10px 16px",
        backgroundColor: "#fff",
        border: "1.5px solid #d6dfd6",
        borderRadius: "7px",
        flexWrap: "wrap", flexShrink: 0,
    },
    legendTitle: { fontSize: "11px", fontWeight: "700", color: "#8a9e8a", flexShrink: 0 },
    legendItem: { display: "flex", alignItems: "center", gap: "6px" },
    legendDot: { width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0 },
    legendLabel: { fontSize: "12px", color: "#3a4e3a", fontWeight: "600" },
    legendRange: { fontSize: "11px", color: "#9aaa9a" },
    tabsSection: {
        backgroundColor: "#fff",
        border: "1.5px solid #d6dfd6",
        borderRadius: "10px",
        overflow: "hidden",
    },
    tabsBar: {
        display: "flex", borderBottom: "1.5px solid #d6dfd6",
        backgroundColor: "#f5f7f5", padding: "6px 6px 0", gap: "4px",
    },
    tab: {
        padding: "9px 20px", border: "none",
        backgroundColor: "transparent", borderRadius: "6px 6px 0 0",
        cursor: "pointer", fontSize: "13px",
        fontWeight: "600", color: "#8a9e8a",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
    },
    activeTab: {
        padding: "9px 20px", border: "none",
        backgroundColor: "#fff", borderRadius: "6px 6px 0 0",
        cursor: "pointer", fontSize: "13px",
        fontWeight: "700", color: "#1c2e1c",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        borderBottom: "2px solid #5a8a6a",
        marginBottom: "-1.5px",
    },
    contentArea: { padding: "20px 22px" },
    chartTitleRow: {
        display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "14px",
    },
    chartTitle: { margin: 0, fontSize: "16px", fontWeight: "800", color: "#1c2e1c" },
    chartSub: { fontSize: "12px", color: "#9aaa9a", fontWeight: "500" },
    chartLegend: {
        display: "flex", gap: "18px",
        marginTop: "12px", paddingTop: "12px",
        borderTop: "1px solid #eaf0ea",
    },
    chartLegendItem: { display: "flex", alignItems: "center", gap: "7px" },
    compGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "14px", marginTop: "14px",
    },
    compCard: {
        padding: "20px", textAlign: "center",
        borderRadius: "9px", border: "1.5px solid",
        transition: "all 0.15s",
    },
    compName: { fontSize: "12px", fontWeight: "700", color: "#6a7e6a", marginBottom: "8px" },
    compAqi: { fontSize: "48px", fontWeight: "800", lineHeight: 1, margin: "6px 0" },
    compDetail: { fontSize: "12px", color: "#8a9e8a", marginBottom: "4px" },
    compBadge: {
        display: "inline-block", padding: "4px 12px",
        borderRadius: "4px", fontSize: "11px",
        fontWeight: "700", marginTop: "10px",
    },
};

export default Dashboard;
