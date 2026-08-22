import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import ProductDetailClient from "./ProductDetailClient";
import PublicLayout from "@/components/layout/PublicLayout";
import { getAbsoluteUrl } from "@/lib/config";

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

async function getProduct(idOrSlug: string) {
  if (!supabaseUrl || !supabaseKey || !idOrSlug) return null;
  const supabase = createClient(supabaseUrl, supabaseKey);
  const identifier = decodeURIComponent(idOrSlug).trim();

  // 1. Try finding by slug (exact match)
  let { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", identifier.toLowerCase())
    .maybeSingle();

  // 2. Try finding by ID (UUID or numeric ID)
  if (!data) {
    const res = await supabase
      .from("products")
      .select("*")
      .eq("id", identifier)
      .maybeSingle();
    data = res.data;
  }

  // 3. Try finding by case-insensitive slug match
  if (!data) {
    const res = await supabase
      .from("products")
      .select("*")
      .ilike("slug", identifier)
      .maybeSingle();
    data = res.data;
  }

  // 4. Try finding by name match as fallback
  if (!data) {
    const res = await supabase
      .from("products")
      .select("*")
      .ilike("name", identifier.replace(/-/g, " "))
      .maybeSingle();
    data = res.data;
  }

  if (!data) return null;

  // Populate category if it's an ID
  if (data.category && typeof data.category === "string") {
    const { data: catData } = await supabase
      .from("categories")
      .select("*")
      .eq("id", data.category)
      .maybeSingle();
    if (catData) {
      data.category = catData;
    }
  }

  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const product = await getProduct(resolvedParams?.id);
  if (!product) {
    return {
      title: "Product Details | Pavira Signature",
      description: "Discover luxury handcrafted mandalas and timeless art pieces at Pavira Signature.",
    };
  }

  const title = product.meta_title || `${product.name} | Pavira Signature`;
  const description =
    product.meta_description ||
    product.description?.substring(0, 160) ||
    "Discover luxury handcrafted mandalas and timeless art pieces at Pavira Signature.";
  const url = `https://pavirasignature.in/products/${product.slug || product.id}`;

  let imageUrl = "https://pavirasignature.in/logo.png";
  if (product.images && product.images.length > 0) {
    imageUrl = getAbsoluteUrl(product.images[0].url);
  } else if (product.image) {
    imageUrl = getAbsoluteUrl(product.image);
  }

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: "Pavira Signature",
      images: [
        {
          url: imageUrl,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const product = await getProduct(resolvedParams?.id);

  if (!product) {
    return (
      <PublicLayout>
        <main className="min-h-screen bg-[#07241D] text-[#F5F0E6] flex flex-col items-center justify-center relative overflow-hidden px-4">
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,61,44,0.4)_0%,rgba(7,36,29,1)_100%)] z-0 pointer-events-none" />
          <div className="text-center relative z-10 max-w-md">
            <h1 className="text-3xl font-serif text-[#D4AF37] mb-4">
              Masterpiece Not Found
            </h1>
            <p className="text-gray-300 font-light mb-8 text-sm">
              The product you are seeking may have been curated into a private collection or moved.
            </p>
            <a
              href="/products"
              className="inline-block px-8 py-3 bg-[#D4AF37] text-[#07241D] font-bold uppercase tracking-widest text-xs rounded-full hover:bg-[#E6C78B] transition-colors"
            >
              Explore Gallery
            </a>
          </div>
        </main>
      </PublicLayout>
    );
  }

  const url = `https://pavirasignature.in/products/${product.slug || product.id}`;
  let imageUrl = "https://pavirasignature.in/logo.png";
  if (product.images && product.images.length > 0) {
    imageUrl = getAbsoluteUrl(product.images[0].url);
  } else if (product.image) {
    imageUrl = getAbsoluteUrl(product.image);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: imageUrl,
    brand: {
      "@type": "Brand",
      name: "Pavira Signature",
    },
    offers: {
      "@type": "Offer",
      url: url,
      priceCurrency: "INR",
      price: product.price || 0,
      availability:
        (product.stock || 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    aggregateRating: product.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: product.rating,
          reviewCount: product.numReviews || 1,
        }
      : undefined,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://pavirasignature.in",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: "https://pavirasignature.in/products",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: url,
      },
    ],
  };

  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <main className="min-h-screen bg-[#07241D] text-[#F5F0E6] relative overflow-hidden selection:bg-[#D4AF37] selection:text-[#07241D]">
        <ProductDetailClient product={product} />
      </main>
    </PublicLayout>
  );
}
