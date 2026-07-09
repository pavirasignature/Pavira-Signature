import { Metadata } from "next";

// Fetch product data for metadata and schema
async function getProduct(id: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  try {
    const res = await fetch(`${apiUrl}/products/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error("Error fetching product for metadata:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProduct(params.id);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pavirasignature.com";

  if (!product) {
    return {
      title: "Product Not Found | Pavira Signature",
    };
  }

  const title = `${product.name} | Pavira Signature`;
  const description = product.description?.substring(0, 160) || "Discover luxury handcrafted mandalas and timeless art pieces at Pavira Signature.";
  const imageUrl = product.images?.[0]?.url || product.image || "/placeholder.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/products/${product._id || product.id}`,
      siteName: "Pavira Signature",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pavirasignature.com";

  let structuredData: Record<string, any> | null = null;

  if (product) {
    const productUrl = `${baseUrl}/products/${product._id || product.id}`;
    const imageUrl = product.images?.[0]?.url || product.image || "/placeholder.jpg";

    structuredData = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      image: imageUrl,
      description: product.description,
      sku: product._id || product.id,
      offers: {
        "@type": "Offer",
        url: productUrl,
        priceCurrency: "INR",
        price: product.price,
        availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      },
    };

    if (product.rating && product.reviews?.length > 0) {
      structuredData.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviews.length,
      };
    }
  }

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      {children}
    </>
  );
}
