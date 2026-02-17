import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix for default marker icons in Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// Custom Sauna Icons
const getSaunaIcon = (visited, isLegendary, totonoiScore) => {
    // 塗りつぶしコンセプト: スコアに応じて色が濃くなる
    // 訪問済み(visited)であれば基本色、さらにスコアが高ければ強調
    const hasGoodScore = totonoiScore >= 60;
    const hasGreatScore = totonoiScore >= 80;

    const bgColor = visited ? '#10b981' : 'rgba(255, 255, 255, 0.9)';
    const strokeColor = visited ? '#059669' : '#94a3b8';

    const iconColor = visited ? '#fff' : '#94a3b8';
    const shadowSize = visited
        ? (hasGreatScore ? '0 0 20px rgba(16, 185, 129, 0.4)' : '0 0 10px rgba(16, 185, 129, 0.2)')
        : 'none';
    const borderStyle = visited ? `2px solid white` : `2px dashed ${strokeColor}`;

    return new L.DivIcon({
        html: `<div style="background: ${bgColor}; padding: 3px; border-radius: 50%; box-shadow: ${shadowSize}; border: ${borderStyle}; display: flex; align-items: center; justify-content: center; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; width: 40px; height: 40px; transform: ${hasGreatScore ? 'scale(1.1)' : 'scale(1)'}; overflow: hidden;">
              <img src="/sauna-icon.png" alt="sauna" style="width: 100%; height: 100%; object-fit: cover; opacity: ${visited ? '1' : '0.6'}; transition: all 0.3s; border-radius: 50%; filter: ${visited ? 'none' : 'grayscale(100%)'};" />
            </div>`,
        className: 'custom-sauna-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });
};

function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

const PopupManager = ({ selectedSauna }) => {
    const map = useMap();
    useEffect(() => {
        if (!selectedSauna) {
            map.closePopup();
        }
    }, [selectedSauna, map]);
    return null;
};



// Global cache for GeoJSON to prevent redundant 12MB fetches on remount
let cachedGeoData = null;
let geoDataPromise = null;

const Map = ({ saunas, selectedSauna, conqueredPrefectures, onSelectSauna }) => {
    const [center, setCenter] = useState([37.5, 133.0]); // Shifted even further West (final tweak)
    const [geoData, setGeoData] = useState(cachedGeoData);

    useEffect(() => {
        if (selectedSauna) {
            setCenter([selectedSauna.lat, selectedSauna.lng]);
        }
    }, [selectedSauna]);

    useEffect(() => {
        if (cachedGeoData) {
            setGeoData(cachedGeoData);
            return;
        }

        if (!geoDataPromise) {
            geoDataPromise = fetch('/japan.geojson')
                .then(res => res.json())
                .then(data => {
                    cachedGeoData = data;
                    return data;
                })
                .catch(err => {
                    console.error("GeoJSON load error:", err);
                    geoDataPromise = null; // Reset on error to allow retry
                });
        }

        geoDataPromise.then(data => {
            if (data) setGeoData(data);
        });
    }, []);

    const geoJsonStyle = (feature) => {
        const prefName = feature.properties.nam_ja;
        const isConquered = conqueredPrefectures?.includes(prefName);

        return {
            fillColor: isConquered ? '#10b981' : 'transparent',
            weight: isConquered ? 1.5 : 0.8,
            opacity: 1,
            color: isConquered ? '#059669' : '#e2e8f0', // Border color
            fillOpacity: isConquered ? 0.35 : 0,
        };
    };

    return (
        <div className="map-wrapper">
            <MapContainer center={center} zoom={6} scrollWheelZoom={true} zoomControl={false} tap={false} doubleClickZoom={false}>
                <TileLayer
                    attribution='&copy; CARTO'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                <ChangeView center={center} />
                <PopupManager selectedSauna={selectedSauna} />

                {geoData && (
                    <GeoJSON
                        data={geoData}
                        style={geoJsonStyle}
                        interactive={false}
                    />
                )}

                {saunas.map((sauna) => (
                    <Marker
                        key={sauna.id}
                        position={[sauna.lat, sauna.lng]}
                        icon={getSaunaIcon(sauna.visited, sauna.is_legendary, sauna.totonoi_score)}
                        interactive={true}
                        riseOnHover={true}
                        eventHandlers={{
                            click: (e) => {
                                L.DomEvent.stopPropagation(e);
                                onSelectSauna(sauna);
                            },
                            mousedown: (e) => {
                                L.DomEvent.stopPropagation(e);
                                onSelectSauna(sauna); // Ensure modal opens on mousedown
                            }
                        }}
                    />
                ))}
            </MapContainer>
        </div>
    );
};

export default Map; // Force update
