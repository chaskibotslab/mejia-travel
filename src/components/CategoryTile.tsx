import Link from 'next/link';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  href: string;
  label: string;
  color?: string | null;
  icon?: string | null;
  image?: string | null;
  className?: string;
};

// Mapa: slug-hash -> gradient vibrante estilo Instagram
const GRADIENTS = [
  'from-pink-500 via-rose-500 to-orange-400',
  'from-fuchsia-500 via-purple-500 to-indigo-600',
  'from-cyan-400 via-blue-500 to-purple-600',
  'from-emerald-400 via-teal-500 to-cyan-600',
  'from-amber-400 via-orange-500 to-pink-500',
  'from-violet-500 via-purple-600 to-fuchsia-600',
  'from-rose-400 via-pink-500 to-purple-600',
  'from-lime-400 via-emerald-500 to-teal-600',
];

function hashGradient(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

export default function CategoryTile({ href, label, icon, image, className }: Props) {
  const IconCmp = (icon && (Icons as any)[icon]) || Icons.Sparkles;
  const grad = hashGradient(label);

  return (
    <Link
      href={href}
      className={cn(
        'group relative overflow-hidden rounded-2xl aspect-square shadow-[0_6px_18px_rgba(120,40,200,0.18)] active:scale-95 hover:scale-[1.03] transition-transform',
        className
      )}
    >
      {/* Fondo: si hay imagen úsala, si no, gradient vibrante */}
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={label} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${grad}`} />
      )}

      {/* Overlay degradado para legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Brillo decorativo (estilo Instagram) */}
      <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform" />

      {/* Contenido */}
      <div className="relative h-full flex flex-col justify-between p-3">
        <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 grid place-items-center text-white">
          <IconCmp className="w-5 h-5" strokeWidth={2} />
        </div>
        <div className="text-white">
          <p className="text-sm font-extrabold leading-tight drop-shadow-md">{label}</p>
        </div>
      </div>
    </Link>
  );
}
