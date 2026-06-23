import { createClient } from '@/lib/supabase/server';
import MarketplaceClient from './MarketplaceClient';

export const revalidate = 30;

export default async function MarketplacePage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('marketplace_items')
    .select('*')
    .gt('expires_at', new Date().toISOString())
    .eq('is_sold', false)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(200);

  return <MarketplaceClient items={(data ?? []) as any[]} />;
}
