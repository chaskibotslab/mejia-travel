'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Loader2, Pencil, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { TransportCooperative, TransportRoute } from '@/lib/types';

export default function CoopRoutesPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [coop, setCoop] = useState<TransportCooperative | null>(null);
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<TransportRoute> | null>(null);

  async function load() {
    setLoading(true);
    const [c, r] = await Promise.all([
      supabase.from('transport_cooperatives').select('*').eq('id', params.id).single(),
      supabase.from('transport_routes').select('*').eq('cooperative_id', params.id).order('sort_order'),
    ]);
    setCoop(c.data as TransportCooperative);
    setRoutes((r.data ?? []) as TransportRoute[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, [params.id]);

  async function save() {
    if (!editing || !editing.origin || !editing.destination) { alert('Origen y destino requeridos'); return; }
    const payload = { ...editing, cooperative_id: params.id };
    const res = editing.id
      ? await supabase.from('transport_routes').update(payload).eq('id', editing.id)
      : await supabase.from('transport_routes').insert(payload);
    if (res.error) { alert(res.error.message); return; }
    setEditing(null);
    load();
  }

  async function del(id: string) {
    if (!confirm('Eliminar ruta?')) return;
    await supabase.from('transport_routes').delete().eq('id', id);
    load();
  }

  if (loading) return <Loader2 className="w-5 h-5 animate-spin mx-auto mt-10" />;

  return (
    <div className="px-4 pt-4 fade-in">
      <Link href="/admin/cooperativas" className="text-xs text-brand-600 flex items-center gap-1 mb-2">
        <ArrowLeft className="w-3 h-3" /> Volver a cooperativas
      </Link>
      <h1 className="text-xl font-bold mb-1">{coop?.name}</h1>
      <p className="text-sm text-slate-500 mb-3">Rutas de la cooperativa</p>

      <button onClick={() => setEditing({ sort_order: routes.length + 1 })} className="mb-3 flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-600 text-white text-sm font-semibold">
        <Plus className="w-4 h-4" /> Agregar ruta
      </button>

      {routes.length === 0 ? (
        <p className="text-sm text-slate-500">Sin rutas registradas.</p>
      ) : (
        <ul className="space-y-2">
          {routes.map((r) => (
            <li key={r.id} className="rounded-xl bg-white border border-slate-200 p-3 shadow-soft">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <div className="font-semibold">{r.origin} → {r.destination}</div>
                  <div className="text-xs text-slate-500">
                    {(r.schedule_start || '—')} – {(r.schedule_end || '—')} · {r.frequency || 'sin frecuencia'}
                    {r.fare != null && ` · $${Number(r.fare).toFixed(2)}`}
                  </div>
                  {r.notes && <p className="text-xs text-slate-500 mt-1">{r.notes}</p>}
                </div>
                <button onClick={() => setEditing(r)} className="p-2 text-blue-600"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => del(r.id)} className="p-2 text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-end sm:place-items-center" onClick={() => setEditing(null)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-4 max-h-[90vh] overflow-y-auto space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{editing.id ? 'Editar' : 'Nueva'} ruta</h2>
              <button onClick={() => setEditing(null)}><X className="w-5 h-5" /></button>
            </div>
            <Field label="Origen *"><input value={editing.origin ?? ''} onChange={(e) => setEditing({ ...editing, origin: e.target.value })} className="inp" placeholder="Machachi" /></Field>
            <Field label="Destino *"><input value={editing.destination ?? ''} onChange={(e) => setEditing({ ...editing, destination: e.target.value })} className="inp" placeholder="Quitumbe" /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Hora inicio"><input value={editing.schedule_start ?? ''} onChange={(e) => setEditing({ ...editing, schedule_start: e.target.value })} className="inp" placeholder="04:00" /></Field>
              <Field label="Hora fin"><input value={editing.schedule_end ?? ''} onChange={(e) => setEditing({ ...editing, schedule_end: e.target.value })} className="inp" placeholder="21:00" /></Field>
            </div>
            <Field label="Frecuencia"><input value={editing.frequency ?? ''} onChange={(e) => setEditing({ ...editing, frequency: e.target.value })} className="inp" placeholder="Cada 7 min" /></Field>
            <Field label="Tarifa ($)"><input type="number" step="0.01" value={editing.fare ?? ''} onChange={(e) => setEditing({ ...editing, fare: e.target.value ? Number(e.target.value) : null })} className="inp" /></Field>
            <Field label="Notas"><textarea rows={2} value={editing.notes ?? ''} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} className="inp resize-none" /></Field>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setEditing(null)} className="flex-1 py-2 rounded-xl bg-slate-100">Cancelar</button>
              <button onClick={save} className="flex-1 py-2 rounded-xl bg-brand-600 text-white font-semibold">Guardar</button>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`.inp { width:100%; border-radius:.6rem; border:1px solid rgb(226 232 240); background:white; padding:.5rem .65rem; font-size:.875rem; }`}</style>
    </div>
  );
}

function Field({ label, children }: any) {
  return (<label className="block"><span className="block text-xs font-semibold text-slate-600 mb-1">{label}</span>{children}</label>);
}
