'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Star, Trash2, Pencil, Loader2, Plus, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminBusinessesPage() {
  const supabase = createClient();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('businesses')
      .select('id, slug, name, plan, is_published, is_verified, is_featured, category_id, created_at, categories(name_es)')
      .order('created_at', { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function toggle(id: string, field: string, value: any) {
    await supabase.from('businesses').update({ [field]: value }).eq('id', id);
    load();
  }

  async function del(id: string) {
    if (!confirm('Eliminar negocio?')) return;
    await supabase.from('businesses').delete().eq('id', id);
    load();
  }

  const filtered = items.filter((b) => !q || b.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="px-4 pt-4 fade-in">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold">Negocios</h1>
        <Link href="/panel/nuevo" className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-600 text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> Nuevo
        </Link>
      </div>
      <div className="relative mb-3">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-sm" />
      </div>

      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto mt-6" /> : filtered.length === 0 ? (
        <p className="text-sm text-slate-500">Sin negocios.</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((b) => (
            <li key={b.id} className="rounded-xl bg-white border border-slate-200 p-3 shadow-soft">
              <div className="flex items-center gap-2 mb-2">
                <Link href={`/n/${b.slug}`} className="font-semibold truncate flex-1">{b.name}</Link>
                <span className="text-[10px] uppercase bg-slate-100 px-2 py-0.5 rounded">{b.plan}</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">{(b as any).categories?.name_es || '—'}</p>
              <div className="flex gap-1.5 flex-wrap">
                <Btn active={b.is_published} onClick={() => toggle(b.id, 'is_published', !b.is_published)}>{b.is_published ? 'Publicado' : 'Borrador'}</Btn>
                <Btn active={b.is_verified} onClick={() => toggle(b.id, 'is_verified', !b.is_verified)} icon={CheckCircle2}>{b.is_verified ? 'Verificado' : 'No verif.'}</Btn>
                <Btn active={b.is_featured} onClick={() => toggle(b.id, 'is_featured', !b.is_featured)} icon={Star}>{b.is_featured ? 'Destacado' : 'Normal'}</Btn>
                <Link href={`/panel/editar/${b.id}`} className="px-2 py-1 text-xs rounded-md bg-blue-50 text-blue-600 ml-auto flex items-center gap-1">
                  <Pencil className="w-3 h-3" /> Editar
                </Link>
                <button onClick={() => del(b.id)} className="px-2 py-1 rounded-md text-xs bg-red-50 text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Btn({ active, onClick, children, icon: Icon }: any) {
  return (
    <button onClick={onClick} className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
      {Icon && <Icon className="w-3.5 h-3.5" />} {children}
    </button>
  );
}
