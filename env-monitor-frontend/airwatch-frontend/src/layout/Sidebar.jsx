import { useState } from 'react';

function Sidebar({ stations, selectedStation, onStationChange }) {
    const [pollutants, setPollutants] = useState({
        'PM2.5': true, 'PM10': false, 'NO2': false, 'SO2': false, 'O3': false
    });

    const handleCheckboxChange = (p) => setPollutants({ ...pollutants, [p]: !pollutants[p] });

    const getAQIColor = (aqi) => {
        if (aqi <= 50) return '#75d093';
        if (aqi <= 100) return '#e4b547';
        if (aqi <= 150) return '#d44a31';
        if (aqi <= 200) return '#eb4040';
        return '#ff0000';
    };

    const getAlertType = (aqi) => {
        if (aqi <= 100) return null;
        if (aqi <= 150) return { color: '#ec8428', bg: '#ffbc79' };
        if (aqi <= 200) return { color: '#cf3636', bg: '#a3393982' };
        return { color: '#000000', bg: '#f81111c5' };
    };

    const alertStations = stations.filter(s => s.aqi > 100);

    return (
        <aside style={styles.sidebar}>

            <div style={styles.titleRow}>
                <span style={styles.titleIcon}>◈</span>
                <div>
                    <div style={styles.title}>Filters & Stations</div>
                </div>
            </div>

            <div style={styles.rule} />

            {/* Pollutants */}
            <div style={styles.section}>
                <div style={styles.sectionLabel}>Pollutants</div>
                {Object.keys(pollutants).map(p => {
                    const disabled = ['NO2','SO2','O3'].includes(p);
                    return (
                        <label key={p} style={{ ...styles.checkRow, opacity: disabled ? 0.35 : 1 }}>
                            <div style={{
                                ...styles.box,
                                backgroundColor: pollutants[p] && !disabled ? '#5a8a6a' : '#fff',
                                borderColor: pollutants[p] && !disabled ? '#5a8a6a' : '#c0cec0',
                            }}>
                                {pollutants[p] && !disabled && <span style={styles.tick}>✓</span>}
                            </div>
                            <input type="checkbox" checked={pollutants[p]}
                                onChange={() => handleCheckboxChange(p)}
                                style={{ display: 'none' }} disabled={disabled} />
                            <span style={styles.pollutantText}>
                                {p}
                                {disabled && <span style={styles.soon}>soon</span>}
                            </span>
                        </label>
                    );
                })}
            </div>

            <div style={styles.rule} />

            {/* Stations */}
            <div style={styles.section}>
                <div style={styles.sectionLabel}>Monitoring Stations</div>
                {stations.length === 0 ? (
                    <div style={styles.empty}>Loading stations...</div>
                ) : stations.map(station => (
                    <div key={station.id}
                        style={{
                            ...styles.stationRow,
                            backgroundColor: station.id === selectedStation ? '#edf4ed' : 'transparent',
                            borderLeft: station.id === selectedStation ? '3px solid #5a8a6a' : '3px solid transparent',
                        }}
                        onClick={() => onStationChange(station.id)}
                    >
                        <div style={styles.stationLeft}>
                            <div style={{
                                ...styles.dot,
                                backgroundColor: station.aqi > 0 ? '#5a8a6a' : '#b05050',
                            }} />
                            <div>
                                <div style={{
                                    ...styles.stationName,
                                    fontWeight: station.id === selectedStation ? '700' : '500',
                                    color: station.id === selectedStation ? '#1c2e1c' : '#3a4e3a',
                                }}>{station.name}</div>
                                <div style={styles.stationSub}>PM2.5: {station.PM25} μg/m³</div>
                            </div>
                        </div>
                        <div style={{
                            ...styles.aqiPill,
                            color: getAQIColor(station.aqi),
                            backgroundColor: getAQIColor(station.aqi) + '14',
                            border: `1px solid ${getAQIColor(station.aqi)}35`,
                        }}>{station.aqi}</div>
                    </div>
                ))}
            </div>

            <div style={styles.rule} />

            {/* Alerts */}
            <div style={styles.section}>
                <div style={styles.sectionLabel}>Active Alerts</div>
                {alertStations.length === 0 ? (
                    <div style={styles.noAlerts}>
                        <span style={{ color: '#5a8a6a' }}>✓</span> All stations are clear
                    </div>
                ) : alertStations.map(station => {
                    const alert = getAlertType(station.aqi);
                    return (
                        <div key={station.id} style={{ ...styles.alertRow, backgroundColor: alert.bg }}>
                            <span style={{ fontSize: '13px' }}>⚠</span>
                            <div>
                                <div style={{ ...styles.alertTitle, color: alert.color }}>
                                    {station.aqi <= 150 ? 'Moderate Alert' : 'Unhealthy Alert'}
                                </div>
                                <div style={styles.alertSub}>{station.name} — AQI {station.aqi}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}

const styles = {
    sidebar: {
        width: "320px",
        backgroundColor: "#dcf7dc",
        padding: "22px 20px",
        boxSizing: "border-box",
        overflowY: "auto",
        borderRight: "2px solid #d6dfd6",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        flexShrink: 0,
    },
    titleRow: {
        display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px",
    },
    titleIcon: { fontSize: "18px", color: "#7aaa8a" },
    title: { fontSize: "18px", fontWeight: "800", color: "#0d1f0d" },
    rule: { height: "1.5px", backgroundColor: "#d6dfd6", margin: "16px 0" },
    section: { marginBottom: "4px" },
    sectionLabel: {
        fontSize: "11px", fontWeight: "700", color: "#4a6a4a",
        letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: "12px",
    },
    checkRow: {
        display: "flex", alignItems: "center", gap: "10px",
        marginBottom: "10px", cursor: "pointer",
    },
    box: {
        width: "18px", height: "18px",
        border: "1.5px solid #c0cec0", borderRadius: "3px",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
    },
    tick: { fontSize: "12px", color: "#fff", fontWeight: "900", lineHeight: 1 },
    pollutantText: {
        fontSize: "15px", color: "#1a2e1a", fontWeight: "600",
        display: "flex", alignItems: "center", gap: "8px",
    },
    soon: {
        fontSize: "10px", color: "#7a8e7a",
        backgroundColor: "#d8eed8",
        padding: "1px 6px", borderRadius: "3px", fontWeight: "600",
    },
    stationRow: {
        display: "flex", justifyContent: "space-between",
        alignItems: "center", padding: "10px 12px",
        marginBottom: "4px", cursor: "pointer",
        borderRadius: "6px", transition: "all 0.15s",
    },
    stationLeft: { display: "flex", alignItems: "center", gap: "10px" },
    dot: { width: "9px", height: "9px", borderRadius: "50%", flexShrink: 0 },
    stationName: { fontSize: "15px" },
    stationSub: { fontSize: "12px", color: "#4a6a4a", marginTop: "2px" },
    aqiPill: {
        padding: "3px 10px", borderRadius: "4px",
        fontSize: "14px", fontWeight: "800",
    },
    alertRow: {
        display: "flex", gap: "10px", alignItems: "flex-start",
        padding: "10px 12px", borderRadius: "6px", marginBottom: "6px",
    },
    alertTitle: { fontSize: "14px", fontWeight: "700", marginBottom: "2px" },
    alertSub: { fontSize: "13px", color: "#4a6a4a" },
    empty: { fontSize: "14px", color: "#6a8a6a", padding: "10px 0" },
    noAlerts: {
        display: "flex", alignItems: "center", gap: "8px",
        fontSize: "14px", color: "#3a6a4a", fontWeight: "600",
        padding: "10px 12px", backgroundColor: "#d4f0d4", borderRadius: "6px",
    },
};

export default Sidebar;
