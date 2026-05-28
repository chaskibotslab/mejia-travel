'use client';
import { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const FIELDS: { key: string; label: string; type?: string; help?: string }[] = [
  { key: 'site.name',        label: 'Nombre del sitio' },
  { key: 'site.tagline',     label: 'Lema / tagline' },
  { key: 'site.gad_phone',   label: 'Teléfono GAD' },
  { key: 'site.gad_email',   label: 'Email GAD' },
  { key: 'site.gad_address', label: 'Dirección GAD' },
  { key: 'site.center_lat',  label: 'Latitud centro mapa', type: 'number', help: 'Ej: -0.5081' },
  { key: 'site.center_lng',  label: 'Longitud centro mapa', type: 'number', help: 'Ej: -78.5680' },
];

export default function AdminSettingsPage() {
  const supabase = createClient();
  const [values, setValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('app_settings').select('*');
    const map: Record<string, any> = {};
    for (const row of data ?? []) {
      try { map[row.key] = typeof row.value === 'string' ? JSON.parse(row.value) : row.value; }
      catch { map[row.key] = row.value; }
    }
    setValues(map);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    const rows = FIELDS.map((f) => ({ key: f.key, value: values[f.key] ?? null }));
    const { error } = await supabase.from('app_settings').upsert(rows, { onConflict: 'key' });
    setSaving(false);
    if (error) alert(error.message);
    else alert('Guardado ✓');
  }

  if (loading) return <Loader2 className="w-5 h-5 animate-spin mx-auto mt-10" />;

  return (
    <div className="px-4 pt-4 fade-in space-y-3">
      <h1 className="text-xl font-bold mb-1">Ajustes generales</h1>
      <p className="text-xs text-slate-500 mb-3">Estos valores se usan en toda la app. Nada está hardcoded.</p>

      {FIELDS.map((f) => (
        <label key={f.key} className="block">
          <span className="block text-xs font-semibold text-slate-600 mb-1">{f.label}</span>
          <input
            type={f.type ?? 'text'}
            value={values[f.key] ?? ''}
            onChange={(e) => setValues({ ...values, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          />
          {f.help && <span className="text-[11px] text-slate-400">{f.help}</span>}
        </label>
      ))}

      <button onClick={save} disabled={saving} className="w-full mt-2 py-3 rounded-xl bg-brand-600 text-white font-semibold flex items-center justify-center gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Guardar cambios
      </button>
    </div>
  );
}
