'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const CATEGORIES = ['Vehículos', 'Hogar', 'Animales', 'Agricultura', 'Electrónica', 'Ropa', 'Otros'];

export default function PublishItemPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/cuenta?redirect=/mercado/publicar');
      } else {
        setUser(data.user);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  async function submit(e: any) {
    e.preventDefault();
    if (!user) return;
    if (!form.title || !form.price) {
      alert('Título y precio son obligatorios');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('marketplace_items')
      .insert({
        user_id: user.id,
        title: form.title,
        description: form.description || null,
        price: Number(form.price),
        category: form.category,
        condition: form.condition,
        phone: form.phone || null,
        whatsapp: form.whatsapp || null,
        location: form.location || null,
        images: form.images,
      })
      .select('id')
      .single();
    setLoading(false);
    if (error) {
      alert(error.message);
      return;
    }
    router.push(`/mercado/${data!.id}`);
  }

  return (
    <form onSubmit={submit} className="px-4 pt-4 fade-in space-y-3">
      <h1 className="text-xl font-bold mb-2">Publicar artículo</h1>
      <p className="text-xs text-slate-500 -mt-2">Tu publicación será visible por 48 horas.</p>

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
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={url} alt="" className="w-20 h-20 rounded-lg object-cover" />
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
        {loading ? 'Publicando…' : 'Publicar artículo'}
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
