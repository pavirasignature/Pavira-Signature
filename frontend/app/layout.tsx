import type { Metadata } from "next";
import { Nunito } from "next/font/google";
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
  alternates: {
    canonical: "/",
  },
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
      className={`dark ${nunito.variable}`}
      suppressHydrationWarning
    >
      <body
        className="bg-[#F8F7F3] text-[#1A1A1A] font-sans antialiased overflow-x-hidden selection:bg-accent selection:text-accent-foreground"
        suppressHydrationWarning
      >
        <ClientBody>{children}</ClientBody>
        <AutoRefreshWidget />
      </body>
    </html>
  );
}
