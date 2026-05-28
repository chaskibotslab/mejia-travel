'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, ShoppingBag, MapPin, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/eventos', label: 'Eventos', icon: Calendar },
  { href: '/mercado', label: 'Mercado', icon: ShoppingBag },
  { href: '/mapa', label: 'Mapa', icon: MapPin },
  { href: '/cuenta', label: 'Cuenta', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200 safe-bottom">
      <ul className="max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl grid grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] transition',
                  active ? 'text-brand-600' : 'text-slate-500 hover:text-slate-800'
                )}
              >
                <Icon className={cn('w-5 h-5', active && 'stroke-[2.4]')} />
                <span className="font-medium">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
