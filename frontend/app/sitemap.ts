import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://pavirasignature.in";
  const siteUrl = baseUrl.replace(/\/$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/shipping`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/refund-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/shipping-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  try {
    const supabaseUrl =
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return staticRoutes;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch all products
    const { data: products, error: prodError } = await supabase
      .from("products")
      .select("id, slug, updated_at")
      .limit(2000);

    const productRoutes: MetadataRoute.Sitemap = [];
    if (!prodError && products) {
      for (const product of products) {
        const identifier = product.slug || product.id;
        if (identifier) {
          productRoutes.push({
            url: `${siteUrl}/products/${identifier}`,
            lastModified: new Date(product.updated_at || new Date()),
            changeFrequency: "weekly",
            priority: 0.9,
          });
        }
      }
    }

    // 2. Fetch categories
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("id, slug, updated_at")
      .limit(100);

    const categoryRoutes: MetadataRoute.Sitemap = [];
    if (!catError && categories) {
      for (const cat of categories) {
        const catSlug = cat.slug || cat.id;
        if (catSlug) {
          categoryRoutes.push({
            url: `${siteUrl}/products?category=${encodeURIComponent(catSlug)}`,
            lastModified: new Date(cat.updated_at || new Date()),
            changeFrequency: "weekly",
            priority: 0.85,
          });
        }
      }
    }

    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
  } catch (error) {
    console.error("Error generating dynamic sitemap:", error);
    return staticRoutes;
  }
}
