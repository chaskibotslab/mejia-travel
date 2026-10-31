'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

export function formatEcuadorTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Guayaquil',
  });
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

// Portada de una ruta programada: cuenta regresiva hasta publish_at.
// La activación real la decide la base de datos (RLS con la hora del servidor);
// aquí solo se vuelve a consultar: cada minuto mientras corre (por si el reloj
// del celular está atrasado) y cada 5 s cuando llega a cero, hasta que cargue.
export default function RouteCountdown({
  route,
  onCheck,
}: {
  route: { name: string; short_description?: string | null; color?: string | null; publish_at: string };
  onCheck: () => void;
}) {
  const target = new Date(route.publish_at).getTime();
  const [now, setNow] = useState(() => Date.now());
  const lastCheck = useRef(Date.now());
  const remaining = Math.max(0, target - now);
  const done = remaining === 0;

  useEffect(() => {
    const t = setInterval(() => {
      const n = Date.now();
      setNow(n);
      const every = n >= target ? 5000 : 60000;
      if (n - lastCheck.current >= every) {
        lastCheck.current = n;
        onCheck();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [target, onCheck]);

  const totalSec = Math.floor(remaining / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const color = route.color || '#f97316';

  return (
    <div className="fade-in -mx-4 -mt-4">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1e0b36] via-[#3b0f5c] to-[#7c2d12] px-5 pt-12 pb-10 text-white text-center min-h-[70vh] flex flex-col justify-center">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-40" style={{ background: color }} />
        <div className="absolute -bottom-16 -left-10 w-56 h-56 bg-purple-500/30 rounded-full blur-3xl" />

        <div className="relative">
          <p className="text-6xl mb-3 select-none" aria-hidden>
            🎃
          </p>
          <p className="text-xs font-bold uppercase tracking-wider text-orange-300">Ruta especial</p>
          <h1 className="text-3xl font-extrabold mt-1 drop-shadow-lg">{route.name}</h1>
          {route.short_description && <p className="text-sm text-white/80 mt-1.5">{route.short_description}</p>}

          <div className="mt-8 mx-auto max-w-xs bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/15">
            {done ? (
              <p className="flex items-center justify-center gap-2 text-sm font-bold">
                <Loader2 className="w-4 h-4 animate-spin" /> Activando la ruta…
              </p>
            ) : (
              <>
                <p className="text-sm font-bold text-white/90">
                  La ruta se activa hoy a las <span className="text-orange-300">{formatEcuadorTime(route.publish_at)}</span>
                </p>
                <p className="mt-3 text-4xl font-extrabold tabular-nums tracking-wider" aria-live="polite">
                  {pad(h)}:{pad(m)}:{pad(s)}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-white/60">horas · minutos · segundos</p>
              </>
            )}
          </div>
          <p className="mt-5 text-xs text-white/70">Deja esta página abierta: el mapa con los locales aparece solo.</p>
          <Link href="/rutas" className="inline-block mt-6 text-sm font-bold text-orange-300">
            ← Ver otras rutas
          </Link>
        </div>
      </div>
    </div>
  );
}
