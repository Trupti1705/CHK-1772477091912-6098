export default function Header({ stations, selectedStation, onStationChange }) {

    const currentStation = stations.find(s => s.id == selectedStation);

    const getAQIColor = (aqi) => {
        if (aqi <= 50) return '#75d093';
        if (aqi <= 100) return '#e4b547';
        if (aqi <= 150) return '#d44a31';
        if (aqi <= 200) return '#eb4040';
        return '#ff0000';
    };

    const getAQILabel = (aqi) => {
        if (aqi <= 50) return 'Good';
        if (aqi <= 100) return 'Moderate';
        if (aqi <= 150) return 'Sensitive';
        if (aqi <= 200) return 'Unhealthy';
        return 'Danger';
    };

    return (
        <header style={styles.header}>
            <div style={styles.left}>
                <div style={styles.logoBox}>🌍</div>
                <div>
                    <div style={styles.brandName}>VayuSena</div>
                    <div style={styles.tagline}>Real-time Air Quality Monitoring</div>
                </div>
            </div>

            <div style={styles.right}>
                <div style={styles.liveChip}>
                    <div style={styles.liveDot} />
                    <span style={styles.liveText}>Live</span>
                </div>

                <select value={selectedStation} onChange={e => onStationChange(e.target.value)} style={styles.select}>
                    {stations.map(s => <option key={s.id} value={s.id}> {s.name}</option>)}
                </select>

                {currentStation && (
                    <div style={{ ...styles.aqiBadge, borderColor: getAQIColor(currentStation.aqi) + '60' }}>
                        <span style={styles.aqiLabel}>AQI</span>
                        <span style={{ ...styles.aqiNum, color: getAQIColor(currentStation.aqi) }}>{currentStation.aqi}</span>
                        <span style={{ ...styles.aqiTag, color: getAQIColor(currentStation.aqi) + 'cc' }}>{getAQILabel(currentStation.aqi)}</span>
                    </div>
                )}
            </div>
        </header>
    );
}

const styles = {
    header: {
        height: "62px",
        backgroundColor: "#dcf7dc",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 28px",
        width: "100%",
        boxSizing: "border-box",
        borderBottom: "2px solid #d6dfd6",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        flexShrink: 0,
    },
    left: { display: "flex", alignItems: "center", gap: "13px" },
    logoBox: {
        width: "36px", height: "36px",
        backgroundColor: "#e4ede4",
        border: "1.5px solid #c8d5c8",
        borderRadius: "7px",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "19px", flexShrink: 0,
    },
    brandName: {
        fontSize: "17px", fontWeight: "800",
        color: "#1c2e1c", lineHeight: 1, letterSpacing: "-0.2px",
    },
    tagline: {
        fontSize: "11px", color: "#849484", marginTop: "3px", fontWeight: "500",
    },
    right: { display: "flex", alignItems: "center", gap: "10px" },
    liveChip: {
        display: "flex", alignItems: "center", gap: "6px",
        backgroundColor: "#ecf4ec",
        border: "1.5px solid #c8d5c8",
        borderRadius: "5px", padding: "5px 12px",
    },
    liveDot: {
        width: "7px", height: "7px",
        backgroundColor: "#5a8a6a", borderRadius: "50%",
        animation: "pulse 2s infinite",
    },
    liveText: { fontSize: "12px", color: "#4a6e5a", fontWeight: "700" },
    select: {
        fontSize: "13px", backgroundColor: "#fff",
        color: "#2a3a2a", padding: "6px 11px",
        border: "1.5px solid #c8d5c8", borderRadius: "5px",
        cursor: "pointer", fontWeight: "600",
        outline: "none", fontFamily: "'Inter', 'Segoe UI', sans-serif",
    },
    aqiBadge: {
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "4px 16px", minWidth: "76px",
        border: "1.5px solid", borderRadius: "5px",
        backgroundColor: "#fafcfa",
    },
    aqiLabel: { fontSize: "9px", color: "#a0b0a0", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase" },
    aqiNum: { fontSize: "19px", fontWeight: "800", lineHeight: 1.1 },
    aqiTag: { fontSize: "10px", fontWeight: "600", marginTop: "1px" },
};
