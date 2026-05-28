'use client';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix iconos default en bundlers
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
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
