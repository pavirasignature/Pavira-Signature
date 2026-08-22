import { Metadata } from "next";
import HomeClient from "./HomeClient";
import PublicLayout from "@/components/layout/PublicLayout";

export const metadata: Metadata = {
  title: "Pavira Signature | Luxury Handcrafted Home Decor & Metal Wall Art",
  description:
    "Transform your home into a luxury space with Pavira Signature's bespoke handcrafted metal wall art, decorative clocks, sacred geometry mandalas & designer decor collections.",
  alternates: {
    canonical: "https://pavirasignature.in",
  },
  openGraph: {
    title: "Pavira Signature | Luxury Handcrafted Home Decor & Metal Wall Art",
    description:
      "Transform your home into a luxury space with Pavira Signature's bespoke handcrafted metal wall art, decorative clocks, sacred geometry mandalas & designer decor collections.",
    url: "https://pavirasignature.in",
    siteName: "Pavira Signature",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Pavira Signature - Premium Home Decor Logo",
      },
    ],
  },
};

export default function HomePage() {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Pavira Signature",
    url: "https://pavirasignature.in",
    description:
      "Transform your home with Pavira Signature's bespoke handcrafted metal wall art, luxury clocks, sacred geometry mandalas & designer decor.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://pavirasignature.in/products?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <HomeClient />
    </PublicLayout>
  );
}
