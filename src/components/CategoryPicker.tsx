'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, ChevronDown, X, Check } from 'lucide-react';

export type CategoryOption = {
  id: string;
  name_es: string;
  parent_id?: string | null;
};

type Props = {
  value: string | null | undefined;
  onChange: (id: string) => void;
  options: CategoryOption[];
  placeholder?: string;
  required?: boolean;
};

/**
 * Selector de categorías con búsqueda. Reemplaza el <select> nativo
 * que con muchas opciones queda inusable en móvil.
 */
export default function CategoryPicker({ value, onChange, options, placeholder = 'Selecciona una categoría', required }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.id === value) || null;

  const filtered = useMemo(() => {
    const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const term = norm(q.trim());
    if (!term) return options;
    return options.filter((o) => norm(o.name_es).includes(term));
  }, [q, options]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-2 rounded-xl border bg-white px-3 py-2.5 text-sm text-left ${selected ? 'border-slate-200 text-slate-900' : 'border-slate-200 text-slate-400'} ${required && !selected ? 'border-amber-300' : ''}`}
      >
        <span className="flex-1 truncate">{selected ? selected.name_es : placeholder}</span>
        {selected && (
          <X
            className="w-4 h-4 text-slate-400 hover:text-red-500"
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
          />
        )}
        <ChevronDown className={`w-4 h-4 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl max-h-80 overflow-hidden flex flex-col">
          <div className="relative border-b border-slate-100">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar categoría…"
              className="w-full pl-9 pr-3 py-2.5 text-sm focus:outline-none"
            />
          </div>
          <ul className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-sm text-slate-400 text-center">Sin resultados</li>
            ) : (
              filtered.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => { onChange(o.id); setOpen(false); setQ(''); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50 ${o.id === value ? 'bg-fuchsia-50 text-fuchsia-700 font-semibold' : 'text-slate-700'}`}
                  >
                    {o.parent_id && <span className="text-slate-300 ml-1">—</span>}
                    <span className="flex-1 truncate">{o.name_es}</span>
                    {o.id === value && <Check className="w-4 h-4 text-fuchsia-600" />}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
