'use client';
import { useEffect, useMemo, useState } from 'react';
import { Upload, Download, AlertTriangle, Loader2, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { parseCSV, toCSV, downloadCSV, slugify } from '@/lib/csv';

type ImportType = 'businesses' | 'professionals' | 'cooperatives' | 'products';

type Schema = {
  table: string;
  label: string;
  required: string[];
  columns: { key: string; label: string; help?: string }[];
  template: Record<string, string>;
  transform: (row: Record<string, string>, ctx: Ctx) => any | null;
};

type Ctx = {
  categories: { id: string; name_es: string }[];
  businesses: { id: string; name: string; slug: string }[];
  cooperatives: { id: string; name: string; slug: string }[];
};

function findCategoryId(name: string, cats: Ctx['categories']): string | null {
  if (!name) return null;
  const n = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const cat = cats.find((c) => c.name_es.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim() === n);
  return cat?.id ?? null;
}

function findBusinessId(nameOrSlug: string, list: Ctx['businesses']): string | null {
  if (!nameOrSlug) return null;
  const n = nameOrSlug.toLowerCase().trim();
  return list.find((b) => b.slug === n || b.name.toLowerCase() === n)?.id ?? null;
}

const SCHEMAS: Record<ImportType, Schema> = {
  businesses: {
    table: 'businesses',
    label: 'Negocios',
    required: ['name', 'category'],
    columns: [
      { key: 'name', label: 'name *', help: 'Nombre del negocio' },
      { key: 'category', label: 'category *', help: 'Nombre EXACTO de la categoría que ya existe' },
      { key: 'short_description', label: 'short_description' },
      { key: 'description', label: 'description' },
      { key: 'phone', label: 'phone' },
      { key: 'whatsapp', label: 'whatsapp' },
      { key: 'email', label: 'email' },
      { key: 'website', label: 'website' },
      { key: 'facebook', label: 'facebook' },
      { key: 'instagram', label: 'instagram' },
      { key: 'tiktok', label: 'tiktok' },
      { key: 'address', label: 'address' },
      { key: 'latitude', label: 'latitude' },
      { key: 'longitude', label: 'longitude' },
      { key: 'cover_image', label: 'cover_image', help: 'URL pública de la imagen' },
      { key: 'owner_name', label: 'owner_name' },
      { key: 'is_published', label: 'is_published', help: 'true/false (default true)' },
    ],
    template: {
      name: 'Restaurante La Buena Mesa',
      category: 'Gastronomía',
      short_description: 'Comida típica de Mejía',
      description: 'Ofrecemos los mejores platos típicos…',
      phone: '0999999999', whatsapp: '0999999999',
      email: '', website: '', facebook: '', instagram: '', tiktok: '',
      address: 'Av. Amazonas y 9 de Octubre, Machachi',
      latitude: '-0.51234', longitude: '-78.56789',
      cover_image: '', owner_name: '', is_published: 'true',
    },
    transform: (r, ctx) => {
      const category_id = findCategoryId(r.category, ctx.categories);
      if (!r.name || !category_id) return null;
      return {
        name: r.name,
        slug: slugify(r.name),
        category_id,
        short_description: r.short_description || null,
        description: r.description || null,
        phone: r.phone || null,
        whatsapp: r.whatsapp || null,
        email: r.email || null,
        website: r.website || null,
        facebook: r.facebook || null,
        instagram: r.instagram || null,
        tiktok: r.tiktok || null,
        address: r.address || null,
        latitude: r.latitude ? Number(r.latitude) : null,
        longitude: r.longitude ? Number(r.longitude) : null,
        cover_image: r.cover_image || null,
        owner_name: r.owner_name || null,
        is_published: r.is_published?.toLowerCase() === 'false' ? false : true,
      };
    },
  },

  professionals: {
    table: 'professionals',
    label: 'Profesionales',
    required: ['full_name', 'category'],
    columns: [
      { key: 'full_name', label: 'full_name *' },
      { key: 'category', label: 'category *', help: 'Nombre exacto de la categoría' },
      { key: 'profession', label: 'profession' },
      { key: 'bio', label: 'bio' },
      { key: 'phone', label: 'phone' },
      { key: 'whatsapp', label: 'whatsapp' },
      { key: 'email', label: 'email' },
      { key: 'facebook', label: 'facebook' },
      { key: 'instagram', label: 'instagram' },
      { key: 'address', label: 'address' },
      { key: 'latitude', label: 'latitude' },
      { key: 'longitude', label: 'longitude' },
      { key: 'photo', label: 'photo', help: 'URL pública' },
      { key: 'is_published', label: 'is_published' },
    ],
    template: {
      full_name: 'Dr. Juan Pérez',
      category: 'Médicos',
      profession: 'Pediatra',
      bio: '20 años de experiencia',
      phone: '0999', whatsapp: '0999', email: '',
      facebook: '', instagram: '', address: 'Machachi',
      latitude: '', longitude: '', photo: '', is_published: 'true',
    },
    transform: (r, ctx) => {
      const category_id = findCategoryId(r.category, ctx.categories);
      if (!r.full_name || !category_id) return null;
      return {
        full_name: r.full_name,
        category_id,
        profession: r.profession || null,
        bio: r.bio || null,
        phone: r.phone || null,
        whatsapp: r.whatsapp || null,
        email: r.email || null,
        facebook: r.facebook || null,
        instagram: r.instagram || null,
        address: r.address || null,
        latitude: r.latitude ? Number(r.latitude) : null,
        longitude: r.longitude ? Number(r.longitude) : null,
        photo: r.photo || null,
        is_published: r.is_published?.toLowerCase() === 'false' ? false : true,
      };
    },
  },

  cooperatives: {
    table: 'transport_cooperatives',
    label: 'Cooperativas',
    required: ['name', 'type'],
    columns: [
      { key: 'name', label: 'name *' },
      { key: 'type', label: 'type *', help: 'bus | taxi | camioneta | escolar | turismo' },
      { key: 'description', label: 'description' },
      { key: 'founded_year', label: 'founded_year' },
      { key: 'phone', label: 'phone' },
      { key: 'whatsapp', label: 'whatsapp' },
      { key: 'email', label: 'email' },
      { key: 'address', label: 'address' },
      { key: 'latitude', label: 'latitude' },
      { key: 'longitude', label: 'longitude' },
      { key: 'logo', label: 'logo', help: 'URL pública' },
      { key: 'color', label: 'color', help: 'ej: #1B97A3' },
      { key: 'schedule_general', label: 'schedule_general' },
      { key: 'is_published', label: 'is_published' },
    ],
    template: {
      name: 'Coop. Aloasí', type: 'bus',
      description: '', founded_year: '1985',
      phone: '0999', whatsapp: '0999', email: '',
      address: 'Aloasí', latitude: '', longitude: '',
      logo: '', color: '#1B97A3',
      schedule_general: 'Lunes a Viernes 04:00-21:00',
      is_published: 'true',
    },
    transform: (r) => {
      const validTypes = ['bus','taxi','camioneta','escolar','turismo'];
      const type = validTypes.includes(r.type) ? r.type : 'bus';
      if (!r.name) return null;
      return {
        name: r.name,
        slug: slugify(r.name),
        type,
        description: r.description || null,
        founded_year: r.founded_year ? Number(r.founded_year) : null,
        phone: r.phone || null,
        whatsapp: r.whatsapp || null,
        email: r.email || null,
        address: r.address || null,
        latitude: r.latitude ? Number(r.latitude) : null,
        longitude: r.longitude ? Number(r.longitude) : null,
        logo: r.logo || null,
        color: r.color || '#1B97A3',
        schedule_general: r.schedule_general || null,
        is_published: r.is_published?.toLowerCase() === 'false' ? false : true,
      };
    },
  },

  products: {
    table: 'business_products',
    label: 'Productos (de negocios)',
    required: ['business', 'name'],
    columns: [
      { key: 'business', label: 'business *', help: 'Slug o nombre EXACTO del negocio que ya existe' },
      { key: 'name', label: 'name *' },
      { key: 'description', label: 'description' },
      { key: 'category', label: 'category', help: 'Texto libre (ej: Bebidas, Repuestos)' },
      { key: 'price', label: 'price' },
      { key: 'currency', label: 'currency', help: 'default USD' },
      { key: 'sku', label: 'sku' },
      { key: 'stock', label: 'stock' },
      { key: 'image', label: 'image', help: 'URL pública' },
      { key: 'is_published', label: 'is_published' },
    ],
    template: {
      business: 'restaurante-la-buena-mesa', name: 'Hornado completo',
      description: 'Plato típico con mote, papas y agrio',
      category: 'Platos fuertes', price: '6.50', currency: 'USD',
      sku: 'HORN-01', stock: '', image: '', is_published: 'true',
    },
    transform: (r, ctx) => {
      const business_id = findBusinessId(r.business, ctx.businesses);
      if (!business_id || !r.name) return null;
      return {
        business_id,
        name: r.name,
        description: r.description || null,
        category: r.category || null,
        price: r.price ? Number(r.price) : null,
        currency: r.currency || 'USD',
        sku: r.sku || null,
        stock: r.stock ? Number(r.stock) : null,
        image: r.image || null,
        is_published: r.is_published?.toLowerCase() === 'false' ? false : true,
      };
    },
  },
};

export default function ImportPage() {
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [type, setType] = useState<ImportType>('businesses');
  const [ctx, setCtx] = useState<Ctx>({ categories: [], businesses: [], cooperatives: [] });
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [filename, setFilename] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ ok: number; fail: number; errors: string[] } | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { setIsAdmin(false); return; }
      const { data: prof } = await supabase.from('profiles').select('role').eq('id', u.user.id).single();
      setIsAdmin(prof?.role === 'admin');
      const [cats, biz] = await Promise.all([
        supabase.from('categories').select('id,name_es'),
        supabase.from('businesses').select('id,name,slug'),
      ]);
      setCtx({
        categories: (cats.data ?? []) as any,
        businesses: (biz.data ?? []) as any,
        cooperatives: [],
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const schema = SCHEMAS[type];

  const preview = useMemo(() => {
    return rows.slice(0, 5).map((r) => schema.transform(r, ctx));
  }, [rows, schema, ctx]);

  const validCount = useMemo(
    () => rows.filter((r) => schema.transform(r, ctx) !== null).length,
    [rows, schema, ctx]
  );

  function downloadTemplate() {
    const csv = toCSV([schema.template], schema.columns.map((c) => c.key));
    downloadCSV(`plantilla_${type}.csv`, csv);
  }

  async function handleFile(file: File) {
    setResult(null);
    const text = await file.text();
    const { headers: h, rows: r } = parseCSV(text);
    setHeaders(h);
    setRows(r);
    setFilename(file.name);
  }

  async function runImport() {
    setImporting(true);
    setResult(null);
    const payloads: any[] = [];
    const errors: string[] = [];
    rows.forEach((row, idx) => {
      const p = schema.transform(row, ctx);
      if (!p) errors.push(`Fila ${idx + 2}: faltan campos requeridos o categoría/negocio no encontrado`);
      else payloads.push(p);
    });
    if (payloads.length === 0) {
      setResult({ ok: 0, fail: rows.length, errors });
      setImporting(false);
      return;
    }
    // Insertar en lotes de 50 para evitar payloads enormes
    let ok = 0;
    for (let i = 0; i < payloads.length; i += 50) {
      const batch = payloads.slice(i, i + 50);
      const { error } = await supabase.from(schema.table).insert(batch);
      if (error) {
        errors.push(`Lote ${i / 50 + 1}: ${error.message}`);
      } else {
        ok += batch.length;
      }
    }
    setResult({ ok, fail: rows.length - ok, errors });
    setImporting(false);
  }

  if (isAdmin === null) return <div className="px-4 pt-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></div>;
  if (!isAdmin) return <div className="px-4 pt-10 text-center text-slate-500">Acceso solo para administradores.</div>;

  return (
    <div className="px-4 pt-4 pb-8 fade-in space-y-4">
      <div>
        <h1 className="text-xl font-bold">Importar en masa</h1>
        <p className="text-xs text-slate-500">Sube un CSV con muchos registros de una sola vez.</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">¿Qué quieres importar?</label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(SCHEMAS) as ImportType[]).map((k) => (
            <button
              key={k}
              onClick={() => { setType(k); setRows([]); setHeaders([]); setResult(null); }}
              className={`px-3 py-2 rounded-xl text-sm font-medium border ${type === k ? 'bg-fuchsia-50 border-fuchsia-400 text-fuchsia-700' : 'bg-white border-slate-200 text-slate-700'}`}
            >
              {SCHEMAS[k].label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
        <p className="font-semibold flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Cómo funciona</p>
        <ol className="list-decimal ml-5 mt-1 space-y-0.5 text-xs">
          <li>Descarga la plantilla y ábrela en Excel / Google Sheets.</li>
          <li>Rellena las filas. Los campos con <strong>*</strong> son obligatorios.</li>
          <li>Guarda como <strong>CSV (delimitado por comas o punto y coma)</strong>.</li>
          <li>Sube el archivo aquí, revisa la vista previa y pulsa Importar.</li>
          <li>Para fotos: pega una <strong>URL pública</strong> en la columna correspondiente. Si no tienes URL, déjala vacía y edita el registro luego.</li>
        </ol>
      </div>

      <button onClick={downloadTemplate} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm">
        <Download className="w-4 h-4" /> Descargar plantilla CSV de {schema.label}
      </button>

      <details className="bg-white border border-slate-200 rounded-xl p-3 text-xs">
        <summary className="font-semibold cursor-pointer text-slate-700">Ver columnas esperadas ({schema.columns.length})</summary>
        <ul className="mt-2 space-y-1">
          {schema.columns.map((c) => (
            <li key={c.key} className="flex items-start gap-2">
              <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">{c.label}</code>
              {c.help && <span className="text-slate-500">{c.help}</span>}
            </li>
          ))}
        </ul>
      </details>

      <label className="block">
        <span className="block text-xs font-semibold text-slate-600 mb-1">Subir archivo CSV</span>
        <label className="rounded-xl border-2 border-dashed border-slate-300 px-3 py-6 text-sm text-slate-500 cursor-pointer hover:bg-slate-50 flex flex-col items-center gap-2">
          <Upload className="w-6 h-6" />
          {filename ? <span className="text-slate-700 font-medium">{filename}</span> : <span>Selecciona o arrastra un .csv</span>}
          <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </label>
      </label>

      {rows.length > 0 && (
        <>
          <div className="rounded-xl bg-white border border-slate-200 p-3 text-sm">
            <p className="font-semibold mb-1 flex items-center gap-1"><FileSpreadsheet className="w-4 h-4" /> Vista previa</p>
            <p className="text-xs text-slate-500 mb-2">
              {rows.length} filas detectadas · <span className="text-emerald-700 font-semibold">{validCount} válidas</span> · <span className="text-red-600 font-semibold">{rows.length - validCount} inválidas</span>
            </p>
            <div className="overflow-x-auto -mx-3">
              <table className="text-[11px] w-full">
                <thead className="bg-slate-50">
                  <tr>{headers.slice(0, 6).map((h) => <th key={h} className="text-left px-2 py-1 font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((r, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      {headers.slice(0, 6).map((h) => <td key={h} className="px-2 py-1 truncate max-w-[120px]">{r[h]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={runImport}
            disabled={importing || validCount === 0}
            className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-fuchsia-600 text-white font-semibold disabled:opacity-50"
          >
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Importar {validCount} registros
          </button>
        </>
      )}

      {result && (
        <div className={`rounded-xl border p-3 text-sm ${result.fail === 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
          <p className="font-semibold flex items-center gap-1">
            {result.fail === 0 ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            Resultado: {result.ok} OK, {result.fail} fallidos
          </p>
          {result.errors.length > 0 && (
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer font-semibold">Ver errores ({result.errors.length})</summary>
              <ul className="mt-1 space-y-0.5 list-disc ml-5">
                {result.errors.slice(0, 30).map((e, i) => <li key={i}>{e}</li>)}
                {result.errors.length > 30 && <li>… y {result.errors.length - 30} más</li>}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
