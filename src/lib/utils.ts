import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhone(p?: string | null) {
  if (!p) return '';
  return p.replace(/\s+/g, '');
}

export function waLink(phone?: string | null, msg?: string) {
  if (!phone) return '#';
  const clean = phone.replace(/[^0-9]/g, '');
  const m = msg ? `?text=${encodeURIComponent(msg)}` : '';
  return `https://wa.me/${clean}${m}`;
}

export function telLink(phone?: string | null) {
  return phone ? `tel:${phone.replace(/\s+/g, '')}` : '#';
}

export function mapLink(lat?: number | null, lng?: number | null, name?: string) {
  if (lat == null || lng == null) return '#';
  const q = name ? `&q=${encodeURIComponent(name)}` : '';
  return `https://www.google.com/maps?ll=${lat},${lng}${q}`;
}

export function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return 'hace minutos';
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}

export function timeLeft(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return 'expirado';
  const h = Math.floor(ms / 3_600_000);
  if (h >= 24) return `${Math.floor(h / 24)} d ${h % 24} h`;
  if (h >= 1) return `${h} h`;
  const m = Math.floor(ms / 60_000);
  return `${m} min`;
}
