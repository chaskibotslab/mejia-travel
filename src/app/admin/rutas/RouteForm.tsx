'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, Trash2, GripVertical, Loader2, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import ImageUpload from '@/components/ImageUpload';

type Stop = {
  id?: string;
  name: string;
  description: string;
  latitude: number | string;
  longitude: number | string;
  business_slug: string;
  stop_order: number;
  estimated_time_min: number | string;
};

type RouteData = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  short_description: string;
  cover_image: string;
  duration_hours: number | string;
  distance_km: number | string;
  difficulty: 'facil' | 'media' | 'dificil';
  color: string;
  starting_point: string;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
};

const EMPTY_ROUTE: RouteData = {
  slug: '',
  name: '',
  description: '',
  short_description: '',
  cover_image: '',
  duration_hours: '',
  distance_km: '',
  difficulty: 'facil',
  color: '#7c3aed',
  starting_point: '',
  is_published: true,
  is_featured: false,
  sort_order: 100,
};

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function RouteForm({ routeId }: { routeId?: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [route, setRoute] = useState<RouteData>(EMPTY_ROUTE);
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(!!routeId);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!routeId) return;
    (async () => {
      const { data: r } = await supabase.from('tourist_routes').select('*').eq('id', routeId).single();
      const { data: s } = await supabase.from('tourist_route_stops').select('*').eq('route_id', routeId).order('stop_order');
      if (r) setRoute({ ...EMPTY_ROUTE, ...r });
      if (s) setStops(s as Stop[]);
      setLoading(false);
    })();
  }, [routeId]);

  function update<K extends keyof RouteData>(k: K, v: RouteData[K]) {
    setRoute((r) => ({ ...r, [k]: v }));
  }

  function addStop() {
    setStops((s) => [
      ...s,
      { name: '', description: '', latitude: '', longitude: '', business_slug: '', stop_order: s.length + 1, estimated_time_min: '' },
    ]);
  }
  function removeStop(i: number) {
    setStops((s) => s.filter((_, idx) => idx !== i).map((st, idx) => ({ ...st, stop_order: idx + 1 })));
  }
  function updateStop(i: number, field: keyof Stop, val: any) {
    setStops((s) => s.map((st, idx) => (idx === i ? { ...st, [field]: val } : st)));
  }
  function moveStop(i: number, dir: -1 | 1) {
    setStops((s) => {
      const next = [...s];
      const j = i + dir;
      if (j < 0 || j >= next.length) return s;
      [next[i], next[j]] = [next[j], next[i]];
      return next.map((st, idx) => ({ ...st, stop_order: idx + 1 }));
    });
  }

  async function handleSave() {
    setSaving(true);
    setErr('');
    try {
      const payload: any = {
        ...route,
        slug: route.slug || slugify(route.name),
        duration_hours: route.duration_hours === '' ? null : Number(route.duration_hours),
        distance_km: route.distance_km === '' ? null : Number(route.distance_km),
      };

      let id = routeId;
      if (id) {
        const { error } = await supabase.from('tourist_routes').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('tourist_routes').insert(payload).select().single();
        if (error) throw error;
        id = data.id;
      }

      // Reemplazar paradas
      await supabase.from('tourist_route_stops').delete().eq('route_id', id!);
      if (stops.length > 0) {
        const stopsPayload = stops.map((s, idx) => ({
          route_id: id,
          name: s.name,
          description: s.description || null,
          latitude: Number(s.latitude),
          longitude: Number(s.longitude),
          business_slug: s.business_slug || null,
          stop_order: idx + 1,
          estimated_time_min: s.estimated_time_min === '' ? null : Number(s.estimated_time_min),
        }));
        const { error: e2 } = await supabase.from('tourist_route_stops').insert(stopsPayload);
        if (e2) throw e2;
      }

      router.push('/admin/rutas');
      router.refresh();
    } catch (e: any) {
      setErr(e.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader2 className="w-5 h-5 animate-spin mx-auto mt-10" />;

  return (
    <div className="px-4 pt-4 pb-20 fade-in max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{routeId ? 'Editar ruta' : 'Nueva ruta turística'}</h1>
        <button
          onClick={handleSave}
          disabled={saving || !route.name}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-fuchsia-600 text-white text-sm font-bold disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar
        </button>
      </div>

      {err && <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm p-3">{err}</div>}

      {/* Datos principales */}
      <section className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
        <h2 className="font-bold text-slate-900">Información general</h2>

        <Field label="Nombre *">
          <input value={route.name} onChange={(e) => update('name', e.target.value)} className="input" placeholder="Circuito de los Volcanes" />
        </Field>
        <Field label="Slug (URL)" help="Se autogenera del nombre si lo dejas vacío">
          <input value={route.slug} onChange={(e) => update('slug', e.target.value)} className="input" placeholder="circuito-volcanes" />
        </Field>
        <Field label="Descripción corta">
          <input value={route.short_description} onChange={(e) => update('short_description', e.target.value)} className="input" placeholder="Pasochoa, Cotopaxi y El Corazón en un día" />
        </Field>
        <Field label="Descripción completa">
          <textarea value={route.description} onChange={(e) => update('description', e.target.value)} className="input min-h-[100px]" placeholder="Detalle del recorrido…" />
        </Field>
        <Field label="Imagen de portada" help="Sube una foto desde tu equipo o pega una URL externa">
          <ImageUpload
            value={route.cover_image || null}
            onChange={(url) => update('cover_image', url || '')}
            folder="rutas"
            previewSize="lg"
            label="Subir foto de la ruta"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Duración (horas)">
            <input type="number" step="0.5" value={route.duration_hours} onChange={(e) => update('duration_hours', e.target.value)} className="input" />
          </Field>
          <Field label="Distancia (km)">
            <input type="number" step="0.1" value={route.distance_km} onChange={(e) => update('distance_km', e.target.value)} className="input" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Dificultad">
            <select value={route.difficulty} onChange={(e) => update('difficulty', e.target.value as any)} className="input">
              <option value="facil">Fácil</option>
              <option value="media">Media</option>
              <option value="dificil">Difícil</option>
            </select>
          </Field>
          <Field label="Color (mapa)">
            <input type="color" value={route.color} onChange={(e) => update('color', e.target.value)} className="w-full h-10 rounded-lg border border-slate-200" />
          </Field>
        </div>

        <Field label="Punto de partida">
          <input value={route.starting_point} onChange={(e) => update('starting_point', e.target.value)} className="input" placeholder="Plaza Central de Machachi" />
        </Field>

        <div className="flex gap-4 pt-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={route.is_published} onChange={(e) => update('is_published', e.target.checked)} /> Publicada
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={route.is_featured} onChange={(e) => update('is_featured', e.target.checked)} /> Destacada
          </label>
        </div>
      </section>

      {/* PARADAS */}
      <section className="rounded-2xl bg-white border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-fuchsia-600" /> Paradas del recorrido
          </h2>
          <button onClick={addStop} className="flex items-center gap-1 text-xs font-bold text-fuchsia-600 px-2 py-1 rounded-lg bg-fuchsia-50">
            <Plus className="w-3.5 h-3.5" /> Añadir parada
          </button>
        </div>

        {stops.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">Aún no hay paradas. Añade al menos 2 para dibujar la línea en el mapa.</p>
        ) : (
          <ol className="space-y-3">
            {stops.map((s, i) => (
              <li key={i} className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-fuchsia-600 text-white font-bold text-xs grid place-items-center">{i + 1}</div>
                  <input
                    value={s.name}
                    onChange={(e) => updateStop(i, 'name', e.target.value)}
                    className="flex-1 input"
                    placeholder="Nombre de la parada"
                  />
                  <button onClick={() => moveStop(i, -1)} disabled={i === 0} className="p-1 text-slate-500 disabled:opacity-30" title="Subir">↑</button>
                  <button onClick={() => moveStop(i, 1)} disabled={i === stops.length - 1} className="p-1 text-slate-500 disabled:opacity-30" title="Bajar">↓</button>
                  <button onClick={() => removeStop(i)} className="p-1 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <textarea
                  value={s.description}
                  onChange={(e) => updateStop(i, 'description', e.target.value)}
                  className="input min-h-[50px] text-xs mb-2"
                  placeholder="Descripción opcional"
                />
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input type="number" step="any" value={s.latitude} onChange={(e) => updateStop(i, 'latitude', e.target.value)} className="input text-xs" placeholder="Latitud (-0.5081)" />
                  <input type="number" step="any" value={s.longitude} onChange={(e) => updateStop(i, 'longitude', e.target.value)} className="input text-xs" placeholder="Longitud (-78.5680)" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input value={s.business_slug} onChange={(e) => updateStop(i, 'business_slug', e.target.value)} className="input text-xs" placeholder="Slug negocio (opcional)" />
                  <input type="number" value={s.estimated_time_min} onChange={(e) => updateStop(i, 'estimated_time_min', e.target.value)} className="input text-xs" placeholder="Minutos estimados" />
                </div>
              </li>
            ))}
          </ol>
        )}

        <p className="text-[11px] text-slate-400 mt-3">
          💡 Tip: usa <a href="https://www.google.com/maps" target="_blank" rel="noreferrer" className="text-fuchsia-600 underline">Google Maps</a> → clic derecho en un punto → copiar coordenadas.
        </p>
      </section>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border-radius: 0.625rem;
          border: 1px solid #e2e8f0;
          background: white;
          font-size: 0.875rem;
        }
        .input:focus {
          outline: none;
          border-color: #c026d3;
          box-shadow: 0 0 0 2px rgba(192, 38, 211, 0.15);
        }
      `}</style>
    </div>
  );
}

function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1">{label}</label>
      {children}
      {help && <p className="text-[10px] text-slate-400 mt-1">{help}</p>}
    </div>
  );
}
