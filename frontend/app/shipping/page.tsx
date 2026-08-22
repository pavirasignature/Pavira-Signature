import { Metadata } from "next";
import ShippingClient from "./ShippingClient";
import PublicLayout from "@/components/layout/PublicLayout";

export const metadata: Metadata = {
  title: "Shipping & Returns | Pavira Signature",
  description:
    "Learn about Pavira Signature's domestic and international shipping options, delivery times, and 14-day return guidelines.",
  alternates: {
    canonical: "https://pavirasignature.in/shipping",
  },
  openGraph: {
    title: "Shipping & Returns | Pavira Signature",
    description:
      "Learn about Pavira Signature's domestic and international shipping options, delivery times, and 14-day return guidelines.",
    url: "https://pavirasignature.in/shipping",
  },
};

export default function ShippingPage() {
  return (
    <PublicLayout>
      <ShippingClient />
    </PublicLayout>
  );
}
