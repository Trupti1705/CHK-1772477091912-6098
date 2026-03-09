import { PieChart, Pie, Cell } from 'recharts';

function RightPannel({ stations, selectedStation }) {
    const currentStation = stations.find(s => s.id === selectedStation);

    if (!currentStation) {
        return (
            <aside style={styles.panel}>
                <div style={styles.loading}>Loading station data...</div>
            </aside>
        );
    }

    const getHealthAdvisory = (aqi) => {
        if (aqi <= 50) return {
            title: 'Good Air Quality', icon: '🌿',
            advice: ["Air quality is satisfactory", "Outdoor activities are safe", "No precautions needed"],
            color: '#4a7a5a', bg: '#f0f7f0',
        };
        if (aqi <= 100) return {
            title: "Moderate", icon: '🌤',
            advice: ["Sensitive people limit exertion", "Generally safe for most"],
            color: '#7a7040', bg: '#f7f5ec',
        };
        if (aqi <= 150) return {
            title: "Unhealthy for Sensitive", icon: '⚠',
            advice: ["Sensitive groups limit outdoors", "Wear masks if outside", "Keep windows closed"],
            color: '#8a5a30', bg: '#f7f2ec',
        };
        if (aqi <= 200) return {
            title: "Unhealthy", icon: '🔴',
            advice: ["Avoid outdoor activities", "Wear N95 masks", "Use air purifiers"],
            color: '#7a3535', bg: '#f7efef',
        };
        return {
            title: "Very Unhealthy", icon: '🚨',
            advice: ["Stay indoors", "Avoid all outdoors", "Seek medical help if needed"],
            color: '#5a2020', bg: '#f5eaea',
        };
    };

    const getDominantPollutant = (s) => {
        const p = { 'PM2.5': s.PM25, 'PM10': s.PM10, 'NO2': s.NO2, 'SO2': s.SO2, 'O3': s.O3 };
        let max = 'PM2.5', maxVal = s.PM25;
        for (const [name, value] of Object.entries(p)) {
            if (value > maxVal) { maxVal = value; max = name; }
        }
        return { name: max, value: maxVal };
    };

    // Convert MQ135 and MQ7 raw values into meaningful sensor readings
    // MQ135 primarily detects CO2/NH3/benzene — raw value mapped to approximate ppm
    // MQ7 primarily detects CO — raw value mapped to approximate CO ppm
    const getSensorBreakdown = (s) => {
        const mq135Raw = s.mq135 || 0;
        const mq7Raw = s.mq7co || 0;

        // MQ135: approximate CO2-equivalent ppm (raw 0–1023 → ~400–5000 ppm range)
        const co2Equiv = Math.round(400 + (mq135Raw / 1023) * 4600);
        // MQ135: approximate NH3 in ppm (rough conversion, ~0–50 ppm range)
        const nh3 = Math.round((mq135Raw / 1023) * 50 * 10) / 10;
        // MQ7: CO in ppm (raw 0–1023 → ~1–1000 ppm range, log scale approx)
        const co = Math.round(1 + (mq7Raw / 1023) * 999);
        // PM2.5 and PM10 directly
        const pm25 = s.PM25 || 0;
        const pm10 = s.PM10 || 0;

        // Normalize for donut chart (show relative proportions of pollutant load)
        const total = pm25 + pm10 + (co2Equiv / 100) + nh3 + (co / 10);
        if (total === 0) return { segments: [], readings: [] };

        return {
            segments: [
                { name: 'PM2.5', value: Math.max(1, Math.round((pm25 / total) * 100)), color: '#3b82f6' },
                { name: 'PM10',  value: Math.max(1, Math.round((pm10  / total) * 100)), color: '#f97316' },
                { name: 'CO₂ eq', value: Math.max(1, Math.round(((co2Equiv/100) / total) * 100)), color: '#a855f7' },
                { name: 'NH₃',   value: Math.max(1, Math.round((nh3   / total) * 100)), color: '#e4b547' },
                { name: 'CO',    value: Math.max(1, Math.round(((co/10) / total) * 100)), color: '#eb4040' },
            ],
            readings: [
                { label: 'PM2.5',   value: `${pm25} μg/m³`,    color: '#3b82f6' },
                { label: 'PM10',    value: `${pm10} μg/m³`,    color: '#f97316' },
                { label: 'CO₂ eq',  value: `${co2Equiv} ppm`,  color: '#a855f7' },
                { label: 'NH₃',     value: `${nh3} ppm`,       color: '#e4b547' },
                { label: 'CO',      value: `${co} ppm`,        color: '#eb4040' },
            ],
        };
    };

    const handleExport = () => {
        let csv = 'Station Name,AQI,PM2.5,PM10,NO2,SO2,O3,MQ135,MQ7_CO,Timestamp\n';
        stations.forEach(s => {
            csv += `${s.name},${s.aqi},${s.PM25},${s.PM10},${s.NO2},${s.SO2},${s.O3},${s.mq135},${s.mq7co},${s.timestamp}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `airwatch-${Date.now()}.csv`; a.click();
        window.URL.revokeObjectURL(url);
    };

    const dominant = getDominantPollutant(currentStation);
    const advisory = getHealthAdvisory(currentStation.aqi);
    const { segments, readings } = getSensorBreakdown(currentStation);

    return (
        <aside style={styles.panel}>

            {/* Advisory */}
            <div style={{ ...styles.advisoryBox, backgroundColor: advisory.bg }}>
                <div style={styles.advisoryHeader}>
                    <span style={{ fontSize: '17px' }}>{advisory.icon}</span>
                    <span style={{ ...styles.advisoryTitle, color: advisory.color }}>Health Advisory</span>
                </div>
                <div style={{ ...styles.advisoryStatus, color: advisory.color }}>{advisory.title}</div>
                <ul style={styles.advisoryList}>
                    {advisory.advice.map((item, i) => (
                        <li key={i} style={{ color: advisory.color + 'cc' }}>{item}</li>
                    ))}
                </ul>
            </div>

            <div style={styles.rule} />

            {/* Quick Stats */}
            <div style={styles.sectionLabel}>Quick Stats</div>

            <div style={styles.statRow}>
                <div style={styles.statCard}>
                    <div style={styles.statLabel}>Dominant</div>
                    <div style={styles.statVal}>{dominant.name}</div>
                    <div style={styles.statSub}>{dominant.value} μg/m³</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statLabel}>24h Change</div>
                    <div style={{ ...styles.statVal, color: '#7a3535' }}>+15%</div>
                    <div style={{ ...styles.statSub, color: '#7a3535' }}>↑ Worsening</div>
                </div>
            </div>

            <div style={styles.rule} />

            {/* Prediction */}
            <div style={styles.predBox}>
                <div style={styles.advisoryHeader}>
                    <span style={{ fontSize: '14px' }}>🔮</span>
                    <span style={styles.predTitle}>24h Prediction</span>
                </div>
                {[
                    { label: 'Expected AQI', value: '175–186' },
                    { label: 'Peak hours', value: '8–10 AM, 5–8 PM' },
                    { label: 'Confidence', value: '85%' },
                ].map(row => (
                    <div key={row.label} style={styles.predRow}>
                        <span style={styles.predLabel}>{row.label}</span>
                        <span style={styles.predVal}>{row.value}</span>
                    </div>
                ))}
            </div>

            {/* Buttons */}
            <div style={styles.btnGroup}>
                <button style={{ ...styles.btn, ...styles.btnPrimary }}>📊 View Reports</button>
                <button style={{ ...styles.btn, ...styles.btnSecondary }}>➕ Add Report</button>
                <button style={{ ...styles.btn, ...styles.btnOutline }} onClick={handleExport}>📥 Export Data</button>
            </div>

            <div style={styles.rule} />

            {/* Sensor Breakdown */}
            <div style={styles.sectionLabel}>Sensor Breakdown</div>
            <div style={styles.sensorNote}>MQ135 · MQ7 converted values</div>

            <div style={styles.chartWrap}>
                <PieChart width={190} height={190}>
                    <Pie
                        data={segments.length > 0 ? segments : [{ name: 'N/A', value: 1, color: '#e8f0e8' }]}
                        cx={95} cy={95} innerRadius={55} outerRadius={78}
                        paddingAngle={3} dataKey="value" stroke="none"
                    >
                        {(segments.length > 0 ? segments : [{ color: '#e8f0e8' }]).map((e, i) => (
                            <Cell key={i} fill={e.color} />
                        ))}
                    </Pie>
                    <text x={95} y={88} textAnchor="middle" dominantBaseline="middle"
                        style={{ fontSize: '12px', fill: '#8a9e8a', fontWeight: '600', fontFamily: "'Inter',sans-serif" }}>AQI</text>
                    <text x={95} y={108} textAnchor="middle" dominantBaseline="middle"
                        style={{ fontSize: '28px', fill: '#1c2e1c', fontWeight: '800', fontFamily: "'Inter',sans-serif" }}>
                        {currentStation.aqi}
                    </text>
                </PieChart>

                <div style={styles.legend}>
                    {readings.map((item, i) => (
                        <div key={i} style={styles.legendItem}>
                            <div style={{ ...styles.legendDot, backgroundColor: item.color }} />
                            <span style={styles.legendText}>{item.label}</span>
                            <span style={{ ...styles.legendPct, color: item.color }}>{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={styles.liveRow}>
                <div style={styles.liveDot} />
                <span style={styles.liveText}>Live updates active</span>
            </div>
        </aside>
    );
}

const styles = {
    panel: {
        width: "300px",
        backgroundColor: "#dcf7dc",
        padding: "18px",
        boxSizing: "border-box",
        overflowY: "auto",
        borderLeft: "2px solid #d6dfd6",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        flexShrink: 0,
    },
    loading: { textAlign: 'center', padding: '40px 0', color: '#9aaa9a', fontSize: '15px' },
    advisoryBox: { borderRadius: "8px", padding: "14px", marginBottom: "4px" },
    advisoryHeader: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" },
    advisoryTitle: { fontSize: "15px", fontWeight: "700" },
    advisoryStatus: { fontSize: "15px", fontWeight: "700", marginBottom: "8px" },
    advisoryList: {
        margin: 0, paddingLeft: "18px",
        lineHeight: "2", fontSize: "13px", fontWeight: "500",
    },
    rule: { height: "1.5px", backgroundColor: "#d6dfd6", margin: "14px 0" },
    sectionLabel: {
        fontSize: "11px", fontWeight: "700", color: "#6a8a6a",
        letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: "10px",
    },
    sensorNote: {
        fontSize: "11px", color: "#9aaa9a", fontWeight: "500",
        marginTop: "-6px", marginBottom: "10px",
    },
    statRow: { display: "flex", gap: "10px", marginBottom: "4px" },
    statCard: {
        flex: 1, backgroundColor: "#fff",
        border: "1.5px solid #d6dfd6", borderRadius: "8px", padding: "12px",
    },
    statLabel: { fontSize: "11px", color: "#9aaa9a", fontWeight: "600", marginBottom: "5px" },
    statVal: { fontSize: "22px", fontWeight: "800", color: "#1c2e1c", lineHeight: 1 },
    statSub: { fontSize: "12px", color: "#8a9e8a", marginTop: "3px" },
    predBox: {
        backgroundColor: "#fff",
        border: "1.5px solid #d6dfd6", borderRadius: "8px",
        padding: "12px", marginBottom: "12px",
    },
    predTitle: { fontSize: "13px", fontWeight: "700", color: "#3a4e3a" },
    predRow: {
        display: "flex", justifyContent: "space-between",
        alignItems: "center", padding: "6px 0",
        borderBottom: "1px solid #f0f5f0",
    },
    predLabel: { fontSize: "13px", color: "#7a8e7a", fontWeight: "500" },
    predVal: { fontSize: "13px", color: "#1c2e1c", fontWeight: "700" },
    btnGroup: { display: "flex", flexDirection: "column", gap: "7px", marginBottom: "4px" },
    btn: {
        padding: "10px 14px", border: "1.5px solid",
        borderRadius: "7px", fontSize: "14px", fontWeight: "700",
        cursor: "pointer", textAlign: "left",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        transition: "opacity 0.15s",
    },
    btnPrimary: { backgroundColor: "#2a3e2a", color: "#f0f7f0", borderColor: "#2a3e2a" },
    btnSecondary: { backgroundColor: "#edf4ed", color: "#2a4a2a", borderColor: "#c8d5c8" },
    btnOutline: { backgroundColor: "#fff", color: "#5a6e5a", borderColor: "#d6dfd6" },
    chartWrap: {
        backgroundColor: "#fff", border: "1.5px solid #d6dfd6",
        borderRadius: "8px", padding: "14px",
        display: "flex", flexDirection: "column", alignItems: "center",
        marginBottom: "10px",
    },
    legend: { width: "100%", display: "flex", flexDirection: "column", gap: "7px", marginTop: "6px" },
    legendItem: { display: "flex", alignItems: "center", gap: "8px" },
    legendDot: { width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0 },
    legendText: { fontSize: "13px", color: "#3a4e3a", fontWeight: "600", flex: 1 },
    legendPct: { fontSize: "13px", fontWeight: "700" },
    liveRow: {
        display: "flex", alignItems: "center", gap: "7px",
        paddingTop: "10px", borderTop: "1px solid #e8f0e8",
    },
    liveDot: {
        width: "8px", height: "8px",
        backgroundColor: "#5a8a6a", borderRadius: "50%",
        animation: "pulse 2s infinite",
    },
    liveText: { fontSize: "13px", color: "#8a9e8a", fontWeight: "500" },
};

export default RightPannel;
