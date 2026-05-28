'use client';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

type Stop = {
  id: string;
  name: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  stop_order: number;
  business_slug?: string | null;
};

function makeNumberedIcon(num: number, color: string) {
  return L.divIcon({
    className: 'route-stop-marker',
    html: `
      <div style="
        background: ${color};
        color: white;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 3px solid white;
      ">${num}</div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

function FitBounds({ stops }: { stops: Stop[] }) {
  const map = useMap();
  useEffect(() => {
    if (stops.length === 0) return;
    const bounds = L.latLngBounds(stops.map((s) => [s.latitude, s.longitude]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [stops, map]);
  return null;
}

export default function RouteMap({
  stops,
  color = '#7c3aed',
  height = '420px',
}: {
  stops: Stop[];
  color?: string;
  height?: string;
}) {
  if (stops.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-100 grid place-items-center text-slate-400 text-sm" style={{ height }}>
        Sin paradas
      </div>
    );
  }

  const positions: [number, number][] = stops.map((s) => [s.latitude, s.longitude]);
  const center = positions[0];

  return (
    <div style={{ height, width: '100%' }} className="rounded-2xl overflow-hidden">
      <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Línea del recorrido */}
        <Polyline
          positions={positions}
          pathOptions={{ color, weight: 5, opacity: 0.85, dashArray: '8 6' }}
        />

        {/* Marcadores numerados */}
        {stops.map((s) => (
          <Marker key={s.id} position={[s.latitude, s.longitude]} icon={makeNumberedIcon(s.stop_order, color)}>
            <Popup>
              <div className="text-sm">
                <p className="font-bold text-slate-900">
                  {s.stop_order}. {s.name}
                </p>
                {s.description && <p className="text-xs text-slate-600 mt-1">{s.description}</p>}
                {s.business_slug && (
                  <a href={`/n/${s.business_slug}`} className="text-fuchsia-600 font-semibold text-xs block mt-2">
                    Ver detalles →
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        <FitBounds stops={stops} />
      </MapContainer>
    </div>
  );
}
