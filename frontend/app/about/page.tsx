import { Metadata } from "next";
import AboutClient from "./AboutClient";
import PublicLayout from "@/components/layout/PublicLayout";

export const metadata: Metadata = {
  title: "About Pavira Signature | Luxury Handcrafted Home Decor Artisans",
  description:
    "Meet the master artisans behind Pavira Signature. Learn our heritage, craftsmanship philosophy, and commitment to sustainable luxury home decor.",
  alternates: {
    canonical: "https://pavirasignature.in/about",
  },
  openGraph: {
    title: "About Pavira Signature | Luxury Handcrafted Home Decor Artisans",
    description:
      "Meet the master artisans behind Pavira Signature. Learn our heritage, craftsmanship philosophy, and commitment to sustainable luxury home decor.",
    url: "https://pavirasignature.in/about",
    siteName: "Pavira Signature",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Pavira Signature - About Us",
      },
    ],
  },
};

export default function AboutPage() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Pavira Signature",
    url: "https://pavirasignature.in/about",
    description:
      "Meet the master artisans behind Pavira Signature. Learn our heritage, craftsmanship philosophy, and commitment to sustainable luxury home decor.",
    mainEntity: {
      "@type": "Organization",
      name: "Pavira Signature",
      url: "https://pavirasignature.in",
      logo: "https://pavirasignature.in/logo.png",
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
        name: "About Us",
        item: "https://pavirasignature.in/about",
      },
    ],
  };

  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <AboutClient />
    </PublicLayout>
  );
}
