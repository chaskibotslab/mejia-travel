import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import TopBar from '@/components/TopBar';
import PWARegister from '@/components/PWARegister';
import AIAssistant from '@/components/AIAssistant';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// Evita que Next.js cachee el HTML como estático: necesitamos que cada request
// re-lea las env vars de Supabase para inyectarlas frescas en el <head>.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mejía Travel — Todo lo que buscas en el Cantón Mejía',
  description:
    'Descubre todos los negocios, servicios, turismo, hospedaje, gastronomía y emprendimientos del Cantón Mejía. Llama, escribe por WhatsApp o ubica en el mapa con un toque.',
  manifest: '/manifest.json',
  appleWebApp: { statusBarStyle: 'default', title: 'Mejía Travel' },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
  openGraph: {
    title: 'Mejía Travel',
    description: 'Todo lo que buscas en el Cantón Mejía',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#1e3a8a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return (
    <html lang="es" className={inter.variable}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__SUPABASE_URL__=${JSON.stringify(supabaseUrl)};window.__SUPABASE_ANON__=${JSON.stringify(supabaseAnon)};`,
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <TopBar />
        <main className="pb-24 max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl px-4 pt-4">
          {children}
        </main>
        <AIAssistant />
        <BottomNav />
        <PWARegister />
      </body>
    </html>
  );
}
