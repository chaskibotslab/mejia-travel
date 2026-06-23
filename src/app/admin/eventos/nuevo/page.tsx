'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import ImageUpload from '@/components/ImageUpload';

export default function NewEventPage() {
  return (
    <Suspense fallback={<div className="px-4 pt-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></div>}>
      <NewEventInner />
    </Suspense>
  );
}

function toLocalInput(iso: string | null | undefined) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function NewEventInner() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get('id');
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    organizer: 'GAD Municipal de Mejía',
    starts_at: '',
    ends_at: '',
    cover_image: '',
    is_published: true,
  });
  const [loading, setLoading] = useState(false);
  const [loadingItem, setLoadingItem] = useState(!!editId);

  useEffect(() => {
    if (!editId) return;
    (async () => {
      const { data, error } = await supabase.from('events').select('*').eq('id', editId).maybeSingle();
      if (error || !data) { alert('No se pudo cargar el evento.'); router.push('/admin/eventos'); return; }
      setForm({
        title: data.title || '',
        description: data.description || '',
        location: data.location || '',
        organizer: data.organizer || '',
        starts_at: toLocalInput(data.starts_at),
        ends_at: toLocalInput(data.ends_at),
        cover_image: data.cover_image || '',
        is_published: data.is_published ?? true,
      });
      setLoadingItem(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  async function submit(e: any) {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
    };
    const { error } = editId
      ? await supabase.from('events').update(payload).eq('id', editId)
      : await supabase.from('events').insert(payload);
    setLoading(false);
    if (error) { alert(error.message); return; }
    router.push('/admin/eventos');
  }

  if (loadingItem) {
    return <div className="px-4 pt-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></div>;
  }

  return (
    <form onSubmit={submit} className="px-4 pt-4 fade-in space-y-3">
      <h1 className="text-xl font-bold">{editId ? 'Editar evento' : 'Nuevo evento'}</h1>
      <input required placeholder="Título" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="inp" />
      <textarea placeholder="Descripción" rows={3} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="inp resize-none" />
      <input placeholder="Lugar" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} className="inp" />
      <input placeholder="Organizador" value={form.organizer} onChange={(e) => setForm({...form, organizer: e.target.value})} className="inp" />
      <label className="text-xs text-slate-500">Inicio</label>
      <input required type="datetime-local" value={form.starts_at} onChange={(e) => setForm({...form, starts_at: e.target.value})} className="inp" />
      <label className="text-xs text-slate-500">Fin (opcional)</label>
      <input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({...form, ends_at: e.target.value})} className="inp" />
      <label className="text-xs text-slate-500">Imagen de portada</label>
      <ImageUpload value={form.cover_image || null} onChange={(url) => setForm({...form, cover_image: url || ''})} folder="eventos" previewSize="lg" label="Subir foto del evento" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({...form, is_published: e.target.checked})} />
        Publicado (visible al público)
      </label>
      <button disabled={loading} className="w-full rounded-xl bg-brand-600 text-white py-3 font-semibold shadow-card">{loading ? 'Guardando…' : editId ? 'Guardar cambios' : 'Crear evento'}</button>
      <style jsx>{`
        .inp { width:100%; border-radius:.75rem; border:1px solid rgb(226 232 240); background:white; padding:.625rem .75rem; font-size:.875rem; }
      `}</style>
    </form>
  );
}
