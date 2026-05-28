'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, Search, User } from 'lucide-react';

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === '/';

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/85 border-b border-slate-200">
      <div className="max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl px-4 h-14 flex items-center justify-between">
        {isHome ? (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 grid place-items-center text-white font-bold text-sm">
              mt
            </div>
            <span className="font-bold tracking-tight">
              <span className="text-brand-700">MEJÍA</span>
              <span className="text-accent ml-1">TRAVEL</span>
            </span>
          </Link>
        ) : (
          <button
            onClick={() => router.back()}
            aria-label="Volver"
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 active:scale-90 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-1">
          <Link
            href="/buscar"
            aria-label="Buscar"
            className="p-2 rounded-full hover:bg-slate-100 active:scale-90 transition"
          >
            <Search className="w-5 h-5" />
          </Link>
          <Link
            href="/cuenta"
            aria-label="Mi cuenta"
            className="p-2 rounded-full hover:bg-slate-100 active:scale-90 transition"
          >
            <User className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
