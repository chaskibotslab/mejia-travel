'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Search, Store, User } from 'lucide-react';

const left = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/eventos', label: 'Eventos', icon: Calendar },
];
const right = [
  { href: '/mercado', label: 'Mercado', icon: Store },
  { href: '/cuenta', label: 'Perfil', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 pb-3 pointer-events-none">
      <div className="max-w-md mx-auto sm:max-w-lg px-4 pointer-events-none">
        <div className="relative pointer-events-auto">
          {/* Barra principal flotante */}
          <div className="relative bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-3xl border border-slate-100 grid grid-cols-5 items-center h-[68px] overflow-hidden">
            {left.map((it) => (
              <NavItem key={it.href} {...it} active={isActive(it.href)} />
            ))}
            {/* Espacio para el botón central flotante */}
            <div aria-hidden />
            {right.map((it) => (
              <NavItem key={it.href} {...it} active={isActive(it.href)} />
            ))}
          </div>

          {/* Botón central flotante (Buscar) */}
          <Link
            href="/buscar"
            aria-label="Buscar"
            className={`absolute -top-5 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full grid place-items-center text-white shadow-[0_8px_24px_rgba(120,40,200,0.45)] transition-transform active:scale-90 hover:scale-105 ${
              isActive('/buscar')
                ? 'bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-600'
                : 'bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-600'
            }`}
          >
            <Search className="w-7 h-7" strokeWidth={2.4} />
          </Link>
        </div>
      </div>
    </nav>
  );
}

function NavItem({ href, label, icon: Icon, active }: { href: string; label: string; icon: any; active: boolean }) {
  return (
    <Link
      href={href}
      className="relative flex flex-col items-center justify-center gap-0.5 h-full"
    >
      <Icon
        className={`w-5 h-5 transition-all ${active ? 'text-fuchsia-600 scale-110' : 'text-slate-400'}`}
        strokeWidth={active ? 2.6 : 2}
      />
      <span className={`text-[10px] font-bold transition ${active ? 'text-fuchsia-600' : 'text-slate-400'}`}>
        {label}
      </span>
      {active && <span className="absolute top-1 w-1.5 h-1.5 rounded-full bg-fuchsia-500" />}
    </Link>
  );
}
