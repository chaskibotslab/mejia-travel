'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import ImageUpload from '@/components/ImageUpload';

export default function NewEventPage() {
  const supabase = createClient();
  const router = useRouter();
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

  async function submit(e: any) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('events').insert({
      ...form,
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
    });
    setLoading(false);
    if (error) { alert(error.message); return; }
    router.push('/admin');
  }

  return (
    <form onSubmit={submit} className="px-4 pt-4 fade-in space-y-3">
      <h1 className="text-xl font-bold">Nuevo evento</h1>
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
      <button disabled={loading} className="w-full rounded-xl bg-brand-600 text-white py-3 font-semibold shadow-card">{loading ? 'Guardando…' : 'Crear evento'}</button>
      <style jsx>{`
        .inp { width:100%; border-radius:.75rem; border:1px solid rgb(226 232 240); background:white; padding:.625rem .75rem; font-size:.875rem; }
      `}</style>
    </form>
  );
}
