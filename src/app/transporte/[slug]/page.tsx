import { notFound } from 'next/navigation';
import { Phone, MessageCircle, MapPin, Bus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { telLink, waLink, mapLink } from '@/lib/utils';
import type { TransportCooperative, TransportRoute } from '@/lib/types';

export const revalidate = 60;

export default async function CoopPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: coop } = await supabase
    .from('transport_cooperatives')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();

  if (!coop) notFound();
  const c = coop as TransportCooperative;

  const { data: routes } = await supabase
    .from('transport_routes')
    .select('*')
    .eq('cooperative_id', c.id)
    .order('sort_order');

  const rts = (routes ?? []) as TransportRoute[];

  return (
    <div className="fade-in pb-8">
      <div className="px-4 py-5 text-white" style={{ background: c.color }}>
        <div className="flex items-center gap-3">
          {c.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.logo} alt="" className="w-16 h-16 rounded-xl bg-white/20 p-1 object-contain" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-white/20 grid place-items-center text-3xl">🚌</div>
          )}
          <div>
            <h1 className="text-xl font-bold leading-tight">{c.name}</h1>
            {c.founded_year && (
              <p className="text-sm opacity-90">Sirviendo desde {c.founded_year}</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {c.description && <p className="text-slate-700 text-sm">{c.description}</p>}

        <section>
          <h2 className="font-bold text-slate-800 mb-2 flex items-center gap-1">
            <Bus className="w-4 h-4" /> Nuestras Rutas
          </h2>
          {rts.length === 0 ? (
            <p className="text-sm text-slate-500">Sin rutas registradas todavía.</p>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-emerald-100">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold">Ruta</th>
                    <th className="text-right px-3 py-2 font-semibold">Horario</th>
                    <th className="text-right px-3 py-2 font-semibold">Frec.</th>
                  </tr>
                </thead>
                <tbody>
                  {rts.map((r) => (
                    <tr key={r.id} className="border-t border-slate-100">
                      <td className="px-3 py-2">
                        <div className="font-medium">{r.origin} — {r.destination}</div>
                        {r.fare != null && (
                          <div className="text-xs text-slate-500">${Number(r.fare).toFixed(2)}</div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-600">
                        {r.schedule_start || '—'}{r.schedule_end ? ` – ${r.schedule_end}` : ''}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-600">{r.frequency || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className="font-bold text-slate-800 mb-2">Contáctenos</h2>
          <div className="flex flex-wrap gap-2">
            {c.phone && (
              <a href={telLink(c.phone)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-100 text-emerald-700 text-sm font-medium">
                <Phone className="w-4 h-4" /> {c.phone}
              </a>
            )}
            {c.whatsapp && (
              <a href={waLink(c.whatsapp)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-100 text-green-700 text-sm font-medium">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            )}
            {c.latitude && c.longitude && (
              <a href={mapLink(c.latitude, c.longitude)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-100 text-blue-700 text-sm font-medium">
                <MapPin className="w-4 h-4" /> Mapa
              </a>
            )}
          </div>
          {c.address && <p className="text-sm text-slate-500 mt-2">{c.address}</p>}
        </section>
      </div>
    </div>
  );
}
