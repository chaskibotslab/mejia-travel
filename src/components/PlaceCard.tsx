import Link from 'next/link';
import { Star, MapPin, BadgeCheck } from 'lucide-react';

type Props = {
  href: string;
  name: string;
  image?: string | null;
  short?: string | null;
  address?: string | null;
  rating?: number | null;
  ratingCount?: number | null;
  verified?: boolean;
  badge?: string;
  badgeColor?: string;
  size?: 'sm' | 'md' | 'lg';
};

export default function PlaceCard({
  href,
  name,
  image,
  short,
  address,
  rating,
  ratingCount,
  verified,
  badge,
  badgeColor = '#1B97A3',
  size = 'md',
}: Props) {
  const h = size === 'lg' ? 'h-44' : size === 'sm' ? 'h-28' : 'h-36';
  return (
    <Link
      href={href}
      className="group block rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-soft hover:shadow-card transition-all active:scale-[0.98]"
    >
      <div className={`relative ${h} overflow-hidden bg-slate-100`}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-fuchsia-400 via-purple-500 to-indigo-600 grid place-items-center">
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/15 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="relative text-white text-center px-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 grid place-items-center mb-1.5">
                <MapPin className="w-6 h-6" strokeWidth={1.8} />
              </div>
              <p className="text-xs font-bold drop-shadow line-clamp-2">{name}</p>
            </div>
          </div>
        )}
        {badge && (
          <div
            className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wide"
            style={{ background: badgeColor }}
          >
            {badge}
          </div>
        )}
        {verified && (
          <div className="absolute top-2 right-2 bg-white/95 backdrop-blur rounded-full p-1">
            <BadgeCheck className="w-4 h-4 text-brand-600" />
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-sm text-slate-800 leading-tight line-clamp-2 flex-1">{name}</h3>
          {typeof rating === 'number' && rating > 0 && (
            <div className="flex items-center gap-0.5 text-xs font-semibold text-amber-600 shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {rating.toFixed(1)}
              {typeof ratingCount === 'number' && ratingCount > 0 && (
                <span className="text-slate-400 font-normal">({ratingCount})</span>
              )}
            </div>
          )}
        </div>
        {short && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{short}</p>}
        {address && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1.5">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{address}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
