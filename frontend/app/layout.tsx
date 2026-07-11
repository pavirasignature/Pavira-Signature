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
  title: "Pavira Signature by Punit Creation - Premium Home Decor",
  description:
    "Transform Your Home Into Luxury with our signature collections.",
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
