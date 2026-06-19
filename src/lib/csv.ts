// Parser CSV minimalista — soporta:
//   - separador ',' o ';' (detección automática)
//   - comillas dobles con escape ""
//   - saltos de línea \n o \r\n
//   - celdas vacías
// No depende de librerías externas.

export type CSVRow = Record<string, string>;

export function parseCSV(text: string): { headers: string[]; rows: CSVRow[] } {
  const clean = text.replace(/^\uFEFF/, ''); // strip BOM
  // Detectar separador a partir de la primera línea
  const firstNl = clean.indexOf('\n');
  const firstLine = firstNl >= 0 ? clean.slice(0, firstNl) : clean;
  const sep = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ';' : ',';

  const records: string[][] = [];
  let cur: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (inQuotes) {
      if (ch === '"') {
        if (clean[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === sep) { cur.push(field); field = ''; }
      else if (ch === '\n') { cur.push(field); records.push(cur); cur = []; field = ''; }
      else if (ch === '\r') { /* skip */ }
      else field += ch;
    }
  }
  if (field.length > 0 || cur.length > 0) { cur.push(field); records.push(cur); }

  if (records.length === 0) return { headers: [], rows: [] };
  const headers = records[0].map((h) => h.trim());
  const rows: CSVRow[] = records.slice(1)
    .filter((r) => r.some((c) => c && c.trim() !== ''))
    .map((r) => {
      const obj: CSVRow = {};
      headers.forEach((h, idx) => { obj[h] = (r[idx] ?? '').trim(); });
      return obj;
    });
  return { headers, rows };
}

export function toCSV(rows: Record<string, any>[], headers?: string[]): string {
  if (rows.length === 0 && !headers) return '';
  const cols = headers ?? Object.keys(rows[0] ?? {});
  const esc = (v: any) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (/[",;\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const out = [cols.join(',')];
  for (const r of rows) out.push(cols.map((c) => esc(r[c])).join(','));
  return out.join('\n');
}

export function downloadCSV(filename: string, content: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export { slugify };
