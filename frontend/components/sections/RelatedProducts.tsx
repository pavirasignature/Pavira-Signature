"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { productService } from "@/lib/services";
import { ArrowRight, Star } from "lucide-react";

interface RelatedProduct {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  image?: string;
  images?: { url: string }[];
  category?: any;
  rating?: number;
}

export default function RelatedProducts({ productId }: { productId: string }) {
  const [products, setProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadRelated() {
      try {
        setLoading(true);
        if (productId) {
          const res = await productService.getRelatedProducts(productId);
          if (isMounted && Array.isArray(res) && res.length > 0) {
            setProducts(res);
            return;
          }
        }
        // Fallback to featured or general collection
        const featured = await productService.getProducts({ limit: 4 });
        if (isMounted) {
          const items = featured?.data || [];
          setProducts(items.filter((p: any) => (p._id || p.id) !== productId).slice(0, 4));
        }
      } catch (err) {
        console.warn("Could not load related products:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadRelated();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className="mt-20 border-t border-[#1A1A1A]/10 pt-16">
      <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold block mb-2">
            Curated Complements
          </span>
          <h2 className="text-2xl md:text-3xl font-brand text-[#1A1A1A]">
            Complete The Look
          </h2>
        </div>
        <Link
          href="/products"
          className="text-xs uppercase tracking-widest text-[#0C3A2E] hover:text-[#D4AF37] transition-colors inline-flex items-center gap-1.5 mt-2 sm:mt-0 font-semibold"
        >
          <span>View All Pieces</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-[#1A1A1A]/5 aspect-square rounded mb-4" />
                <div className="h-4 bg-[#1A1A1A]/10 rounded w-3/4 mb-2" />
                <div className="h-4 bg-[#1A1A1A]/10 rounded w-1/3" />
              </div>
            ))
          : products.map((item) => {
              const itemId = item._id || item.id;
              const displayImage = item.images?.[0]?.url || item.image || "/placeholder.jpg";

              return (
                <Link
                  key={itemId}
                  href={`/products/${itemId}`}
                  className="group block"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#F4F1EA] mb-3">
                    <Image
                      src={displayImage}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-sm font-medium text-[#1A1A1A] group-hover:text-[#0C3A2E] transition-colors truncate">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-sm font-semibold text-[#1A1A1A]">
                      ₹{item.price?.toLocaleString("en-IN")}
                    </span>
                    {item.rating ? (
                      <span className="text-xs text-[#D4AF37] flex items-center gap-1">
                        <Star size={12} fill="#D4AF37" />
                        <span>{item.rating}</span>
                      </span>
                    ) : null}
                  </div>
                </Link>
              );
            })}
      </div>
    </section>
  );
}
