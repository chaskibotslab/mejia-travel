import Link from 'next/link';
import { Calendar, MapPin } from 'lucide-react';

type Props = {
  id: string;
  title: string;
  cover_image?: string | null;
  starts_at: string;
  location?: string | null;
  category?: string | null;
};

export default function EventCard({ id, title, cover_image, starts_at, location, category }: Props) {
  const date = new Date(starts_at);
  const day = date.getDate();
  const month = date.toLocaleString('es', { month: 'short' }).toUpperCase();
  const weekday = date.toLocaleString('es', { weekday: 'short' });
  const time = date.toLocaleString('es', { hour: '2-digit', minute: '2-digit' });

  return (
    <Link
      href={`/eventos#${id}`}
      className="group flex-shrink-0 w-64 sm:w-72 rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-soft hover:shadow-card transition-all active:scale-[0.98]"
    >
      <div className="relative h-32 bg-slate-100 overflow-hidden">
        {cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover_image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-orange-400 via-pink-500 to-rose-600">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-4 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute inset-0 grid place-items-center text-white/40">
              <Calendar className="w-12 h-12" strokeWidth={1.5} />
            </div>
          </div>
        )}
        <div className="absolute top-2 left-2 bg-white rounded-xl px-2 py-1 text-center shadow-card">
          <div className="text-[10px] font-bold text-accent-600 leading-none">{month}</div>
          <div className="text-lg font-extrabold text-slate-900 leading-none">{day}</div>
        </div>
        {category && (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full">
            {category}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-bold text-sm text-slate-800 leading-tight line-clamp-2">{title}</h3>
        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1.5">
          <Calendar className="w-3 h-3" />
          <span className="capitalize">{weekday}</span>
          <span className="text-slate-300">•</span>
          <span>{time}</span>
        </div>
        {location && (
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{location}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
