import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/server';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

export const revalidate = 60;

export default async function MapPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('businesses')
    .select('slug, name, latitude, longitude')
    .eq('is_published', true)
    .not('latitude', 'is', null);

  const markers = (data ?? [])
    .filter((b: any) => b.latitude && b.longitude)
    .map((b: any) => ({
      lat: Number(b.latitude),
      lng: Number(b.longitude),
      name: b.name,
      href: `/n/${b.slug}`,
    }));

  return (
    <div className="px-2 pt-2 fade-in">
      <h1 className="text-xl font-bold mb-2 px-2">Mapa de Mejía</h1>
      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-soft">
        <MapView lat={-0.5072} lng={-78.5705} zoom={13} markers={markers} height="calc(100vh - 220px)" />
      </div>
    </div>
  );
}
