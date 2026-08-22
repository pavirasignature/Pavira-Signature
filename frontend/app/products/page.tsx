import { Metadata } from "next";
import ProductsClient from "./ProductsClient";
import PublicLayout from "@/components/layout/PublicLayout";

export const metadata: Metadata = {
  title: "Shop Premium Handcrafted Decor | Metal Wall Art, Clocks & Candles",
  description: "Browse our curated collection of luxury home decor items. Discover handcrafted metal wall art, premium clocks, scented candles, and bespoke mandala pieces for modern homes.",
  alternates: {
    canonical: "https://pavirasignature.in/products",
  },
  openGraph: {
    title: "Shop Premium Handcrafted Decor | Metal Wall Art, Clocks & Candles",
    description: "Browse our curated collection of luxury home decor items. Discover handcrafted metal wall art, premium clocks, and bespoke mandala pieces.",
    url: "https://pavirasignature.in/products",
  },
};

export default function ProductsPage() {
  return (
    <PublicLayout>
      <ProductsClient />
    </PublicLayout>
  );
}
