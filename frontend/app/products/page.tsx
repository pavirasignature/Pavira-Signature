import { Metadata } from "next";
import ProductsClient from "./ProductsClient";
import PublicLayout from "@/components/layout/PublicLayout";

export const metadata: Metadata = {
  title: "Shop Handcrafted Luxury Home Decor | Wall Art, Clocks & Mandala Decor",
  description:
    "Browse our curated collection of premium handcrafted wall art, decorative clocks, canvas paintings & designer decor pieces. Handcrafted in Ahmedabad, India.",
  alternates: {
    canonical: "https://pavirasignature.in/products",
  },
  openGraph: {
    title: "Shop Handcrafted Luxury Home Decor | Wall Art, Clocks & Mandala Decor",
    description:
      "Browse our curated collection of premium handcrafted wall art, decorative clocks, canvas paintings & designer decor pieces.",
    url: "https://pavirasignature.in/products",
    siteName: "Pavira Signature",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Pavira Signature - Product Collections",
      },
    ],
  },
};

export default function ProductsPage() {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Luxury Handcrafted Home Decor Collections",
    url: "https://pavirasignature.in/products",
    description:
      "Browse our curated collection of premium handcrafted wall art, decorative clocks, canvas paintings & designer decor pieces.",
    mainEntity: {
      "@type": "ItemList",
      name: "Pavira Signature Masterpiece Collections",
      itemListOrder: "https://schema.org/ItemListOrderDescending",
    },
  };

  const breadcrumbSchema = {
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
    ],
  };

  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductsClient />
    </PublicLayout>
  );
}
