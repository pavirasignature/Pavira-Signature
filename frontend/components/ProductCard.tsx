"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { useStore } from "@/store/useStore";
import toast from "react-hot-toast";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { config, getAbsoluteUrl, isExternalUrl } from "@/lib/config";
interface Product {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  images?: { url: string }[];
  rating: number;
  numReviews?: number;
  slug: string;
  category?: any;
}

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}


const getProductImage = (product: Product) => {
  const isValidRemoteUrl = (url: string) => {
    if (!url) return false;
    if (url.includes("file://") || url.includes("D:") || url.includes("Downloads")) return false;
    return isExternalUrl(url) || url.startsWith("/") || url.startsWith("uploads/");
  };

  const withCacheBust = (url: string) => {
    const v = (product as any)?.updatedAt;
    if (!v) return url;
    if (url.includes("?")) return `${url}&v=${encodeURIComponent(String(v))}`;
    return `${url}?v=${encodeURIComponent(String(v))}`;
  };

  if (product.images && product.images.length > 0) {
    for (const img of product.images) {
      const url = typeof img === "string" ? img : (img && typeof img === "object" ? (img as any).url : "");
      if (url && isValidRemoteUrl(url)) return withCacheBust(getAbsoluteUrl(url));
    }
  }

  if (product.image && isValidRemoteUrl(product.image)) {
    return withCacheBust(getAbsoluteUrl(product.image));
  }

  const name = product.name.toLowerCase();
  if (name.includes("lotus") || name.includes("wall art")) return "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=400&q=80";
  if (name.includes("clock")) return "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=400&q=80";
  if (name.includes("mandala")) return "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=400&q=80";
  if (name.includes("candle") || name.includes("scented")) return "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80";
  if (name.includes("panels") || name.includes("mdf")) return "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80";
  if (name.includes("grill") || name.includes("door")) return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80";

  return config.images.productPlaceholder;
};

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addToCart, addToWishlist, wishlist, token } = useStore();
  const router = useRouter();
  const productId = product._id || product.id || "";
  const productImg = getProductImage(product);
  const discount = product.compareAtPrice ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please sign in to add items to your cart");
      router.push("/login");
      return;
    }
    addToCart({ product: productId, quantity: 1, price: product.price, name: product.name, image: productImg });
    toast.success("Added to cart");
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please sign in to add items to your wishlist");
      router.push("/login");
      return;
    }
    if (wishlist.includes(productId)) {
      toast.error("Already in wishlist");
      return;
    }
    addToWishlist(productId);
    toast.success("Added to wishlist");
  };

  const categoryName = typeof product.category === "object" && product.category ? product.category.name : product.category || "Decor";

  // Magnetic Tilt Physics
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="group relative bg-[#112F24]/65 backdrop-blur-xl rounded-2xl overflow-hidden border border-[#D4AF37]/15 hover:border-[#D4AF37]/40 transition-colors duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)]"
    >
      <Link href={`/products/${product.slug}`} className="block h-full w-full">
        <div className="relative aspect-square overflow-hidden bg-[#07241D]" style={{ transform: "translateZ(30px)" }}>
          <Image
            src={productImg}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            className="object-cover scale-100 group-hover:scale-[1.08] transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
          />

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-4 left-4 bg-[#D4AF37] text-[#0B3B2E] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-lg border border-[#D4AF37]/50 z-20">
              {discount}% OFF
            </div>
          )}

          {/* Luxury Floating Actions */}
          <div className="absolute top-4 right-4 flex flex-col space-y-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 z-20">
            <button
              onClick={handleAddToWishlist}
              className="bg-[#0B3B2E]/80 backdrop-blur-md hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0B3B2E] p-3 rounded-full transition-all duration-300 shadow-xl border border-[#D4AF37]/30"
            >
              <Heart size={16} className={wishlist.includes(productId) ? "fill-red-500 stroke-red-500" : ""} />
            </button>
            <button
              onClick={handleAddToCart}
              className="bg-[#0B3B2E]/80 backdrop-blur-md hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0B3B2E] p-3 rounded-full transition-all duration-300 shadow-xl border border-[#D4AF37]/30"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B3B2E]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
        </div>

        {/* Content */}
        <div className="p-6 relative z-30 bg-gradient-to-t from-[#112F24] to-transparent" style={{ transform: "translateZ(40px)" }}>
          <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-[0.2em] mb-2 opacity-80">
            {categoryName}
          </p>
          <h3 className="text-xl font-serif text-[#F5F0E6] mb-3 line-clamp-1 group-hover:text-[#D4AF37] transition-colors duration-300 drop-shadow-md">
            {product.name}
          </h3>

          <div className="flex items-center justify-between mt-5 pt-5 border-t border-[#D4AF37]/10">
            <div className="flex items-baseline gap-3">
              <span className="text-lg font-bold text-[#F5F0E6] tracking-wide">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.compareAtPrice && (
                <span className="text-xs text-gray-400 line-through decoration-[#D4AF37]/50 font-light">
                  ₹{product.compareAtPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < Math.round(product.rating) ? "fill-[#D4AF37] text-[#D4AF37]" : "text-gray-600 opacity-30"}
                />
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="bg-[#112F24]/40 backdrop-blur-xl rounded-2xl overflow-hidden border border-[#D4AF37]/10 shadow-xl relative w-full aspect-[3/4]">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
      <div className="aspect-square bg-[#0B3B2E]/50 relative overflow-hidden" />
      <div className="p-6 space-y-4">
        <div className="h-2 w-1/4 bg-[#D4AF37]/20 rounded" />
        <div className="h-6 w-3/4 bg-[#F5F0E6]/20 rounded" />
        <div className="pt-4 border-t border-[#D4AF37]/10 flex justify-between items-center mt-4">
          <div className="h-5 w-20 bg-[#F5F0E6]/20 rounded" />
        </div>
      </div>
    </div>
  );
}
