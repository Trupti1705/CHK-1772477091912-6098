import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import "leaflet/dist/leaflet.css"
import { useEffect } from 'react'

function FlyToLocation({ coords }) {
    const map = useMap()
    useEffect(() => {
        if (coords) {
            map.flyTo(coords, 14, { animate: true, duration: 1.2 })
        }
    }, [coords, map])
    return null
}

export default function MapView({ routeData, onLocationFound }) {

    const realCoordinates = routeData
        ? routeData.coordinates.map(([lng, lat]) => [lat, lng])
        : []

    const startCoord = realCoordinates.length > 0 ? realCoordinates[0] : null
    const endCoord = realCoordinates.length > 0 ? realCoordinates[realCoordinates.length - 1] : null

    const handleCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation not supported by your browser')
            return
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude
                const lng = position.coords.longitude
                onLocationFound(lat, lng)
                alert(`📍 Location found! Now enter your destination and click Find Route.`)
            },
            () => {
                alert('Could not get your location. Please allow location access.')
            }
        )
    }

    const routeColor = routeData?.color || '#10b981'

    return (
        <div style={styles.wrapper}>

            {/* Top Bar */}
            <div style={styles.topBar}>
                <div style={styles.mapTitle}>
                    <span style={styles.mapTitleDot}>🗺️</span>
                    <span style={styles.mapTitleText}>LIVE ROUTE MAP</span>
                    {routeData && (
                        <span style={{
                            ...styles.routeNameTag,
                            backgroundColor: routeColor + '20',
                            color: routeColor,
                            border: `2px solid ${routeColor}`,
                        }}>
                            {routeData.name}
                        </span>
                    )}
                </div>
                <button
                    style={styles.locationBtn}
                    onClick={handleCurrentLocation}
                >
                    📍 MY LOCATION
                </button>
            </div>

            {/* Map Container */}
            <div style={styles.mapWrapper}>
                <MapContainer
                    center={[18.5218, 73.8187]}
                    zoom={13}
                    style={styles.map}
                    zoomControl={true}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                    />

                    {routeData && startCoord && (
                        <>
                            <FlyToLocation coords={startCoord} />

                            {/* Route Line */}
                            <Polyline
                                positions={realCoordinates}
                                color={routeColor}
                                weight={7}
                                opacity={0.9}
                            />

                            {/* Start Marker */}
                            <Marker position={startCoord}>
                                <Popup>
                                    <div style={styles.popup}>
                                        <strong style={styles.popupTitle}>🟢 START</strong>
                                        <p style={styles.popupText}>Your starting point</p>
                                    </div>
                                </Popup>
                            </Marker>

                            {/* End Marker */}
                            <Marker position={endCoord}>
                                <Popup>
                                    <div style={styles.popup}>
                                        <strong style={styles.popupTitle}>🏁 DESTINATION</strong>
                                        <p style={styles.popupText}>Your destination</p>
                                    </div>
                                </Popup>
                            </Marker>
                        </>
                    )}

                    {/* Empty state overlay */}
                    {!routeData && (
                        <div style={styles.emptyOverlay}>
                            <div style={styles.emptyBox}>
                                <p style={styles.emptyTitle}>No route yet</p>
                                <p style={styles.emptyText}>Enter locations and click Find Route</p>
                            </div>
                        </div>
                    )}

                </MapContainer>
            </div>

            {/* Bottom Legend */}
            <div style={styles.legend}>
                <span style={styles.legendTitle}>AQI LEGEND</span>
                <div style={styles.legendItems}>
                    {[
                        { color: '#16a34a', label: 'Good (0–50)' },
                        { color: '#d97706', label: 'Moderate (51–100)' },
                        { color: '#dc2626', label: 'Unhealthy (101–150)' },
                    ].map(item => (
                        <div key={item.label} style={styles.legendItem}>
                            <div style={{ ...styles.legendDot, backgroundColor: item.color }}></div>
                            <span style={styles.legendLabel}>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}

const styles = {
    wrapper: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },

    // Top Bar
    topBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        border: '2.5px solid #1a1a1a',
        borderRadius: '10px',
        padding: '12px 16px',
        flexShrink: 0,
    },
    mapTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    mapTitleDot: {
        fontSize: '18px',
    },
    mapTitleText: {
        fontSize: '13px',
        fontWeight: '900',
        color: '#1a1a1a',
        letterSpacing: '1px',
    },
    routeNameTag: {
        fontSize: '12px',
        fontWeight: '800',
        padding: '3px 10px',
        borderRadius: '20px',
    },
    locationBtn: {
        backgroundColor: '#1a1a1a',
        color: 'white',
        border: '2.5px solid #1a1a1a',
        borderRadius: '8px',
        padding: '8px 16px',
        fontSize: '12px',
        fontWeight: '900',
        letterSpacing: '0.5px',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.15s',
    },

    // Map
    mapWrapper: {
        flex: 1,
        borderRadius: '10px',
        overflow: 'hidden',
        border: '2.5px solid #1a1a1a',
        boxShadow: '4px 4px 0px #1a1a1a',
        minHeight: 0,
    },
    map: {
        width: '100%',
        height: '100%',
    },

    // Empty Overlay
    emptyOverlay: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        pointerEvents: 'none',
    },
    emptyBox: {
        backgroundColor: 'white',
        border: '2.5px solid #1a1a1a',
        borderRadius: '10px',
        padding: '16px 24px',
        textAlign: 'center',
        boxShadow: '3px 3px 0px #1a1a1a',
    },
    emptyTitle: {
        fontSize: '15px',
        fontWeight: '900',
        color: '#1a1a1a',
        margin: '0 0 4px 0',
    },
    emptyText: {
        fontSize: '12px',
        color: '#888',
        margin: 0,
        fontWeight: '500',
    },

    // Popup
    popup: {
        textAlign: 'center',
        padding: '4px',
    },
    popupTitle: {
        fontSize: '13px',
        color: '#1a1a1a',
        display: 'block',
        marginBottom: '4px',
    },
    popupText: {
        fontSize: '12px',
        color: '#666',
        margin: 0,
    },

    // Legend
    legend: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        backgroundColor: 'white',
        border: '2.5px solid #1a1a1a',
        borderRadius: '10px',
        padding: '10px 16px',
        flexShrink: 0,
    },
    legendTitle: {
        fontSize: '11px',
        fontWeight: '900',
        color: '#1a1a1a',
        letterSpacing: '1px',
        whiteSpace: 'nowrap',
    },
    legendItems: {
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    legendDot: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        border: '2px solid #1a1a1a',
        flexShrink: 0,
    },
    legendLabel: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#444',
    },
}
