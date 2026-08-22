import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://pavirasignature.in");
  const siteUrl = baseUrl.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/products",
        "/about",
        "/contact",
        "/faq",
        "/shipping",
        "/privacy-policy",
        "/refund-policy",
        "/shipping-policy",
        "/terms-of-service",
      ],
      disallow: [
        "/admin/",
        "/dashboard/",
        "/cart",
        "/checkout",
        "/login",
        "/signup",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/wishlist",
        "/api/",
        "/_next/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
