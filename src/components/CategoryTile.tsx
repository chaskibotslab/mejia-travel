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

// Paleta semántica por slug/label (fallback si no viene color de BD)
const PALETTE: Record<string, { bg: string; ring: string; icon: string }> = {
  gastronomia:    { bg: 'bg-orange-50',   ring: 'bg-orange-100',   icon: 'text-orange-600' },
  hospedaje:      { bg: 'bg-violet-50',   ring: 'bg-violet-100',   icon: 'text-violet-600' },
  turismo:        { bg: 'bg-emerald-50',  ring: 'bg-emerald-100',  icon: 'text-emerald-600' },
  medicina:       { bg: 'bg-rose-50',     ring: 'bg-rose-100',     icon: 'text-rose-600' },
  'medicina-y-salud': { bg: 'bg-rose-50', ring: 'bg-rose-100',     icon: 'text-rose-600' },
  salud:          { bg: 'bg-rose-50',     ring: 'bg-rose-100',     icon: 'text-rose-600' },
  automotriz:     { bg: 'bg-slate-50',    ring: 'bg-slate-100',    icon: 'text-slate-700' },
  'servicios-publicos': { bg: 'bg-amber-50', ring: 'bg-amber-100', icon: 'text-amber-600' },
  servicios:      { bg: 'bg-amber-50',    ring: 'bg-amber-100',    icon: 'text-amber-600' },
  educacion:      { bg: 'bg-sky-50',      ring: 'bg-sky-100',      icon: 'text-sky-600' },
  compras:        { bg: 'bg-pink-50',     ring: 'bg-pink-100',     icon: 'text-pink-600' },
  'compras-e-insumos': { bg: 'bg-pink-50',ring: 'bg-pink-100',     icon: 'text-pink-600' },
  belleza:        { bg: 'bg-fuchsia-50',  ring: 'bg-fuchsia-100',  icon: 'text-fuchsia-600' },
  transporte:     { bg: 'bg-cyan-50',     ring: 'bg-cyan-100',     icon: 'text-cyan-700' },
  inmobiliaria:   { bg: 'bg-stone-50',    ring: 'bg-stone-100',    icon: 'text-stone-700' },
  default:        { bg: 'bg-slate-50',    ring: 'bg-slate-100',    icon: 'text-slate-600' },
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function CategoryTile({ href, label, icon, color, className }: Props) {
  const IconCmp = (icon && (Icons as any)[icon]) || Icons.Sparkles;
  const key = slugify(label);
  const palette = PALETTE[key] ?? PALETTE.default;

  // Si la BD trae un color específico, lo usamos para el círculo
  const ringStyle = color ? { background: `${color}1A` } : undefined; // 1A = 10% alpha
  const iconStyle = color ? { color } : undefined;

  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-card transition-all active:scale-95',
        className
      )}
    >
      {/* Círculo con ícono */}
      <div
        className={cn(
          'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl grid place-items-center transition-transform group-hover:scale-110 group-active:scale-95',
          !color && palette.ring
        )}
        style={ringStyle}
      >
        <IconCmp
          className={cn('w-7 h-7 sm:w-8 sm:h-8', !color && palette.icon)}
          style={iconStyle}
          strokeWidth={1.8}
        />
      </div>

      {/* Nombre */}
      <span className="text-[11px] sm:text-xs font-semibold text-slate-700 text-center leading-tight line-clamp-2">
        {label}
      </span>
    </Link>
  );
}
