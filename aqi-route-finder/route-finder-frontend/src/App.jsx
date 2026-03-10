import RouteCard from "./components/RouteCard"
import Sidebar from "./components/Sidebar"
import MapView from "./components/MapView";
import axios from "axios";
import { useState } from "react";

export default function App() {

    const getAQIColor = (aqi) => {
        if (aqi <= 50) return '#16a34a'
        if (aqi <= 100) return '#d97706'
        if (aqi <= 150) return '#dc2626'
        return '#7c3aed'
    }

    const [allRoutes, setAllRoutes] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [sliderValue, setSliderValue] = useState(50)
    const [startInput, setStartInput] = useState('')
    const [endInput, setEndInput] = useState('')

    const selectedRoute = allRoutes
        ? sliderValue <= 33 ? allRoutes[2]
        : sliderValue <= 66 ? allRoutes[1]
        : allRoutes[0]
        : null

    const geocodeLocation = async (text, biasLat = null, biasLon = null) => {
        const params = { text }
        if (biasLat !== null && biasLon !== null) {
            params.biasLat = biasLat
            params.biasLon = biasLon
        }
        const response = await axios.get('http://localhost:5000/api/geocode', { params })
        return response.data
    }

    const fetchRoute = async () => {
        try {
            setLoading(true)
            setError(null)

            if (!startInput || !endInput) {
                setError('Please enter both start and end locations!')
                setLoading(false)
                return
            }

            let startCoordinate, destinationCoordinate

            if (startInput.includes(',') && !isNaN(startInput.split(',')[0].trim())) {
                const [lat, lng] = startInput.split(',').map(s => Number(s.trim()))
                startCoordinate = { lat, lng }
            } else {
                startCoordinate = await geocodeLocation(startInput)
            }

// was: destinationCoordinate = await geocodeLocation(endInput)
// now: pass start coords so ORS picks the CLOSEST matching place name
            destinationCoordinate = await geocodeLocation(endInput, startCoordinate.lat, startCoordinate.lng)

            const response = await axios.post('http://localhost:5000/api/route', {
                startLat: startCoordinate.lat,
                startLon: startCoordinate.lng,
                endLat: destinationCoordinate.lat,
                endLon: destinationCoordinate.lng,
                sliderValue: sliderValue
            })

            setAllRoutes(response.data.routes)

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleLocationFound = (lat, lng) => {
        setStartInput(`${lat}, ${lng}`)
    }

    const getActiveRouteLabel = () => {
        if (sliderValue <= 33) return { emoji: '🌿', label: 'CLEAN AIR ROUTE', color: '#16a34a', bg: '#f0fdf4' }
        if (sliderValue <= 66) return { emoji: '⚖️', label: 'BALANCED ROUTE', color: '#2563eb', bg: '#eff6ff' }
        return { emoji: '⚡', label: 'FASTEST ROUTE', color: '#d97706', bg: '#fffbeb' }
    }

    const activeLabel = getActiveRouteLabel()

    return (
        <div style={styles.appContainer}>
            <div style={styles.mainLayout}>

                {/* LEFT COLUMN */}
                <div style={styles.leftColumn}>

                    {/* Header */}
                    <div style={styles.header}>
                        <div style={styles.logoRow}>
                            <span style={styles.logoEmoji}>🌍</span>
                            <div>
                                <h1 style={styles.title}>AQI Route Finder</h1>
                                <p style={styles.subtitle}>Breathe smart. Route smarter.</p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar inputs + slider */}
                    <Sidebar
                        onfindRoutes={fetchRoute}
                        loading={loading}
                        sliderValue={sliderValue}
                        setSliderValue={setSliderValue}
                        startInput={startInput}
                        endInput={endInput}
                        setStartInput={setStartInput}
                        setEndInput={setEndInput}
                    />

                    {/* Active route indicator */}
                    {allRoutes && (
                        <div style={{
                            ...styles.routeIndicator,
                            backgroundColor: activeLabel.bg,
                            border: `2.5px solid ${activeLabel.color}`,
                            color: activeLabel.color
                        }}>
                            <span style={styles.routeIndicatorEmoji}>{activeLabel.emoji}</span>
                            <span style={styles.routeIndicatorText}>{activeLabel.label}</span>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div style={styles.errorBox}>
                            <span style={styles.errorIcon}>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Route Card */}
                    <div style={styles.routeList}>
                        {selectedRoute ? (
                            <RouteCard
                                name={selectedRoute.name}
                                distance={selectedRoute.distance}
                                duration={selectedRoute.duration}
                                avgAQI={selectedRoute.avgAQI}
                                aqiLevel={selectedRoute.aqiLevel}
                                aqiColor={getAQIColor(selectedRoute.avgAQI)}
                                isRecommended={true}
                            />
                        ) : (
                            <div style={styles.placeholder}>
                                <div style={styles.placeholderIcon}>🗺️</div>
                                <p style={styles.placeholderText}>
                                    Enter locations above and hit Find Route
                                </p>
                            </div>
                        )}

                        {/* AQI Breakdown */}
                        <div style={styles.aqiBreakdown}>
                            <h4 style={styles.breakdownTitle}>AIR QUALITY BREAKDOWN</h4>
                            <div style={styles.breakdownRow}>
                                <div style={styles.breakdownItem}>
                                    <div style={{...styles.breakdownDot, backgroundColor: '#16a34a'}}></div>
                                    <span style={styles.breakdownLabel}>Good</span>
                                    <span style={{...styles.breakdownValue, color: '#16a34a'}}>
                                        {selectedRoute ? selectedRoute.aqiBreakdown.good + '%' : '—'}
                                    </span>
                                </div>
                                <div style={styles.breakdownItem}>
                                    <div style={{...styles.breakdownDot, backgroundColor: '#d97706'}}></div>
                                    <span style={styles.breakdownLabel}>Moderate</span>
                                    <span style={{...styles.breakdownValue, color: '#d97706'}}>
                                        {selectedRoute ? selectedRoute.aqiBreakdown.moderate + '%' : '—'}
                                    </span>
                                </div>
                                <div style={styles.breakdownItem}>
                                    <div style={{...styles.breakdownDot, backgroundColor: '#dc2626'}}></div>
                                    <span style={styles.breakdownLabel}>Unhealthy</span>
                                    <span style={{...styles.breakdownValue, color: '#dc2626'}}>
                                        {selectedRoute ? selectedRoute.aqiBreakdown.unhealthy + '%' : '—'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN - MAP */}
                <div style={styles.rightColumn}>
                    <MapView
                        routeData={selectedRoute}
                        onLocationFound={handleLocationFound}
                    />
                </div>

            </div>
        </div>
    )
}

const styles = {
    appContainer: {
        backgroundColor: '#f5f5f0',
        minHeight: '100vh',
        fontFamily: '"DM Sans", "Helvetica Neue", Arial, sans-serif',
    },
    mainLayout: {
        display: 'grid',
        gridTemplateColumns: '420px 1fr',
        height: '100vh',
        overflow: 'hidden',
    },
    leftColumn: {
        backgroundColor: '#ffffff',
        borderRight: '3px solid #1a1a1a',
        overflowY: 'auto',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
    },

    // Header
    header: {
        borderBottom: '3px solid #1a1a1a',
        paddingBottom: '16px',
    },
    logoRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    logoEmoji: {
        fontSize: '36px',
        lineHeight: 1,
    },
    title: {
        fontSize: '22px',
        fontWeight: '900',
        color: '#1a1a1a',
        margin: 0,
        letterSpacing: '-0.5px',
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: '12px',
        color: '#666',
        margin: '2px 0 0 0',
        fontWeight: '500',
        letterSpacing: '0.5px',
    },

    // Route Indicator
    routeIndicator: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        borderRadius: '8px',
        fontWeight: '800',
        letterSpacing: '0.5px',
    },
    routeIndicatorEmoji: {
        fontSize: '20px',
    },
    routeIndicatorText: {
        fontSize: '14px',
    },

    // Error
    errorBox: {
        backgroundColor: '#fef2f2',
        border: '2.5px solid #dc2626',
        borderRadius: '8px',
        padding: '12px 16px',
        color: '#dc2626',
        fontSize: '13px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    errorIcon: {
        fontSize: '16px',
    },

    // Route List
    routeList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },

    // Placeholder
    placeholder: {
        backgroundColor: '#f5f5f0',
        border: '2.5px dashed #ccc',
        borderRadius: '8px',
        padding: '32px 16px',
        textAlign: 'center',
    },
    placeholderIcon: {
        fontSize: '32px',
        marginBottom: '8px',
    },
    placeholderText: {
        color: '#888',
        fontSize: '14px',
        fontWeight: '500',
        margin: 0,
    },

    // AQI Breakdown
    aqiBreakdown: {
        backgroundColor: '#f5f5f0',
        border: '2.5px solid #1a1a1a',
        borderRadius: '8px',
        padding: '16px',
    },
    breakdownTitle: {
        fontSize: '11px',
        fontWeight: '900',
        color: '#1a1a1a',
        margin: '0 0 14px 0',
        letterSpacing: '1px',
    },
    breakdownRow: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    breakdownItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    breakdownDot: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        flexShrink: 0,
        border: '2px solid #1a1a1a',
    },
    breakdownLabel: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#444',
        flex: 1,
    },
    breakdownValue: {
        fontSize: '15px',
        fontWeight: '800',
    },

    // Right Column
    rightColumn: {
        backgroundColor: '#f5f5f0',
        padding: '20px',
        overflow: 'hidden',
    },
}
