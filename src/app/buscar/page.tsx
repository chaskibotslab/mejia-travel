'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Hit = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  cover_image: string | null;
  rating_avg: number;
  rating_count: number;
  latitude: number | null;
  longitude: number | null;
};

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function SearchPage() {
  const supabase = createClient();
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [near, setNear] = useState<{ lat: number; lng: number } | null>(null);
  const [nearLoading, setNearLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!q.trim()) {
        setHits([]);
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from('businesses')
        .select('id, slug, name, short_description, cover_image, rating_avg, rating_count, latitude, longitude')
        .eq('is_published', true)
        .or(`name.ilike.%${q}%,short_description.ilike.%${q}%,description.ilike.%${q}%`)
        .limit(30);
      setHits((data as Hit[]) ?? []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function searchNearMe() {
    if (!navigator.geolocation) {
      alert('Tu dispositivo no soporta ubicación');
      return;
    }
    setNearLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setNear({ lat, lng });
        const { data } = await supabase
          .from('businesses')
          .select('id, slug, name, short_description, cover_image, rating_avg, rating_count, latitude, longitude')
          .eq('is_published', true)
          .not('latitude', 'is', null);
        const sorted = ((data as Hit[]) ?? [])
          .map((b) => ({
            ...b,
            _d: b.latitude && b.longitude ? distanceKm(lat, lng, b.latitude, b.longitude) : 9999,
          }))
          .sort((a, b) => (a as any)._d - (b as any)._d)
          .slice(0, 30);
        setHits(sorted);
        setNearLoading(false);
      },
      () => {
        alert('No se pudo obtener la ubicación');
        setNearLoading(false);
      }
    );
  }

  return (
    <div className="px-4 pt-4 fade-in">
      <h1 className="text-xl font-bold mb-3">Buscar</h1>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="¿Qué necesitas?"
          className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-300"
        />
      </div>
      <button
        onClick={searchNearMe}
        disabled={nearLoading}
        className="flex items-center gap-2 w-full justify-center rounded-xl bg-brand-600 text-white py-2.5 font-semibold shadow-card mb-4 disabled:opacity-60"
      >
        {nearLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
        Cerca de mí
      </button>

      {loading && <p className="text-sm text-slate-500">Buscando…</p>}

      <ul className="space-y-2">
        {hits.map((h) => {
          const d =
            near && h.latitude && h.longitude
              ? distanceKm(near.lat, near.lng, h.latitude, h.longitude)
              : null;
          return (
            <li key={h.id}>
              <Link
                href={`/n/${h.slug}`}
                className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-3 py-3 shadow-soft hover:shadow-card"
              >
                {h.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={h.cover_image} alt={h.name} className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-brand-100 grid place-items-center text-brand-700 font-bold">
                    {h.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{h.name}</h3>
                  {h.short_description && (
                    <p className="text-xs text-slate-500 truncate">{h.short_description}</p>
                  )}
                </div>
                {d != null && (
                  <span className="text-xs text-brand-600 font-semibold">{d.toFixed(1)} km</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
