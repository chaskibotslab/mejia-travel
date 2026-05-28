'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, MapPin, Loader2, Briefcase, Calendar, Bus, Store } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Hit = {
  type: 'business' | 'professional' | 'event' | 'cooperative';
  id: string;
  slug?: string;
  name: string;
  short?: string | null;
  image?: string | null;
  rating?: number;
  ratingCount?: number;
  latitude?: number | null;
  longitude?: number | null;
  href: string;
  meta?: string;
};

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const TABS: { key: string; label: string; icon: any }[] = [
  { key: 'all', label: 'Todo', icon: Search },
  { key: 'business', label: 'Negocios', icon: Store },
  { key: 'professional', label: 'Profesionales', icon: Briefcase },
  { key: 'event', label: 'Eventos', icon: Calendar },
  { key: 'cooperative', label: 'Transporte', icon: Bus },
];

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-600" /></div>}>
      <SearchInner />
    </Suspense>
  );
}

function SearchInner() {
  const supabase = createClient();
  const params = useSearchParams();
  const initialQ = params.get('q') ?? '';

  const [q, setQ] = useState(initialQ);
  const [tab, setTab] = useState<string>('all');
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [near, setNear] = useState<{ lat: number; lng: number } | null>(null);
  const [nearLoading, setNearLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => doSearch(), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, tab]);

  async function doSearch() {
    if (!q.trim()) {
      setHits([]);
      return;
    }
    setLoading(true);
    const search = `%${q.trim()}%`;
    const results: Hit[] = [];

    const tasks: PromiseLike<any>[] = [];

    if (tab === 'all' || tab === 'business') {
      tasks.push(
        supabase
          .from('businesses')
          .select('id, slug, name, short_description, cover_image, rating_avg, rating_count, latitude, longitude, address')
          .eq('is_published', true)
          .or(`name.ilike.${search},short_description.ilike.${search},description.ilike.${search},address.ilike.${search}`)
          .limit(20)
          .then(({ data }) => {
            (data ?? []).forEach((b: any) =>
              results.push({
                type: 'business',
                id: b.id,
                slug: b.slug,
                name: b.name,
                short: b.short_description,
                image: b.cover_image,
                rating: b.rating_avg,
                ratingCount: b.rating_count,
                latitude: b.latitude,
                longitude: b.longitude,
                href: `/n/${b.slug}`,
                meta: b.address ?? undefined,
              })
            );
          })
      );
    }

    if (tab === 'all' || tab === 'professional') {
      tasks.push(
        supabase
          .from('professionals')
          .select('id, full_name, profession, photo, address, latitude, longitude')
          .eq('is_published', true)
          .or(`full_name.ilike.${search},profession.ilike.${search},bio.ilike.${search}`)
          .limit(20)
          .then(({ data }) => {
            (data ?? []).forEach((p: any) =>
              results.push({
                type: 'professional',
                id: p.id,
                name: p.full_name,
                short: p.profession,
                image: p.photo,
                latitude: p.latitude,
                longitude: p.longitude,
                href: `/buscar?q=${encodeURIComponent(p.full_name)}`,
                meta: p.address ?? p.profession,
              })
            );
          })
      );
    }

    if (tab === 'all' || tab === 'event') {
      tasks.push(
        supabase
          .from('events')
          .select('id, title, description, cover_image, starts_at, location, latitude, longitude')
          .eq('is_published', true)
          .or(`title.ilike.${search},description.ilike.${search},location.ilike.${search}`)
          .limit(20)
          .then(({ data }) => {
            (data ?? []).forEach((e: any) =>
              results.push({
                type: 'event',
                id: e.id,
                name: e.title,
                short: e.description,
                image: e.cover_image,
                latitude: e.latitude,
                longitude: e.longitude,
                href: `/eventos#${e.id}`,
                meta: new Date(e.starts_at).toLocaleDateString('es', { day: 'numeric', month: 'short' }) + (e.location ? ` · ${e.location}` : ''),
              })
            );
          })
      );
    }

    if (tab === 'all' || tab === 'cooperative') {
      tasks.push(
        supabase
          .from('transport_cooperatives')
          .select('id, slug, name, description, logo, cover_image, type, latitude, longitude')
          .eq('is_published', true)
          .or(`name.ilike.${search},description.ilike.${search},type.ilike.${search}`)
          .limit(20)
          .then(({ data }) => {
            (data ?? []).forEach((c: any) =>
              results.push({
                type: 'cooperative',
                id: c.id,
                slug: c.slug,
                name: c.name,
                short: c.description,
                image: c.cover_image ?? c.logo,
                latitude: c.latitude,
                longitude: c.longitude,
                href: `/transporte/${c.slug}`,
                meta: c.type,
              })
            );
          })
      );
    }

    await Promise.all(tasks);
    setHits(results);
    setLoading(false);
  }

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
          .select('id, slug, name, short_description, cover_image, rating_avg, rating_count, latitude, longitude, address')
          .eq('is_published', true)
          .not('latitude', 'is', null);
        const sorted = ((data as any[]) ?? [])
          .map((b) => ({
            type: 'business' as const,
            id: b.id,
            slug: b.slug,
            name: b.name,
            short: b.short_description,
            image: b.cover_image,
            latitude: b.latitude,
            longitude: b.longitude,
            href: `/n/${b.slug}`,
            meta: b.address,
            _d: b.latitude && b.longitude ? distanceKm(lat, lng, b.latitude, b.longitude) : 9999,
          }))
          .sort((a, b) => (a as any)._d - (b as any)._d)
          .slice(0, 30);
        setHits(sorted as any);
        setNearLoading(false);
      },
      () => {
        alert('No se pudo obtener la ubicación');
        setNearLoading(false);
      }
    );
  }

  const typeIcons: Record<string, any> = {
    business: Store,
    professional: Briefcase,
    event: Calendar,
    cooperative: Bus,
  };
  const typeLabels: Record<string, string> = {
    business: 'Negocio',
    professional: 'Profesional',
    event: 'Evento',
    cooperative: 'Cooperativa',
  };

  return (
    <div className="fade-in">
      <h1 className="text-2xl font-bold mb-1">Buscar</h1>
      <p className="text-sm text-slate-500 mb-4">Encuentra negocios, profesionales, eventos y transporte en Mejía</p>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="hornado, doctor, cotopaxi..."
          className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-3 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-300"
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

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 mb-4">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition ${
                active ? 'bg-brand-600 text-white shadow-card' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="text-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-brand-600 mx-auto" />
        </div>
      )}

      {!loading && q && hits.length === 0 && (
        <div className="text-center py-10 text-slate-500">
          <p className="text-sm">No encontramos resultados para "<strong>{q}</strong>"</p>
          <p className="text-xs mt-1">Intenta con otra palabra o usa el asistente IA 🤖</p>
        </div>
      )}

      {!loading && !q && (
        <div className="text-center py-10 text-slate-400">
          <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Empieza a escribir para buscar</p>
        </div>
      )}

      <ul className="space-y-2">
        {hits.map((h) => {
          const TypeIcon = typeIcons[h.type];
          const d = near && h.latitude && h.longitude ? distanceKm(near.lat, near.lng, h.latitude, h.longitude) : null;
          return (
            <li key={`${h.type}-${h.id}`}>
              <Link href={h.href} className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-3 py-3 shadow-soft hover:shadow-card hover:border-brand-200 transition">
                {h.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={h.image} alt={h.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-brand-100 grid place-items-center flex-shrink-0">
                    <TypeIcon className="w-6 h-6 text-brand-700" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                      {typeLabels[h.type]}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm leading-tight truncate">{h.name}</h3>
                  {h.short && <p className="text-xs text-slate-500 truncate mt-0.5">{h.short}</p>}
                  {h.meta && <p className="text-[11px] text-slate-400 truncate mt-0.5">{h.meta}</p>}
                </div>
                {d != null && <span className="text-xs text-brand-600 font-semibold flex-shrink-0">{d.toFixed(1)} km</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
