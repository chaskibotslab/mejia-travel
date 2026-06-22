'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Upload, Loader2, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const CATEGORIES = ['Vehículos', 'Hogar', 'Animales', 'Agricultura', 'Electrónica', 'Ropa', 'Otros'];

export default function PublishItemPage() {
  return (
    <Suspense fallback={<div className="px-4 pt-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></div>}>
      <PublishItemInner />
    </Suspense>
  );
}

function PublishItemInner() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get('id');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [defaultHours, setDefaultHours] = useState(720); // 30 días por defecto
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Otros',
    condition: 'usado' as 'nuevo' | 'usado' | 'seminuevo',
    phone: '',
    whatsapp: '',
    location: 'Machachi',
    images: [] as string[],
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push(`/cuenta?redirect=/mercado/publicar${editId ? `?id=${editId}` : ''}`);
        return;
      }
      setUser(data.user);

      const { data: setting } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'marketplace_default_hours')
        .maybeSingle();
      if (setting?.value) setDefaultHours(Number(setting.value));

      if (editId) {
        const { data: it } = await supabase
          .from('marketplace_items')
          .select('*')
          .eq('id', editId)
          .eq('user_id', data.user.id)
          .maybeSingle();
        if (!it) { alert('No encontramos esa publicación o no es tuya.'); router.push('/cuenta/mis-articulos'); return; }
        setForm({
          title: it.title || '',
          description: it.description || '',
          price: it.price?.toString() || '',
          category: it.category || 'Otros',
          condition: it.condition || 'usado',
          phone: it.phone || '',
          whatsapp: it.whatsapp || '',
          location: it.location || 'Machachi',
          images: it.images || [],
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  async function uploadImage(file: File) {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `marketplace/${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('media').upload(path, file, { upsert: false });
    if (error) {
      alert('Error subiendo imagen: ' + error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('media').getPublicUrl(path);
    setForm((f) => ({ ...f, images: [...f.images, data.publicUrl] }));
    setUploading(false);
  }

  function removeImage(idx: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }

  async function submit(e: any) {
    e.preventDefault();
    if (!user) return;
    if (!form.title || !form.price) {
      alert('Título y precio son obligatorios');
      return;
    }
    setLoading(true);

    const payload = {
      title: form.title,
      description: form.description || null,
      price: Number(form.price),
      category: form.category,
      condition: form.condition,
      phone: form.phone || null,
      whatsapp: form.whatsapp || null,
      location: form.location || null,
      images: form.images,
    };

    if (editId) {
      // Modo edición: NO tocamos expires_at ni user_id
      const { error } = await supabase
        .from('marketplace_items')
        .update(payload)
        .eq('id', editId)
        .eq('user_id', user.id);
      setLoading(false);
      if (error) { alert(error.message); return; }
      router.push(`/mercado/${editId}`);
      return;
    }

    // Modo creación: aplica expires_at con la duración configurada
    const expires_at = new Date(Date.now() + defaultHours * 3600 * 1000).toISOString();
    const { data, error } = await supabase
      .from('marketplace_items')
      .insert({ ...payload, user_id: user.id, expires_at })
      .select('id')
      .single();
    setLoading(false);
    if (error) { alert(error.message); return; }
    router.push(`/mercado/${data!.id}`);
  }

  const durationText = defaultHours >= 24
    ? `${Math.round(defaultHours / 24)} días`
    : `${defaultHours} horas`;

  return (
    <form onSubmit={submit} className="px-4 pt-4 fade-in space-y-3">
      <h1 className="text-xl font-bold mb-2">{editId ? 'Editar publicación' : 'Publicar artículo'}</h1>
      <p className="text-xs text-slate-500 -mt-2">
        {editId
          ? 'Edita los datos. La fecha de vencimiento se conserva.'
          : `Tu publicación será visible por ${durationText}.`}
      </p>

      <Field label="Título *">
        <input
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="input"
          placeholder="Ej: Bicicleta de montaña"
        />
      </Field>

      <Field label="Precio (USD) *">
        <input
          required
          type="number"
          step="0.01"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="input"
          placeholder="0.00"
        />
      </Field>

      <Field label="Categoría">
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="input"
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>

      <Field label="Estado">
        <select
          value={form.condition}
          onChange={(e) => setForm({ ...form, condition: e.target.value as any })}
          className="input"
        >
          <option value="nuevo">Nuevo</option>
          <option value="seminuevo">Seminuevo</option>
          <option value="usado">Usado</option>
        </select>
      </Field>

      <Field label="Descripción">
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          className="input resize-none"
        />
      </Field>

      <Field label="Teléfono">
        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="input"
          placeholder="+593..."
        />
      </Field>
      <Field label="WhatsApp">
        <input
          value={form.whatsapp}
          onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
          className="input"
          placeholder="+593..."
        />
      </Field>
      <Field label="Ubicación">
        <input
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          className="input"
        />
      </Field>

      <Field label="Fotos">
        <div className="flex gap-2 flex-wrap">
          {form.images.map((url, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-20 h-20 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white grid place-items-center shadow"
                aria-label="Quitar imagen"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          <label className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 grid place-items-center cursor-pointer hover:bg-slate-50">
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 text-slate-400" />}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])}
            />
          </label>
        </div>
      </Field>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand-600 text-white py-3 font-semibold shadow-card disabled:opacity-60"
      >
        {loading ? 'Guardando…' : editId ? 'Guardar cambios' : 'Publicar artículo'}
      </button>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(226 232 240);
          background: white;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
        }
        .input:focus {
          outline: none;
          border-color: rgb(59 91 219);
          box-shadow: 0 0 0 3px rgba(59, 91, 219, 0.15);
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}
