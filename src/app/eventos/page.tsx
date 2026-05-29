import { Calendar, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 60;

const MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function formatDate(s: string) {
  const d = new Date(s);
  return {
    day: d.getDate(),
    month: MONTHS[d.getMonth()],
    time: d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
  };
}

export default async function EventsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .gte('starts_at', new Date().toISOString())
    .order('starts_at')
    .limit(60);

  const events = (data ?? []) as any[];

  return (
    <div className="px-4 pt-4 fade-in">
      <h1 className="text-xl font-bold mb-3">Agenda Cultural</h1>

      {events.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center text-slate-500">
          <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-400" />
          <p className="font-semibold">Aún no hay eventos publicados</p>
          <p className="text-sm">Vuelve pronto.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {events.map((e) => {
            const d = formatDate(e.starts_at);
            return (
              <li
                key={e.id}
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-soft"
              >
                {e.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.cover_image} alt={e.title} className="w-full aspect-video object-cover" />
                ) : (
                  <div className="w-full aspect-video relative overflow-hidden bg-gradient-to-br from-orange-400 via-pink-500 to-rose-600">
                    <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/20 rounded-full blur-2xl" />
                    <div className="absolute inset-0 grid place-items-center">
                      <Calendar className="w-12 h-12 text-white/40" strokeWidth={1.5} />
                    </div>
                  </div>
                )}
                <div className="p-3 flex gap-3">
                  <div className="flex-shrink-0 w-14 rounded-lg bg-brand-100 text-brand-700 grid place-items-center text-center py-1">
                    <div>
                      <div className="text-[10px] uppercase font-semibold">{d.month}</div>
                      <div className="text-xl font-extrabold leading-none">{d.day}</div>
                      <div className="text-[10px]">{d.time}</div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold leading-tight">{e.title}</h3>
                    {e.location && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {e.location}
                      </p>
                    )}
                    {e.description && (
                      <p className="text-sm text-slate-600 mt-1 line-clamp-3">{e.description}</p>
                    )}
                    {e.organizer && (
                      <p className="text-[11px] text-slate-400 mt-1">por {e.organizer}</p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
