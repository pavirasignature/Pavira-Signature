import { Metadata } from "next";
import ContactClient from "./ContactClient";
import PublicLayout from "@/components/layout/PublicLayout";

export const metadata: Metadata = {
  title: "Contact Pavira Signature | Premium Home Decor Consultancy",
  description:
    "Reach out to our design team for consultations, custom commissions, and interior design support. Available Monday-Saturday.",
  alternates: {
    canonical: "https://pavirasignature.in/contact",
  },
  openGraph: {
    title: "Contact Pavira Signature | Premium Home Decor Consultancy",
    description:
      "Reach out to our design team for consultations, custom commissions, and interior design support. Available Monday-Saturday.",
    url: "https://pavirasignature.in/contact",
    siteName: "Pavira Signature",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Pavira Signature - Contact Us",
      },
    ],
  },
};

export default function ContactPage() {
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Pavira Signature",
    url: "https://pavirasignature.in/contact",
    description:
      "Reach out to our design team for consultations, custom commissions, and interior design support.",
    mainEntity: {
      "@type": "LocalBusiness",
      name: "Pavira Signature",
      image: "https://pavirasignature.in/logo.png",
      telephone: "+91-84878-16296",
      email: "care@pavirasignature.in",
      address: {
        "@type": "PostalAddress",
        streetAddress: "A-47, Nilkanth Arcade Estate, G.I.D.C., Road No.15, Kathwada, Odhav",
        addressLocality: "Ahmedabad",
        addressRegion: "Gujarat",
        postalCode: "382430",
        addressCountry: "IN",
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "10:00",
        closes: "19:00",
      },
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
        name: "Contact Us",
        item: "https://pavirasignature.in/contact",
      },
    ],
  };

  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ContactClient />
    </PublicLayout>
  );
}
