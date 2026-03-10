export default function Sidebar({ onfindRoutes, loading, sliderValue, setSliderValue, startInput, endInput, setStartInput, setEndInput }) {

    const getSliderLabel = () => {
        if (sliderValue <= 33) return { left: true, text: '🌿 Prioritizing Clean Air' }
        if (sliderValue <= 66) return { mid: true, text: '⚖️ Balanced' }
        return { right: true, text: '⚡ Prioritizing Speed' }
    }

    const label = getSliderLabel()

    return (
        <div style={styles.container}>

            {/* Start Input */}
            <div style={styles.inputGroup}>
                <label style={styles.label}>
                    <span style={styles.labelDot}>📍</span>
                    STARTING POINT
                </label>
                <input
                    type="text"
                    placeholder="e.g. Baner, Pune"
                    style={styles.input}
                    value={startInput}
                    onChange={e => setStartInput(e.target.value)}
                />
            </div>

            {/* Arrow between inputs */}
            <div style={styles.arrowRow}>
                <div style={styles.arrowLine}></div>
                <span style={styles.arrowIcon}>↓</span>
                <div style={styles.arrowLine}></div>
            </div>

            {/* End Input */}
            <div style={styles.inputGroup}>
                <label style={styles.label}>
                    <span style={styles.labelDot}>🎯</span>
                    DESTINATION
                </label>
                <input
                    type="text"
                    placeholder="e.g. Kothrud, Pune"
                    style={styles.input}
                    value={endInput}
                    onChange={e => setEndInput(e.target.value)}
                />
            </div>

            {/* Divider */}
            <div style={styles.divider}></div>

            {/* Slider */}
            <div style={styles.sliderSection}>
                <div style={styles.sliderHeader}>
                    <span style={styles.sliderTitle}>ROUTE PRIORITY</span>
                    <span style={styles.sliderValueBadge}>{sliderValue}</span>
                </div>

                {/* Labels */}
                <div style={styles.sliderLabels}>
                    <span style={{
                        ...styles.sliderSideLabel,
                        color: sliderValue <= 33 ? '#16a34a' : '#999',
                        fontWeight: sliderValue <= 33 ? '800' : '500'
                    }}>
                        🌿 Air Quality
                    </span>
                    <span style={{
                        ...styles.sliderSideLabel,
                        color: sliderValue > 66 ? '#d97706' : '#999',
                        fontWeight: sliderValue > 66 ? '800' : '500'
                    }}>
                        ⚡ Speed
                    </span>
                </div>

                {/* Range Input */}
                <input
                    type="range"
                    min={0}
                    max={100}
                    value={sliderValue}
                    onChange={e => setSliderValue(Number(e.target.value))}
                    style={styles.slider}
                />

                {/* Active Label */}
                <div style={styles.activeLabel}>
                    {label.text}
                </div>
            </div>

            {/* Divider */}
            <div style={styles.divider}></div>

            {/* Button */}
            <button
                style={{
                    ...styles.button,
                    backgroundColor: loading ? '#999' : '#1a1a1a',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transform: loading ? 'none' : undefined,
                }}
                onClick={onfindRoutes}
                disabled={loading}
            >
                {loading ? (
                    <span style={styles.loadingContent}>
                        <span style={styles.spinner}>⟳</span>
                        FINDING ROUTES...
                    </span>
                ) : (
                    '🔍 FIND ROUTE'
                )}
            </button>

            {loading && (
                <p style={styles.loadingNote}>
                    ⏱ Fetching real-time AQI data... ~20 seconds
                </p>
            )}

        </div>
    )
}

const styles = {
    container: {
        backgroundColor: '#ffffff',
        border: '2.5px solid #1a1a1a',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
    },

    // Inputs
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        fontSize: '11px',
        fontWeight: '900',
        color: '#1a1a1a',
        letterSpacing: '1px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    labelDot: {
        fontSize: '14px',
    },
    input: {
        padding: '11px 14px',
        border: '2.5px solid #1a1a1a',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        color: '#1a1a1a',
        backgroundColor: '#fafafa',
        transition: 'border-color 0.2s, background-color 0.2s',
    },

    // Arrow
    arrowRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0 4px',
    },
    arrowLine: {
        flex: 1,
        height: '1px',
        backgroundColor: '#e5e5e5',
    },
    arrowIcon: {
        fontSize: '16px',
        color: '#999',
        fontWeight: '900',
    },

    // Divider
    divider: {
        height: '2px',
        backgroundColor: '#f0f0f0',
        borderRadius: '1px',
    },

    // Slider
    sliderSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    sliderHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sliderTitle: {
        fontSize: '11px',
        fontWeight: '900',
        color: '#1a1a1a',
        letterSpacing: '1px',
    },
    sliderValueBadge: {
        backgroundColor: '#1a1a1a',
        color: 'white',
        fontSize: '11px',
        fontWeight: '800',
        padding: '2px 8px',
        borderRadius: '20px',
    },
    sliderLabels: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        transition: 'all 0.2s',
    },
    sliderSideLabel: {
        fontSize: '12px',
        transition: 'all 0.2s',
    },
    slider: {
        width: '100%',
        height: '6px',
        borderRadius: '3px',
        outline: 'none',
        background: 'linear-gradient(to right, #16a34a, #2563eb, #d97706)',
        cursor: 'pointer',
        WebkitAppearance: 'none',
        appearance: 'none',
    },
    activeLabel: {
        textAlign: 'center',
        fontSize: '13px',
        fontWeight: '700',
        color: '#444',
        backgroundColor: '#f5f5f0',
        padding: '6px 12px',
        borderRadius: '6px',
        border: '1.5px solid #e5e5e5',
    },

    // Button
    button: {
        width: '100%',
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: '14px 20px',
        border: '2.5px solid #1a1a1a',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '900',
        letterSpacing: '1px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        fontFamily: 'inherit',
    },
    loadingContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
    },
    spinner: {
        display: 'inline-block',
        animation: 'spin 1s linear infinite',
        fontSize: '16px',
    },
    loadingNote: {
        fontSize: '12px',
        color: '#888',
        textAlign: 'center',
        margin: 0,
        fontWeight: '500',
    },
}
