import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import Script from "next/script";
// @ts-ignore - CSS import
import "./globals.css";
import ClientBody from "@/components/ClientBody";
import AutoRefreshWidget from "@/components/AutoRefreshWidget";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Pavira Signature | Premium Home Decor by Punit Creation",
    template: "%s | Pavira Signature",
  },
  description: "Transform your home into a luxury space with Pavira Signature's premium home decor collections, hand-crafted clocks, metal wall art, panels, and scented candles.",
  keywords: [
    "Pavira Signature",
    "Punit Creation",
    "Premium Home Decor",
    "Luxury Home Decor",
    "Metal Wall Art",
    "Decorative Clocks",
    "Wall Panels",
    "Scented Candles",
    "Luxury Living",
    "Handmade Decor India"
  ],
  authors: [{ name: "Punit Creation" }],
  creator: "Punit Creation",
  publisher: "Punit Creation",
  metadataBase: new URL("https://pavirasignature.in"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://pavirasignature.in",
    title: "Pavira Signature | Premium Home Decor by Punit Creation",
    description: "Transform your home into a luxury space with Pavira Signature's premium home decor collections, hand-crafted clocks, metal wall art, panels, and scented candles.",
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
  twitter: {
    card: "summary_large_image",
    title: "Pavira Signature | Premium Home Decor by Punit Creation",
    description: "Transform your home into a luxury space with Pavira Signature's premium home decor collections.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "Cc5pqPKCfmxHR8g6tTHYHk2n9cocDNGew32erZ5kgRY",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${nunito.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Pavira Signature",
              url: "https://pavirasignature.in",
              logo: "https://pavirasignature.in/logo.png",
              description: "Contemporary wall decor designed and crafted in Ahmedabad - statement clocks, metal wall art, canvas, and designer decor pieces.",
              email: "connect@pavirasignature.in",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+91-84878-16296",
                contactType: "Customer Support",
                areaServed: "IN",
                availableLanguage: ["en", "hi"],
              },
              address: {
                "@type": "PostalAddress",
                streetAddress: "A-47, Nilkanth Arcade Estate",
                addressLocality: "Ahmedabad",
                addressRegion: "Gujarat",
                postalCode: "382430",
                addressCountry: "IN",
              },
              sameAs: [
                "https://www.instagram.com/pavirasignature",
                "https://www.facebook.com/pavirasignature",
              ],
            }),
          }}
        />
        {/* Google Analytics 4 */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'}');
            `,
          }}
        />
        {/* Razorpay Checkout SDK */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </head>
      <body
        className="bg-background text-foreground font-sans antialiased overflow-x-hidden selection:bg-accent selection:text-accent-foreground"
        suppressHydrationWarning
      >
        <ClientBody>{children}</ClientBody>
        <AutoRefreshWidget />
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
