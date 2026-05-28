'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Sparkles } from 'lucide-react';

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
};

export default function HomeHero({ banners }: { banners: Banner[] }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  const current = banners[idx];
  const fallbackBg = 'https://images.unsplash.com/photo-1568388505325-cad6c925da12?w=1600&q=80';

  function search(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/buscar?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <div className="relative -mx-4 -mt-4 mb-2">
      {/* Slides */}
      <div className="relative h-[420px] sm:h-[480px] overflow-hidden">
        {(banners.length > 0 ? banners : [{ id: 'fb', title: 'Mejía Travel', subtitle: 'Todo lo que buscas en el Cantón Mejía', image: fallbackBg, link: null }]).map((b, i) => (
          <div
            key={b.id}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: i === idx % (banners.length || 1) ? 1 : 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={b.image}
              alt={b.title}
              className="w-full h-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/80" />
          </div>
        ))}

        {/* Contenido encima */}
        <div className="relative h-full flex flex-col justify-end pb-24 px-5 text-white max-w-3xl mx-auto">
          <div className="flex items-center gap-1.5 text-xs text-white/90 mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>Cantón Mejía · Pichincha · Ecuador</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight drop-shadow-lg">
            {current?.title ?? 'Mejía Travel'}
          </h1>
          {current?.subtitle && (
            <p className="text-sm sm:text-base text-white/95 mt-2 drop-shadow max-w-xl">
              {current.subtitle}
            </p>
          )}

          {/* Dots indicador */}
          {banners.length > 1 && (
            <div className="flex gap-1.5 mt-3">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
                  aria-label={`Ir a banner ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Buscador grande superpuesto */}
      <form
        onSubmit={search}
        className="relative -mt-10 mx-4 max-w-3xl sm:mx-auto bg-white rounded-2xl shadow-card p-2 flex items-center gap-2 z-10 border border-slate-200"
      >
        <Search className="w-5 h-5 text-brand-600 ml-2" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          type="text"
          placeholder="¿Qué buscas hoy? hornado, cotopaxi, taxi..."
          className="flex-1 outline-none text-sm py-2.5 bg-transparent"
        />
        <button
          type="submit"
          className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-4 py-2.5 transition active:scale-95"
        >
          Buscar
        </button>
      </form>

      {/* Quick filters vibrantes debajo del buscador */}
      <div className="px-4 mt-4 flex gap-2.5 overflow-x-auto pb-1 max-w-3xl sm:mx-auto scrollbar-hide">
        {[
          { label: 'Comer', emoji: '🍽', href: '/c/gastronomia', grad: 'from-orange-400 via-pink-500 to-rose-500' },
          { label: 'Dormir', emoji: '🏨', href: '/c/hospedaje', grad: 'from-purple-500 via-fuchsia-500 to-pink-500' },
          { label: 'Turismo', emoji: '🏔', href: '/c/turismo', grad: 'from-cyan-400 via-blue-500 to-indigo-600' },
          { label: 'Salud', emoji: '💊', href: '/c/medicina', grad: 'from-red-400 via-rose-500 to-pink-600' },
          { label: 'Transporte', emoji: '🚌', href: '/c/transporte', grad: 'from-emerald-400 via-teal-500 to-cyan-500' },
          { label: 'Compras', emoji: '🛍', href: '/c/compras', grad: 'from-amber-400 via-orange-500 to-red-500' },
          { label: 'Belleza', emoji: '✨', href: '/c/belleza', grad: 'from-pink-400 via-fuchsia-500 to-purple-600' },
        ].map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className={`group flex-shrink-0 rounded-2xl text-white font-bold text-xs sm:text-sm shadow-[0_4px_14px_rgba(120,40,200,0.25)] active:scale-95 hover:scale-105 transition-transform overflow-hidden`}
          >
            <div className={`bg-gradient-to-br ${q.grad} px-4 py-2.5 flex items-center gap-1.5`}>
              <span className="text-base">{q.emoji}</span>
              <span className="drop-shadow-sm">{q.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
