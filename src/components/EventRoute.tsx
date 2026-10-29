'use client';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { MapPin, Navigation, Search, Check, Clock, EyeOff, Loader2, ChevronRight } from 'lucide-react';
import type { EventStop } from './EventRouteMap';

const EventRouteMap = dynamic(() => import('./EventRouteMap'), { ssr: false });

type Stop = EventStop & { parish?: string | null; phone?: string | null; stop_order: number };

type Route = {
  id: string;
  name: string;
  description?: string | null;
  short_description?: string | null;
  color?: string | null;
  is_published?: boolean;
};

// Distancia en km entre dos coordenadas (fórmula de Haversine)
function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function formatDistance(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export default function EventRoute({ route, stops: rawStops }: { route: Route; stops: Stop[] }) {
  // Ignora paradas incompletas (sin nombre o en 0,0) para que no aparezcan pines perdidos
  const stops = useMemo(
    () => rawStops.filter((s) => s.name?.trim() && Number(s.latitude) !== 0 && Number(s.longitude) !== 0),
    [rawStops]
  );
  const color = route.color || '#f97316';
  const storageKey = `route-visited:${route.id}`;

  // Locales visitados: se guardan solo en este dispositivo (sin registro)
  const [visited, setVisited] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setVisited(new Set(JSON.parse(raw)));
    } catch {}
  }, [storageKey]);

  function toggleVisited(id: string) {
    setVisited((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  }

  const [query, setQuery] = useState('');
  const [parish, setParish] = useState<string | null>(null);
  const [hideVisited, setHideVisited] = useState(false);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [focus, setFocus] = useState<{ lat: number; lng: number; key: number } | null>(null);

  const parishes = useMemo(() => {
    const set = new Set<string>();
    stops.forEach((s) => s.parish && set.add(s.parish));
    return Array.from(set).sort();
  }, [stops]);

  function locate() {
    if (!navigator.geolocation) {
      setGeoError('Tu dispositivo no permite ubicación.');
      return;
    }
    setLocating(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserPos(p);
        setFocus({ ...p, key: Date.now() });
        setLocating(false);
      },
      () => {
        setGeoError('No pudimos obtener tu ubicación. Revisa los permisos de GPS.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    let list = stops.filter((s) => {
      if (parish && s.parish !== parish) return false;
      if (hideVisited && visited.has(s.id)) return false;
      if (q && !normalize(`${s.name} ${s.address ?? ''}`).includes(q)) return false;
      return true;
    });
    if (userPos) {
      list = list
        .map((s) => ({ s, d: distanceKm(userPos, { lat: s.latitude, lng: s.longitude }) }))
        .sort((a, b) => a.d - b.d)
        .map((x) => x.s);
    }
    return list;
  }, [stops, query, parish, hideVisited, visited, userPos]);

  const total = stops.length;
  const done = stops.filter((s) => visited.has(s.id)).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="fade-in -mx-4 -mt-4">
      {/* Hero Halloween */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1e0b36] via-[#3b0f5c] to-[#7c2d12] px-5 pt-10 pb-6 text-white">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-40" style={{ background: color }} />
        <div className="absolute -bottom-16 -left-10 w-56 h-56 bg-purple-500/30 rounded-full blur-3xl" />
        <div className="absolute right-4 top-6 text-6xl select-none opacity-90" aria-hidden>
          🎃
        </div>

        <div className="relative">
          {route.is_published === false && (
            <span className="inline-block mb-3 text-[10px] font-bold uppercase tracking-wider bg-yellow-400 text-yellow-950 px-2 py-0.5 rounded-full">
              Vista previa · solo admins
            </span>
          )}
          <p className="text-xs font-bold uppercase tracking-wider text-orange-300">Ruta especial</p>
          <h1 className="text-3xl font-extrabold mt-1 pr-16 drop-shadow-lg">{route.name}</h1>
          {route.short_description && <p className="text-sm text-white/80 mt-1.5 pr-16">{route.short_description}</p>}

          {/* Progreso */}
          <div className="mt-5 bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/15">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-bold">
                🍬 Llevas <span className="text-orange-300 text-lg">{done}</span> de {total} locales
              </p>
              <span className="text-xs font-bold text-white/70">{pct}%</span>
            </div>
            <div className="mt-2 h-2.5 rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-yellow-300 transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            {done === total && total > 0 && (
              <p className="text-xs font-bold text-yellow-300 mt-2">👑 ¡Completaste la ruta! Eres el rey de los dulces.</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-5">
        {route.description && <p className="text-sm text-slate-700 leading-relaxed">{route.description}</p>}

        {/* Mapa */}
        <section>
          <EventRouteMap
            stops={filtered}
            visited={visited}
            onToggleVisited={toggleVisited}
            userPos={userPos}
            focus={focus}
            color={color}
            height="380px"
          />
        </section>

        {/* Controles */}
        <section className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar local o calle…"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <button
              type="button"
              onClick={locate}
              disabled={locating}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-white text-sm font-bold shadow-md active:scale-[0.97] disabled:opacity-70"
              style={{ background: color }}
            >
              {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
              Cerca de mí
            </button>
          </div>
          {geoError && <p className="text-xs text-rose-600">{geoError}</p>}

          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
            <button
              type="button"
              onClick={() => setHideVisited((v) => !v)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border ${
                hideVisited ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" /> Ocultar visitados
            </button>
            {parishes.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setParish(null)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border ${
                    parish === null ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  Todas
                </button>
                {parishes.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setParish(parish === p ? null : p)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border ${
                      parish === p ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </>
            )}
          </div>

          <p className="text-xs text-slate-400">
            {filtered.length} {filtered.length === 1 ? 'local' : 'locales'}
            {userPos ? ' · ordenados por cercanía' : ''}
          </p>
        </section>

        {/* Lista de locales */}
        <section>
          <ul className="space-y-3">
            {filtered.map((s) => {
              const isVisited = visited.has(s.id);
              const dist = userPos ? distanceKm(userPos, { lat: s.latitude, lng: s.longitude }) : null;
              return (
                <li
                  key={s.id}
                  className={`rounded-2xl border p-4 transition-colors ${
                    isVisited ? 'bg-emerald-50/60 border-emerald-200' : 'bg-white border-slate-200 shadow-soft'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleVisited(s.id)}
                      aria-label={isVisited ? 'Desmarcar visitado' : 'Marcar como visitado'}
                      className={`flex-shrink-0 w-10 h-10 rounded-full grid place-items-center text-lg border-2 active:scale-90 transition-transform ${
                        isVisited ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-orange-50 border-orange-200'
                      }`}
                    >
                      {isVisited ? <Check className="w-5 h-5" strokeWidth={3} /> : '🍬'}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-bold leading-tight ${isVisited ? 'text-emerald-800' : 'text-slate-900'}`}>{s.name}</h3>
                        {dist !== null && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex-shrink-0">
                            {formatDistance(dist)}
                          </span>
                        )}
                      </div>
                      {s.address && <p className="text-xs text-slate-500 mt-0.5">{s.address}</p>}
                      {s.schedule && (
                        <p className="text-xs text-orange-600 font-semibold mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {s.schedule}
                        </p>
                      )}
                      {s.description && <p className="text-xs text-slate-600 mt-1.5">{s.description}</p>}

                      <div className="flex items-center gap-4 mt-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setFocus({ lat: s.latitude, lng: s.longitude, key: Date.now() });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-orange-600"
                        >
                          <MapPin className="w-3 h-3" /> Ver en mapa
                        </button>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${s.latitude},${s.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600"
                        >
                          <Navigation className="w-3 h-3" /> Cómo llegar
                        </a>
                        {s.business_slug && (
                          <Link href={`/n/${s.business_slug}`} className="inline-flex items-center gap-0.5 text-xs font-bold text-slate-500">
                            Ver local <ChevronRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {filtered.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center text-slate-500 text-sm">
              No hay locales con esos filtros.
            </div>
          )}
        </section>

        <div className="text-center pt-2 pb-4">
          <Link href="/rutas" className="text-sm font-bold text-orange-600">
            ← Ver todas las rutas
          </Link>
        </div>
      </div>
    </div>
  );
}
