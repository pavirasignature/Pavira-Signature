import { Metadata } from "next";
import FaqClient from "./FaqClient";
import PublicLayout from "@/components/layout/PublicLayout";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Pavira Signature",
  description:
    "Find answers to common questions regarding Pavira Signature handcrafted decor orders, custom dimensions, international shipping, and returns.",
  alternates: {
    canonical: "https://pavirasignature.in/faq",
  },
  openGraph: {
    title: "Frequently Asked Questions | Pavira Signature",
    description:
      "Find answers to common questions regarding Pavira Signature handcrafted decor orders, custom dimensions, international shipping, and returns.",
    url: "https://pavirasignature.in/faq",
    siteName: "Pavira Signature",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Pavira Signature - FAQ",
      },
    ],
  },
};

export default function FAQPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What makes Pavira Signature art pieces unique?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Every piece is meticulously handcrafted by master artisans using premium sustainable materials, blending sacred geometry with modern luxury aesthetics.",
        },
      },
      {
        "@type": "Question",
        name: "Do you offer international shipping?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, we ship globally with gallery-grade secure crating and packaging. Shipping costs and delivery times vary by destination.",
        },
      },
      {
        "@type": "Question",
        name: "Can I commission a custom piece or bespoke dimensions?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolutely. We offer tailored bespoke commission services to adapt dimensions, wood stains, and metallic finishes to your space.",
        },
      },
      {
        "@type": "Question",
        name: "What is your return and exchange policy?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We accept returns within 14 days of delivery for standard items in their original condition. Custom commissioned pieces are final sale and non-refundable.",
        },
      },
    ],
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
        name: "FAQ",
        item: "https://pavirasignature.in/faq",
      },
    ],
  };

  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <FaqClient />
    </PublicLayout>
  );
}
