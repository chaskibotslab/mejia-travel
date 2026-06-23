'use client';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Icono custom: SVG con la punta exactamente en el píxel inferior central.
// Esto garantiza que el pin apunte exactamente a la lat/lng real, sin offsets.
const icon = L.divIcon({
  className: 'mejia-map-pin',
  html: `
    <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 4px rgba(0,0,0,0.35));">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 26 16 26s16-15 16-26C32 7.163 24.837 0 16 0z" fill="#2563eb"/>
      <circle cx="16" cy="16" r="6" fill="white"/>
    </svg>
  `,
  iconSize: [32, 42],
  iconAnchor: [16, 42],   // punta inferior del pin = ubicación real
  popupAnchor: [0, -38],
});

type Props = {
  lat: number;
  lng: number;
  name?: string;
  height?: string;
  markers?: Array<{ lat: number; lng: number; name: string; href?: string }>;
  zoom?: number;
};

export default function MapView({ lat, lng, name, height = '260px', markers, zoom = 15 }: Props) {
  const points = markers && markers.length ? markers : [{ lat, lng, name: name || '' }];
  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer center={[lat, lng]} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((p, i) => (
          <Marker key={i} position={[p.lat, p.lng]} icon={icon}>
            <Popup>
              {(p as any).href ? (
                <a href={(p as any).href} className="font-semibold text-blue-600">
                  {p.name}
                </a>
              ) : (
                <b>{p.name}</b>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
