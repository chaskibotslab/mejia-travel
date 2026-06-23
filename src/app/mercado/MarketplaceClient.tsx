'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Clock, Star, Search, X, ShoppingBag, Car, Home, PawPrint, Wheat, Smartphone, Shirt, MoreHorizontal } from 'lucide-react';
import { timeLeft } from '@/lib/utils';

const CATEGORIES = [
  { label: 'Todas',       value: '',            icon: ShoppingBag },
  { label: 'Vehículos',   value: 'Vehículos',   icon: Car },
  { label: 'Hogar',       value: 'Hogar',       icon: Home },
  { label: 'Animales',    value: 'Animales',    icon: PawPrint },
  { label: 'Agricultura', value: 'Agricultura', icon: Wheat },
  { label: 'Electrónica', value: 'Electrónica', icon: Smartphone },
  { label: 'Ropa',        value: 'Ropa',        icon: Shirt },
  { label: 'Otros',       value: 'Otros',       icon: MoreHorizontal },
];

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export default function MarketplaceClient({ items }: { items: any[] }) {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('');

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    return items.filter((it) => {
      if (cat && it.category !== cat) return false;
      if (!q) return true;
      const blob = norm(`${it.title || ''} ${it.description || ''} ${it.location || ''} ${it.category || ''}`);
      return blob.includes(q);
    });
  }, [items, query, cat]);

  return (
    <div className="px-4 pt-4 fade-in">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold">Mercado Mejía</h1>
          <p className="text-xs text-slate-500">{items.length} publicaciones activas</p>
        </div>
        <Link
          href="/mercado/publicar"
          className="flex items-center gap-1.5 rounded-xl bg-accent text-white px-3 py-2 text-sm font-semibold shadow-card active:scale-95"
        >
          <Plus className="w-4 h-4" /> Publicar
        </Link>
      </div>

      {/* Search bar */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, descripción o lugar…"
          className="w-full rounded-xl bg-white border border-slate-200 pl-9 pr-9 py-2.5 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-fuchsia-200"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
            aria-label="Limpiar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Categories chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 mb-3 no-scrollbar">
        {CATEGORIES.map(({ label, value, icon: Icon }) => {
          const active = cat === value;
          return (
            <button
              key={label}
              onClick={() => setCat(value)}
              className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                active
                  ? 'bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white border-transparent shadow-card'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-fuchsia-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center text-slate-500">
          <p className="font-semibold mb-1">{items.length === 0 ? 'Aún no hay artículos' : 'Sin resultados'}</p>
          <p className="text-sm">
            {items.length === 0 ? '¡Sé el primero en publicar algo!' : 'Prueba con otra búsqueda o categoría.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((it) => (
            <Link
              key={it.id}
              href={`/mercado/${it.id}`}
              className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-soft hover:shadow-card active:scale-[0.99] transition"
            >
              <div className="relative aspect-square bg-slate-100">
                {it.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.images[0]} alt={it.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-3xl">📦</div>
                )}
                {it.is_featured && (
                  <div className="absolute top-1.5 left-1.5 bg-amber-400 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-current" /> Destacado
                  </div>
                )}
                <div className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Clock className="w-3 h-3" /> {timeLeft(it.expires_at)}
                </div>
              </div>
              <div className="p-2.5">
                <h3 className="font-semibold text-sm leading-tight truncate">{it.title}</h3>
                <p className="text-brand-600 font-bold text-sm mt-0.5">
                  {it.currency} {Number(it.price).toFixed(2)}
                </p>
                {it.category && (
                  <p className="text-[10px] text-fuchsia-600 font-semibold mt-0.5">{it.category}</p>
                )}
                {it.location && <p className="text-[11px] text-slate-500 truncate">{it.location}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
