'use client';

import { MapContainer, TileLayer, Polygon, Popup, Tooltip, Polyline, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default marker icon missing in Leaflet + Next.js (still good to have if we add markers later)
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

// Icon definition moved inside component or check for window
let customIcon: L.Icon | undefined;

if (typeof window !== 'undefined') {
    customIcon = new L.Icon({
        iconUrl,
        iconRetinaUrl,
        shadowUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });
}

interface MarketLineData {
    id: string; // The ID from JSON key (L1, LI, etc.)
    name: string; // "Rapa Line"
    items: string[];
}

interface MarketLayoutData {
    id: string;
    coordinates: [number, number][];
    labelPosition: [number, number];
    color: string;
}

interface MapComponentProps {
    lines: MarketLineData[];
    layout: Record<string, MarketLayoutData>;
    activeLineId?: string;
    path?: [number, number][];
}

// Component to fit bounds to the path
function FitBounds({ path }: { path?: [number, number][] }) {
    const map = useMap();

    useEffect(() => {
        if (path && path.length > 0) {
            // Create bounds from path points
            const bounds = L.latLngBounds(path);
            // Fit bounds with some padding
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [path, map]);

    return null;
}

export default function MapComponent({ lines, layout, activeLineId, path }: MapComponentProps) {
    // Bamenda Main Market approximate center
    const center: [number, number] = [5.9631, 10.1591];

    return (
        <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg border border-gray-200 z-0 relative">
            <MapContainer
                center={center}
                zoom={19}
                maxZoom={22}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <FitBounds path={path} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Render Path if exists */}
                {path && path.length > 0 && (
                    <>
                        <Polyline
                            positions={path}
                            pathOptions={{ color: 'red', weight: 4, opacity: 0.8, dashArray: '10, 10' }}
                        />
                        {/* Start Marker (Entrance) */}
                        <Marker position={path[0]} icon={customIcon}>
                            <Popup>Main Entrance</Popup>
                            <Tooltip direction="bottom" offset={[0, 20]} opacity={1} permanent>
                                <span className="text-xs font-bold bg-white px-1 rounded shadow">Main Entrance</span>
                            </Tooltip>
                        </Marker>
                    </>
                )}

                {lines.map((line) => {
                    const lineLayout = layout[line.id];
                    if (!lineLayout) return null; // Skip if no layout defined

                    const isActive = activeLineId === line.id;
                    const fillColor = isActive ? '#fbbf24' : lineLayout.color; // Amber-400 if active
                    const fillOpacity = isActive ? 0.8 : 0.5;

                    return (
                        <Polygon
                            key={line.id}
                            positions={lineLayout.coordinates}
                            pathOptions={{ color: lineLayout.color, fillColor: fillColor, fillOpacity: fillOpacity }}
                        >
                            <Tooltip direction="center" offset={[0, 0]} opacity={1} permanent>
                                <span className="text-xs font-bold">{line.name}</span>
                            </Tooltip>
                            <Popup>
                                <div className="min-w-[150px]">
                                    <h3 className="font-bold text-gray-800 border-b pb-1 mb-2">{line.name}</h3>
                                    <div className="text-xs text-xs text-gray-500 mb-1">Items Sold:</div>
                                    <ul className="list-disc list-inside text-sm text-gray-700">
                                        {line.items.length > 0 ? (
                                            line.items.slice(0, 5).map((item, i) => (
                                                <li key={i} className="capitalize">{item}</li>
                                            ))
                                        ) : (
                                            <li className="italic text-gray-400">No items listed</li>
                                        )}
                                        {line.items.length > 5 && (
                                            <li className="text-gray-500 italic">+{line.items.length - 5} more...</li>
                                        )}
                                    </ul>
                                </div>
                            </Popup>
                        </Polygon>
                    );
                })}
            </MapContainer>
        </div>
    );
}
