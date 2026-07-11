import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://pavirasignature.in');
  const siteUrl = baseUrl.replace(/\/$/, "");

  const sitemapItems: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    // Query Supabase directly instead of going through the API
    // (API routes aren't available during static build on Vercel)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn("Sitemap: Supabase credentials not available, skipping product URLs.");
      return sitemapItems;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: products, error } = await supabase
      .from("products")
      .select("id, slug, updated_at")
      .limit(1000);

    if (error || !products) {
      console.error("Sitemap: Failed to fetch products from Supabase:", error?.message);
      return sitemapItems;
    }

    const productRoutes: MetadataRoute.Sitemap = products.map((product: any) => ({
      url: `${siteUrl}/products/${product.id}`,
      lastModified: new Date(product.updated_at || new Date()),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...sitemapItems, ...productRoutes];
  } catch (error) {
    console.error("Error generating sitemap for products:", error);
    return sitemapItems;
  }
}
