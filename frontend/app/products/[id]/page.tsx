import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import ProductDetailClient from "./ProductDetailClient";
import PublicLayout from "@/components/layout/PublicLayout";
import { getAbsoluteUrl } from "@/lib/config";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

async function getProduct(id: string) {
  if (!supabaseUrl || !supabaseKey) return null;
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProduct(params.id);
  if (!product) return {};

  const title = product.meta_title || product.name;
  const description = product.meta_description || product.description?.substring(0, 160) || "";
  const url = `https://pavirasignature.in/products/${product.id}`;
  
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

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product) {
    return (
      <PublicLayout>
        <main className="min-h-screen bg-[#1B2D20] text-foreground flex items-center justify-center relative overflow-hidden">
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,61,44,0.4)_0%,rgba(27,45,32,1)_100%)] z-0 pointer-events-none" />
          <div className="text-center relative z-10">
            <p className="text-gray-400 text-lg">Product not found</p>
          </div>
        </main>
      </PublicLayout>
    );
  }

  const url = `https://pavirasignature.in/products/${product.id}`;
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
      availability: (product.stock || 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    aggregateRating: product.rating ? {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.numReviews || 1,
    } : undefined,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://pavirasignature.in"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: "https://pavirasignature.in/products"
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: url
      }
    ]
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
      <main className="min-h-screen bg-[#1B2D20] text-foreground relative overflow-hidden selection:bg-accent selection:text-accent-foreground">
        <ProductDetailClient product={product} />
      </main>
    </PublicLayout>
  );
}
