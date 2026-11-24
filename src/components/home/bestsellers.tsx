import { listBestsellers } from '@/lib/admin/queries';
import { getBestsellers } from '@/lib/catalog';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import type { AdminProduct } from '@/lib/admin/constants';
import { BestsellersRail } from './bestsellers-rail';

/**
 * Server component — fetches bestsellers from Supabase when configured,
 * falls back to the static catalogue otherwise.
 */
export async function Bestsellers() {
  let products: AdminProduct[] = [];

  if (isSupabaseConfigured) {
    products = await listBestsellers(6);
  }

  // Fall back to static catalog if DB is empty or Supabase not configured
  if (products.length === 0) {
    products = getBestsellers(6).map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      subtitle: p.subtitle ?? null,
      category_slug: p.category,
      price: p.price,
      compare_at_price: p.compareAtPrice ?? null,
      stock_count: 10,
      is_made_to_order: Boolean(p.madeToOrder),
      fabric: p.fabric ?? null,
      embroidery: p.embroidery ?? null,
      description: p.description ?? null,
      image_urls: p.images,
      is_bestseller: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  return <BestsellersRail products={products} />;
}
