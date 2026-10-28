'use client';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useMemo, useRef } from 'react';

export type EventStop = {
  id: string;
  name: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  address?: string | null;
  schedule?: string | null;
  business_slug?: string | null;
};

// Pin con emoji: 🍬 pendiente, ✓ visitado. Un icono por estado (no por parada)
// para que 200+ marcadores sigan siendo livianos.
function makeIcon(visited: boolean, color: string) {
  const bg = visited ? '#10b981' : color;
  const content = visited ? '✓' : '🍬';
  return L.divIcon({
    className: 'event-stop-marker',
    html: `
      <div style="
        background: ${bg};
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 15px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.35);
        border: 2px solid white;
      ">${content}</div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  });
}

function FitBounds({ stops }: { stops: EventStop[] }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    // Solo encuadra la primera vez, para no pelear con el zoom del usuario
    if (fitted.current || stops.length === 0) return;
    fitted.current = true;
    const bounds = L.latLngBounds(stops.map((s) => [s.latitude, s.longitude]));
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [stops, map]);
  return null;
}

function FlyTo({ target }: { target: { lat: number; lng: number; key: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 17), { duration: 0.6 });
  }, [target, map]);
  return null;
}

export default function EventRouteMap({
  stops,
  visited,
  onToggleVisited,
  userPos,
  focus,
  color = '#f97316',
  height = '400px',
}: {
  stops: EventStop[];
  visited: Set<string>;
  onToggleVisited: (id: string) => void;
  userPos: { lat: number; lng: number } | null;
  focus: { lat: number; lng: number; key: number } | null;
  color?: string;
  height?: string;
}) {
  const pendingIcon = useMemo(() => makeIcon(false, color), [color]);
  const visitedIcon = useMemo(() => makeIcon(true, color), [color]);

  if (stops.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-100 grid place-items-center text-slate-400 text-sm" style={{ height }}>
        Sin locales
      </div>
    );
  }

  return (
    <div style={{ height, width: '100%' }} className="rounded-2xl overflow-hidden">
      <MapContainer
        center={[stops[0].latitude, stops[0].longitude]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer attribution="&copy; OpenStreetMap" url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {stops.map((s) => {
          const isVisited = visited.has(s.id);
          return (
            <Marker key={s.id} position={[s.latitude, s.longitude]} icon={isVisited ? visitedIcon : pendingIcon}>
              <Popup>
                <div className="text-sm min-w-[180px]">
                  <p className="font-bold text-slate-900">{s.name}</p>
                  {s.address && <p className="text-xs text-slate-500 mt-0.5">{s.address}</p>}
                  {s.schedule && <p className="text-xs text-orange-600 font-semibold mt-0.5">🕓 {s.schedule}</p>}
                  {s.description && <p className="text-xs text-slate-600 mt-1">{s.description}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => onToggleVisited(s.id)}
                      className={`text-xs font-bold ${isVisited ? 'text-emerald-600' : 'text-orange-600'}`}
                    >
                      {isVisited ? '✓ Visitado' : 'Marcar visitado'}
                    </button>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${s.latitude},${s.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-blue-600"
                    >
                      Cómo llegar
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {userPos && (
          <CircleMarker
            center={[userPos.lat, userPos.lng]}
            radius={9}
            pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }}
          />
        )}

        <FitBounds stops={stops} />
        <FlyTo target={focus} />
      </MapContainer>
    </div>
  );
}
