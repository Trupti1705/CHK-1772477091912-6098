export default function RouteCard({ name, distance, duration, avgAQI, aqiLevel, aqiColor, isRecommended }) {

    const getAQIBg = (color) => {
        if (color === '#16a34a') return '#f0fdf4'
        if (color === '#d97706') return '#fffbeb'
        if (color === '#dc2626') return '#fef2f2'
        return '#faf5ff'
    }

    const progressWidth = Math.min((avgAQI / 300) * 100, 100)

    return (
        <div style={{
            ...styles.card,
            borderLeft: `5px solid ${aqiColor}`,
        }}>

            {/* Header */}
            <div style={styles.header}>
                <div style={styles.nameRow}>
                    <h3 style={styles.routeName}>{name}</h3>
                    {isRecommended && (
                        <span style={styles.badge}>★ SELECTED</span>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div style={styles.statsGrid}>

                <div style={styles.statBox}>
                    <span style={styles.statLabel}>DISTANCE</span>
                    <span style={styles.statValue}>{distance}</span>
                </div>

                <div style={styles.statBox}>
                    <span style={styles.statLabel}>DURATION</span>
                    <span style={styles.statValue}>{duration}</span>
                </div>

                <div style={{
                    ...styles.statBox,
                    ...styles.aqiStatBox,
                    backgroundColor: getAQIBg(aqiColor),
                    border: `2px solid ${aqiColor}`,
                }}>
                    <span style={styles.statLabel}>AVG AQI</span>
                    <span style={{ ...styles.statValue, color: aqiColor, fontSize: '28px' }}>
                        {avgAQI}
                    </span>
                </div>

                <div style={{
                    ...styles.statBox,
                    backgroundColor: getAQIBg(aqiColor),
                    border: `2px solid ${aqiColor}`,
                }}>
                    <span style={styles.statLabel}>AIR QUALITY</span>
                    <span style={{ ...styles.statValue, color: aqiColor, fontSize: '13px' }}>
                        {aqiLevel}
                    </span>
                </div>

            </div>

            {/* Progress Bar */}
            <div style={styles.progressSection}>
                <div style={styles.progressHeader}>
                    <span style={styles.progressLabel}>AQI LEVEL</span>
                    <span style={{ ...styles.progressLabel, color: aqiColor }}>{avgAQI} / 300</span>
                </div>
                <div style={styles.progressTrack}>
                    <div style={{
                        ...styles.progressFill,
                        width: `${progressWidth}%`,
                        backgroundColor: aqiColor,
                    }}></div>
                </div>
            </div>

        </div>
    )
}

const styles = {
    card: {
        backgroundColor: 'white',
        border: '2.5px solid #1a1a1a',
        borderRadius: '10px',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: '3px 3px 0px #1a1a1a',
    },

    // Header
    header: {
        borderBottom: '2px solid #f0f0f0',
        paddingBottom: '12px',
    },
    nameRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '8px',
    },
    routeName: {
        margin: 0,
        fontSize: '17px',
        fontWeight: '900',
        color: '#1a1a1a',
        letterSpacing: '-0.3px',
    },
    badge: {
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '10px',
        fontWeight: '900',
        letterSpacing: '0.5px',
        whiteSpace: 'nowrap',
    },

    // Stats Grid
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
    },
    statBox: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '10px 12px',
        backgroundColor: '#f5f5f0',
        borderRadius: '8px',
        border: '2px solid #e5e5e5',
    },
    aqiStatBox: {
        // overridden inline
    },
    statLabel: {
        fontSize: '10px',
        fontWeight: '900',
        color: '#888',
        letterSpacing: '1px',
    },
    statValue: {
        fontSize: '18px',
        fontWeight: '800',
        color: '#1a1a1a',
        lineHeight: 1.1,
    },

    // Progress Bar
    progressSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    progressHeader: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    progressLabel: {
        fontSize: '10px',
        fontWeight: '900',
        color: '#888',
        letterSpacing: '1px',
    },
    progressTrack: {
        width: '100%',
        height: '8px',
        backgroundColor: '#f0f0f0',
        borderRadius: '4px',
        overflow: 'hidden',
        border: '1.5px solid #e5e5e5',
    },
    progressFill: {
        height: '100%',
        borderRadius: '4px',
        transition: 'width 0.5s ease',
    },
}
